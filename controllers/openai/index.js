import { Configuration, OpenAIApi } from "openai";
import { createApi } from "unsplash-js";
import admin from "firebase-admin";

const unsplashRoute = createApi({
	accessKey: process.env.unsplash_key,
	fetch: fetch,
});

const configuration = new Configuration({
	apiKey: process.env.OPENAI_TOKEN,
});
const openai = new OpenAIApi(configuration);

const openaiCompletionResponse = async ({ prompt, temperature }) => {
	const response = await openai.createCompletion({
		model: "text-davinci-003",
		prompt,
		max_tokens: 1000,
		temperature: temperature ? temperature : 0.7,
	});
	return response;
};
// methods of openai
export const getDataFromOpenAI = async (req, res) => {
	const {
		age,
		increase,
		amount,
		unit,
		totalMeals,
		vegetarian,
		country,
		temperature,
	} = req.body;
	const prompt = `Hello chat GPT my age is ${age} I want to ${
		increase ? "increase" : "decrease"
	} my weight by ${amount} ${unit}, please suggest me daily ${totalMeals} ${
		vegetarian ? "vegetarian" : "non-vegetarian"
	} ${country} meal `;
	const response = await openai.createCompletion({
		model: "text-davinci-003",
		prompt: prompt,
		// instruction: prompt,
		max_tokens: 1000,
		temperature: temperature ? temperature : 0.7,
	});
	const data = response.data.choices[0].text;
	res.send(data);
};

export const getYogaPostures = async (req, res) => {
	const { temperature, age, target, gender, dayTime, totalTime } = req.body;
	const prompt = `You are a Yoga expert and instructor and knows yoga 
	well with 10 plus years of experience. Your jobs is to suggest me with 
	yoga postures according to my age target and my requirements. I am ${age} 
	old ${gender} and want to ${target} my weight, give me ${totalTime} minutes 
	yoga postures for ${dayTime}. In the response include only 4 postures, and 
	give number of reps and time required for each postures along with one detailed 
	benefit of doing it. Give me output in terms of json schema contains key values so that I can store this in database. 
	`;
	const response = await openai.createCompletion({
		model: "text-davinci-003",
		prompt,
		max_tokens: 500,
		temperature: temperature ? temperature : 0.7,
	});
	const data = response.data.choices[0].text;
	res.send(data);
};

export const getYogaPostureImageFromUnSplash = async (req, res) => {
	const { query } = req.body;
	const response = await unsplashRoute.search
		.getPhotos({ query })
		.then((res) => res);
	const output = response.response.results;
	res.send(output);
};

export const getAllYogaAsanas = async (req, res) => {
	const prompt = `You are the yoga instructor with more than 30 years of experience. 
	Give me all types of yoga asanas. The output should be the list of the
	the names of all asana in sanskrit english`;
	const response = await openaiCompletionResponse({ prompt });
	console.log(response.data.choices[0].text.length);
	res.send(response.data.choices[0].text);
};

export const getYogaAsanasByTime = async (req, res) => {
	const prompt = `You are the yoga instructor with more than 30 years of experience. 
	Give me all types of yoga asanas I can do at the current time, please include the 
	factors like I can should not do a particular yoga in evening after lunch, for example,
	current time is ${Date.now()}. The output should be the list of the names of all asana 
	in sanskrit I can do at the current time`;
	const response = await openaiCompletionResponse({ prompt });
	console.log(typeof response.data.choices[0].text);
	res.send(response.data.choices[0].text);
};

export const getYogaAsanasByGenderMood = async (req, res) => {
	const { name, sexCategory, mood, age } = req.body;
	const prompt = `You are the yoga instructor with more than 30 years of experience. 
	Give me all types of yoga asanas according to my age and gender and current mood.
	Here is the user details, Hello, my name is ${name} and I am ${age} years old ${sexCategory} and 
	my current mood is ${mood}. Suggest me 5 some yoga postures with description
	name and procedure to do it.`;
	const response = await openaiCompletionResponse({ prompt });
	res.send(response.data.choices[0].text);
};

export const getAllYogaPoses = async (req, res) => {
	const { poses } = req.body;
	await admin.firestore().collection("yogaApp").set(poses);
	res.send("Done");
};

export const getYogaAsanasForHealthProblems = async (req, res) => {
	const { healthIssue } = req.body;
	const prompt = `You are the yoga instructor with more than 30 years of experience. 
	Give me all types of yoga asanas to cure person ${healthIssue}.
	Suggest me 2 best yoga postures with name and one reason how this 
	asans will benefit to cure ${healthIssue}.`;
	const response = await openaiCompletionResponse({ prompt });
	res.send(response.data.choices[0].text);
};

export const getSingleThreadTweet = async (req, res) => {
	const { blogId } = req.body;
	const threads = await admin
		.firestore()
		.collection("threads")
		.doc(blogId)
		.collection("data")
		.get();
	const tags = await (
		await admin.firestore().collection("threads").doc(blogId).get()
	).data().tags;
	const blocks = threads.docs.map((item) => item.data());
	const sortedBlocks = blocks.sort((a, b) => {
		if (a.stepNumber > b.stepNumber) {
			return 0;
		} else {
			return -1;
		}
	});
	const htmls = sortedBlocks.map((block) => {
		const threadBlocks = block.data.blocks;
		let html = ``;
		threadBlocks.map((block) => {
			if (block.type === "paragraph") {
				return (html += `<p>${block.data.text}</p>`);
			} else if (block.type === "code") {
				return (html += block.data.code);
			} else if (block.type === "image") {
				return (html += `<img src=${block.data.source} />`);
			} else if (block.type === "header") {
				return (html += `<h3>${block.data.text}</h3>`);
			} else if (block.type === "list") {
				return (html += `<ol>${block.data.items.map(
					(item) => `<li>${item}</li>`
				)}</ol>`);
			} else if (block.type === "gist") {
				return (html += `<div />`);
			} else return (html += `<div />`);
		});
		return html;
	});
	const contentChunk = htmls.join(". ").toString();
	const prompt = `"Read this entire html format content and Transform the knowledge into tweet! 
	🚀 Here's a fascinating insight: \n\n${contentChunk}\n\n
	Craft a tweet that captures the essence of this information. 
	Make it concise, engaging, and informative. What's the most 
	compelling angle you can find in this content?  #${tags[0]} #${tags[1]}"
`;
	const response = await openaiCompletionResponse({ prompt });
	res.send(response.data.choices[0].text);
};
