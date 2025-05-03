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
	const { queries, options = {}, limit = 10 } = req.body;

	// Handle both single query and array of queries
	const queryArray = Array.isArray(queries) ? queries : [queries];

	if (!queryArray.length || queryArray.some((q) => !q)) {
		return res
			.status(400)
			.json({ error: "At least one valid query is needed" });
	}

	try {
		const tbsParts = Object.entries(options)
			.map(([k, v]) => codeMap[k]?.[v])
			.filter(Boolean);
		const tbsQuery = tbsParts.length ? `&tbs=${tbsParts.join(",")}` : "";

		// Launch single browser instance
		const browser = await chromium.launch();
		const page = await browser.newPage();

		try {
			// Process queries sequentially
			const results = [];
			for (const query of queryArray) {
				try {
					await page.goto(
						`https://www.google.com/search?q=${encodeURIComponent(
							query
						)}&tbm=isch${tbsQuery}`
					);
					await page.waitForSelector('img[src^="https"]');
					await page.evaluate(() =>
						window.scrollTo(0, document.body.scrollHeight)
					);
					await page.waitForTimeout(2000);

					const images = await page.evaluate(
						(max) =>
							Array.from(document.querySelectorAll('img[src^="https"]'))
								.map((img) => ({
									url: img.src,
									w: img.naturalWidth,
									h: img.naturalHeight,
									...img,
								}))
								.filter((i) => i.w > 100 && i.h > 100)
								.slice(0, max)
								.map((i) => i.url),
						limit
					);

					results.push({ query, images });
				} catch (error) {
					results.push({
						query,
						images: [],
					});
				}
			}

			// If single query was provided, return just the images array
			if (!Array.isArray(queries)) {
				const result = results[0];
				if (!result.success) {
					return res.status(500).json({ error: result.error });
				}
				return res.send(result.images);
			}

			// For multiple queries, return array of results
			res.send(results);
		} finally {
			await browser.close();
		}
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Failed to process prompts" });
	}
};

