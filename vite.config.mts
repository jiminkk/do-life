import fs from "fs"
import path from "path"
import { defineConfig } from "vite"
import tailwindcss from "@tailwindcss/vite"
import { redwood } from "rwsdk/vite"
import { cloudflare } from "@cloudflare/vite-plugin"
import basicSsl from "@vitejs/plugin-basic-ssl"

export default defineConfig({
  environments: {
    ssr: {},
  },
  plugins: [
    basicSsl(),
    cloudflare({
      viteEnvironment: { name: "worker" },
    }),
    redwood(),
    tailwindcss(),
  ],
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, ".cert/localhost-key.pem")),
      cert: fs.readFileSync(
        path.resolve(__dirname, ".cert/localhost-cert.pem"),
      ),
    },
  },
})
