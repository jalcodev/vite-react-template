import { useState } from "react";
import { createWalletClient, custom } from "viem";
import { base } from "viem/chains";
import { wrapFetchWithPayment } from "x402-fetch";
import { ZONE_NAMES } from "./GridMap";

const ZONE_OPTIONS = Object.keys(ZONE_NAMES);
const BASE_URL = "https://api.grid-hub.app";

type Status = "idle" | "connecting" | "connected" | "paying" | "success" | "error";

export default function PayWidget() {
  const [status, setStatus] = useState<Status>("idle");
  const [address, setAddress] = useState<string | null>(null);
  const [zone, setZone] = useState("GB");
  const [result, setResult] = useState<unknown>(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function connect() {
    setStatus("connecting");
    setErrorMsg("");
    try {
      if (!window.ethereum) {
        throw new Error("No wallet found. Install a browser wallet like Coinbase Wallet or MetaMask.");
      }
      const accounts = (await window.ethereum.request({ method: "eth_requestAccounts" })) as string[];
      const acct = accounts[0];
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x2105" }], // Base mainnet, 8453
        });
      } catch {
        // Wallet may already be on Base, or the user declined the switch —
        // proceed anyway and let the payment attempt surface any real error.
      }
      setAddress(acct);
      setStatus("connected");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Failed to connect wallet");
      setStatus("error");
    }
  }

  async function buy() {
    if (!address || !window.ethereum) return;
    setStatus("paying");
    setErrorMsg("");
    setResult(null);
    try {
      const walletClient = createWalletClient({
        account: address as `0x${string}`,
        chain: base,
        transport: custom(window.ethereum),
      });
      // x402-fetch expects a viem Account/signer. A browser WalletClient
      // configured with an account implements the same signTypedData surface,
      // but this is the one integration point we haven't been able to test
      // live — if this throws a type/runtime mismatch, that's the first
      // place to look.
      const fetchWithPayment = wrapFetchWithPayment(fetch, walletClient as unknown as Parameters<typeof wrapFetchWithPayment>[1]);
      const res = await fetchWithPayment(`${BASE_URL}/v1/latest/${zone}`);
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      setResult(data);
      setStatus("success");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Payment failed");
      setStatus("error");
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
        {status === "idle" || status === "connecting" ? (
          <button className="cta-button" onClick={connect} disabled={status === "connecting"}>
            {status === "connecting" ? "Connecting…" : "Connect wallet"}
          </button>
        ) : (
          <button className="cta-button" onClick={buy} disabled={status === "paying"}>
            {status === "paying" ? "Paying…" : "Buy for $0.001"}
          </button>
        )}
      </div>

      {address && (
        <p className="pay-widget-address mono">
          Connected: {address.slice(0, 6)}…{address.slice(-4)}
        </p>
      )}

      {status === "error" && <p className="pay-widget-error">{errorMsg}</p>}

      {status === "success" && result != null && (
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
