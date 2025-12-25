/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
// import { defineConfig } from 'astro/config';
// import tailwindcss from 'tailwindcss';
// import postcss from 'postcss';
// import fs from 'fs';
// import path from 'path';
/**
 * @typedef {import('astro/config').defineConfig} DefineConfig
 * @typedef {Parameters<DefineConfig>[0]} AstroUserConfig
 * @typedef {Exclude<AstroUserConfig['vite'], undefined>} ViteUserConfig
 * 
 * @typedef {Exclude<ViteUserConfig['plugins'], undefined>} VitePlugins
 * 
 * @typedef {VitePlugins extends (infer X)[] ? Exclude<Extract<X, object>, Promise<any>> : never} VitePlugin
 */

import path from 'path';
import fs from 'fs';
import postcss from 'postcss';
import tailwindcss from '@tailwindcss/postcss';

function getThemeNames() {
    // const record = import.meta.glob('/src/styles/starry-night/*.css');
    const record = fs.readdirSync('src/styles/starry-night', {withFileTypes: false, recursive: false, encoding: 'utf-8'}).filter(x=>x.endsWith('.css'));
    const prefix = '/src/styles/starry-night/';
    // console.log(record);
    return record;
    // return (record).map(x=>x.slice(prefix.length));
}

// /**@type {Map<string, string>} */
// const themeFiles = new Map();


// /**
//  * 
//  * @param {string} inputPath 
//  * 
//  * @returns {string | null} outputPath
//  */
// function deriveOutputPath(inputPath) {
//     // if(inputPath.includes('src/styles/starry-night'))
//     const match = inputPath.match(/^(?:(.*?)\/)?src\/styles\/starry-night\/([^\/.]+?)\.css$/);
//     if(!match) return null;
//     const pre = match[1];
//     const themeName = match[2];
//     if(!themeName) return null;
//     return `${pre}public/styles/starry-night/${themeName}.css`;
// }

/**
 * @param {string} inputPath
 * @param {string} outputPath
 */
async function maybeCopyTransformedStatic(inputPath, outputPath) {
    const result = await fs.promises.readFile(inputPath, 'utf-8').then(css=>postcss([tailwindcss]).process(css, { from: inputPath, to: outputPath }));
    if(fs.existsSync(outputPath)) {
        const src = fs.readFileSync(outputPath);
        if(src.toString() === result.css) {
            console.log('Skipping identical', inputPath, outputPath);
            return;
        }
    }
    console.log('Updating theme CSS:', inputPath, outputPath);
    await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.promises.writeFile(outputPath, result.css);
}

/** @type {VitePlugin} */
const plugin = ({
    name: 'tailwind-static-copy',
    async buildStart(options) {
        const themes = getThemeNames();
        // console.log('BUILD START; themes:', themes);
        // themeFiles.clear();
        for (const theme of themes) {
            const inputPath = path.resolve(`src/styles/starry-night/${theme}`);
            const outputPath = path.resolve(`public/styles/starry-night/${theme}`);

            // this.addWatchFile(inputPath);
            // themeFiles.set(inputPath, outputPath);
            await maybeCopyTransformedStatic(inputPath, outputPath);
        }
    },
    // buildEnd(error) {},
    // watchChange: {
    //     async handler(id, change) {
    //         if(change.event === 'delete') return;
    //         if(!id.endsWith('.css')) return;

    //         const inputPath = path.resolve(id);
    //         if(themeFiles.size && !themeFiles.has(inputPath)) return;
    //         const outputPath = themeFiles.get(inputPath);
    //         // console.log('WATCH CHANGE:', id, inputPath, change);

    //         await maybeCopyTransformedStatic(inputPath, outputPath);
    //     },
    //     order: "post",
    //     sequential: undefined
    // },
    // closeWatcher() {},

    // hotUpdate(options) {},
    handleHotUpdate: {
        handler: (context) => {
            // type will be 'update'
            const {file, server, type, ...contextRest} = context;
            if (file.includes('src/styles/starry-night') && file.endsWith('.css')) {
                const themeName = path.basename(file, '.css');
                const payload = {
                    type: 'custom',
                    event: 'theme-update',
                    data: { themeName },
                }
                // console.log('HOT UPDATE HANDLING', file, themeName);
                server.ws.send(payload);

                const outPath = file.replace('src/styles/starry-night', 'public/styles/starry-night');
                void maybeCopyTransformedStatic(file, outPath);
            }
        },
        order: "post",
    },
    
    // apply(config, env) {},
    // applyToEnvironment(environment) {},

    // transform(code, id, options) {},
    // shouldTransformCachedModule(context, options) {},
    
    // transformIndexHtml(html, ctx) {    },


    // onLog(level, log) {},

    // options(options) {},
    // outputOptions(options) {},
 
    
    // config(config, env) {},
    // // configurePreviewServer: {handler: undefined, order: undefined},
    // // configureServer(server) {},
    // configEnvironment(name, config, env) {},
    // configResolved(config) {},

    // resolveFileUrl(options) {    },
    // resolveId(source, importer, options) {    },
    // // resolveImportMeta(property, options) {    }, // or handler+order
    // resolveDynamicImport(specifier, options) {},

    // renderDynamicImport(options) {},
    // renderChunk(code, chunk, options, meta) {},
    // renderStart(outputOptions, inputOptions) {    },
    // renderError(error) {    },

    // augmentChunkHash(chunk) {},


    // intro(chunk) {},
    // outro(chunk) {},
    // banner(chunk) {},
    // footer(chunk) {},
    
    // load(id, options) {},
    // moduleParsed(info) {    },


    // writeBundle(options, bundle) {},
    // closeBundle(error) {},
    // generateBundle(options, bundle, isWrite) {},
        
    // enforce: undefined,
    // perEnvironmentStartEndDuringDev: undefined,
    // version: undefined,
    // sharedDuringBuild: undefined,
    // api: undefined,
    // cacheKey: undefined,
});

export default plugin;