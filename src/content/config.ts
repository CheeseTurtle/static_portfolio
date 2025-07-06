// src/content/config.ts
import { glob, type Loader } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';
import LazyTextFileInstance from '../utils/textloader';


const jsonDataCollection = defineCollection({
  type: "data",
  schema: z.object({
    //Define JSON-file structure
    profileImage: z.string(),
    profileAlt: z.string(),
    profileLink: z.string(),
    profileTitle: z.string(),
    profileName: z.string(),
    github: z.string().url(),
    githubText: z.string(),
    portfolioImage: z.string(),
    email: z.string().email(),
    linkedin: z.string().url(),
    instagram: z.string().url(),
    youtube: z.optional(z.nullable(z.string().url())),
    alias: z.optional(z.nullable(z.string())),
    aliasYouTube: z.optional(z.nullable(z.string())),
    aliasInstagram: z.optional(z.nullable(z.string())),
    aliasLinkedIn: z.optional(z.nullable(z.string())),
    aliasGithub: z.optional(z.nullable(z.string())),
    contactSectionTitle: z.string(),
    contactSectionSubtitle: z.string(),
    contactSectionButtonText: z.string(),
    contactSectionButtonIcon: z.string(),
    techsTitle: z.string(),
    instagramIconName: z.string(),
    youtubeIconName: z.string(),
    githubIconName: z.string(),
    linkedinIconName: z.string(),
    emailIconName: z.string(),
  }),
});

// const storySectionCollection = defineCollection({
//   // type: 'content',
//   loader: glob({pattern: '**/*.mdx', base: './src/pages/story/sections'}),
  
//   schema: z.object({
//     title: z.string(),
//     id: z.string(),
//     date: z.date(),
//     backdropImage: z.optional(z.string())
//   })
// })



const fileNameExtractionRegex = /(?<=\/|^)[^/.]+(?=\.(?:txt|md)$)/;
function extractFileName(filePath: string): string {
  const match = fileNameExtractionRegex.exec(filePath)
  if(match === null)
    throw `Invalid filepath/name: '${filePath}'`;
  return match[0];
}

const loremIpsumCollection = defineCollection({
  type: 'content_layer',
  async loader(): Promise<Record<string, LazyTextFileInstance>> {
    const files = import.meta.glob<Record<string,any>>('/dev/lorem_ipsum/*.txt');
    const obj = Object.fromEntries(
      Object.entries(files).map((pair) =>
        // console.log(pair) ??
        ((id, path) => [id, new LazyTextFileInstance(path, id)])(
          extractFileName(pair[0]), pair[0])
      )
    );
    // console.log(obj);
    return obj;
  },

  schema: z.object(
    {
      id: z.string(),
      path: z.string(),
      loadedContent: z.optional(z.string()),
      paragraphs: z.optional(z.array(z.string())),

      // load: z.function(z.tuple([]),z.string())
    })
});


export const collections = {
  staticData: jsonDataCollection,
  loremIpsum: loremIpsumCollection
  // storySections: storySectionCollection
};
