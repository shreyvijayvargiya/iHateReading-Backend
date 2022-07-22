const { Configuration, OpenAIApi } = require("openai");
const admin = require("firebase-admin");

const configuration = new Configuration({
	apiKey: process.env.OPENAI_TOKEN,
});

const createSummary = (req, res) => {
	const { logId } = req.body;
	try {
		const openai = new OpenAIApi(configuration);
		const response = openai.createCompletion({
			model: "text-davinci-002",
			prompt: "",
			temperature: 0.5,
			max_tokens: 1000,
		});
	} catch (error) {
		console.log(error, "error");
		res.send("Error", error);
	}
};

module.exports = { createSummary };
