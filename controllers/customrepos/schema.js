import { z } from "zod";

const FileSchema = z.object({
  name: z.string(),
  type: z.literal("file"),
  content: z.union([z.string(), z.record(z.any())]),
});

export const DirSchema = z.lazy(() =>
  z.object({
    name: z.string(),
    type: z.literal("directory"),
    children: z.array(z.union([FileSchema, z.lazy(() => DirSchema)])),
  })
);
