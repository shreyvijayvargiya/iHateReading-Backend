import { OpenAI } from "openai";
import admin from "firebase-admin";
import { gemini15Flash, googleAI } from "@genkit-ai/googleai";
import { genkit } from "genkit";
import { createApi } from "unsplash-js";
import { load } from "cheerio";

export const convertDataToHtml = (blocks) => {
	let convertedHtml = ``;

	if (blocks !== undefined && blocks !== null) {
		blocks?.forEach((block) => {
			switch (block.type) {
				case "header":
					convertedHtml += `<h${block.data.level} style="font-weight:600; margin:20px 0px;">${block.data.text}</h${block.data.level}>`;
					break;
				case "embed":
					convertedHtml += `<div><iframe width="100%" height="400" src="${block.data.embed}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe></div>`;
					break;
				case "code":
					convertedHtml += `<pre style="background: #f4f4f4; padding: 10px; border-radius: 4px; overflow: auto;"><code style="font-family: 'Courier New', Courier, monospace; white-space: pre-wrap;">${block.data.code}</code></pre>`;
					break;
				case "paragraph":
					convertedHtml += `<p style="margin:20px 0px">${block.data.text} </p>`;
					break;
				case "delimiter":
					convertedHtml += `<div style="margin:auto">* * *</div>`;
					break;
				case "image":
					convertedHtml += `<img src="${block.data.file.url}" style="width: 100%; max-height: 600px; margin:20px 0px; object-fit:contain" /><div style="text-align:center">${block.data.caption}</div>`;
					break;
				case "checklist":
					convertedHtml += `<ul style="list-style-type:none; padding-left: 0;">`;
					block.data.items.forEach((item) => {
						const isChecked = item.checked ? "checked" : "";
						convertedHtml += `<li><input type="checkbox" ${isChecked}> ${item.text}</li>`;
					});
					convertedHtml += `</ul>`;
					break;
				case "list":
					convertedHtml += `<ul style="margin:10px">`;
					block.data.items.forEach(function (li) {
						convertedHtml += `<li style="list-style:inside; margin:4px 0px;">${li}</li>`;
					});
					convertedHtml += "</ul>";
					break;
				case "hyperlink":
					convertedHtml += `<a href=${block.data.link} target="_blank" style="color:black; margin:4px 0px; font-weight:bold; text-decoration:underline;">${block.data.text}</a>`;
					break;
				case "link":
					convertedHtml += `<a href=${block.data.link} style="color:black; margin:4px 0px; font-weight:bold; text-decoration:underline;">${block.data.text}</a>`;
					break;
				case "gist":
					convertedHtml += `<div class="gistcontainer" id="gist1"><script src=${block.data.gistLink}></script></div>`;
					break;
				case "button":
					convertedHtml += `<div style="margin:10px 0px; cursor:pointer;"><a target="_blank" href=${block.data.link}><button style="background:black; text-decoration: none; color: white; border-radius:4px; display:flex;justify-content: center; margin: auto; text-align:center; padding:10px; border:none">${block.data.text}</button></a></div>`;
					break;
				default:
					console.log("Unknown block type", block);
					break;
			}
		});
	}
	return convertedHtml;
};

const unsplashInstance = createApi({
	accessKey: process.env.unsplash_key,
	fetch: fetch,
});
export const getYogaPostureImageFromUnSplash = async (req, res) => {
	const { query } = req.body;
	const response = await unsplashInstance.search
		.getPhotos({ query })
		.then((res) => res);
	const output = response.response.results;
	res.send(output);
};


const openai = new OpenAI({
	apiKey: process.env.OPENAI_TOKEN,
});

const openaiCompletionResponse = async ({ prompt, temperature }) => {
	const response = await openai.createCompletion({
		model: "gpt-4o",
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
		model: "text-curie-001",
		prompt: prompt,
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
		model: "text-curie-001",
		prompt,
		max_tokens: 500,
		temperature: temperature ? temperature : 0.7,
	});
	const data = response.data.choices[0].text;
	res.send(data);
};

