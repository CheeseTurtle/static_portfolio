import * as React from "react";
import { createStarryNight } from "@wooorm/starry-night";
import sourceAstro from "@wooorm/starry-night/source.astro";

import sourceJs from "@wooorm/starry-night/source.js";
import sourceTs from "@wooorm/starry-night/source.ts";
import sourceTsx from "@wooorm/starry-night/source.tsx";
import textMd from "@wooorm/starry-night/text.md";

import sourceMdx from "@wooorm/starry-night/source.mdx";

import sourceProlog from "@wooorm/starry-night/source.prolog";
import sourceYAML from "@wooorm/starry-night/source.yaml";

import sourcePowerShell from "@wooorm/starry-night/source.powershell";
import sourcePython from "@wooorm/starry-night/source.python";
// import sourcePythonRegex from "@wooorm/starry-night/source.regexp.python";


import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";

type StarryNight = Awaited<ReturnType<typeof createStarryNight>>;
type Root = ReturnType<StarryNight['highlight']>;
// type Root2 = Parameters<typeof toJsxRuntime>[0];


// let starryNightWebPromise: Promise<StarryNight> | null = null;

type StarryNightContextValue = {
  starryNights: React.RefObject<Partial<Record<LanguageKey, Promise<StarryNight>>>>,
  getStarryNight: (lang: LanguageKey) => Promise<StarryNight>
}

const StarryNightContext = React.createContext<StarryNightContextValue | null>(null);

export function useStarryNightContext() {
  const value = React.useContext(StarryNightContext);
  if(!value) throw new Error('Not in StarryNightContext Provider');
  return value;
}


export type LanguageKey = 'mdx' | 'jsx' | 'js' | 'tsx' | 'ts' | 'astro' | 'yaml' | 'ps1' | 'pro' | 'py' | 'md';


function getGrammarsForKey(key: LanguageKey) {
  switch(key) {
    case 'md':
      return [textMd];
    case 'mdx':
      return [textMd, sourceJs, sourceTs, sourceTsx, sourceMdx];
    case 'yaml':
      return [sourceYAML];
    case 'astro':
      return [sourceAstro];
    case 'js':
      return [sourceJs];
    case 'ts':
      return [sourceTs];
    case 'tsx':
      return [sourceTs, sourceTsx];
    case 'ps1':
      return [sourcePowerShell];
    case 'py':
      return [sourcePython];
    case 'jsx':
      return [sourceJs]; // TODO
    case 'pro':
      return [sourceProlog];
    default:
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new TypeError(`Unknown language key: ${key}`);

  }

}

export function StarryNightProvider(props?: Omit<React.ComponentPropsWithoutRef<typeof StarryNightContext.Provider>, 'value'>) {
  const starryNights = React.useRef<Partial<Record<LanguageKey, Promise<StarryNight>>>>({});

  const getStarryNight = React.useCallback((key: LanguageKey)=>{
    const promise = starryNights.current[key];
    if(undefined !== promise && null !== promise) return promise;
    const grammars = getGrammarsForKey(key);
    return (starryNights.current[key] = createStarryNight(grammars));
  }, [])

  const value = React.useMemo(()=>({
    starryNights, getStarryNight
  }), [starryNights, getStarryNight])

  return <StarryNightContext.Provider {...props} value={value}/>
}

// function getStarryNight() {
//   if (!starryNightWebPromise) {
//     starryNightWebPromise = createStarryNight([sourceJs]);
//   }
//   return starryNightWebPromise;
// }



export function renderTree(tree: Root) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return toJsxRuntime(tree, {
    Fragment, jsx,jsxs
  });
}

const scopeForLang: Record<LanguageKey, string> = {
  md: "text.md",
  mdx: "source.mdx",
  js: "source.js",
  jsx: 'source.js',
  ts: "source.ts",
  tsx: "source.tsx",
  astro: "source.astro",
  yaml: "source.yaml",
  ps1: "source.powershell",
  py: "source.python",
  pro: "source.prolog",
};

export async function highlight(promise: Promise<StarryNight>, source: string, lang: LanguageKey) {
  const scope = scopeForLang[lang];
  const starryNight = await promise;
  const tree = starryNight.highlight(source, scope);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return renderTree(tree);
}


export type HighlightedCodeProps = (React.ComponentProps<'pre'>) & {
  lang: LanguageKey,
  children: string,
}
export function HighlightedCode({lang, children, ...props}: HighlightedCodeProps) {
  const {getStarryNight} = useStarryNightContext();
  const promise = React.useMemo(()=>getStarryNight(lang), [lang, getStarryNight]);
  const highlighted = React.useMemo(()=>highlight(promise, children, lang), [promise, children, lang]);
  return <pre {...props}><code>
      <React.Suspense fallback={children}>
        {React.use(highlighted)}
      </React.Suspense>
    </code></pre>
}
