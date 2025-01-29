import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const llm = new ChatGoogleGenerativeAI({
	temperature: 0.9,
	model: "gemini-2.0-flash-exp",
	apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

export const createRepoApi = async (req, res) => {
	try {
		const { question } = req.body;
		const result = await llm.invoke(question);
		res.send(result.content);
	} catch (e) {
		console.log(e, "error");
		res.send("Error");
	}
};

export const createBasicStarterRepo = async (req, res) => {
	try {
		const { prompt } = req.body;
		const result = await llm.stream(prompt);
		res.send(result);
	} catch (e) {
		console.log(e, "error");
		res.send("Error");
	}
};

// API for creating basic frontend starter repository 
// API for creating frontend wireframe app
// API for creating frontend components of your choice
