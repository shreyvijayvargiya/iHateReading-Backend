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
	authentication: frameworkSchema.optional(),
	testing: frameworkSchema.optional(),
	linting: frameworkSchema.optional(),
	deployment: frameworkSchema.optional(),
	api: frameworkSchema.optional(),
});

export const dependencyGraphSchema = z.object({
	projectname: z.string().optional(),
	frameworks: z.enum([
		"next.js",
		"create-react-app",
		"vite.js",
		"remix",
		"other",
	]),
	styling: z.enum(["tailwindcss", "css-modules", "styled-components"]),
	database: z.enum(["firebase", "supabase", "appwrite"]).optional(),
	ui: z
		.enum(["shadcn/ui", "mui", "antd", "mantine", "chakra-ui", "other"])
		.optional(),
	cms: z
		.enum(["sanity", "contentful", "directus", "strapi", "wordpress", "other"])
		.optional(),
	payment: z
		.enum(["stripe", "paypal", "lemonsqueezy", "razorpay", "other"])
		.optional(),
	emailing: z.enum(["resend", "sendgrid", "mailgun", "other"]).optional(),
	statemanagement: z
		.enum(["redux", "zustand", "jotai", "mobx", "xstate"])
		.optional(),
	routing: z.enum(["next.js", "react-router", "react-router-dom"]).optional(),
	testing: z.enum(["jest", "vitest", "cypress"]).optional(),
	linting: z.enum(["eslint", "prettier"]).optional(),
	deployment: z
		.enum([
			"vercel",
			"netlify",
			"heroku",
			"railway",
			"aws",
			"bun",
			"bun.sh",
			"other",
		])
		.optional(),
	authentication: z.enum(["firebase", "supabase", "appwrite"]).optional(),
	api: z.enum(["firebase", "supabase", "appwrite"]).optional(),
	other: z.string().optional(),
	monitoring: z.enum(["sentry", "logrocket", "other"]).optional(),
	analytics: z
		.enum([
			"google-analytics",
			"mixpanel",
			"other",
			"amplitude",
			"posthog",
			"plausible",
		])
		.optional(),
	seo: z
		.enum(["next-seo", "react-helmet", "other", "vercel-analytics"])
		.optional(),
	sms: z.enum(["twilio", "other"]).optional(),
});
