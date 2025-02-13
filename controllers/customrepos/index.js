import admin from "firebase-admin";
import zip from "adm-zip";
import { DirSchema, dependencyGraphSchema } from "./schema.js";
import crypto from "crypto";
import {
	getSystemPrompt,
	getUpdateSystemPrompt,
	getDependencySystemPrompt,
	getRoadmapSystemPrompt,
} from "./systemPrompt.js";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOllama } from "@langchain/ollama";
import { PromptTemplate } from "@langchain/core/prompts";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { performance } from "perf_hooks";
import { load } from "cheerio";
import TurndownService from "turndown";

const ollamaClient = new ChatOllama({
	model: "codellama:7b",
	temperature: 0.8,
	baseUrl: "http://localhost:11434",
	streaming: true,
});

const deepSeekClient = new ChatOllama({
	model: "deepseek-r1:8b",
	temperature: 0.8,
	baseUrl: "http://localhost:11434",
	streaming: true,
});

const client = new ChatOpenAI({
	temperature: 0.9,
	model: "gpt-4o-mini",
	apiKey: process.env.OPENAI_API_KEY,
});

const checkRepositoryStatusApi = async (dependencyGraphHash) => {
	try {
		const uniqueHash = crypto
			.createHash("sha256")
			.update(dependencyGraphHash)
			.digest("hex");
		const isExists = await admin
			.firestore()
			.collection("repos")
			.doc(uniqueHash)
			.get();
		return { isExists: isExists.exists, repoStructure: isExists.data() };
	} catch (error) {
		console.error("Error checking repository status:", error);
		return false;
	}
};

const createRepoZipApi = (repoStructure) => {
	const zipFolder = new zip("./repo.zip");

	const addFilesToZip = (dir, parentPath = "") => {
		dir.children.forEach((child) => {
			const currentPath = `${parentPath}${child.name}`;
			if (child.type === "file") {
				zipFolder.addFile(currentPath, Buffer.from(child.content));
			} else if (child.type === "directory") {
				addFilesToZip(child, `${currentPath}/`);
			}
		});
	};

	addFilesToZip(repoStructure);
	return zipFolder.toBuffer();
};

const saveVariantToFile = async (variantCode, variantId, format) => {
	try {
		const __filename = fileURLToPath(import.meta.url);
		const __dirname = path.dirname(__filename);
		const viewsDir = path.join(__dirname, "../../views/image");

		await fs.mkdir(viewsDir, { recursive: true });

		const timestamp = new Date().getTime();
		const filename = `variant-${variantId}-${timestamp}.jsx`;
		const filePath = path.join(viewsDir, filename);

		const fileContent = `${variantCode}`;

		await fs.writeFile(filePath, fileContent, "utf8");
		return filename;
	} catch (error) {
		console.error(`Error saving variant ${variantId} to file:`, error);
		throw error;
	}
};

const sendSSEData = (res, data) => {
	if (!res.finished) {
		res.write(`data: ${JSON.stringify(data)}\n\n`);
	}
};

export const generateCustomRepo = async (req, res) => {
	try {
		const dependencyGraph = req.body.dependencyGraph;
		const dependencyGraphHash = JSON.stringify(dependencyGraph);
		const uniqueHash = crypto
			.createHash("sha256")
			.update(dependencyGraphHash)
			.digest("hex");
		const { isExists, repoStructure } = await checkRepositoryStatusApi(
			dependencyGraphHash
		);

		res.setHeader("Content-Type", "text/event-stream");
		res.setHeader("Cache-Control", "no-cache");
		res.setHeader("Connection", "keep-alive");

		const sendEvent = (message) => {
			res.write(`data: ${JSON.stringify({ message })}\n\n`);
		};

		sendEvent("Initializing repository generation...");

		const systemPrompt = getSystemPrompt(dependencyGraph);
		const messages = [
			new SystemMessage(systemPrompt),
			new HumanMessage("Generate the defined repository structure"),
		];
		let gptResponse, inputTokens, outputTokens;
		if (isExists) {
			gptResponse = repoStructure;
		} else {
			const gptMessage = await client.invoke(messages);
			gptResponse = gptMessage.content;
			inputTokens = await Promise.all(
				messages.map((msg) => client.getNumTokens(msg.content))
			).then((tokens) => tokens.reduce((total, num) => total + num, 0));

			outputTokens = await client.getNumTokens(gptMessage.content);
			await admin
				.firestore()
				.collection("repos")
				.doc(uniqueHash)
				.set(
					{
						dependencyGraph,
						createdAt: admin.firestore.Timestamp.now(),
						updatedAt: admin.firestore.Timestamp.now(),
						repoStructure: JSON.stringify(gptMessage.content),
						totalTokens: inputTokens + outputTokens,
					},
					{ merge: true }
				);
		}

		try {
			console.log(gptResponse, "gptResponse");
			const validated = DirSchema.parse(gptResponse?.repoStrucure);
			sendEvent("Repository generated successfully.");
			res.setHeader("Content-Type", "application/zip");
			res.setHeader("Content-Disposition", "attachment; filename=repo.zip");
			res.end({ data: JSON.stringify(validated) });
		} catch (validationError) {
			sendEvent("Error during validation.");
			throw validationError;
		}
	} catch (error) {
		console.error("Error in generating custom repo:", error);
		res.write(
			`data: ${JSON.stringify({
				error: "Error in generating custom repo",
			})}\n\n`
		);
		res.end();
	}
};

