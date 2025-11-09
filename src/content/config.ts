// src/content/config.ts
import { defineCollection, z } from 'astro:content';
import LazyTextFileInstance from '../utils/textloader';
import type { Loader, DefaultObjectPromise } from '../components/story/util/types/types';
import type { ImageInputFormat } from 'astro';
// import { imageMetadata } from 'astro/assets/utils';


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

const imageInputFormats = z.union(
  [z.literal<string>("svg"), z.literal<string>("jpeg"),
  z.literal<string>("jpg"),z.literal<string>("png"),z.literal<string>("tiff"),z.literal<string>("webp"),
  z.literal<string>("gif"),z.literal<string>("avif")]);

const imageLoaderSchema = z.function(
  z.tuple([]),
  z.promise(
    z.object({
      default: z.object({
        src: z.string(),
        width: z.number(),
        height: z.number(),
        format: imageInputFormats,
        orientation: z.optional(z.string()),
      }),
    })
  )
  // z.instanceof <typeof Promise<DefaultObjectPromise<ImageMetadata>>>(
  //     Promise<DefaultObjectPromise<ImageMetadata>>
  // )
);

// const backdropImageCollection = defineCollection({
//   schema: z.object({
//     id: z.string(),
//     imageLoaderSchema,
//   loader(): Record<string, ()=>Promise<{default:ImageMetadata}>> {
//     const obj = Object.fromEntries(Object.entries(import.meta.glob<{default: ImageMetadata}>('/public/images/story/backdrop/*.{jpg,jpeg,png,gif}')));
//     console.log(obj);
//     return obj;
//   },
// });



const projectCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    year: z.number(),

    description: z.string().optional(),
    summary: z.string().optional(),
    
    category: z.string(),
    audience: z.string().optional(),
    tags: z.object({
      languages: z.array(z.string()).optional(),
      skills: z.array(z.string()).optional(),
      topics: z.array(z.string()).optional(),
    }),
    images: z.array(z.string()).optional(),
  }),
})





export const collections = {
  staticData: jsonDataCollection,
  loremIpsum: loremIpsumCollection,
  projects: projectCollection,
  // backdropImages: backdropImageCollection, 
  // storySections: storySectionCollection
};




