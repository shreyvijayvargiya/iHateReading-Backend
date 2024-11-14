import { load } from "cheerio";
import axios from "axios";
import RssParser from "rss-parser";

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
		console.log(finalTags);
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

export const scrapRSSFeed = async (req, res) => {
	let response = {
		success: false,
		status: null,
		data: null,
		error: null,
	};
	try {
		const { url } = req.body;
		const parser = new RssParser();
		const parsed = await parser.parseURL(url);
		response.data = parsed;
		response.status = 200;
		response.success = true;
		res.send(response);
	} catch (e) {
		console.log(e, "error");
		response.error = e;
		res.send(response);
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
