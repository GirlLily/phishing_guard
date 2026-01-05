import { defineConfig } from "vite";

export default defineConfig({
  define: {
    __POLICY_API_BASE__: JSON.stringify(process.env.VITE_POLICY_API_BASE || ""),
    __COMPANY_ID__: JSON.stringify(process.env.VITE_COMPANY_ID || ""),
    __POLICY_VERIFY_KEY_BASE64__: JSON.stringify(process.env.VITE_POLICY_VERIFY_KEY_BASE64 || "")
  },
  build: {
    outDir: "dist"
  }
});