export const generateDependencyGraph = async (req, res) => {
	try {
		const { userPrompt } = req.body;

		const response = await ollamaClient.invoke([
			new SystemMessage(getDependencySystemPrompt(userPrompt)),
			new HumanMessage(`
				Please provide the required output that reflects the user project details or requirements. 
			`),
		]);

		console.log(response.content);

		res.send(response.content);
	} catch (error) {
		console.error("Child-proof error:", error);
		res.status(500).json({
			error:
				"Let's try again! Could you describe your website idea differently?",
			examplePrompts: [
				"I want a blog about dinosaurs",
				"Make me a store for toy cars",
				"Create a birthday party invitation site",
			],
		});
	}
};

export const updateCustomRepo = async (req, res) => {
	try {
		const { repoStructure, dependencyGraph, instructions } = req.body;
		const systemPrompt = getUpdateSystemPrompt({
			dependencyGraph,
			previousRepoStructure: repoStructure,
			instructions,
		});

		const response = await ollamaClient.invoke([
			new SystemMessage(systemPrompt),
			new HumanMessage(
				"Update the defined repository structure based on the instructions"
			),
		]);

		const validated = DirSchema.parse(JSON.parse(response.content));
		res.send(validated);
	} catch (e) {
		console.log(e, "error in generating custom repo");
		res.send("Error in generating custom repo");
	}
};

export const generateRoadmap = async (req, res) => {
	const { userPrompt } = req.body;

	try {
		const stream = await ollamaClient.stream([
			new SystemMessage(getRoadmapSystemPrompt(userPrompt)),
			new HumanMessage(
				`Please provide a step-by-step roadmap, tech stack based on the schema: ${dependencyGraphSchema}
				 and repo structure for the project`
			),
		]);
		for await (const chunk of stream) {
			res.write(chunk.content);
		}
		res.end();
	} catch (error) {
		console.error("Error generating roadmap:", error);
		res.status(500).json({
			message: "An error occurred while generating the roadmap.",
			details: error.message,
		});
	}
};

// Update the system message to be more structured and specific
const systemMessage = `You are a React code generator. Generate ONLY the following structure:

REQUIRED_STRUCTURE = {
    imports: ['React', 'useState'],
    componentName: string,
    stateDefinitions: [{ name: string, setter: string, initialValue: any }],
    jsx: {
        rootElement: {
            type: string,
            className: string,
            children: Array<Element>
        }
    }
}

Rules:
1. ALWAYS start with: import React, { useState } from 'react';
2. ALWAYS use function declaration syntax
3. ALWAYS include loading state
4. ALWAYS use Tailwind classes
5. ALWAYS include dark mode variants
6. NEVER use TypeScript
7. NEVER add comments
8. NEVER include explanations

Example Output Structure:
import React, { useState } from 'react';

function ProductCard() {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            {isLoading ? (
                <div className="animate-pulse bg-gray-200 h-48" />
            ) : (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold">Title</h2>
                    <p className="text-gray-600 dark:text-gray-300">Content</p>
                </div>
            )}
        </div>
    );
}

export default ProductCard;`;

// Update the component prompt to be more structured
const componentPrompt = PromptTemplate.fromTemplate(`
Create a React component for: {component}

Follow these exact requirements:
1. Component Structure:
   - Root element with Tailwind container class
   - Loading state with skeleton
   - Content section with proper hierarchy
   - Interactive elements with hover states

2. Required Tailwind Features:
   - Container: p-4 rounded-lg shadow
   - Colors: bg-white/gray text-gray
   - Dark Mode: dark:bg-gray-800
   - Hover: hover:shadow-lg
   - Animation: animate-pulse
   - Responsive: sm: md: lg:

3. Required States:
   - Loading state
   - Hover state
   - Active state

4. Required Handlers:
   - onClick for interactive elements
   - onHover for hover effects
   - Loading state toggle

Output the component following the system message structure EXACTLY.
`);

