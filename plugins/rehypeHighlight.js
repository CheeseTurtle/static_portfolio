import { CONTINUE, SKIP, visit } from "unist-util-visit";

/** 
 * @typedef {import('unist-util-visit').Visitor} Visitor 
 * @typedef {Parameters<Visitor>[0]} Node
 * @typedef {Node & {qualifiers?: string[]}} NodeWithQualifiers
 * @typedef {import('hast').Element} Element
*/

/**
 * @typedef {Exclude<keyof Element, keyof Node>} MissingKeys
 * @typedef {{[K in MissingKeys]: Element[K]}} MissingProps
 */

/**
 * @template {string | number} T
 * @typedef {T[]} Array1<T>
 * 
 */

/**
 * @typedef {Array1<undefined>} StringArray
 */

// /**
//  * @template {Node} N
//  * @param {N} node 
//  * @param {string} tagName
//  * @param {import("hast").Properties} [properties]
//  * @param {import("hast").ElementContent[]} [children]
//  * @param {import('hast').ElementData} [data]
//  * @param {import("hast").Root | undefined} [content] Only when `tagName` is `'template'`
//  * @returns {N & Element}
//  */
// function convertToElement(node, tagName, properties, children, data, content) {
//     // Node has type, data, position, and (if it is a Parent) children.
//     return Object.assign<Node,Element>(node, /**@type {MissingProps}*/ {
//         type: 'element',
//         tagName,
//         properties: properties || {},
//         children: children || [],
//         data: data ? (typeof node.data === 'object' ? Object.assign(data, node.data) : Object.assign(data, {nodeData: node.data}) : (typeof node.data === 'object' ? node.data : (node.data ? {nodeData: node.data} : undefined)))
//         content
//     })
// }

/**
 * Rehype plugin to convert `highlight` mdast nodes into <mark> elements.
 * - Adds class names for any qualifiers
 *
 * @returns {(tree: import('unist').Node) => void}
 */
export default function rehypeHighlight() {
  return function transformer(tree) {
    visit(tree, "element",/**@type {import("unist-util-visit").BuildVisitor<Element, 'element'>}*/(node) => {
        //   if(node.type !== 'element') return CONTINUE;
        
        // Only process custom highlight nodes (e.g., from mdast->hast mapping)
        if(node.tagName === 'code' || node.tagName === 'script' || node.tagName === 'style' || node.tagName === 'img' || node.tagName === 'svg' || node.tagName === 'iframe' || node.tagName === 'key') return SKIP;
        // Normalize custom <highlight> into a real <mark> element
        if(node.tagName === "highlight") node.tagName = "mark";
        else if(node.tagName !== "mark") return CONTINUE;

        if(!node.properties) return CONTINUE;

        // Skip user-authored <mark> elements — only transform those we generated
        const generated =
            node.properties?.['data-generated-by'] === 'remark-highlight' ||
            node.properties?.dataGeneratedBy === 'remark-highlight' ||
            node.properties?.['dataGeneratedBy'] === 'remark-highlight';
        if (!generated) return CONTINUE;
 
        // Gather qualifiers from properties or data (set by remark via hProperties/data)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const rawQualifiers = node.properties?.["data-qualifiers"] ?? node.properties?.qualifiers ?? node.data?.qualifiers ?? node.data?.["data-qualifiers"];
        const qualifiersArray = typeof rawQualifiers === "string" ? rawQualifiers.split(/\s+/).filter(Boolean) : (Array.isArray(rawQualifiers) ? Array.from(new Set(rawQualifiers)) : undefined);
        if(qualifiersArray?.length) {
             const classes = qualifiersArray.map(q => `hl-${q}`);
             node.properties.className = [
                'hl',
                 ...(node.properties.className || []),
                 ...classes,
             ].join(' ');
             node.properties['data-qualifiers'] = qualifiersArray.map(x=>`{${x}}`).join();
        } else {
            node.properties.className = [
                'hl hl-default', 
                ...(node.properties.className || [])
            ].join(' ')
        }

        delete node.properties['data-generated-by'];
        delete node.properties['dataGeneratedBy'];
    });
  };
}
