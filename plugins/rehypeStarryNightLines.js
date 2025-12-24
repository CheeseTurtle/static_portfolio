import { visit, SKIP, CONTINUE } from 'unist-util-visit';


// #region typedefs

/**
 * @typedef {import('hast').Root} HastRoot
 * @typedef {import('hast').Parent} HastParent
 * @typedef {import('hast').Element} HastElement
 * @typedef {import('hast').Text} HastText
 * @typedef {import('hast').ElementContent ElementContent}
 */

/**
 * @typedef {import('unist').Node} UnistNode
 * @typedef {import('unist').Parent} UnistParent
 * @typedef {import('unist-util-visit-parents').VisitorResult} VisitorResult
 */

/** 
 * @typedef { (HastElement & {dataLineSpan?: number}) | HastText } ElementContentWithLineSpan 
* */

/**
 * @typedef {Exclude<import('unist-util-is').Test, undefined> | undefined} Test
 *   Test from `unist-util-is`.
 *
 *   Note: we have remove and add `undefined`, because otherwise when generating
 *   automatic `.d.ts` files, TS tries to flatten paths from a local perspective,
 *   which doesn’t work when publishing on npm.
 */

// To do: use types from `unist-util-visit-parents` when it’s released.

/**
 * @typedef {(
 *   Fn extends (value: any) => value is infer Thing
 *   ? Thing
 *   : Fallback
 * )} Predicate
 *   Get the value of a type guard `Fn`.
 * @template Fn
 *   Value; typically function that is a type guard (such as `(x): x is Y`).
 * @template Fallback
 *   Value to yield if `Fn` is not a type guard.
 */

/**
 * @typedef {(
 *   Check extends null | undefined // No test.
 *   ? Value
 *   : Value extends {type: Check} // String (type) test.
 *   ? Value
 *   : Value extends Check // Partial test.
 *   ? Value
 *   : Check extends Function // Function test.
 *   ? Predicate<Check, Value> extends Value
 *     ? Predicate<Check, Value>
 *     : never
 *   : never // Some other test?
 * )} MatchesOne
 *   Check whether a node matches a primitive check in the type system.
 * @template Value
 *   Value; typically unist `Node`.
 * @template Check
 *   Value; typically `unist-util-is`-compatible test, but not arrays.
 */

/**
 * @typedef {(
 *   Check extends Array<any>
 *   ? MatchesOne<Value, Check[keyof Check]>
 *   : MatchesOne<Value, Check>
 * )} Matches
 *   Check whether a node matches a check in the type system.
 * @template Value
 *   Value; typically unist `Node`.
 * @template Check
 *   Value; typically `unist-util-is`-compatible test.
 */

/**
 * @typedef {0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10} Uint
 *   Number; capped reasonably.
 */

/**
 * @typedef {I extends 0 ? 1 : I extends 1 ? 2 : I extends 2 ? 3 : I extends 3 ? 4 : I extends 4 ? 5 : I extends 5 ? 6 : I extends 6 ? 7 : I extends 7 ? 8 : I extends 8 ? 9 : 10} Increment
 *   Increment a number in the type system.
 * @template {Uint} [I=0]
 *   Index.
 */

/**
 * @typedef {(
 *   Node extends UnistParent
 *   ? Node extends {children: Array<infer Children>}
 *     ? Child extends Children ? Node : never
 *     : never
 *   : never
 * )} InternalParent
 *   Collect nodes that can be parents of `Child`.
 * @template {UnistNode} Node
 *   All node types in a tree.
 * @template {UnistNode} Child
 *   Node to search for.
 */

/**
 * @typedef {InternalParent<InclusiveDescendant<Tree>, Child>} Parent
 *   Collect nodes in `Tree` that can be parents of `Child`.
 * @template {UnistNode} Tree
 *   All node types in a tree.
 * @template {UnistNode} Child
 *   Node to search for.
 */

/**
 * @typedef {(
 *   Depth extends Max
 *   ? never
 *   :
 *     | InternalParent<Node, Child>
 *     | InternalAncestor<Node, InternalParent<Node, Child>, Max, Increment<Depth>>
 * )} InternalAncestor
 *   Collect nodes in `Tree` that can be ancestors of `Child`.
 * @template {UnistNode} Node
 *   All node types in a tree.
 * @template {UnistNode} Child
 *   Node to search for.
 * @template {Uint} [Max=10]
 *   Max; searches up to this depth.
 * @template {Uint} [Depth=0]
 *   Current depth.
 */

