import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
	apiKey: process.env.OPENAI_TOKEN,
});

export const getDataFromOpenAI = async (req, res) => {
	const openai = new OpenAIApi(configuration);
	const response = await openai.createCompletion({
		model: "text-davinci-003",
		prompt: `${req.body.description}`,
		max_tokens: 200,
	});
	// const data = response.data.choices[0].text;
	res.send(response.data);
};
