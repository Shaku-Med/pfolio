import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  loadEnv(mode, process.cwd(), "");
  let isDev = mode === "development";
  console.log("is dev: ", isDev);
  console.log("port: ", !isDev ? 3001 : 3000);
  return {
    plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
    server: {
      port: !isDev ? 3001 : 3000,
      host: true,
    },
    allowedHosts: ["medzy.brozy.org"],
    cors: true,
  };
});
