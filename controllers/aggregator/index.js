import axios from "axios";
import { load } from "cheerio";
import fs from "fs";
import csvParser from "csv-parser";
import RssParser from "rss-parser";
import { supabaseApp } from "../../utils/supabase.js";

export const getIndianCuisine = async (req, res) => {
	try {
		const filePath = process.cwd() + "/indian_food.csv";

		let results = [];
		fs.createReadStream(filePath)
			.pipe(csvParser())
			.on("data", (data) => results.push(data))
			.on("end", () => {
				res.send(results);
			});
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
		await supabaseApp.from("News-Channels").insert(response, { count: "exact" });
		res.send(response);
	} catch (e) {
		console.log(e, "error");
		res.send("Error");
	}
};
