import { load } from "cheerio";
import axios from "axios";
import { chromium } from "playwright";
import { ChatOllama, Ollama } from "@langchain/ollama";
import { parseStringPromise } from "xml2js";

// Initialize DeepSeek client
const deepSeekClient = new ChatOllama({
	model: "deepseek-r1:8b",
	temperature: 0.1,
	baseUrl: "http://localhost:11434",
	streaming: true, // turn off streaming for simplicity
});

const llamaClient = new Ollama({
	model: "gemma",
	temperature: 0.1,
	baseUrl: "http://localhost:11434",
	streaming: true, // turn off streaming for simplicity
});

const codeMap = {
	size: {
		Small: "isz:i",
		Medium: "isz:m",
		Large: "isz:l",
		"Extra large": "isz:x",
	},
	type: {
		Photograph: "itp:photo",
		Clipart: "itp:clipart",
		Animated: "itp:animated",
		"Line drawing": "itp:lineart",
	},
	color: {
		"Full color": "ic:color",
		"Black & white": "ic:gray",
		Transparent: "ic:trans",
	},
	license: { "Creative Commons": "il:cl", Commercial: "il:ol" },
	time: { "Past day": "qdr:d", "Past week": "qdr:w", "Past month": "qdr:m" },
	aspect: { Tall: "iar:t", Square: "iar:s", Wide: "iar:w" },
	format: { JPG: "ift:jpg", PNG: "ift:png", GIF: "ift:gif" },
};

export const scrapGoogleImagesApi = async (req, res) => {
	const { query, options = {}, limit = 10 } = req.body;
	if (!query) {
		return res.status(400).json({ error: "query is needed" });
	}

	try {
		const tbsParts = Object.entries(options)
			.map(([k, v]) => codeMap[k]?.[v])
			.filter(Boolean);
		const tbsQuery = tbsParts.length ? `&tbs=${tbsParts.join(",")}` : "";

		const browser = await chromium.launch();
		const page = await browser.newPage();
		await page.goto(
			`https://www.google.com/search?q=${encodeURIComponent(
				query
			)}&tbm=isch${tbsQuery}`
		);
		await page.waitForSelector('img[src^="https"]');
		await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
		await page.waitForTimeout(2000);

		const images = await page.evaluate(
			(max) =>
				Array.from(document.querySelectorAll('img[src^="https"]'))
					.map((img) => ({
						url: img.src,
						w: img.naturalWidth,
						h: img.naturalHeight,
					}))
					.filter((i) => i.w > 100 && i.h > 100)
					.slice(0, max)
					.map((i) => i.url),
			limit
		);

		await browser.close();
		res.send(images);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Failed to process prompt" });
	}
};

export const scrapLink = async (req, res) => {
	const { url } = req.body;
	let response = {
		success: false,
		status: null,
		data: null,
		error: null,
	};
	try {
		const data = await axios.get(url);
		const $ = load(data.data);
		const impMetaTags = [
			"og:title",
			"og:description",
			"og:keywords",
			"og:image",
			"twitter:title",
			"twitter:description",
			"twitter:image",
			"twitter:keywords",
			"keywords",
			"author",
		];
		const finalTags = {};
		const title = $("title:first").text();
		$("meta").map((item) => {
			const name = $(this).attr("name")
				? $(this).attr("name")
				: $(this).attr("property");
			if (impMetaTags.includes(name)) {
				return (finalTags[name] = {
					[name]: $(this).attr("value")
						? $(this).attr("value")
						: $(this).attr("content"),
				});
			}
		});
		response.data = [{ name: "title", value: title }, ...finalTags];
		response.status = data.status;
		response.success = true;
		res.send(response);
	} catch (e) {
		// console.log(e, "error");
		response.success = false;
		response.status = e.response?.status;
		response.error = e.response?.statusText;
		res.send(response);
	}
};

export const scrapMetaTags = async (req, res) => {
	let response = {
		data: null,
		status: Number,
		error: null,
	};
	try {
		const data = await axios.get(req.body.url);
		const $ = load(data.data, { xmlMode: true });

		const items = [];

		$("meta").each((index, element) => {
			if (element.name === "meta" && element.attribs.content) {
				items.push({
					name: element.attribs.name || element.attribs.property,
					value: element.attribs.content,
				});
			} else {
				return null;
			}
		});
		response.data = items;
		res.send(response);
	} catch (e) {
		response.status = 500;
		response.error = "";
		console.log(e, "e");
		res.json(response);
	}
};

