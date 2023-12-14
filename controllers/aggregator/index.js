import axios from "axios";
import fs from "fs";
import csvParser from "csv-parser";
import RssParser from "rss-parser";

export const scrapFromRss = async (req, res) => {};
export const googleTrendingAPINews = async (req, res) => {};
export const bingSearchAPI = async (req, res) => {};
export const newsCatcherAPINews = async (req, res) => {};
export const newsDataAPINews = async (req, res) => {};

export const getIndianCuisine = async (req, res) => {
	try {
		const filePath = process.cwd() + "/indian_food.csv";
		// const fileData = await fs.readFileSync(filePath, "utf8");

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

function validateRssLinks(links) {
	const validRssLinks = links.map(async (item) => {
		try {
			const parser = new RssParser();
			const parsed = await parser?.parseURL(item.rssLink);
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
	});

	return validRssLinks;
}

export const getNewsWebsite = async (req, res) => {
	try {
		const filePath =
			process.cwd() + "/controllers/aggregator/newsPlatform.json";
		const newsWebsites = fs.readFileSync(filePath, "utf-8");
		const rssLinks = JSON.parse(newsWebsites).newsChannels;
		const results = await Promise.all(validateRssLinks(rssLinks));
		res.send(results.filter((item) => item !== null));
	} catch (e) {
		console.log(e, "error");
		res.send("Error");
	}
};
