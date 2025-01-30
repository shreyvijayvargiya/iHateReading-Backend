import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import {
	dependencyMapSchema,
	DirSchema,
	dependencyGraphSchema,
} from "./schema.js";
import {
	getSystemPrompt,
	getUpdateSystemPrompt,
	getDependencySystemPrompt,
} from "./systemPrompt.js";

const client = new ChatOpenAI({
	temperature: 0.7,
	model: "gpt-4o-mini",
	apiKey: process.env.OPENAI_API_KEY,
});

export const generateCustomRepo = async (req, res) => {
	try {
		const { dependencyGraph } = req.body;
		const systemPrompt = getSystemPrompt(dependencyGraph);

		res.setHeader("Content-Type", "text/event-stream");
		res.setHeader("Cache-Control", "no-cache");
		res.setHeader("Connection", "keep-alive");

		const sendEvent = (message) => {
			res.write(`data: ${JSON.stringify({ message })}\n\n`);
		};

		sendEvent("Initializing repository generation...");

		const response = await client.invoke([
			new SystemMessage(systemPrompt),
			new HumanMessage("Generate the defined repository structure"),
		]);
		try {
			const validated = DirSchema.parse(JSON.parse(response.content));
			sendEvent("Repository generated successfully.");
			res.write(`data: ${JSON.stringify({ data: validated })}\n\n`);
		} catch (validationError) {
			sendEvent("Error during validation.");
			throw validationError;
		}
		res.end();
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

		const response = await client.invoke([
			new SystemMessage(getDependencySystemPrompt(userPrompt)),
			new HumanMessage(`
				Please respond with a valid JSON object matching the exact structure below, 
				without any code blocks or additional explanations matching ${dependencyGraphSchema}. 
				Only return the JSON as shown below 
				{
					"projectname": "generated-name",
					"frameworks": "next.js",
					"styling": "tailwindcss",
					"database": "firebase",
					"ui": "shadcn/ui",
					"payment": "stripe",
					"emailing": "resend",
					"statemanagement": ""
				}
			`),
		]);

		const parsedResponse =
			typeof response.content === "string"
				? JSON.parse(response.content)
				: response.content;

		const validated = dependencyMapSchema.parse({
			parsedResponse,
			projectname: parsedResponse.projectname || "my-awesome-project",
		});
		res.send(parsedResponse);
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

		const response = await client.invoke([
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
