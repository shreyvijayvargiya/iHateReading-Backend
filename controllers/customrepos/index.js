import admin from "firebase-admin";
import z from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { DirSchema } from "./schema.js";
import { getSystemPrompt } from "./systemPrompt.js";

const client = new ChatOpenAI({
	temperature: 0.7,
	model: "gpt-4o-mini",
	apiKey: process.env.OPENAI_API_KEY,
});


export const generateCustomRepo = async (req, res) => {
	try {
		const { dependencyGraph } = req.body;
		const systemPrompt = getSystemPrompt(dependencyGraph);

		const response = await client.invoke([
			new SystemMessage(systemPrompt),
			new HumanMessage("Generate the defined repository structure"),
		]);

		const validated = DirSchema.parse(JSON.parse(response.content));
		res.send(validated);
	} catch (e) {
		console.log(e, "error in generating custom repo");
		res.send("Error in generating custom repo");
	}
};
