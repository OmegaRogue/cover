import fs from "fs-extra";
import * as Vite from "vite";
// import { LightningCSSOptions } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
// eslint-disable-next-line import/default
import checker from "vite-plugin-checker";
import path from "path";
import packageJSON from "./package.json";
import esbuild from "esbuild";

// import { LengthValue, TransformOptions } from "lightningcss";

const config = Vite.defineConfig(({ command, mode }): Vite.UserConfig => {
	const buildMode = mode === "production" ? "production" : "development";
	const outDir = "dist";

	const plugins = [
		checker({ typescript: true }),
		tsconfigPaths(),
	];
	// Handle minification after build to allow for tree-shaking and whitespace minification
	// "Note the build.minify option does not minify whitespaces when using the 'es' format in lib mode, as it removes
	// pure annotations and breaks tree-shaking."
	if (buildMode === "production") {
		plugins.push({
			name: "minify",
			renderChunk: {
				order: "post",
				async handler(code, chunk) {
					const opts = {
						keepNames: true,
						minifyIdentifiers: false,
						minifySyntax: true,
						minifyWhitespace: true,
						sourcemap: true,
					};
					return chunk.fileName.endsWith(".mjs") ? esbuild.transform(code, opts) : code;
				},
			},
		});
	} else {
		plugins.push(
			// Foundry expects all esm files listed in system.json to exist: create empty vendor module when in dev mode
			{
				name: "touch-vendor-mjs",
				apply: "build",
				writeBundle: {
					async handler() {
						fs.closeSync(fs.openSync(path.resolve(outDir, "vendor.mjs"), "w"));
					},
				},
			},
			// Vite HMR is only preconfigured for css files: add handler for HBS templates
			{
				name: "hmr-handler",
				apply: "serve",
				handleHotUpdate(context) {
					if (context.file.startsWith(outDir)) return;

					if (context.file.endsWith("en.json")) {
						const basePath = context.file.slice(context.file.indexOf("lang/"));
						console.log(`Updating lang file at ${basePath}`);
						fs.promises.copyFile(context.file, `${outDir}/${basePath}`).then(() => {
							context.server.ws.send({
								type: "custom",
								event: "lang-update",
								data: { path: `modules/cover/${basePath}` },
							});
						});
					} else if (context.file.endsWith(".hbs")) {
						const basePath = context.file.slice(context.file.indexOf("templates/"));
						console.log(`Updating template at ${basePath}`);
						fs.promises.copyFile(context.file, `${outDir}/${basePath}`).then(() => {
							context.server.ws.send({
								type: "custom",
								event: "template-update",
								data: { path: `modules/cover/${basePath}` },
							});
						});
					}  else if (context.file.endsWith(".scss")) {
						const basePath = context.file.slice(context.file.indexOf("styles/"));
						console.log(`Updating scss at ${basePath}`);
						(async()=>{})().then(() => {
							context.server.ws.send({
								type: "custom",
								event: "scss-update",
								data: { path: `modules/cover/${basePath}` },
							});
						});
					}
				},
			},
		);
	}

	// Create dummy files for vite dev server
	if (command === "serve") {
		const message = "This file is for a running vite dev server and is not copied to a build";
		fs.writeFileSync("./index.html", `<h1>${message}</h1>\n`);
		if (!fs.existsSync("./styles")) fs.mkdirSync("./styles");
		fs.writeFileSync("./styles/cover.css", `/** ${message} */\n`);
		fs.writeFileSync("./cover.mjs", `/** ${message} */\n\nimport "./src/module/cover.js";\n`);
		fs.writeFileSync("./vendor.mjs", `/** ${message} */\n`);
	}

	return {
		root: "./",
		base: command === "build" ? "./" : "/modules/cover/",
		publicDir: "static",
		define: {
			BUILD_MODE: JSON.stringify(buildMode),
			fu: "foundry.utils",
		},
		esbuild: { keepNames: true },
		build: {
			outDir,
			emptyOutDir: false, //build-packs.ts handles this
			minify: false,
			sourcemap: true,
			lib: {
				name: "cover",
				entry: "src/module/cover.js",
				formats: ["es"],
				fileName: "cover",
			},
			rollupOptions: {
				output: {
					assetFileNames: ({ name }): string =>
						name === "style.css" ? "styles/cover.css" : name!,
					chunkFileNames: "[name].mjs",
					entryFileNames: "cover.mjs",
					manualChunks: {
						vendor: buildMode === "production" ? Object.keys(packageJSON.dependencies) : [],
					},
				},
				watch: { buildDelay: 100 },
			},
			target: "es2022",
		},
		server: {
			port: 30001,
			open: false,
			proxy: {
				"^(?!/modules/cover/)": "http://localhost:32456/",
				"/socket.io": {
					target: "ws://localhost:32456",
					ws: true,
				},
			},
		},
		plugins,
		css: {
			// transformer: "lightningcss",
			// lightningcss: (<Partial<TransformOptions<never>>>{
			// 	visitor: {
			// 		Length(length: LengthValue): LengthValue | void {
			// 			return { unit: length.unit, value: length.value };
			// 		},
			// 	},
			// }) as LightningCSSOptions,
			// devSourcemap: true,
			preprocessorOptions: {
				scss: {
					sourceMap: true,
					sourceMapEmbed: true,
					sourceEmbed: true
				}
			},
		},
	};
});

// eslint-disable-next-line import/no-default-export
export default config;