/**
 * @typedef {(
 *   Tree extends UnistParent
 *     ? Depth extends Max
 *       ? Tree
 *       : Tree | InclusiveDescendant<Tree['children'][number], Max, Increment<Depth>>
 *     : Tree
 * )} InclusiveDescendant
 *   Collect all (inclusive) descendants of `Tree`.
 *
 *   > 👉 **Note**: for performance reasons, this seems to be the fastest way to
 *   > recurse without actually running into an infinite loop, which the
 *   > previous version did.
 *   >
 *   > Practically, a max of `2` is typically enough assuming a `Root` is
 *   > passed, but it doesn’t improve performance.
 *   > It gets higher with `List > ListItem > Table > TableRow > TableCell`.
 *   > Using up to `10` doesn’t hurt or help either.
 * @template {UnistNode} Tree
 *   Tree type.
 * @template {Uint} [Max=10]
 *   Max; searches up to this depth.
 * @template {Uint} [Depth=0]
 *   Current depth.
 */

/**
 * @callback Visitor
 *   Handle a node (matching `test`, if given).
 *
 *   Visitors are free to transform `node`.
 *   They can also transform `parent`.
 *
 *   Replacing `node` itself, if `SKIP` is not returned, still causes its
 *   descendants to be walked (which is a bug).
 *
 *   When adding or removing previous siblings of `node` (or next siblings, in
 *   case of reverse), the `Visitor` should return a new `Index` to specify the
 *   sibling to traverse after `node` is traversed.
 *   Adding or removing next siblings of `node` (or previous siblings, in case
 *   of reverse) is handled as expected without needing to return a new `Index`.
 *
 *   Removing the children property of `parent` still results in them being
 *   traversed.
 * @param {Visited} node
 *   Found node.
 * @param {Visited extends UnistNode ? number | undefined : never} index
 *   Index of `node` in `parent`.
 * @param {Ancestor extends UnistParent ? Ancestor | undefined : never} parent
 *   Parent of `node`.
 * @returns {VisitorResult}
 *   What to do next.
 *
 *   An `Index` is treated as a tuple of `[CONTINUE, Index]`.
 *   An `Action` is treated as a tuple of `[Action]`.
 *
 *   Passing a tuple back only makes sense if the `Action` is `SKIP`.
 *   When the `Action` is `EXIT`, that action can be returned.
 *   When the `Action` is `CONTINUE`, `Index` can be returned.
 * @template {UnistNode} [Visited=UnistNode]
 *   Visited node type.
 * @template {UnistParent} [Ancestor=UnistParent]
 *   Ancestor type.
 */

/**
 * @typedef {Visitor<Visited, Parent<Ancestor, Visited>>} BuildVisitorFromMatch
 *   Build a typed `Visitor` function from a node and all possible parents.
 *
 *   It will infer which values are passed as `node` and which as `parent`.
 * @template {UnistNode} Visited
 *   Node type.
 * @template {UnistParent} Ancestor
 *   Parent type.
 */

/**
 * @typedef {(
 *   BuildVisitorFromMatch<
 *     Matches<Descendant, Check>,
 *     Extract<Descendant, UnistParent>
 *   >
 * )} BuildVisitorFromDescendants
 *   Build a typed `Visitor` function from a list of descendants and a test.
 *
 *   It will infer which values are passed as `node` and which as `parent`.
 * @template {UnistNode} Descendant
 *   Node type.
 * @template {Test} Check
 *   Test type.
 */

/**
 * @typedef {(
 *   BuildVisitorFromDescendants<
 *     InclusiveDescendant<Tree>,
 *     Check
 *   >
 * )} BuildVisitor
 *   Build a typed `Visitor` function from a tree and a test.
 *
 *   It will infer which values are passed as `node` and which as `parent`.
 * @template {UnistNode} [Tree=UnistNode]
 *   Node type.
 * @template {Test} [Check=Test]
 *   Test type.
 */

// #endregion


/**
 * Helper: create a HAST text node
 * @param {string} value
 * @returns {HastText}
 */
function createTextNode(value) {
  return { type: 'text', value };
}