export const scrapGoogleMapsLocation = async (req, res) => {
	const { queries } = req.body;

	const queryArray = Array.isArray(queries) ? queries : [queries];

	if (!queryArray.length || queryArray.some((q) => !q)) {
		return res
			.status(400)
			.json({ error: "At least one valid query is needed" });
	}

	let browser;
	try {
		const proxy = {
			host: "208.195.173.57",
			port: "65095",
			auth: { username: "TP48427802", password: "XQiJAsYA" },
		};

		// Launch single browser instance with proper configuration
		browser = await chromium.launch({
			headless: true,
			userAgent:
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
			args: [
				"--no-sandbox",
				"--disable-setuid-sandbox",
				"--disable-dev-shm-usage",
				"--disable-accelerated-2d-canvas",
				"--no-first-run",
				"--no-zygote",
				"--single-process",
				"--disable-gpu",
			],
		});

		// Create a shared context for all queries
		const context = await browser.newContext({
			proxy: {
				server: `http://${proxy.host}:${proxy.port}`,
				username: proxy.auth.username,
				password: proxy.auth.password,
			},
		});

		// Block unnecessary resources
		await context.route("**/*", (route) => {
			const type = route.request().resourceType();
			return ["image", "font", "stylesheet"].includes(type)
				? route.abort()
				: route.continue();
		});

		// Process all queries in parallel using Promise.all
		const results = await Promise.all(
			queryArray.map(async (query) => {
				const page = await context.newPage();
				try {
					// Navigate to Google Maps
					await page.goto(
						`https://www.google.com/maps/search/${encodeURIComponent(query)}`,
						{
							waitUntil: "networkidle",
						}
					);

					// Wait for the map to load
					await page.waitForSelector('div[role="main"]', { timeout: 30000 });

					// Wait a bit for the location to be fully loaded
					await page.waitForTimeout(5000);

					// Extract location data
					const locationData = await page.evaluate(() => {
						const url = window.location.href;
						const coordsMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
						const locationName =
							document.querySelector("h1")?.textContent || "";
						const address =
							document.querySelector('button[data-item-id="address"]')
								?.textContent || "";
						const details = Array.from(
							document.querySelectorAll('div[role="article"]')
						)
							.map((el) => el.textContent)
							.filter((text) => text.trim());

						return {
							name: locationName,
							address: address,
							coordinates: coordsMatch
								? {
										lat: parseFloat(coordsMatch[1]),
										lng: parseFloat(coordsMatch[2]),
								  }
								: null,
							url: url,
							details: details,
						};
					});

					return { query, ...locationData };
				} catch (error) {
					console.error(`Error processing query "${query}":`, error);
					return {
						query,
						name: "",
						address: "",
						coordinates: null,
						url: "",
						details: [],
						error: error.message,
					};
				} finally {
					await page.close();
				}
			})
		);

		// Close the shared context after all queries are complete
		await context.close();

		// If single query was provided, return just the location data
		if (!Array.isArray(queries)) {
			const result = results[0];
			if (!result.coordinates) {
				return res.status(404).json({
					error: "Location not found or coordinates not available",
					data: result,
				});
			}
			return res.status(200).json(result);
		}

		// For multiple queries, return array of results
		res.status(200).json(results);
	} catch (error) {
		console.error("Error scraping Google Maps:", error);
		res.status(500).json({
			error: "Failed to fetch location data",
			details: error.message,
		});
	} finally {
		if (browser) {
			await browser.close();
		}
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

export const scrapAirbnbListings = async (req, res) => {
	const { query, limit = 5 } = req.body;
	if (!query) {
		return res.status(400).json({ error: "query is needed" });
	}

	try {
		const browser = await chromium.launch();
		const page = await browser.newPage();

		// Navigate directly to Airbnb search
		await page.goto(
			`https://www.airbnb.com/s/${encodeURIComponent(query)}/homes`
		);

		// Wait for listings to load
		await page.waitForSelector('[data-testid="card-container"]');
		await page.waitForTimeout(2000);

		// Extract Airbnb listings
		const listings = await page.evaluate((max) => {
			const cards = Array.from(
				document.querySelectorAll('[data-testid="card-container"]')
			);
			return cards
				.map((card) => {
					const link = card.querySelector("a");
					const title = card.querySelector(
						'[data-testid="listing-card-title"]'
					)?.textContent;

					// Get the main image from the picture element
					const picture = card.querySelector("picture");
					const image =
						picture?.querySelector("img")?.src ||
						card.querySelector('img[data-testid="image"]')?.src;

					// Get price from the price element
					const priceElement = card.querySelector(
						'[data-testid="listing-card-price"]'
					);
					const price = priceElement?.textContent?.trim() || "";

					// Get rating from the rating element
					const ratingElement = card.querySelector(
						'[data-testid="listing-card-rating"]'
					);
					const rating = ratingElement?.textContent?.trim() || "";

					// Get location from the location element
					const locationElement = card.querySelector(
						'[data-testid="listing-card-location"]'
					);
					const location = locationElement?.textContent?.trim() || "";

					// Get host info
					const hostElement = card.querySelector(
						'[data-testid="listing-card-host"]'
					);
					const host = hostElement?.textContent?.trim() || "";

					// Get room type
					const roomTypeElement = card.querySelector(
						'[data-testid="listing-card-room-type"]'
					);
					const roomType = roomTypeElement?.textContent?.trim() || "";

					if (link && link.href) {
						return {
							url: link.href,
							title: title || "",
							price: price,
							rating: rating,
							location: location,
							image: image || "",
							host: host,
							roomType: roomType,
						};
					}
					return null;
				})
				.filter(Boolean)
				.slice(0, max);
		}, limit);

		await browser.close();

		// Return the listings
		res.send(listings);
	} catch (err) {
		console.error(err);
		res.status(500).json({
			status: 500,
			error: "Failed to fetch Airbnb listings",
			message: err.message,
		});
	}
};

export const getUnsplashImages = async (req, res) => {
	const { queries, limit = 10 } = req.body;

	// Handle both single query and array of queries
	const queryArray = Array.isArray(queries) ? queries : [queries];

	if (!queryArray.length || queryArray.some((q) => !q)) {
		return res
			.status(400)
			.json({ error: "At least one valid query is needed" });
	}

	try {
		const results = [];
		for (const query of queryArray) {
			try {
				const response = await axios.get(
					`https://api.unsplash.com/search/photos`,
					{
						params: {
							query,
							per_page: limit,
							client_id: process.env.UNSPLASH_ACCESS_KEY,
						},
					}
				);

				const images = response.data.results.map((photo) => ({
					url: photo.urls.regular,
					thumb: photo.urls.thumb,
					download: photo.links.download,
					author: photo.user.name,
					authorUrl: photo.user.links.html,
					width: photo.width,
					height: photo.height,
				}));

				results.push({ query, images });
			} catch (error) {
				results.push({ query, images: [] });
			}
		}

		// If single query was provided, return just the images array
		if (!Array.isArray(queries)) {
			return res.send(results[0].images);
		}

		// For multiple queries, return array of results
		res.send(results);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Failed to fetch images from Unsplash" });
	}
};

export const getGoogleMapsLocations = async (req, res) => {
	const { queries } = req.body;

	// Handle both single query and array of queries
	const queryArray = Array.isArray(queries) ? queries : [queries];

	if (!queryArray.length || queryArray.some((q) => !q)) {
		return res
			.status(400)
			.json({ error: "At least one valid query is needed" });
	}

	try {
		const results = [];
		for (const query of queryArray) {
			try {
				// Make request to Google Maps Geocoding API
				const response = await axios.get(
					`https://maps.googleapis.com/maps/api/geocode/json`,
					{
						params: {
							address: query,
							key: process.env.GOOGLE_MAPS_API_KEY,
						},
					}
				);

				if (response.data.status === "OK" && response.data.results.length > 0) {
					const result = response.data.results[0];
					const locationData = {
						name: result.formatted_address.split(",")[0],
						address: result.formatted_address,
						coordinates: {
							lat: result.geometry.location.lat,
							lng: result.geometry.location.lng,
						},
						url: `https://www.google.com/maps/search/${encodeURIComponent(
							query
						)}`,
						details: [
							...result.address_components.map(
								(component) => component.long_name
							),
							...result.types,
						],
					};
					results.push({ query, ...locationData });
				} else {
					results.push({
						query,
						name: "",
						address: "",
						coordinates: null,
						url: "",
						details: [],
						error: "Location not found",
					});
				}
			} catch (error) {
				results.push({
					query,
					name: "",
					address: "",
					coordinates: null,
					url: "",
					details: [],
					error: error.message,
				});
			}
		}

		// If single query was provided, return just the location data
		if (!Array.isArray(queries)) {
			const result = results[0];
			if (!result.coordinates) {
				return res.status(404).json({
					error: "Location not found or coordinates not available",
					data: result,
				});
			}
			return res.status(200).json(result);
		}

		// For multiple queries, return array of results
		res.status(200).json(results);
	} catch (error) {
		console.error("Error fetching location data:", error);
		res.status(500).json({
			error: "Failed to fetch location data",
			details: error.message,
		});
	}
};

export const getSerpLocations = async (req, res) => {
	const { queries } = req.body;

	// Handle both single query and array of queries
	const queryArray = Array.isArray(queries) ? queries : [queries];

	if (!queryArray.length || queryArray.some((q) => !q)) {
		return res
			.status(400)
			.json({ error: "At least one valid query is needed" });
	}

	try {
		const results = [];
		for (const query of queryArray) {
			try {
				// Make request to SerpAPI
				const response = await axios.get(`https://serpapi.com/search`, {
					params: {
						engine: "google_maps",
						q: query,
						api_key: process.env.SERP_API_KEY,
						type: "search",
						ll: "@0,0,15z", // Default zoom level
					},
				});

				if (response.data.place_results) {
					const result = response.data.place_results;
					const locationData = {
						name: result.title,
						address: result.address,
						coordinates: {
							lat: result.gps_coordinates?.latitude || null,
							lng: result.gps_coordinates?.longitude || null,
						},
						url: result.place_id_search,
						details: [
							result.description?.snippet,
							result.weather?.conditions,
							result.weather?.celsius,
							result.website,
							...(result.images?.map((img) => img.title) || []),
						].filter(Boolean),
						metadata: {
							place_id: result.place_id,
							data_id: result.data_id,
							reviews_link: result.reviews_link,
							photos_link: result.photos_link,
							thumbnail: result.thumbnail,
							weather: result.weather,
							website: result.website,
							images: result.images,
						},
					};
					results.push({ query, ...locationData });
				} else {
					results.push({
						query,
						name: "",
						address: "",
						coordinates: null,
						url: "",
						details: [],
						metadata: {},
						error: "Location not found",
					});
				}
			} catch (error) {
				results.push({
					query,
					name: "",
					address: "",
					coordinates: null,
					url: "",
					details: [],
					metadata: {},
					error: error.message,
				});
			}
		}

		// If single query was provided, return just the location data
		if (!Array.isArray(queries)) {
			const result = results[0];
			if (!result.coordinates) {
				return res.status(404).json({
					error: "Location not found or coordinates not available",
					data: result,
				});
			}
			return res.status(200).json(result);
		}

		// For multiple queries, return array of results
		res.status(200).json(results);
	} catch (error) {
		console.error("Error fetching location data:", error);
		res.status(500).json({
			error: "Failed to fetch location data",
			details: error.message,
		});
	}
};
