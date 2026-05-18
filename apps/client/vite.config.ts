import { fileURLToPath, URL } from "node:url";
import { paraglideVitePlugin } from "@inlang/paraglide-js";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

const config = defineConfig({
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./", import.meta.url)),
		},
		dedupe: [
			"react",
			"react-dom",
			"@tanstack/react-router",
			"@tanstack/router-core",
		],
	},
	optimizeDeps: {
		include: ["@aksob/ui", "@aksob/sdk", "react-use", "recharts"],
	},
	ssr: {
		noExternal: ["@aksob/ui", "@aksob/sdk", "react-use", "recharts"],
	},
	server: {
		host: "client.aksob.localhost",
	},
	plugins: [
		devtools(),
		paraglideVitePlugin({
			project: "./project.inlang",
			outdir: "./paraglide",
			strategy: ["url", "baseLocale"],
		}),
		nitro({ preset: "bun" }),
		viteTsConfigPaths({
			projects: ["./tsconfig.json"],
		}),
		tailwindcss(),
		tanstackStart({
			srcDirectory: ".",
			router: {
				routesDirectory: "./app",
				virtualRouteConfig: "./routes.ts",
			},
		}),
		viteReact({
			babel: {
				plugins: ["babel-plugin-react-compiler"],
			},
		}),
	],
});

export default config;