const extractMeta = (html) => {
	const $ = load(html);
	return {
		title:
			$('meta[property="og:title"]').attr("content") ||
			$('meta[name="title"]').attr("content") ||
			$("title").text() ||
			null,
		description:
			$('meta[property="og:description"]').attr("content") ||
			$('meta[name="description"]').attr("content") ||
			null,
		image:
			$('meta[property="og:image"]').attr("content") ||
			$('meta[name="twitter:image"]').attr("content") ||
			null,
		url: $('meta[property="og:url"]').attr("content") || null,
		siteName: $('meta[property="og:site_name"]').attr("content") || null,
	};
};

export const scrapRSSFeed = async (req, res) => {
	const { feedUrl } = req.body;
	if (!feedUrl) {
		return res.status(400).json({ error: "Missing feedUrl in request body" });
	}

	try {
		// 1. Fetch RSS XML as raw text
		const rssResponse = await axios.get(feedUrl, {
			responseType: "text",
			timeout: 5000,
		});
		const xml = rssResponse.data;

		// 2. Parse XML into JS object
		const rssObj = await parseStringPromise(xml, { trim: true });
		const items = rssObj.rss?.channel?.[0]?.item || [];

		// 3. Process each <item>
		const results = await Promise.all(
			items.map(async (item) => {
				const link = item.link?.[0] || null;
				const title = item.title?.[0] || null;
				const pubDate = item.pubDate?.[0] || null;

				if (!link) {
					return { title, link, pubDate, meta: { error: "No link found" } };
				}

				try {
					const pageResp = await axios.get(link, { timeout: 5000 });
					const meta = extractMeta(pageResp.data);
					return { title, link, pubDate, meta };
				} catch (err) {
					return {
						title,
						link,
						pubDate,
						meta: { error: "Failed to fetch page" },
					};
				}
			})
		);

		// 4. Return the aggregated JSON
		res.status(200).json({
			feed: {
				title: rssObj.rss?.channel?.[0]?.title?.[0] || null,
				description: rssObj.rss?.channel?.[0]?.description?.[0] || null,
			},
			items: results,
		});
	} catch (err) {
		console.error("Error processing feed:", err);
		res.status(500).json({ error: "Failed to fetch or parse RSS feed" });
	}
};

export const getMetadataFromUrl = async (url) => {
	try {
		const { data } = await axios.get(url);
		const $ = load(data);

		const getMetaContent = (name) => {
			const content =
				$(`meta[name="${name}"]`).attr("content") ??
				$(`meta[property="${name}"]`).attr("content");
			return content ? content.trim() : undefined;
		};

		const metadata = {
			url,
			title: $("title").text()?.trim() ?? undefined,
			metaTitle: getMetaContent("og:title"),
			ogDescription: getMetaContent("og:description"),
			twitterThumbnail: getMetaContent("twitter:image"),
			ogThumbnail: getMetaContent("og:image"),
			description: getMetaContent("description"),
			twitterLink: getMetaContent("twitter:site"),
			author: getMetaContent("author"),
			publicationDate: getMetaContent("article:published_time"),
			siteName: getMetaContent("og:site_name"),
			canonicalUrl:
				$('link[rel="canonical"]').attr("href")?.trim() ?? undefined,
			locale: getMetaContent("og:locale"),
			websiteLocation: getMetaContent("og:site"),
			twitterCard: getMetaContent("twitter:card"),
			ogType: getMetaContent("og:type"),
			rssLink:
				$('link[rel="alternate"][type="application/rss+xml"]')
					.attr("href")
					?.trim() ?? undefined,
			tags:
				$('meta[name="keywords"]')
					.attr("content")
					?.split(",")
					.map((tag) => tag.trim()) ?? [],
			additionalImages: [],
		};

		$("img").each((i, el) => {
			const src = $(el).attr("src");
			if (src) {
				metadata.additionalImages.push(src);
			}
		});

		return metadata;
	} catch (e) {
		console.log(`Error fetching metadata for URL: ${url}`, e.message);
		return { url, error: e.message };
	}
};
