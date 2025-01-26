import { Configuration, OpenAIApi } from "openai";
import admin from "firebase-admin";
import Anthropic from "@anthropic-ai/sdk";
import { gemini15Flash, googleAI } from "@genkit-ai/googleai";
import { genkit } from "genkit";
import { createApi } from "unsplash-js";
import extracturls from "extract-urls";
import htmlUrls from "html-urls";
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

const configuration = new Configuration({
	apiKey: process.env.OPENAI_TOKEN,
});
const openai = new OpenAIApi(configuration);

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

export const answerGenAiApi = async (req, res) => {
	try {
		const { question } = req.body;
		const { text } = await ai.generate({
			prompt: `Answer the question ${question}`,
			system:
				"You are a software developer expert with more than 5 years of experience and have expertise in frontend/full-stack development.",
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

export const createRepo = async (req, res) => {
	try {
		const { name, instructions } = req.body;

		const dynamicPrompt = `
      Create a complete, ready-to-use ${name} project repository with the following technologies and libraries:
      ${instructions}.
      
      The repository should include:
      1. A valid 'package.json' file with all the necessary dependencies and devDependencies installed with their latest versions.
      2. Configuration files (e.g., tailwind.config.js, .eslintrc, etc.) for all required tools and libraries.
      3. A basic project structure including folders like 'src', 'components', 'pages', and others as needed.
      4. For state management libraries like Redux, Zustand, or Context API, provide the basic setup with sample files (e.g., store.js, slices, or reducers).
      5. For UI libraries like styled-components or TailwindCSS, include the necessary setup and an example usage in a sample component.
      6. For integrations like Supabase or Firebase, include an "api.js" or "supabaseClient.js" file with a sample query or function.
      7. All files should be structured in JSON format with:
         - "name" (file or folder name),
         - "type" ("file" or "directory"),
         - "content" (for files) or "children" (for directories).
      The project should be ready to start with minimal effort after installation.
    `;

		const { text } = await ai.generate({
			prompt: dynamicPrompt,
			system:
				"You are a senior software developer. Always output complete JSON-based code repositories that is easy to parse with all dependencies, configuration files, and starter code necessary to run the project.",
		});

		res.json(text);
	} catch (e) {
		console.error("Error generating repository:", e);
		res.status(500).json({
			success: false,
			message: "Error generating repository",
		});
	}
};

function extractUniqueLinks(htmlStrings) {
	const uniqueLinks = new Set();

	htmlStrings.forEach((htmlString) => {
		try {
			const parser = new DOMParser();
			const doc = parser.parseFromString(htmlString, "text/html");

			const links = Array.from(doc.querySelectorAll("a[href]")).map(
				(a) => a.href
			);

			links.forEach((link) => {
				try {
					const url = new URL(link);
					uniqueLinks.add(url.toString());
				} catch (error) {
					console.error(`Invalid URL encountered: ${link}`, error); //Log invalid URLs for debugging
				}
			});
		} catch (error) {
			console.error("Error parsing HTML string:", error); //Log parsing errors
		}
	});

	return Array.from(uniqueLinks);
}
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
				if (link) {
					links.add(link);
				}
			});
		});
		console.log(links);
		res.send([...links]);
	} catch (e) {
		console.log(e, "error");
		res.send("Error");
	}
};
