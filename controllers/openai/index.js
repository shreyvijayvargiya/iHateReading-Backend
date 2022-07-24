import { Configuration, OpenAIApi } from "openai";
import admin from "firebase-admin";

const configuration = new Configuration({
	apiKey: process.env.OPENAI_TOKEN,
});

export const addSummary = async (logId) => {
	const data = await admin
		.firestore()
		.collection("threads")
		.doc(logId)
		.collection("data")
		.get();
	const threads = await data.docs.map((doc) => doc.data());
	let blocks = [];
	threads.forEach((item) => blocks.push(...item.data.blocks));
	const totalData = [];
	blocks.forEach((item) => {
		if (item.type === "paragraph") {
			totalData.push(item.data.text);
		}
	});
	const prompt = totalData.join(" ");
	const openai = new OpenAIApi(configuration);
	const response = await openai.createCompletion({
		model: "text-davinci-002",
		prompt: prompt + "\n\n" + "TL,DR",
		temperature: 0.7,
		max_tokens: 256,
		top_p: 1,
		frequency_penalty: 0,
		presence_penalty: 0,
	});
	if (response.data?.choices[0]?.text) {
		await admin
			.firestore()
			.collection("threads")
			.doc(logId)
			.set(
				{ summary: response.data?.choices[0].text.replaceAll("\n", "") },
				{ merge: true }
			);
	}
};

export const createSummary = async (req, res) => {
	const data = await admin.firestore().collection("threads").get();
	const logIds = data.docs.map((doc) => doc.id);
	logIds.map((logId) => addSummary(logId));
	res.send("Done");
};
