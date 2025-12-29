import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
// import type { CombinedPropertiesOf } from "@/lib/type-utils";
import { cn } from "@/lib/utils";
import { LucideChevronDown, LucideChevronUp } from "lucide-react";
import React from "react";
// import {gsap} from 'gsap';

// import _ from '@/styles/details.css';

function isStaticHtmlNode(node: unknown): node is React.ReactElement<StaticHtmlProps> {
  return (
    React.isValidElement(node) &&
    typeof node.type === 'function' &&
    node.type.name === 'StaticHtml'
  );
}
interface StaticHtmlProps {
  value: string;
  hydrate?: boolean;
}

// declare const StaticHtml: React.FC<StaticHtmlProps>;


let unifiedPromise: Promise<(typeof import('unified'))> | null = null;
let rehypeParsePromise: Promise<typeof import('rehype-parse')> | null = null;
let rehypeParse: typeof import('rehype-parse')['default'] | null = null;
let unified: typeof import('unified')['unified'] | null = null;
let unist: typeof import('unist-util-visit') | null = null;
let unistPromise: Promise<typeof import('unist-util-visit')> | null = null;

async function getRehypeParse() {
  // if (typeof window === 'undefined') { // Only import on the server
  if(rehypeParse) return rehypeParse;
  rehypeParsePromise ??= import('rehype-parse');
  return (rehypeParse = (await rehypeParsePromise).default);
  // }
  // return null;
}

async function getUnified() {
  // if (typeof window === 'undefined') { // Only import on the server
    if(unified) return unified;
    unifiedPromise ??= import('unified');
    return (unified = (await unifiedPromise).unified);
  // }
  // return null;
}


async function getUnistUtilVisit() {
  // if (typeof window === 'undefined') { // Only import on the server
    if(unist) return unist;
    unistPromise ??= import('unist-util-visit');
    return (unist = (await unistPromise));
  // }
  // return null;
}

let parser: DOMParser | null = null;

const isCodeStaticHtmlElem: (value: string) => boolean = (typeof window === 'undefined') ? await ( async ()=>{
  // console.log('ON SERVER');
  const unified = await getUnified();
  if(!unified) throw new Error();
  const rehypeParse = await getRehypeParse();
  if(!rehypeParse) throw new Error();
  const unist = await getUnistUtilVisit();
  if(!unist?.visit) throw new Error();

  return (value) => {
    const tree = unified()
      .use(rehypeParse, { fragment: true }) // parse fragment, not full document
      .parse(value);    
    // console.log('UNIFIED:', value, tree);
    let codeNode: any = null;
    unist.visit(tree, 'element', (node) => {
      // console.log('unist visit:', node)
      if (node.tagName === 'code') {
        codeNode = node;
        return unist.EXIT; // stop traversal once found
      }
    });
    return !!codeNode;
  }
})() : (
  (value) => {
    parser ??= new DOMParser();
    const doc = parser.parseFromString(value, "text/html");
    const codeElem = doc.querySelector("code");
    return !!codeElem;
    // return new Promise(resolve=>resolve(!!codeElem));

    // if (codeElem) {
    //   console.log(codeElem.innerHTML); // highlighted HTML inside <code>
    // }
  }
);



function isCodeElem(node: React.ReactNode): node is React.ReactElement<React.ComponentProps<'code'>, 'code'> | React.ReactElement<StaticHtmlProps, 'code'> {
  if(!React.isValidElement(node)) return false;
  if(node.type === 'code') return true;
  if(!isStaticHtmlNode(node)) return false;
  // console.log('Is static HTML:', node)
  return isCodeStaticHtmlElem(String(node.props.value));
}


function nodeIncludesCodeElem<T extends React.ReactNode>(children: T): [(T extends Iterable<React.ReactNode> ? Array<React.ReactNode> : T), boolean | undefined] {
  if(!children) return [children as (T extends Iterable<React.ReactNode> ? Array<React.ReactNode> : T), undefined];
  if(typeof children !== 'object')
    return [children as (T extends Iterable<React.ReactNode> ? Array<React.ReactNode> : T), false];
  if(Symbol.iterator in children) {
    const childArray = Array.isArray(children) ? children : Array.from(children);
    
    return [childArray as (T extends Iterable<React.ReactNode> ? Array<React.ReactNode> : T), 
      (childArray.some(x=>!!x) ? childArray.some(isCodeElem) : undefined)]
  }
  return [children as (T extends Iterable<React.ReactNode> ? Array<React.ReactNode> : T), (children === null || children === undefined ? undefined : isCodeElem(children))];
}

function isHighlightedCodeBlock(children: React.ReactNode, props: React.HTMLAttributes<HTMLPreElement> & {[propName: string]: any}) {
  const [children_, tf] = nodeIncludesCodeElem(children);
  if(tf === false) return [false, children_];
  if(props['data-language'])
    return [true, children_];
  // if(props.className && (props.className.includes('starry-night') || props.className.includes('astro-code')))
    // return [true, children_];
  return [false, children_];
}

