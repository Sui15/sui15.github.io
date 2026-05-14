import { defineCollection, z } from 'astro:content';

const positions = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string(),
    title: z.string(),
    image: z.string(),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = {
  positions,
};
