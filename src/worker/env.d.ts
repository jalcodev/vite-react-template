export {};

// wrangler types only generates types for vars declared in wrangler.json.
// Secrets (like GRIDHUB_PARTNER_KEY) are deliberately never written to any
// config file, so we extend the Env interface here by hand. Set the real
// value with: npx wrangler secret put GRIDHUB_PARTNER_KEY
declare global {
  interface Env {
    GRIDHUB_PARTNER_KEY: string;
  }
}
