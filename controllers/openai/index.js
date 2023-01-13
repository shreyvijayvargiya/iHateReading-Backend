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
	const prompt = `Hello chat GPT my age is ${age} and I want to ${increase ? "increase" : "decrease"} my weight by ${amount} ${unit}, please suggest me daily ${meal} ${vegetarian ? "vegetarian": "non-vegetarian"} meal `;
	const response = await openai.createCompletion({
		model: "text-davinci-003",
		prompt: prompt,
		// instruction: prompt,
		max_tokens: 1000,
	});
	const data = response.data.choices[0].text;
	res.send(data);
};

export const basicOpenAIAPI = async(req, res) => {
	const prompt = req.body.prompt;
	const response = await openai.createCompletion({
		prompt,
		max_tokens: 300,
		model: "text-davinci-003"
	})
	const data = response.data.choices[0].text;
	console.log(response, "response")
	res.send(data);
}

// Building the system
// .env, body-parser, express, axios, firebase-admin ,github account, hosting account

// setup for server.js
// create route 
// add route as the middleware
// install the required packages => openai
// define the routes and the methods of openai


// new method

export const getNotionSteps = async(req, res) => {
	// const toolName = req.body.name;
	// const prompt = `Connect ${toolName} to Notion in 5 steps `;
	// const response = await openai.createCompletion({
	// 	model: "text-davinci-003",
	// 	prompt: prompt,
	// 	max_tokens: 1000
	// });
	// const data = response.data.choices[0].text;

	
	// pushing the steps into my database
	// for database i am using Firebase
	req.body.tools.forEach(async(item) => {
		// const getData = await getMetaData(item.link);
		// const getWebsite = await (await fetch(item.link)).text();
		const getData = await urlMetadata(item.link);
		await admin
			.firestore()
			.collection("NotionSteps")
			.add({
				// steps: data,nm
				createdAt: Date.now(),
				toolName: item.name,
				website: item.link,
				type: item.type,
				title: getData?.title,
				description:  getData?.description,
				icon: getData?.icon,
				image: getData?.image,
				keywords: getData?.keywords,
			});
	})
	res.send("Done");
}

export const getNotionTools = async(req, res) => {
	const prompt = `Give me 10 ${req.body.toolPurpose} tools for Notion with their website links in an array of object containing name and link`;
	const response = await openai.createCompletion({
		model: "text-davinci-003",
		prompt,
		max_tokens: 1000
	});
	const data = response.data.choices[0].text;

	// we can push the data in the database
	// Firebase as the database 
	// scrap the website meta data from the link and it will return me bannerImage, description
	// { toolName, website, description, bannerImage } => store them in database

	res.send(data);
	return
	data.map(async(item)=> {
		const getWebsiteData = await getMetaData(item.link)
		admin.firestore().collection("NotionTools").add({
			createdAt: Date.now(),
			toolName: item.name,
			website: item.link,
			title: getWebsiteData?.title,
			description: getWebsiteData?.description,
			icon: getWebsiteData?.icon,
			image: getWebsiteData?.image,
		});
	})
	res.send(data);
}

export const pushNotionToolsInDatabase = async(req, res) => {
	const tools = req.body.tools;
	try{
		const finalTools = tools.map(async(item) => {
			const data = await getMetaData(item.link);
			return { name: item.name, website: item.link, description: data.description, image: data.image, icon: data.icon, createdAt: Date.now() }
		});
		(await Promise.all(finalTools)).map((item) => {
			admin.firestore().collection("NotionTools").add(item)
			return item
		});
		res.send("Done");
	}catch(e){
		console.log(e, "e")
		res.send("Error")
	}
}

// Dalle => text => image
export const getPromptImage = async(req, res) => {
	const prompt = req.body.prompt;
	const response = await openai.createImage({
		prompt,
		size: "1024x1024",
	});
	res.send(response.data.data[0].url);
}