const NUM_PREVIEW_LINES: number = 3;
const NUM_BUFFER_LINES: number = 2;

const NUM_THRESH_LINES = NUM_BUFFER_LINES + NUM_PREVIEW_LINES;

function isBlankNode(node: React.ReactNode): boolean | Promise<boolean> {
  const isBlank = (()=>{
    if(!node && node !== 0 && node !== false) return true;
    if(typeof node === 'string') return !node.trim().length;
    if(typeof node !== 'object') return false;
    if(Symbol.iterator in node) {
      const arr = Array.from(node);
      return !arr.length || arr.every(x=>isBlankNode(x)===true);
    }
    if(node instanceof Promise) return node.then(isBlankNode);
    // @ts-expect-error Props may be empty object type
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return isBlankNode(node.props?.children);
  })();
  // console.log('isBlankNode:', node, isBlank)
  return isBlank
}

function splitChildLines(children: Iterable<React.ReactNode>): [React.ReactNode, React.ReactNode] {
  const arr = Array.from(children);
  // if(arr.length <= NUM_PREVIEW_LINES)
  //   return [children, null];
  if(arr.length <= NUM_THRESH_LINES)
    return [children, null];
  // return [arr.slice(0, NUM_THRESH_LINES), arr.slice(NUM_THRESH_LINES)];
  let n = NUM_THRESH_LINES;
  while(n > NUM_BUFFER_LINES) {
    const child = arr[n];
    if(isBlankNode(child))
      n--;
    else
      break;
  }
  if(!n) return [null, children];
  const above = arr.splice(0, n);
  return [above, arr];
}
type CodeElement = React.ReactElement<React.HTMLAttributes<HTMLElement>, 'code'>;

type SpanElem = React.ReactHTMLElement<HTMLSpanElement>;
type SpanElems = Iterable<SpanElem>;
type SplitLines = [above: SpanElems | undefined, below: SpanElems] // | [above: null, below: NonNullable<React.ReactNode>]
type CodeElemTransformSpec = [props: React.ComponentProps<'code'> | undefined, SplitLines | undefined]; //[shouldTransform: false, splitLines: null] | [shouldTransform: true, SplitLines];

function useCodeElemTransformSpec(elem: React.ReactNode): CodeElemTransformSpec {
  const lastChildren = React.useRef<React.ReactNode>(undefined);
  const lastReturn = React.useRef<SplitLines | undefined | null>(null);
  
  if(!React.isValidElement(elem) || elem.type !== 'code') return [undefined, undefined];
  const {children: grandchildren, ...props} = (elem as CodeElement).props;

  // TODO: Better comparison
  if(null !== lastReturn.current && lastChildren.current === grandchildren) {
    lastChildren.current = grandchildren;
    return [props, lastReturn.current];
  }

  const ret = lastReturn.current = (()=>{
    if(!grandchildren || typeof grandchildren !== 'object' || !(Symbol.iterator in grandchildren)) return undefined;

    const [above, below] = splitChildLines(grandchildren);
    if(!below) return undefined;
    // if(!above) return true;

    return [above, below] as SplitLines;
  })();
  lastChildren.current = grandchildren;
  return [props, ret];
}



// type HTMLDivOrCodeElement = CombinedPropertiesOf<HTMLDivElement, HTMLElement, true, false>


const TransformedCodeElement = ({contentRef, above, below, children, ...props}: {contentRef: React.RefObject<HTMLDivElement | null> | ((el: HTMLDivElement | HTMLElement | null)=>void), above: SpanElems | undefined, below: SpanElems | undefined, } & React.ComponentProps<'code'>) => {
  if(!below) return <code {...props}>{children}</code>;
  if(!above) return <CollapsibleContent className="CollapsibleContent" asChild>
    <code {...props}>{children}</code>
  </CollapsibleContent>;

  return <code {...props}>
    {above}
    <CollapsibleContent asChild>
      <div ref={contentRef} className="CollapsibleContent pb-2em overflow-y-hidden overflow-x-visible m-0 p-0 inset-0 border-none bg-none outline-none shadow-none drop-shadow-none">{below}</div>
    </CollapsibleContent>    
    {/* bg-blue-900/50 */}
    <div className="collapsible-content-overlay absolute bottom-2 left-2 w-[calc(100%-4*var(--spacing))] h-[3em] rounded-b-sm pointer-events-none
      bg-linear-to-t from-black/25 via-black/10 via-25% dark:from-black/75
    "/>
  </code>
}



