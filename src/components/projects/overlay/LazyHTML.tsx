import { useState, useMemo } from 'react';
import parse from 'html-react-parser';

interface LazyHtmlProps {
  html: string;
}

export default function LazyHtml({ html }: LazyHtmlProps) {
  // State to hold parsed content; initially undefined
  const [parsed, setParsed] = useState<ReturnType<typeof parse> | null>(null);

  // Parse on first render (or when shown) only
  const content = useMemo(() => {
    if (!parsed) {
      const nodes = parse(html);
      setParsed(nodes);
      return nodes;
    }
    return parsed;
  }, [html, parsed]);

  return <>{content}</>;
}
