// import type { FC } from "react";
// import { renderToString, renderSlotToString, renderComponent, renderTemplate, renderJSX, render, type AstroComponentFactory } from "astro/runtime/server/index.js";
// // import type { AstroComponentFactory } from "astro/dist/runtime/server/render/astro";
// // import { AstroComponentInstance, renderToString } from "astro/dist/runtime/server";
// // import { renderComponentToString } from "astro/dist/runtime/server/render";
// import React from "react";
// import { renderComponentToString } from "astro/runtime/server/render/component.js";

// interface Props {
//   factory: AstroComponentFactory;
//   data?: Record<string, any>;
// }

// export const AstroFactoryBridge: FC<Props> = ({ factory: Factory, data }) => {
//   const [content, setContent] = React.useState<React.ReactNode>(null);

//   React.useEffect(() => {
//     let mounted = true;
//     // render the Astro factory to HTML string
//     Factory(null, data, null).then(({ html }) => {
//       if (mounted) setContent(<div dangerouslySetInnerHTML={{ __html: html }} />);
//     });
//     return () => { mounted = false; };
//   }, [factory, data]);

//   return <>{content}</>;
// };