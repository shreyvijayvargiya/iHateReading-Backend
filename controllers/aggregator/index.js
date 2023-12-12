import axios from "axios";
import fs from "fs";
import csvParser from "csv-parser";

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
				res.send(results)
			});
	} catch (e) {
		console.log(e, "e");
		res.send("Error");
	}
};
