import { z, defineCollection } from 'astro:content';

const articlesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    tags: z.array(z.string()).optional(),
    summary: z.string(),
    cover: z.string().optional(),
    featured: z.boolean().optional(),
  }),
});

const appsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    version: z.string(),
    date: z.date().optional(),
    platforms: z.array(z.string()),
    icon: z.string().optional(),
    tags: z.array(z.string()).optional(),
    downloadUrl: z.string().optional(),
    repoUrl: z.string().optional(),
    screenshots: z.array(z.string()).optional(),
    summary: z.string(),
    featured: z.boolean().optional(),
  }),
});

export const collections = {
  articles: articlesCollection,
  apps: appsCollection,
};