/**
 * Description placeholder
 *
 * @param {HastElement} el 
 * 
 * @returns {HastElement | undefined}
 */
function getSingleCodeChild(el) {
  if(el.children?.length !== 1)
    return undefined;
  const child = el.children[0];
  if(child.type !== 'element' || child.tagName !== 'code') return undefined;
  return child;

}

/**
 * Description placeholder
 *
 * @param {HastElement} el 
 * 
 * @returns {boolean | string}
 */
function isHighlightedPre(el) {
  /** @type {string[] | undefined} */
  const classList = el.properties?.className;
  if (classList?.length && !classList.includes('astro-code') && classList.includes('starry-night')) {
    return (el.properties?.['data-language']) || true;
  }
  return el.properties?.['data-language'] || false;
}


/**
 * Description placeholder
 *
 * @param {HastElement} el 
 * 
 * @returns {boolean | string}
 */
function isHighlightedCode(el) {
  /** @type {string[] | undefined} */
  const classList = el.properties?.className;
  if(!classList) return false;
  const langClass = classList.find(x=>x.startsWith('language-'));
  if(!langClass) return false;
  const langName = langClass.slice(9);
  return langName || false;
}

// /**
//  * 
//  * @param {ElementContent[]} children 
//  * @returns {HastElement[][]}
//  */
// function flattenChildrenToLines(children) {
//   /** @type {HastElement[][]} */
//   const lines = [];
//   /** @type {HastElement[]} */
//   let currentLine = [];

  
//   function pushLine() {
//     if (currentLine.length) {
//       // Add a newline text node so copy preserves line breaks
//       currentLine.push(createTextNode('\n'));
//       lines.push(currentLine);
//       currentLine = [];
//     }
//   }


//   for(const node of children) {
//     if (node.type === 'text') {
//       const parts = node.value.split(/\r?\n/);
//       parts.forEach((part, i) => {
//         if (part) currentLine.push({ type: 'text', value: part });
//         if (i < parts.length - 1) pushLine();
//       });
//     } else if (node.type === 'element') {
//       // Check if the element contains a multiline text node
//       // let textValue = '';
//       // (function collectText(n) {
//       //   if (n.type === 'text') textValue += n.value;
//       //   else if (n.children) n.children.forEach(collectText);
//       // })(node);

//       // const newlineCount = (textValue.match(/\n/g) || []).length;

//       // if (newlineCount > 0) {
//       //   // Node spans multiple lines → mark line with data-line-span
//       //   const wrapper = {
//       //     type: 'element',
//       //     tagName: 'span', // keep the token as-is
//       //     properties: { ...node.properties },
//       //     children: node.children,
//       //     dataLineSpan: newlineCount + 1,
//       //   };
//       //   currentLine.push(wrapper);
//       // } else {
//       //   currentLine.push(node);
//       // }
//       // element (e.g., <span> token)
      
//       // Check if it contains text nodes with newlines inside
//       const childLines = flattenChildrenToLines(node.children || []);
//       childLines.forEach((lineChildren, i) => {
//         const newElem = { ...node, children: lineChildren };
//         currentLine.push(newElem);
//         if (i < childLines.length - 1) pushLine();
//       });
//     }
//   }

//   if (currentLine.length) pushLine();
//   return lines;
// }


// /**
//  * 
//  * @param {ElementContentWithLineSpan[]} lineChildren 
//  * 
//  * @returns {number}
//  */
// function getLineSpan(lineChildren) {
//   let lineSpan = 1;

//   for(const child of lineChildren) {
//     if(child.type !== 'element') continue;
//     if(child.dataLineSpan) {
//       if(child.dataLineSpan <= 1) continue;
//       lineSpan += (child.dataLineSpan - 1);
//     }
//   }

//   return lineSpan;
// }

/**
 * Flatten code children into an array of lines.
 * Each line is an array of HastElement/Text nodes.
 * @param {HastElement['children']} children
 * @returns {Array<HastElement[]>}
 */
