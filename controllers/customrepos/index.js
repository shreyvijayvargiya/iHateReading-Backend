import { gemini15Flash, googleAI } from "@genkit-ai/googleai";
import admin from "firebase-admin";
import { genkit } from "genkit";
import z from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const TECH_MAP = {
	frameworks: {
		"next.js": "Create pages/ directory with SSR setup",
		"create-react-app": "Generate src/ structure with React 18+",
		"react.js": "Standard React project setup",
	},
	ui: {
		"shadcn/ui": "Add components/ with shadcn primitives",
		mui: "Create theme/ directory with Material UI config",
		antd: "Configure antd theme in src/antd",
	},
	styling: {
		tailwindcss: "Generate tailwind.config.js + postcss.config.js",
		"css-modules": "Create styles/ directory with .module.css files",
		"styled-components": "Add theme provider and base styles",
	},
	state: {
		zustand: "Create store/ with slices",
		redux: "Generate redux store with toolkit",
		context: "Add context providers directory",
	},
	payments: {
		stripe: "Create api/stripe with webhook handlers",
		paypal: "Add paypal client integration in lib/payments",
	},
	email: {
		resend: "Generate email templates and react-email components",
		sendgrid: "Create email service in lib/mail",
	},
	cms: {
		sanity: "Setup sanity studio and schemas",
		contentful: "Add contentful client config",
	},
	database: {
		firebase: "Initialize Firebase config in services/firebase",
		supabase: "Create supabase client in lib/supabase",
	},
};

const getSystemPrompt = (dependencyGraph) => `
	You are a professional project generator. Create a repository structure for:
	${dependencyGraph.projectname}

	**Technical Requirements**:
	${Object.entries(dependencyGraph)
		.filter(([k]) => k !== "projectname")
		.map(([category, tech]) => {
			const instructions =
				TECH_MAP[category.replace(/library|management/g, "").trim()]?.[tech];
			return instructions ? `• ${tech.toUpperCase()}: ${instructions}` : "";
		})
		.filter(Boolean)
		.join("\n")}

	**Core Rules**:
	1. Use latest stable versions (Today: ${new Date().toISOString().split("T")[0]})
	2. Follow official documentation patterns
	3. Include essential config files
	4. Implement security best practices

	**File Structure Constraints**:
	- Max directory depth: 2
	- Valid JSON output only
	- No markdown/backticks
	- Required base files:
		${["package.json", ".gitignore", "README.md"].map((f) => `∘ ${f}`).join("\n  ")}

	**Example Output Format**:
	{
		"name": "${dependencyGraph.projectname}",
		"type": "directory",
		"children": [
			{
				"name": "package.json",
				"type": "file",
				"content": {
					"dependencies": {
						"react": "^18.2.0",
						"tailwindcss": "^3.3.0"
					}
				}
			},
			{
				"name": "components",
				"type": "directory",
				"children": [
					{
						"name": "ui",
						"type": "directory",
						"children": [
							{"name": "button.tsx", "type": "file", "content": "// Shadcn UI button component"}
						]
					}
				]
			}
		]
	}

	**Validation Checklist**:
	1. Verify JSON syntax
	2. Check directory depth
	3. Confirm required tech integration
	4. Validate package.json versions
	5. Ensure no missing dependencies
`;

const ai = genkit({
	plugins: [googleAI()],
	model: gemini15Flash,
});

export const createCustomRepoApi = async (req, res) => {
	try {
		const { instructions } = req.body;

		const { text } = await ai.generate({
			prompt: instructions,
			system: `
				You are a senior software developer. Always return a valid JSON object of a project repository, structured according to the following Zod schema:

				const { z } = require("zod");

				const FileSchema = z.object({
					name: z.string(),
					type: z.literal("file"),  // 'type' must exactly be "file"
					content: z.string(), // File content as a string
				});

				const FolderSchema = z.object({
					name: z.string(),
					type: z.literal("directory"),  // 'type' must exactly be "directory"
					children: z.array(z.union([FileSchema, z.lazy(() => FolderSchema)])), // Can contain files or nested folders
				});

				const DirSchema = z.object({
					name: z.string(),
					type: z.literal("directory"),  // 'type' must exactly be "directory"
					children: z.array(z.union([FileSchema, FolderSchema])), // Array of files or subfolders
				});

				Your response should follow the structure defined by the DirSchema:
				
				- Each directory should have the properties:
					- "name": string (name of the directory)
					- "type": "directory" (the 'type' must be exactly "directory")
					- "children": array of files or directories (max depth of 2 levels)
					
				- Each file should have the properties:
					- "name": string (name of the file)
					- "type": "file" (the 'type' must be exactly "file")
					- "content": string (content of the file)

				Example structure:
				{
					"name": "project-root",
					"type": "directory",  // 'type' must be "directory" exactly
					"children": [
						{
							"name": "package.json",
							"type": "file",  // 'type' must be "file" exactly
							"content": "{...}"
						},
						{
							"name": "src",
							"type": "directory",  // 'type' must be "directory" exactly
							"children": [
								{
									"name": "index.js",
									"type": "file",  // 'type' must be "file" exactly
									"content": "// Entry point for the app"
								}
							]
						}
					]
				}

				Please ensure the output is structured in JSON format, matching the described schema, and avoid any additional comments, markdown, or code blocks. 
				The 'type' field must always be the exact strings "file" or "directory", with lowercase letters.
			`,
			config: {
				maxOutputTokens: 4000,
			},
		});

		const cleanedText = text.replace(/```json|```/g, "").trim();
		const outputJSON = JSON.parse(cleanedText);
		const validatedOutput = DirSchema.parse(outputJSON);

		res.send({ response: validatedOutput });
	} catch (e) {
		console.error("Error generating repository:", e);
		res.status(500).json({
			success: false,
			message: "Error generating repository",
		});
	}
};

const client = new ChatOpenAI({
	temperature: 0.7,
	model: "gpt-4o-mini",
	apiKey: process.env.OPENAI_API_KEY,
});

const FileSchema = z.object({
	name: z.string(),
	type: z.literal("file"),
	content: z.union([z.string(), z.record(z.any())]), 
});

const FolderSchema = z.lazy(() =>
	z.object({
		name: z.string(),
		type: z.literal("directory"),
		children: z.array(z.union([FileSchema, z.lazy(() => FolderSchema)])),
	})
);

const DirSchema = FolderSchema;

export const generateCustomRepo = async (req, res) => {
	try {
		const { dependencyGraph } = req.body;
		const systemPrompt = getSystemPrompt(dependencyGraph);

		const response = await client.invoke([
			new SystemMessage(systemPrompt),
			new HumanMessage("Generate the defined repository structure"),
		]);

		const validated = FolderSchema.parse(JSON.parse(response.content));
		res.send(validated);
	} catch (e) {
		console.log(e, "error in generating custom repo");
		res.send("Error in generating custom repo");
	}
};
