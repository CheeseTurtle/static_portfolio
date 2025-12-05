// // import {unified} from 'unified';
// // import remarkParse from 'remark-parse';
// // import remarkRehype from 'remark-rehype';
// // import remarkMdx from 'remark-mdx';

// import * as MDX from '@mdx-js/mdx';
// // import * as mdx from 'mdast-util-mdx-jsx';

// // import { toJs } from 'estree-util-to-js';
// // import { mdxjs } from 'micromark-extension-mdxjs';
// // import {toJsxRuntime} from 'hast-util-to-jsx-runtime';

// // MDX6.mdxFromMarkdown()
// // MDX3.default({})

// export function createParser() {
//     const p =  unified().use(remarkParse).use(remarkRehype);
//     return ((file: Parameters<typeof p.process>[0]): ReturnType<typeof p.process> => p.process(file)) as typeof p.process;
//     // const p = MDX.createProcessor({format: 'md', rehypePlugins: [], remarkPlugins: [], remarkRehypeOptions: {}});
//     // MDX.run()
// }




// // export function createParser() {
// //   const processor = unified()
// //     .use(remarkParse, { extensions: [mdxjs()] }) // Parse MDX
// //     .use(remarkMdx) // Transform MDX to JSX-compatible AST
// // //     .use(remarkRehype); // Convert to HTML-like AST

// // //   return async (input: string) => {
// // //     const file = await processor.process(input);
// // //     // Convert the AST to JSX runtime code

// // //     const jsx = toJsxRuntime(file.result as any, );
// // //     return jsx;
// //   };
// // }


// // export function createParser() {
// //   const processor = unified()
// //     .use(remarkParse)       // Parse Markdown
// //     .use(remarkRehype)      // Convert to HTML
// //     .use(rehypeStringify);  // Stringify HTML

// //   return async (input: string) => {
// //     const file = await processor.process(input);
// //     return String(file);
// //   };
// // }