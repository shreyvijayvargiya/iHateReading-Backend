import axios from "axios";
import { load } from "cheerio";
import fs from "fs";
import RssParser from "rss-parser";
import { supabaseApp } from "../../utils/supabase.js";
import { createApi } from "unsplash-js";
import { OpenAI } from "openai";
import { encode } from "base64-arraybuffer";
import admin from "firebase-admin";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_TOKEN,
});

const unsplashRoute = createApi({
	accessKey: process.env.unsplash_key,
	fetch: axios,
});

// Initialize Google GenAI client
const googleGenAIClient = new GoogleGenAI({
	apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

export const searchOnUnsplash = async (data) => {
	try {
		const queryForImage = data.state + " dish " + data.name;
		const response = await unsplashRoute?.search?.getPhotos({
			query: queryForImage,
		});
		const results = response?.response?.results;
		return results;
	} catch (e) {
		console.log(e, "error in unsplash api");
		throw e;
	}
};

export const getImageFromOpenAI = async (content) => {
	try {
		const prompt = `Give me a clean asthetic image for an Indian dish named as ${content.name}`;
		const result = await openai.createImage({
			prompt,
			size: "512x512",
			n: 1,
		});
		return result.data.data[0].url;
	} catch (e) {
		console.log(e, "error in openai api");
		throw e;
	}
};

async function downloadImageAsBase64(imageUrl) {
	// Use fetch to download the image
	const response = await fetch(imageUrl);
	const buffer = await response.arrayBuffer();
	const baseImage = encode(buffer);
	return baseImage;
}

const bucketName = process.env.FIREBASE_BUCKET;

const uploadImageinFirebase = async (req) => {
	const { image, fileName } = req;
	const bucket = await admin.storage().bucket(bucketName + "/Indian-Dishes");
	const file = await (await bucket.file(fileName)).save(image);
	return file;
};

export const getIndianCuisine = async (req, res) => {
	try {
		const { start, end } = req.body;
		const response = await supabaseApp
			.from("Indian-Food")
			.select("*")
			.limit(10);
		const foods = response.data;
		const images = await foods.map(async (item) => {
			const image = await downloadImageAsBase64(item.image);
			return image;
		});
		const result = await Promise.all(images);
		await result.map(async (singleImage) => {
			// const imgRes = await uploadImageinFirebase({ image: singleImage, fileName: "file" });
			await admin.firestore().collection();
			console.log(imgRes);
		});
		res.send(result);
		return;
		const emptyImageFood = foods.filter((item) => item.image === null);
		const results = await emptyImageFood.slice(start, end).map(async (item) => {
			const resultImage = await getImageFromOpenAI(item);
			const id = await supabaseApp
				.from("Indian-Food")
				.update({ image: resultImage })
				.eq("name", item.name);
			results.push({ ...item, image: resultImage });
			console.log(id.data, results, "done");
			return {
				...item,
				image: resultImage,
			};
		});
		res.send(results);
	} catch (e) {
		console.log(e, "e");
		res.send("Error");
	}
};

const handleAxiosRequestResponse = async (link) => {
	const response = await axios.get(link);
	if (response.status === 200) {
		return { data: response.data, status: 200 };
	} else if (response.status >= 300 && response.status < 400) {
		return { status: response.status, data: null };
	} else if (response.status >= 400 && response.status < 500) {
		return { status: response.status, data: null };
	} else {
		return { status: response.status, data: null };
	}
};

export const getMetaData = async (link) => {
	try {
		const output = await handleAxiosRequestResponse(link);
		if (output.status >= 200 && output.status < 300 && output.data !== null) {
			let items = {};
			const $ = load(output.data, { xmlMode: true });
			$("meta").each((index, element) => {
				if (element.name === "meta") {
					const name = element.attribs.name || element.attribs.property;
					const value = element.attribs.content;
					if (name) {
						items[name] = value;
					}
				}
			});
			return items;
		} else {
			return null;
		}
	} catch (e) {
		console.log(e.config.url);
		return null;
	}
};

function getChannels() {
	const filePath = process.cwd() + "/controllers/aggregator/newsPlatform.json";
	const newsWebsites = fs.readFileSync(filePath, "utf-8");
	const channels = JSON.parse(newsWebsites).newsChannels;
	return channels;
}

const fetchFromRSSLink = async (rssLink) => {
	try {
		const parser = new RssParser();
		const parsed = await parser?.parseURL(rssLink);
		if (parsed)
			return {
				title: parsed.title,
				description: parsed.description,
				link: parsed.link,
				image: parsed.image.url,
				feeds: parsed.items,
			};
		else return null;
	} catch (e) {
		return null;
	}
};

function validateAndFetchFromRssLinks(links) {
	const validRssLinks = links.map(async (item) => {
		try {
			const data = await fetchFromRSSLink(item.rssLink);
			if (data) {
				return data;
			} else {
				return null;
			}
		} catch (e) {
			return null;
		}
	});
	return validRssLinks;
}

export const getNewsFeeds = async (req, res) => {
	try {
		const rssLinks = getChannels();
		const results = await Promise.all(validateAndFetchFromRssLinks(rssLinks));
		const response = results.filter((item) => item !== null);
		res.send(response);
	} catch (e) {
		console.log(e, "error");
		res.send("Error");
	}
};

export const getSingleChannelFeeds = async (req, res) => {
	try {
		const name = req.body.channel;
		const rssLinks = getChannels();
		const links = rssLinks.filter((item) => item.name === name);
		const results = await Promise.all(validateAndFetchFromRssLinks(links));
		res.send(results);
	} catch (e) {
		console.log(e, "error");
		res.send("Error");
	}
};

export const getAllChannels = async (req, res) => {
	try {
		const rssLinks = getChannels();
		const results = rssLinks.map(async (item) => {
			try {
				const data = await getMetaData(item.website);
				if (data !== null) {
					const img = data["og:image"]
						? data["og:image"]
						: data["twitter:image"];
					return {
						name: item.name,
						website: item.website,
						description: data.description ? data.description : "",
						keywords: data?.keywords?.split(", ")?.slice(0, 4),
						rssLink: item.rssLink,
						image: img ? img : null,
					};
				} else {
					return null;
				}
			} catch (e) {
				return null;
			}
		});
		const channels = await Promise.all(results);
		const finalChannels = channels.filter((item) => item !== null);
		await supabaseApp.from("News-Channels").insert(finalChannels);
		res.send(finalChannels);
	} catch (e) {
		console.log(e, "error");
		res.send("Error");
	}
};

export const checkNewsWebsiteAndAddInSupabase = async (req, res) => {
	try {
		let response = {};
		const link = req.body.link;
		const supabaseTable = await supabaseApp
			.from("News-Channels")
			.select("*")
			.eq("website", link);
		if (supabaseTable?.count === 0) {
			const metadata = await getMetaData(link);
			if (metadata !== null) {
				const img = metadata["og:image"]
					? metadata["og:image"]
					: metadata["twitter:image"];
				response = {
					name: metadata.name,
					website: metadata.website,
					description: metadata.description ? metadata.description : "",
					keywords: metadata?.keywords?.split(", ")?.slice(0, 4),
					rssLink: metadata.rssLink,
					image: img ? img : null,
				};
				return response;
			} else {
				response = null;
				return null;
			}
		} else {
			response.data = "News channel already exists";
		}
		// await supabaseApp
		// 	.from("News-Channels")
		// 	.insert(response, { count: "exact" });
		res.send(response);
	} catch (e) {
		console.log(e, "error");
		res.send("Error");
	}
};

export const getJobsPortals = async (req, res) => {
	try {
		const { data: jobsPortals, error } = await supabaseApp
			.from("Resume-Websites")
			.select("*");

		if (error) throw new Error(error.message);

		const db = admin.firestore();
		let metadatas = [];

		for (const portal of jobsPortals) {
			const url = portal.website;
			metadatas.push(url);
			// try {
			// 	const metadata = await getMetadataFromUrl(url);
			// 	metadatas.push(metadata);
			// } catch (e) {
			// 	console.log(`Error fetching metadata for URL: ${url}`, e.message);
			// 	metadatas.push({ url, error: e.message });
			// }
		}

		res.json(metadatas);
	} catch (e) {
		console.log(e, "error");
		res.status(500).send("Error");
	}
};

// Assumes GOOGLE_GENAI_API_KEY is set in env
const googleClient = new ChatGoogleGenerativeAI({
	model: "gemini-1.5-flash",
	apiKey: process.env.GOOGLE_GENAI_API_KEY,
});
export const fetchAndSummarizeArticles = async (req, res) => {
	try {
		const db = admin.firestore();
		const articlesSnapshot = await db
			.collection("publish")
			.orderBy("timeStamp", "desc")
			.limit(10)
			.get();

		const articles = [];
		const noSummaryArticles = [];
		articlesSnapshot.docs.forEach(async (doc) => {
			const data = doc.data();
			if (data.summary) {
				articles.push({
					id: doc.id,
					title: data.title || "",
					description: data.description || "",
					summary: data.summary || "",
				});
			}
		});

		// Prepare content for llms.txt
		const content = articles
			.map(
				(a) =>
					`ID: ${a.id}\nTitle: ${a.title}\nDescription: ${a.description}\nSummary: ${a.summary}\n`
			)
			.join("\n----------------------\n");
			
		// Save to llms.txt in a safe directory
		const __filename = fileURLToPath(import.meta.url);
		const __dirname = path.dirname(__filename);
		const filePath = path.join(__dirname, "../../llms.txt");
		await fs.promises.writeFile(filePath, content, "utf8");

		// create summary for non summarised articles and finally store inside firestore and return in the LLM.txt

		res.json({
			message: "Articles fetched and saved to llms.txt",
			noSummaryArticles,
			filePath,
		});
	} catch (e) {
		console.error(e, "error in fetchAndSummarizeArticles");
		res.status(500).send("Error fetching and summarizing articles");
	}
};

/**
 * Dedicated method to update summary for a specific document
 * @param {string} docId - The document ID to update
 * @returns {Promise<Object>} - Returns the updated document data
 */
export const updateArticleSummary = async (req, res) => {
	try {
		const { docId } = req.params;

		if (!docId) {
			return res.status(400).json({ error: "Document ID is required" });
		}

		const db = admin.firestore();
		const docRef = db.collection("publish").doc(docId);
		const docSnapshot = await docRef.get();

		if (!docSnapshot.exists) {
			return res.status(404).json({ error: "Document not found" });
		}

		const data = docSnapshot.data();

		// Check if summary already exists
		if (data.summary) {
			return res.json({
				message: "Summary already exists",
				docId,
				summary: data.summary,
			});
		}

		// Check if content exists for summarization
		if (!data.content) {
			return res.status(400).json({
				error: "No content available for summarization",
				docId,
			});
		}

		// Generate summary using Google GenAI
		const prompt = `Summarize the following article in a concise and informative way: ${data.content}`;

		const result = await googleClient.invoke(prompt);
		const summary = result.content;

		// Update the document with the generated summary
		await docRef.update(
			{
				summary: summary || "",
				summaryUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
			},
			{ merge: true }
		);

		// Get the updated document
		const updatedDoc = await docRef.get();
		const updatedData = updatedDoc.data();

		res.json({
			message: "Summary updated successfully",
			docId,
			title: updatedData.title || "",
			description: updatedData.description || "",
			summary: updatedData.summary || "",
			summaryUpdatedAt: updatedData.summaryUpdatedAt,
		});
	} catch (error) {
		console.error("Error updating article summary:", error);
		res.status(500).json({
			error: "Failed to update article summary",
			message: error.message,
		});
	}
};

/**
 * Batch update summaries for multiple documents
 * @param {Array} docIds - Array of document IDs to update
 * @returns {Promise<Object>} - Returns the results of batch update
 */
export const batchUpdateArticleSummaries = async (req, res) => {
	try {
		const db = admin.firestore();
		const results = {
			successful: [],
			failed: [],
		};

		// Query Firestore for documents in "publish" collection
		// Use a simpler query to avoid index requirements
		const querySnapshot = await db
			.collection("publish")
			.orderBy("timeStamp", "desc")
			.limit(100) // Limit to avoid overwhelming the system
			.get();

		const docsToUpdate = [];
		querySnapshot.forEach((doc) => {
			const data = doc.data();
			// Only include if content is present and summary is missing
			if (
				data.content &&
				typeof data.content === "string" &&
				data.content.trim().length > 0 &&
				(!data.summary || data.summary.trim().length === 0)
			) {
				docsToUpdate.push({ docId: doc.id, data });
			}
		});

		if (docsToUpdate.length === 0) {
			return res.json({
				message: "No documents found that require summary generation.",
				totalProcessed: 0,
				successful: 0,
				failed: 0,
			});
		}

		// Process documents in batches to avoid overwhelming the API
		const batchSize = 5;
		for (let i = 0; i < docsToUpdate.length; i += batchSize) {
			const batch = docsToUpdate.slice(i, i + batchSize);

			await Promise.all(
				batch.map(async ({ docId, data }) => {
					try {
						const docRef = db.collection("publish").doc(docId);

						// Generate summary
						const prompt = `Summarize the following article in a concise and informative way: ${data.content}`;
						const result = await googleClient.invoke(prompt);
						const summary = result.content;

						// Update document
						await docRef.update(
							{
								summary: summary || "",
								summaryUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
							},
							{ merge: true }
						);

						results.successful.push({
							docId,
							title: data.title || "",
							summary: summary || "",
						});
					} catch (error) {
						console.error(`Error processing document ${docId}:`, error);
						results.failed.push({
							docId,
							error: error.message,
						});
					}
				})
			);

			// Add a small delay between batches to avoid rate limiting
			if (i + batchSize < docsToUpdate.length) {
				await new Promise((resolve) => setTimeout(resolve, 1000));
			}
		}

		res.json({
			message: "Batch summary update completed",
			results,
			totalProcessed: docsToUpdate.length,
			successful: results.successful.length,
			failed: results.failed.length,
		});
	} catch (error) {
		console.error("Error in batch update:", error);
		res.status(500).json({
			error: "Failed to perform batch summary update",
			message: error.message,
		});
	}
};

/**
 * Alternative batch update method that handles documents without summaries
 * This method is more efficient and doesn't require complex indexes
 */
export const updateMissingSummaries = async (req, res) => {
	try {
		const db = admin.firestore();
		const results = {
			successful: [],
			failed: [],
			skipped: [],
		};

		// Get all documents and filter in memory to avoid index requirements
		const querySnapshot = await db
			.collection("publish")
			.orderBy("timeStamp", "desc")
			.limit(200) // Increased limit for better coverage
			.get();

		const docsToUpdate = [];
		querySnapshot.forEach((doc) => {
			const data = doc.data();
			// Check if document needs summary update
			if (
				data.content &&
				typeof data.content === "string" &&
				data.content.trim().length > 0
			) {
				// Check if summary is missing or empty
				if (!data.summary || data.summary.trim().length === 0) {
					docsToUpdate.push({ docId: doc.id, data });
				} else {
					results.skipped.push({
						docId: doc.id,
						title: data.title || "",
						reason: "Summary already exists",
					});
				}
			} else {
				results.skipped.push({
					docId: doc.id,
					title: data.title || "",
					reason: "No content available",
				});
			}
		});

		if (docsToUpdate.length === 0) {
			return res.json({
				message: "No documents found that require summary generation.",
				totalProcessed: 0,
				successful: 0,
				failed: 0,
				skipped: results.skipped.length,
				results,
			});
		}

		console.log(
			`Found ${docsToUpdate.length} documents that need summary updates`
		);

		// Process documents in smaller batches for better control
		const batchSize = 3; // Reduced batch size for better stability
		for (let i = 0; i < docsToUpdate.length; i += batchSize) {
			const batch = docsToUpdate.slice(i, i + batchSize);
			console.log(
				`Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(
					docsToUpdate.length / batchSize
				)}`
			);

			await Promise.all(
				batch.map(async ({ docId, data }) => {
					try {
						const docRef = db.collection("publish").doc(docId);

						// Create a more specific prompt for better summaries
						const prompt = `Please provide a concise and informative summary of the following article. Focus on the main points and key insights:

Article Content:
${data.content}

Summary:`;

						const result = await googleClient.invoke(prompt);
						const summary = result.content;

						// Update document with summary
						await docRef.update(
							{
								summary: summary || "",
								summaryUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
								summaryGenerated: true,
							},
							{ merge: true }
						);

						results.successful.push({
							docId,
							title: data.title || "",
							summary: summary || "",
							contentLength: data.content.length,
						});

						console.log(`Successfully updated summary for document: ${docId}`);
					} catch (error) {
						console.error(`Error processing document ${docId}:`, error);
						results.failed.push({
							docId,
							title: data.title || "",
							error: error.message,
						});
					}
				})
			);

			// Longer delay between batches to avoid rate limiting
			if (i + batchSize < docsToUpdate.length) {
				console.log("Waiting 2 seconds before next batch...");
				await new Promise((resolve) => setTimeout(resolve, 2000));
			}
		}

		res.json({
			message: "Missing summaries update completed",
			results,
			totalProcessed: docsToUpdate.length,
			successful: results.successful.length,
			failed: results.failed.length,
			skipped: results.skipped.length,
			summary: {
				totalDocuments: querySnapshot.size,
				neededUpdates: docsToUpdate.length,
				successRate: `${(
					(results.successful.length / docsToUpdate.length) *
					100
				).toFixed(2)}%`,
			},
		});
	} catch (error) {
		console.error("Error in missing summaries update:", error);
		res.status(500).json({
			error: "Failed to update missing summaries",
			message: error.message,
		});
	}
};
