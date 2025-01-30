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

const sampleFileSchema = z.object({
	path: z.string().min(1),
	content: z.string().min(1),
});

const sampleCodeSchema = z.object({
	files: z.array(sampleFileSchema).nonempty(),
});

const dependencySchema = z.object({
	description: z.string().min(1),
	env: z.array(z.string().min(1)).optional(),
	sampleCode: sampleCodeSchema.optional(),
});

const frameworkSchema = z.record(z.string(), dependencySchema);

export const dependencyMapSchema = z.object({
	frameworks: frameworkSchema.optional(),
	ui: frameworkSchema.optional(),
	styling: frameworkSchema.optional(),
	statemanagement: frameworkSchema.optional(),
	payment: frameworkSchema.optional(),
	cms: frameworkSchema.optional(),
	database: frameworkSchema.optional(),
	emailing: frameworkSchema.optional(),
});

export const dependencyGraphSchema = z.object({
	projectname: z.string(),
	frameworks: z.enum(["next.js", "create-react-app", "vite.js"]),
	styling: z.enum(["tailwindcss", "css-modules", "styled-components"]),
	database: z.enum(["firebase", "supabase", "appwrite"]).optional(),
	ui: z.enum(["shadcn/ui", "mui", "antd"]).optional(),
	cms: z.enum(["sanity", "contentful"]).optional(),
	payment: z.enum(["stripe", "paypal", "lemonsqueezy"]).optional(),
	emailing: z.enum(["resend", "sendgrid"]).optional(),
});