function flattenChildrenToLines(children) {
  /** @type {HastElement[][]} */
  const lines = [];
  /** @type {HastElement[]} */
  let currentLine = [];

  /**
   * Push the current line and reset.
   */
  function pushLine() {
    // Always push a copy (even if empty) to preserve blank lines
    currentLine.push(createTextNode('\n'));
    lines.push(currentLine);
    currentLine = [];
  }

  for(const node of children) {
    if (node.type === 'text') {
      const parts = node.value.split('\n');
      parts.forEach((part, i) => {
        if (part) currentLine.push({ type: 'text', value: part });
        if (i < parts.length - 1) pushLine();
      });
    } else if (node.type === 'element') {
      // Check if the element itself has text children with newlines
      let multiline = false;
      const newChildren = [];
      node.children.forEach(child => {
        if (child.type === 'text' && child.value.includes('\n')) {
          multiline = true;
        }
        newChildren.push(child);
      });

      if (multiline) {
        // Clone node for each line
        /** @type {ElementContentWithLineSpan[][]} */
        const parts = [];
        node.children.forEach(child => {
          if (child.type === 'text') {
            child.value.split('\n').forEach((part, i) => {
              if (!parts[i]) parts[i] = [];
              if (part) parts[i].push({ type: 'text', value: part });
            });
          } else {
            // Non-text child: assign to first line only (or could be recursive)
            if (!parts[0]) parts[0] = [];
            parts[0].push(child);
          }
        });
        parts.forEach(p => {
          const clone = { ...node, children: p };
          if (p.length) clone.dataLineSpan = 1; // single line for now; adjust later
          currentLine.push(clone);
          pushLine();
        });
      } else {
        currentLine.push(node);
      }
    } else {
      // Unknown node type...
      console.log('UNKNOWN NODE TYPE:', node);
    }
  }

  if (currentLine.length || lines.length === 0) pushLine();

  return lines;
}

/**
 * Compute the line span for a line of children.
 * @param {ElementContentWithLineSpan[]} lineChildren
 */
function getLineSpan(lineChildren) {
  let span = 1;
  lineChildren.forEach(c => {
    if(c.type === 'element' && c.dataLineSpan) span = Math.max(span, c.dataLineSpan);
  });
  return span;
}

/**
 * 
 * @param {HastElement} el 
 * @returns 
 */
function conditionallyAddClassName(el) {
  el.properties = el.properties || {};
  const existing = el.properties?.className;
  /** @type {string[]} */
  const className = Array.isArray(existing)
    ? [...existing]
    : existing
    ? [existing.toString()]
    : [];
  console.log('CONDITIONALLY ADDING CLASS NAME:', className, el.properties)
  if(className.length && (className.includes('astro-code') || className.includes('starry-night')))
    return;
  className.push('starry-night');
  el.properties.className = className;
  console.log('CONDITIONALLY ADDED CLASS NAME:', className)
}

/**
 * Rehype plugin to split Starry Night highlighted code blocks into lines.
 */
export default function rehypeSplitCodeLines() {
  // const numThresh = numPreview + numBuffer;
  
  /**
   * Description placeholder
   *
   * @param {HastRoot} tree 
   */
  function transform(tree) {
    // console.log('TRANSFORMING TREE:', tree);
    visit(tree, 'element', (/**@type {HastElement} */ node) => {
      if(node.tagName !== 'pre') return CONTINUE;
      const codeElem = getSingleCodeChild(node);

      if(!codeElem) {
        console.log('NO CODEELEM');
        return CONTINUE;
      }
      const langName = isHighlightedPre(node) || isHighlightedCode(codeElem);
      if(!langName) {
        console.log('Neither pre nor its child code are highlighted:', node, codeElem);
        return CONTINUE;
      }
    
      const children = codeElem.children;
      
      if(!children) {
        console.log('No non-empty code elem child:', node, codeElem)
        return SKIP;
      }
      // console.log('Node:', node);
      // console.log('Code node children:', codeElem.children);

      const lines = flattenChildrenToLines(codeElem.children);

      if(langName !== true) {
        node.properties ??= {};
        node.properties['data-language'] = node.properties['data-language'] || langName;
      }
      conditionallyAddClassName(node);

      // Wrap lines in line divs
      codeElem.children = lines.map(lineChildren => ({
        type: 'element',
        tagName: 'span',
        properties: {
          className: 'line code-line',
          // If any child has `dataLineSpan`, attach it
          'data-line-span': getLineSpan(lineChildren),
        },
        children: lineChildren,
      }));

      console.log(node);
      return SKIP;
    });
  }

  // console.log('Plugin loaded', transform);

  return transform;
}
