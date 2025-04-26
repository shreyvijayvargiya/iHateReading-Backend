import { test, expect } from "playwright/test";

test("Google Search Scraper", async ({ page }) => {
	await page.goto("https://www.google.com");
	await page.fill('textarea[name="q"]', "srilanka visa websites");
	await Promise.all([
		page.click('input[name="btnK"]'),
		page.waitForSelector("#search"),
	]);
	const searchDiv = page.locator("div[data-async-context]");

	const childElements = await searchDiv.locator("*").all();

	const links = [];
	for (const element of childElements) {
		await element.evaluate(async(node)=> {
    console.log(element.getAttribute("a[jsname]"))
		if (node === "a") {
			const href = await element.getAttribute("href");
			if (href) {
				links.push(href);
			}
		}
	});
  }
  console.log(links, "link")
});
