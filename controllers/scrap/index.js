import puppeteer from "puppeteer";
import urlMetaData from "url-metadata";

export const scrapLink = async (req, res) => {
	const response = {
		data: null,
		message: "",
		error: false,
	};
	const link = req.body.link;
	if (!link) {
		response.error = true;
		response.message = "Please send link";
		res.send(response);
	} else {
		try {
			const browser = await puppeteer.launch({
				headless: false,
				ignoreDefaultArgs: ["--disable-extensions"],
			});
			const page = await browser.newPage();
			await page.goto(link);
			const title = await page.title();
			let h1, h2, thumbnail;
			const metadata = await urlMetaData(link);
			if ((await page.$("h1")) !== null) {
				await page.waitForSelector("h1", { timeout: 5000 });
				h1 = await page.$("h1");
				h1 = await page.evaluate((element) => element.textContent, h1);
			}
			if ((await page.$("h2")) !== null) {
				await page.waitForSelector("h2", { timeout: 5000 });
				h2 = await page.$("h2");
				h2 = await page.evaluate((element) => element.textContent, h2);
			}
			response.data = {
				title,
				h1,
				h2,
				link,
			};
			res.send(response);
		} catch (e) {
			console.log(e, "e");
			res.send({
				data: null,
				error: true,
				message: e,
			});
		}
	}
};

export const scrapMediumArticles = async (req, res) => {
	try {
		const browser = await puppeteer.launch();
		const page = await browser.newPage();
		await page.goto("https://medium.com/me/stories/drafts");
		const data = await page.evaluate(() => {
			console.log("page loaded");
			const stories = document.querySelectorAll(".draftStory");
			return Array.from(stories).map((story) => {
				return {
					title: story.querySelector(".draftStory-title").innerText,
					subtitle: story.querySelector(".draftStory-subtitle").innerText,
					date: story.querySelector(".draftStory-date").innerText,
				};
			});
		});
		console.log(data);
		await browser.close();
	} catch (error) {
		console.log(error, "error");
		res.send("Error");
	}
};
