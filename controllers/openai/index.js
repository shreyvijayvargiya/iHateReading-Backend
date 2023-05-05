import { Configuration, OpenAIApi } from "openai";
import admin from "firebase-admin";
import getMetaData from "metadata-scraper";
import fetch from "node-fetch";
import cheerio from "cheerio";
import urlMetadata from "url-metadata";

const configuration = new Configuration({
	apiKey: process.env.OPENAI_TOKEN,
});
const openai = new OpenAIApi(configuration);

// methods of openai
export const getDataFromOpenAI = async (req, res) => {
	const { age, increase, amount, unit, meal, vegetarian } = req.body;
	const prompt = `Hello chat GPT my age is ${age} and I want to ${
		increase ? "increase" : "decrease"
	} my weight by ${amount} ${unit}, please suggest me daily ${meal} ${
		vegetarian ? "vegetarian" : "non-vegetarian"
	} meal `;
	const response = await openai.createCompletion({
		model: "text-davinci-003",
		prompt: prompt,
		// instruction: prompt,
		max_tokens: 1000,
	});
	const data = response.data.choices[0].text;
	res.send(data);
};