// Simplified validation function that checks for critical elements
const validateComponent = (code) => {
	const criticalPatterns = {
		imports: /^import React,\s*{\s*useState\s*}\s*from\s*['"]react['"];?$/m,
		functionDeclaration: /^function\s+[A-Z]\w+\s*\(\)\s*{/m,
		useState: /const\s+\[isLoading,\s*setIsLoading\]\s*=\s*useState\(true\);/m,
		tailwindClasses: /className=["']\S+["']/,
		darkMode: /dark:/,
		export: /^export default \w+;?$/m,
	};

	const missingPatterns = Object.entries(criticalPatterns)
		.filter(([_, pattern]) => !pattern.test(code))
		.map(([key]) => key);

	if (missingPatterns.length > 0) {
		throw new Error(
			`Invalid component structure. Missing: ${missingPatterns.join(", ")}`
		);
	}

	return true;
};

// Simplified processing function that focuses on structure
const processAndValidateCode = async (rawOutput) => {
	try {
		// Clean the code
		let code = extractReactCode(rawOutput)
			.replace(/```[^`]*```/g, "")
			.replace(/^```jsx?|```$/gm, "")
			.trim();

		// Validate structure
		validateComponent(code);

		// Basic formatting
		code = code
			.replace(/\n{3,}/g, "\n\n") // Remove extra newlines
			.replace(/\s+$/gm, "") // Remove trailing spaces
			.trim();

		return code;
	} catch (error) {
		console.error("Component validation failed:", error);
		throw error;
	}
};

export const generateUIVariants = async (req, res) => {
	req.on("close", () => {
		console.log("Client closed connection");
	});

	let savedFiles = []; // Track saved files

	try {
		const { format = "React", component, numberOfVariants = 5 } = req.body;

		if (!component) {
			if (!res.headersSent) {
				return res
					.status(400)
					.json({ error: "Component description is required" });
			}
			return;
		}

		if (!res.headersSent) {
			res.setHeader("Content-Type", "text/event-stream");
			res.setHeader("Cache-Control", "no-cache");
			res.setHeader("Connection", "keep-alive");
		}

		sendSSEData(res, {
			type: "info",
			message: "Starting generation...",
		});

		const results = [];

		// Generate variants without themes
		for (let i = 0; i < numberOfVariants; i++) {
			if (res.finished) break;

			const formattedPrompt = await componentPrompt.format({
				component,
			});

			sendSSEData(res, {
				type: "progress",
				message: `Generating variant ${i + 1} of ${numberOfVariants}...`,
			});

			let rawOutput = "";
			const stream = await ollamaClient.stream([
				new SystemMessage(systemMessage),
				new HumanMessage(formattedPrompt),
			]);

			for await (const chunk of stream) {
				if (res.finished) break;
				rawOutput += chunk.content;
			}

			try {
				// Process and validate the code
				const cleanReactCode = await processAndValidateCode(rawOutput);

				// Save the validated and improved code
				const filename = await saveVariantToFile(
					cleanReactCode,
					`variant-${i + 1}`,
					"react"
				);
				savedFiles.push(filename);

				sendSSEData(res, {
					type: "file_saved",
					variantId: `variant-${i + 1}`,
					filename: filename,
				});

				results.push({
					theme: "Custom",
					style: "Custom",
					colors: "Custom",
					code: cleanReactCode,
					variantId: `variant-${i + 1}`,
					filename: filename,
				});
			} catch (error) {
				console.error(`Error processing variant ${i + 1}:`, error);
				sendSSEData(res, {
					type: "variant_error",
					variantId: `variant-${i + 1}`,
					error: "Failed to process React code",
					details: error.message,
				});
			}
		}

		if (!res.finished) {
			sendSSEData(res, {
				type: "complete",
				variants: results,
				metadata: {
					format,
					component,
					totalVariants: results.length,
					savedFiles: savedFiles,
				},
			});
			res.end();
		}
	} catch (error) {
		console.error("Error generating UI variants:", error);
		if (!res.finished) {
			sendSSEData(res, {
				type: "error",
				error: "Failed to generate UI variants",
				message: error.message,
			});
			res.end();
		}

		// Cleanup any saved files in case of error
		try {
			const __filename = fileURLToPath(import.meta.url);
			const __dirname = path.dirname(__filename);
			const viewsDir = path.join(__dirname, "../../views/image");

			if (savedFiles?.length > 0) {
				await Promise.all(
					savedFiles.map(async (filename) => {
						const filePath = path.join(viewsDir, filename);
						try {
							await fs.unlink(filePath);
						} catch (unlinkError) {
							console.error(`Failed to delete file ${filename}:`, unlinkError);
						}
					})
				);
			}
		} catch (cleanupError) {
			console.error("Error during cleanup:", cleanupError);
		}
	}
};

// Simple system prompt for React generation
const systemPrompt = `You are a React component generator.
Generate clean, modern React components following these rules:
- Use plain JavaScript (no TypeScript)
- Use Tailwind CSS for styling
- Use semantic HTML elements
- Include hover and focus states
- Add loading states where appropriate
- Make components responsive
- Use proper event handlers
- Follow accessibility best practices

Example structure:
import React, { useState } from 'react';

function ExampleComponent() {
    const [isLoading, setIsLoading] = useState(false);
    
    return (
        <article className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-all">
            {isLoading ? (
                <div className="animate-pulse bg-gray-200 h-48 rounded" />
            ) : (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold">Title</h2>
                    <p className="text-gray-600">Content</p>
                </div>
            )}
        </article>
    );
}

export default ExampleComponent;`;

// Add a function to clean think tags and other unwanted content
const cleanLLMOutput = (content) => {
	return content
		.replace(/<think>[\s\S]*?<\/think>/g, "") // Remove think tags and their content
		.replace(/<reasoning>[\s\S]*?<\/reasoning>/g, "") // Remove reasoning tags
		.replace(/<explanation>[\s\S]*?<\/explanation>/g, "") // Remove explanation tags
		.replace(/```[^`]*```/g, "") // Remove code blocks
		.replace(/^```jsx?|```$/gm, "") // Remove language tags
		.replace(/\/\*[\s\S]*?\*\//g, "") // Remove block comments
		.replace(/\/\/.*/g, "") // Remove line comments
		.trim();
};

// Main component generation endpoint
export const generateComponent = async (req, res) => {
	try {
		const { component } = req.body;

		if (!component) {
			return res
				.status(400)
				.json({ error: "Component description is required" });
		}

		res.setHeader("Content-Type", "text/event-stream");
		res.setHeader("Cache-Control", "no-cache");
		res.setHeader("Connection", "keep-alive");

		sendSSEData(res, {
			type: "start",
			message: "Starting component generation...",
		});

		const stream = await ollamaClient.steam([
			new SystemMessage(systemPrompt),
			new HumanMessage(`Create a React component for: ${component}
				Output ONLY the React component code.
				NO explanations or additional text.`),
		]);

		let componentCode = "";

		for await (const chunk of stream) {
			if (res.finished) break;

			// Extract only the code part from the chunk
			const codePart = cleanLLMOutput(chunk.content).trim();
			if (codePart) {
				componentCode += codePart;

				sendSSEData(res, {
					type: "chunk",
					content: codePart,
				});
			}
		}

		// Final cleanup and validation
		const cleanCode = componentCode.trim();

		sendSSEData(res, {
			type: "complete",
			code: cleanCode,
		});

		res.end();
	} catch (error) {
		console.error("Error generating component:", error);

		if (!res.finished) {
			sendSSEData(res, {
				type: "error",
				error: "Failed to generate component",
				message: error.message,
			});
			res.end();
		}
	}
};

export const benchmarkLLMModels = async (req, res) => {
	try {
		const { prompt } = req.body;

		if (!prompt) {
			console.error("Prompt is required"); // Log error if prompt is missing
			return res.status(400).json({ error: "Prompt is required" });
		}

		console.log(req.body, "body");
		const models = [
			{
				name: "Ollama (CodeLlama)",
				client: ollamaClient,
				config: { model: "codellama:7b" },
			},
			{
				name: "Ollama (DeepSeek)",
				client: deepSeekClient,
				config: { model: "deepseek-r1:1.5b" },
			},
		];

		const results = [];

		for (const model of models) {
			const metrics = {
				modelName: model.name,
				startTime: performance.now(),
				tokens: 0,
				outputLength: 0,
				error: null,
				response: null,
			};
			console.log("Testing model:", model.name); // More descriptive log

			try {
				const response = await model.client.invoke([
					new HumanMessage(prompt),
					new SystemMessage("Answer the user question."),
				]);

				const fullResponse = response.content;

				metrics.endTime = performance.now();
				metrics.totalTime = metrics.endTime - metrics.startTime;
				metrics.response = fullResponse;
			} catch (error) {
				metrics.error = error.message;
				console.error(`Error with model ${model.name}:`, error.message); // Log model-specific error
			}

			results.push(metrics);
		}

		res.json({
			type: "complete",
			results: results.map((result) => ({
				modelName: result.modelName,
				metrics: {
					responseTime: `${(result.totalTime / 1000).toFixed(2)}s`,
					tokensGenerated: result.tokens,
					outputLength: result.outputLength,
					error: result.error,
				},
			})),
		});
	} catch (error) {
		console.error("Benchmark failed:", error.message); // Log overall error
		res.status(500).json({
			error: "Benchmark failed",
			message: error.message,
		});
	}
};

export const summarizeBlogContent = async (req, res) => {
	try {
		const blogContent = req.body;
		if (!blogContent) {
			return res.status(400).json({ error: "Missing blog content" });
		}

		// Use cheerio to load the blog content and extract text
		const $ = load(blogContent);
		const textContent = $("body").text().substring(0, 10000);

		// Set headers for SSE streaming
		res.setHeader("Content-Type", "text/event-stream");
		res.setHeader("Cache-Control", "no-cache");
		res.setHeader("Connection", "keep-alive");

		// Send an initial message so the client knows something is happening
		res.write(`data: Processing your request...\n\n`);

		// Start the deepSeekClient stream
		const stream = await deepSeekClient.stream([
			new HumanMessage(`Please summarize the following programming-related article content in 500 words. 
				Make sure to handle images, links, and videos appropriately. Here is the content: ${textContent}`),
			new SystemMessage("Provide a concise summary while reading blog content"),
		]);

		// Process the stream using a single async function
		const processStream = async () => {
			try {
				const reader = stream.getReader();
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;
					// For SSE, prefix each message with "data:" and end with a double newline
					res.write(`data: ${value.content}\n\n`);
					console.log(value.content);
					if (res.flush) res.flush();
				}
				// Optionally indicate that the stream is complete
				res.write("data: [DONE]\n\n");
				res.end();
			} catch (error) {
				console.error("Error processing stream:", error);
				if (!res.writableEnded) {
					res.write("data: [ERROR] Failed to process stream\n\n");
					res.end();
				}
			}
		};

		// Call the processStream function once
		processStream();
	} catch (error) {
		console.error("Error summarizing blog content:", error);
		if (!res.writableEnded) {
			res.status(500).json({ error: "Failed to summarize blog content" });
		}
	}
};

export const convertHtmlToMarkdownAndGenerateGraph = async (req, res) => {
	try {
		const blogContent = req.body;

		if (!blogContent) {
			return res.status(400).json({ error: "Blog content is required" });
		}

		res.setHeader("Content-Type", "text/event-stream");
		res.setHeader("Cache-Control", "no-cache");
		res.setHeader("Connection", "keep-alive");

		// Send an initial message so the client knows something is happening
		res.write(`data: Processing your request...\n\n`);

		// Convert HTML to Markdown
		const turndownService = new TurndownService();
		const markdownContent = turndownService.turndown(blogContent);

		// Use the LLM model to generate a Mermaid.js graph based on the Markdown content
		const stream = await deepSeekClient.stream([
			new HumanMessage(`Based on the following Markdown content, generate a Mermaid.js graph:
			${markdownContent}`),
			new SystemMessage(
				"Provide a Mermaid.js graph representation of the content."
			),
		]);

		// Process the stream using a single async function
		const processStream = async () => {
			try {
				const reader = stream.getReader();
				let mermaidGraph = '';

				while (true) {
					const { done, value } = await reader.read();
					if (done) break;
					mermaidGraph += value.content; // Accumulate the content
					console.log(mermaidGraph);
					res.write(`data: ${mermaidGraph}`)
					if (res.flush) res.flush();
				}

				// Return the Markdown and the Mermaid graph
				res.end({
					markdown: markdownContent,
					mermaidGraph: mermaidGraph,
				});
			} catch (error) {
				console.error("Error processing stream:", error);
				if (!res.writableEnded) {
					res.status(500).json({ error: "Failed to process stream" });
				}
			}
		};

		// Call the processStream function once
		processStream();
	} catch (error) {
		console.error(
			"Error converting HTML to Markdown and generating graph:",
			error
		);
		res
			.status(500)
			.json({ error: "Failed to convert HTML to Markdown and generate graph" });
	}
};
