import rss, { pagesGlobToRssItems } from '@astrojs/rss';

// @ts-ignore
export async function GET(context) {
  return rss({
    title: 'Stan Soo - Portfolio',
    description: 'Simple portfolio showcasing recent projects',
    site: context.site,
    items: await pagesGlobToRssItems(import.meta.glob('./**/*.md')),
    customData: `<language>en</language>`,
  });
}