export const getAllYogaAsanas = async (req, res) => {
	const prompt = `You are the yoga instructor with more than 30 years of experience. 
	Give me all types of yoga asanas. The output should be the list of the
	the names of all asana in sanskrit english`;
	const response = await openaiCompletionResponse({ prompt });
	res.send(response.data.choices[0].text);
};

export const getYogaAsanasByTime = async (req, res) => {
	const prompt = `You are the yoga instructor with more than 30 years of experience. 
	Give me all types of yoga asanas I can do at the current time, please include the 
	factors like I can should not do a particular yoga in evening after lunch, for example,
	current time is ${Date.now()}. The output should be the list of the names of all asana 
	in sanskrit I can do at the current time`;
	const response = await openaiCompletionResponse({ prompt });
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
		.collection("publish")
		.doc(blogId)
		.collection("data")
		.get();
	const tags = await (
		await admin.firestore().collection("threads").doc(blogId).get()
	).data().tags;
	const blocks = threads.docs.map((item) => item.data());
	const htmls = blocks.map((block) => {
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

const ai = genkit({
	plugins: [googleAI()],
	model: gemini15Flash,
});

export const aiGenKit = async (req, res) => {
	try {
		const { instructions } = req.body;
		const { text } = await ai.generate({
			prompt: `Follow the instructions ${instructions} and give the code component using lucide-react or react-icons for icons, use tailwind css for styling and if the user the explanation instructions contains
			the animation requirement than use frame-motion/motion and gsap open source latest npm module`,
			system:
				"You are a software developer expert with more than 5 years of experience and have expertise in frontend/full-stack development. Your output always contains the single file code component in simple string format without any comments",
			config: {
				maxOutputTokens: 4000,
			},
		});
		res.send(text);
	} catch (e) {
		console.log(e, "error");
		res.send("Error");
	}
};


const extractLinks = (html) => {
	const $ = load(html);

	const links = [];

	$("a").each((index, element) => {
		const link = $(element).attr("href");
		if (link) {
			links.push(link.trim());
		}
	});

	return links;
};

const unwantedDomains = new Set([
	"ihatereading.in",
	"www.ihatereading.in",
	"shreyvijayvargiya.gumroad.com",
	"4pn312wb.r.us-east-1.awstrack.me",
	"url6652.creators.gumroad.com",
	"ehhhejh.r.af.d.sendibt2.com",
	"tracking.tldrnewsletter.com",
]);

export const getUniqueLinksFromNewsletters = async (req, res) => {
	try {
		const newsletters = await admin
			.firestore()
			.collection("Emails")
			.orderBy("createdAt", "desc")
			.get();
		const emails = newsletters.docs.map((item) => item.data());
		let links = new Set();
		emails.forEach((block) => {
			let html = convertDataToHtml(block.data.blocks);
			extractLinks(html).forEach((link) => {
				try {
					const url = new URL(link);
					if (link && url) {
						const domain = url.hostname;
						if (!unwantedDomains.has(domain)) {
							links.add(link);
						}
					}
				} catch (e) {
					console.log(e, "error in link");
				}
			});
		});
		await admin
			.firestore()
			.collection("collections")
			.doc("universo")
			.set({ createdAt: Date.now(), links: [...links] }, { merge: true });
		res.send([...links]);
	} catch (e) {
		console.log(e, "error");
		res.send("Error");
	}
};

export const createSchema = async (req, res) => {
	try {
		const { instructions } = req.body;
		const { text } = await ai.generate({
			prompt: instructions,
			system: `
				You are a senior software developer. Always return a valid schema object using zod the final schema object for the prompt defined by the user

				For example, 
				const { z } = require("zod");

				const FileSchema = z.object({
					name: z.string(),
					type: z.literal("file"),  // 'type' must exactly be "file"
					content: z.string(), // File content as a string
				});

				const FolderSchema = z.object({
					name: z.string(),
					type: z.literal("directory"),  // 'type' must exactly be "directory"
					children: z.array(z.union([FileSchema, z.lazy(() => FolderSchema)])), // Can contain files or nested folders
				});

				const DirSchema = z.object({
					name: z.string(),
					type: z.literal("directory"),  // 'type' must exactly be "directory"
					children: z.array(z.union([FileSchema, FolderSchema])), // Array of files or subfolders
				});

				Your response should follow the structure defined by the DirSchema:
				
				- Each directory should have the properties:
					- "name": string (name of the directory)
					- "type": "directory" (the 'type' must be exactly "directory")
					- "children": array of files or directories (max depth of 2 levels)
					
				- Each file should have the properties:
					- "name": string (name of the file)
					- "type": "file" (the 'type' must be exactly "file")
					- "content": string (content of the file)

				Example structure:
				{
					"name": "project-root",
					"type": "directory",  // 'type' must be "directory" exactly
					"children": [
						{
							"name": "package.json",
							"type": "file",  // 'type' must be "file" exactly
							"content": "{...}"
						},
						{
							"name": "src",
							"type": "directory",  // 'type' must be "directory" exactly
							"children": [
								{
									"name": "index.js",
									"type": "file",  // 'type' must be "file" exactly
									"content": "// Entry point for the app"
								}
							]
						}
					]
				}

				Please ensure the output is structured in JSON format, matching the described schema, and avoid any additional comments, markdown, or code blocks. 
				The 'type' field must always be the exact strings "file" or "directory", with lowercase letters.
			`,
			config: {
				maxOutputTokens: 4000,
			},
		});
		const cleanedText = text.replace(/```json|```/g, "").trim();
		const outputJSON = JSON.parse(cleanedText);
		const validatedOutput = DirSchema.parse(outputJSON);

		res.send({ response: validatedOutput });
	} catch (e) {
		console.error("Error generating repository:", e);
		res.status(500).json({
			success: false,
			message: "Error generating repository",
		});
	}
};
export const createRepo = async (req, res) => {
	try {
		const { instructions } = req.body;
		const { text } = await ai.generate({
			prompt: instructions,
			system: `
				You are a senior software developer. Always return a valid JSON object of a project repository, structured according to the following Zod schema:

				const { z } = require("zod");

				const FileSchema = z.object({
					name: z.string(),
					type: z.literal("file"),  // 'type' must exactly be "file"
					content: z.string(), // File content as a string
				});

				const FolderSchema = z.object({
					name: z.string(),
					type: z.literal("directory"),  // 'type' must exactly be "directory"
					children: z.array(z.union([FileSchema, z.lazy(() => FolderSchema)])), // Can contain files or nested folders
				});

				const DirSchema = z.object({
					name: z.string(),
					type: z.literal("directory"),  // 'type' must exactly be "directory"
					children: z.array(z.union([FileSchema, FolderSchema])), // Array of files or subfolders
				});

				Your response should follow the structure defined by the ${DirSchema}:
				
				- Each directory should have the properties:
					- "name": string (name of the directory)
					- "type": "directory" (the 'type' must be exactly "directory")
					- "children": array of files or directories (max depth of 2 levels)
					
				- Each file should have the properties:
					- "name": string (name of the file)
					- "type": "file" (the 'type' must be exactly "file")
					- "content": string (content of the file)

				Example structure:
				{
					"name": "project-root",
					"type": "directory",  // 'type' must be "directory" exactly
					"children": [
						{
							"name": "package.json",
							"type": "file",  // 'type' must be "file" exactly
							"content": "{...}"
						},
						{
							"name": "src",
							"type": "directory",  // 'type' must be "directory" exactly
							"children": [
								{
									"name": "index.js",
									"type": "file",  // 'type' must be "file" exactly
									"content": "// Entry point for the app"
								}
							]
						}
					]
				}

				Please ensure the output is structured in JSON format, matching the described schema, and avoid any additional comments, markdown, or code blocks. 
				The 'type' field must always be the exact strings "file" or "directory", with lowercase letters.
			`,
			config: {
				maxOutputTokens: 4000,
			},
		});
		const cleanedText = text.replace(/```json|```/g, "").trim();
		const outputJSON = JSON.parse(cleanedText);
		const validatedOutput = DirSchema.parse(outputJSON);

		res.send({ response: validatedOutput });
	} catch (e) {
		console.error("Error generating repository:", e);
		res.status(500).json({
			success: false,
			message: "Error generating repository",
		});
	}
};
