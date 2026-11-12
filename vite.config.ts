import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  ...(process.env["VERCEL"]
    ? {
        nitro: {
          preset: "vercel",
        },
      }
    : {}),
  tanstackStart: {
    server: { entry: "server" },
  },
});