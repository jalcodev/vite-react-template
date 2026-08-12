import { useState } from "react";
import { createWalletClient, createPublicClient, custom, http, parseAbi, maxUint256 } from "viem";
import { base } from "viem/chains";
import { wrapFetchWithPayment, x402Client } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { ZONE_NAMES } from "./GridMap";

const ZONE_OPTIONS = Object.keys(ZONE_NAMES);
const BASE_URL = "https://api.grid-hub.app";
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;
// Canonical Permit2 contract — verified independently against Etherscan,
// Uniswap's own docs, and 0x's integration docs before use.
const PERMIT2_ADDRESS = "0x000000000022D473030F116dDEE9F6B43aC78BA3" as const;

const ERC20_ABI = parseAbi([
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
]);

const publicClient = createPublicClient({ chain: base, transport: http() });

type Busy = "" | "connecting" | "checking" | "approving" | "paying";

export default function PayWidget() {
  const [address, setAddress] = useState<`0x${string}` | null>(null);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [busy, setBusy] = useState<Busy>("");
  const [zone, setZone] = useState("GB");
  const [result, setResult] = useState<unknown>(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function checkApproval(acct: `0x${string}`) {
    setBusy("checking");
    try {
      const allowance = await publicClient.readContract({
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: [acct, PERMIT2_ADDRESS],
      });
      setNeedsApproval(allowance === 0n);
    } catch {
      setNeedsApproval(false);
    } finally {
      setBusy("");
    }
  }

  async function connect() {
    setBusy("connecting");
    setErrorMsg("");
    try {
      if (!window.ethereum) {
        throw new Error("No wallet found. Install a browser wallet like Coinbase Wallet or MetaMask.");
      }
      const accounts = (await window.ethereum.request({ method: "eth_requestAccounts" })) as string[];
      const acct = accounts[0] as `0x${string}`;
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x2105" }], // Base mainnet, 8453
        });
      } catch {
        // Wallet may already be on Base, or declined the switch.
      }
      setAddress(acct);
      await checkApproval(acct);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Failed to connect wallet");
      setBusy("");
    }
  }

  async function approve() {
    if (!address || !window.ethereum) return;
    setBusy("approving");
    setErrorMsg("");
    try {
      const walletClient = createWalletClient({
        account: address,
        chain: base,
        transport: custom(window.ethereum),
      });
      const hash = await walletClient.writeContract({
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [PERMIT2_ADDRESS, maxUint256],
      });
      await publicClient.waitForTransactionReceipt({ hash });
      setNeedsApproval(false);
      setBusy("");
      await buy();
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Approval failed");
      setBusy("");
    }
  }

  async function buy() {
    if (!address || !window.ethereum) return;
    setErrorMsg("");
    setResult(null);
    setBusy("paying");
    try {
      const walletClient = createWalletClient({
        account: address,
        chain: base,
        transport: custom(window.ethereum),
      });

      // @x402/evm's exact signer interface isn't fully pinned down from
      // documentation alone (different examples show slightly different
      // shapes). This adapter exposes the address both flat and nested
      // under `.account`, and delegates actual signing to the real wallet
      // client either way — maximizing compatibility rather than betting
      // on one specific interpretation.
      const signer = {
        address,
        account: { address },
        signTypedData: (args: unknown) =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          walletClient.signTypedData(args as any),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const client = new x402Client().register("eip155:*", new ExactEvmScheme(signer as any));
      const fetchWithPayment = wrapFetchWithPayment(fetch, client);

      const res = await fetchWithPayment(`${BASE_URL}/v1/latest/${zone}`);
      if (!res.ok) {
        let detail = "";
        try {
          const body = await res.json();
          detail = body?.error ? `: ${body.error}${body.detail ? " — " + JSON.stringify(body.detail) : ""}` : "";
        } catch {
          // response wasn't JSON, fall through with no extra detail
        }
        throw new Error(`Request failed: ${res.status}${detail}`);
      }
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Payment failed");
    } finally {
      setBusy("");
    }
  }

  return (
    <div>
      <div className="pay-widget-row">
        <select value={zone} onChange={(e) => setZone(e.target.value)} className="pay-widget-select">
          {ZONE_OPTIONS.map((id) => (
            <option key={id} value={id}>
              {ZONE_NAMES[id]} ({id})
            </option>
          ))}
        </select>

        {!address ? (
          <button className="cta-button" onClick={connect} disabled={busy === "connecting"}>
            {busy === "connecting" ? "Connecting…" : "Connect wallet"}
          </button>
        ) : needsApproval ? (
          <button className="cta-button" onClick={approve} disabled={busy === "approving"}>
            {busy === "approving" ? "Approving…" : "Approve USDC (one-time)"}
          </button>
        ) : (
          <button className="cta-button" onClick={buy} disabled={busy === "paying" || busy === "checking"}>
            {busy === "checking" ? "Checking…" : busy === "paying" ? "Paying…" : "Buy for $0.001"}
          </button>
        )}
      </div>

      {address && (
        <p className="pay-widget-address mono">
          Connected: {address.slice(0, 6)}…{address.slice(-4)}
        </p>
      )}

      {address && needsApproval && (
        <p className="pay-widget-note">
          First-time setup: approve USDC spending once (a small one-time gas fee). Every
          payment after this is instant and gasless.
        </p>
      )}

      {errorMsg && <p className="pay-widget-error">{errorMsg}</p>}

      {result != null && (
        <pre className="code-block mono pay-widget-result">
          <code>{JSON.stringify(result, null, 2)}</code>
        </pre>
      )}

      <p className="pricing-note">
        Real payment on Base mainnet — this charges actual USDC from your connected wallet.
      </p>
    </div>
  );
}