const CollapsibleCodeInner = React.memo(({children: propsChildren, className, ...props}: React.HTMLAttributes<HTMLPreElement> & {'data-language'?: string}) => {
  'use:client';
  const [tf, children] = isHighlightedCodeBlock(propsChildren, props);
  const [open, setOpen] = React.useState<boolean>(false);
  const toggleOpen = React.useCallback(()=>setOpen(v=>!v), []);

  const [codeProps, codeTransformSpec] = tf ? useCodeElemTransformSpec(children) : [undefined, undefined];
  const [above, below] = React.useMemo(()=>[codeTransformSpec?.[0], codeTransformSpec?.[1]], [codeTransformSpec]);

  const contentRef = React.useRef<HTMLDivElement|HTMLElement|null>(null);
  const contentRefCallback = React.useCallback((el: HTMLDivElement | HTMLElement | null)=>{
    contentRef.current = el;
  }, []);

  // const openedRef = React.useRef<boolean|undefined>(undefined);
  // React.useEffect(()=>{
  //   if(!tf) return;
  //   const div = contentRef.current;
  //   if(!div) return;
  //   console.log('open, client/scroll height:', open, div.clientHeight, div.scrollHeight);
  //   const tween = (()=>{
  //     if(open) {
  //       if(div.clientHeight === div.scrollHeight) return;
  //       return gsap.fromTo(div, {
  //         height: div.clientHeight,
  //       }, {
  //         height: div.scrollHeight,
  //         duration: 0.5,
  //         paused: false,
  //         onStart: () => { openedRef.current = undefined; },
  //         onComplete: () => {
  //           openedRef.current = true;
  //           console.log('client/scroll height (complete):', div.clientHeight, div.scrollHeight);
  //           gsap.set(div, {height: 'auto'});
  //           console.log('client/scroll height (complete):', div.clientHeight, div.scrollHeight);

  //         },
  //       })
  //     } else if(div.clientHeight) {
  //       return gsap.fromTo(div, {
  //         height: div.clientHeight,
  //       }, {
  //         height: 0,
  //         duration: 0.5,
  //         onStart: () => { openedRef.current = undefined; 
  //           // console.log('client/scroll height (complete):', div.clientHeight, div.scrollHeight);
  //         },
  //         onComplete: () => { openedRef.current = false; 
  //           console.log('client/scroll height (complete):', div.clientHeight, div.scrollHeight);
  //         },
  //       })
  //     }
  //   })();

  //   if(!tween) return;
  //   return ()=>{
  //     console.log('Killing tween')
  //     tween.kill();
  //   }
  // }, [tf, open])

  if (!tf) {
    return <pre {...props} children={children} className={className} />;
  }

  const language = props['data-language']?.toUpperCase();
    
  return (
      <Collapsible open={open} onOpenChange={setOpen} data-collapsible-open={open} disabled={!codeTransformSpec} className="collapsible-code" asChild>
        <div className="flex flex-col flex-nowrap mx-4 my-3 relative">
          {language && <div className="absolute self-center text-center bg-white/20 text-foreground px-1 py-0.5 font-light rounded-md backdrop-blur-sm backdrop-brightness-125">
            {language}
          </div>}

          <div className="bg-emerald-300 dark:bg-green-900 p-2 rounded-md">
            <pre {...props} className={cn(
              "rounded-sm p-4",
              "overflow-x-auto overflow-y-hidden",
              "text-nowrap",
              className)}>
                <TransformedCodeElement contentRef={contentRefCallback} above={above} below={below} {...codeProps}/>
              {/* {content} */}
              {/* <div className="absolute self-center">Turtles</div> */}
            </pre>
          </div>

          {/* <div className="flex flex-row bg-green-100 dark:bg-green-900 h-2"></div> */}
          {codeTransformSpec && 
            <div className="absolute bottom-0 self-center text-center rounded-full block justify-self-center place-self-center mx-auto">
              <CollapsibleTrigger onClick={toggleOpen} className="text-center not-disabled:cursor-pointer rounded-full bg-white/20 backdrop-blur-sm backdrop-brightness-125 text-foreground p-1 min-w-6 min-h-6 hover:bg-white/50 hover:backdrop-blur-lg shadow-xs shadow-accent-foreground drop-shadow-accent-foreground" asChild>
                {open ? <LucideChevronUp/> : <LucideChevronDown/>}
              </CollapsibleTrigger>
            </div>
          }
        </div>
      </Collapsible>
  );
});



// {/* <div className="flex flex-row bg-green-100 dark:bg-green-900">
//     <CollapsibleTrigger className="text-sm text-muted-foreground" onClick={onClick} asChild>
//       <Button onClick={onClick}>Show code</Button>
//     </CollapsibleTrigger>
//   </div> */}

export default function CollapsibleCode({children, ...props}: React.HTMLAttributes<HTMLPreElement>) {
  const [isClient, setIsClient] = React.useState(false);

  React.useLayoutEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <pre {...props}>{children}</pre>;
  }

  return <CollapsibleCodeInner {...props}>
    {children}
  </CollapsibleCodeInner>;
}