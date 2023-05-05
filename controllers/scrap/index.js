import { load } from "cheerio";
import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import xmlParser from "xml2js";

export const scrapLink = async (req, res) => {
	let response = {
		success: false,
		status: null,
		data: null,
		error: null,
	};
	try {
		const data = await axios.get(req.body.url);
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
		const finalTags = [];
		const title = $("title:first").text();
		$("meta").map(function (item) {
			const name = $(this).attr("name")
				? $(this).attr("name")
				: $(this).attr("property");
			if (impMetaTags.includes(name)) {
				return finalTags.push({
					name,
					value: $(this).attr("value")
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
		console.log(e, "error");
		response.success = false;
		response.status = e.response?.status;
		response.error = e.response?.statusText;
		res.send(response);
	}
};

export const scrapFromRSSFeed = async (req, res) => {
	// data axios.get(rss feed url)
	// data should be an array
	// what is RSS feed is not available first let's do this only
	let data = {
		data: null,
		status: Number,
		error: null,
	};
	try {
		const url = req.body.url;
		const response = await axios.get(url);
		const parser = new XMLParser();
		parser.parse(response.data);
		xmlParser.parseString(response.data, (err, result) => {
			if (err) {
				throw Error(err);
			}
			console.log(result);
			// the hindu rss items destination data.data = JSON.stringify(result.rss.channel[0].item);
			// for every rss feed url we need to find which key contains the items and send it back to the database
			data.status = 200;
			res.error = null;
		});
		res.send(JSON.parse(data.data));
	} catch (e) {
		data.status = 500;
		data.error = "";
		console.log(e, "e");
		res.json(data);
	}
};
