import express from "express";
import passport from "passport";
import admin from "firebase-admin";
import {
	scrapMetaTags,
	scrapRSSFeed,
	scrapGoogleImagesApi,
	scrapGoogleMapsLocation,
	scrapAirbnbListings,
	getUnsplashImages,
	getGoogleMapsLocations,
	getSerpLocations,
} from "../controllers/scrap/index.js";
import {
	sendTestingEmail,
	sendEmailToListUsers,
	sendFirstEmail,
	sendSignUpEmail,
	addSubscriber,
	sendEmailToUsers,
	sendEmailToSpecificUser,
} from "../controllers/email/index.js";
import { postTweet, fetchTweetContent } from "../controllers/tweet/index.js";
import {
	addGumroadTemplate,
	latestTemplates,
} from "../controllers/templates/index.js";
import {
	convertDataToHtml,
	createRepo,
	getAllYogaAsanas,
	getAllYogaPoses,
	getDataFromOpenAI,
	getSingleThreadTweet,
	getUniqueLinksFromNewsletters,
	getYogaAsanasByGenderMood,
	getYogaAsanasByTime,
	getYogaAsanasForHealthProblems,
	getYogaPostureImageFromUnSplash,
	getYogaPostures,
} from "../controllers/openai/index.js";
import {
	checkNewsWebsiteAndAddInSupabase,
	getAllChannels,
	getImageFromOpenAI,
	getIndianCuisine,
	getNewsFeeds,
	getSingleChannelFeeds,
	getJobsPortals,
	fetchAndSummarizeArticles,
	updateArticleSummary,
	batchUpdateArticleSummaries,
} from "../controllers/aggregator/index.js";
import { resumeBuildingWebsite } from "../controllers/findjobsportals/index.js";
import {
	convertHtmlToMarkdownAndGenerateGraph,
	generateComponent,
	generateCustomRepo,
	generateDependencyGraph,
	generateDependencyGraphViaLangchain,
	generateRoadmap,
	summarizeBlogContent,
	updateCustomRepo,
	generateFlashCards,
} from "../controllers/customrepos/index.js";
import { payViaLemonSquezy } from "../controllers/payments/index.js";

const router = express.Router();

router.get("/", (req, res) => {
	res.send("Welcome to basic ihatereading-backend repository ");
});

router.post("/v1/api/get-custom-repo-graph", generateDependencyGraph);
router.post("/v1/api/custom-repo-graph", generateDependencyGraphViaLangchain);
router.post("/v1/api/generateRoadmap", generateRoadmap);
router.post("/v1/api/generate-ui-variants", generateComponent);

router.post("/v1/api/generate-custom-repo", generateCustomRepo);
router.post("/v1/api/summarize-blog-content", summarizeBlogContent);
router.post(
	"/v1/api/get-knowledge-graph",
	convertHtmlToMarkdownAndGenerateGraph
);
router.post("/v1/api/update-custom-repo", updateCustomRepo);
router.post("/v1/api/generate-flash-cards", generateFlashCards);

// payment apis
router.get("/v1/api/get-lemon-squezy-products", (req, res) => res.send("Done"));
router.post("/v1/api/pay-via-lemon-squezy", payViaLemonSquezy);

// google auth api
router.get(
	"/v1/auth/google",
	passport.authenticate("google", {
		session: false,
		scope: ["profile", "email"],
	})
);
router.get(
	"/auth/google/callback",
	passport.authenticate("google", { failureRedirect: "/" }),
	(req, res) => {
		res.cookie("authToken", req.user.token);
		res.redirect("/");
	}
);

// scrap link or website routes
router.post("/v1/api/get-meta-tags", scrapMetaTags);
router.post("/v1/api/scrap-rss-feed", scrapRSSFeed);
router.post("/v1/api/scrap-google-images", scrapGoogleImagesApi);
router.post("/v1/api/scrap-google-maps", scrapGoogleMapsLocation);
router.post("/v1/api/scrap-airbnb-listings", scrapAirbnbListings);
router.post("/v1/api/get-unsplash-images", getUnsplashImages);
router.post("/v1/api/get-google-maps-locations", getGoogleMapsLocations);
router.post("/v1/api/get-serp-locations", getSerpLocations);

// gumroad API routes
router.get("/v1/api/gumroad/addTemplate", addGumroadTemplate);
router.get("/v1/api/latest-templates", latestTemplates);

// courier api for email
router.get("/v1/api/signup-email", sendSignUpEmail);
router.post("/v1/api/addSubscriber", addSubscriber);
router.post("/v1/api/send-testing-email", sendTestingEmail);
router.post("/v1/api/send-email-list-users", sendEmailToListUsers);
router.post("/v1/api/send-email-users", sendEmailToUsers);
router.post("/v1/api/send-first-email", sendFirstEmail);
router.post("/v1/api/send-email-to-user", sendEmailToSpecificUser);

// twitter api
router.get("/v1/api/postTweet", postTweet);
router.post("/v1/api/fetch-tweet-content", fetchTweetContent);

// open AI APIs
router.post("/v1/api/getDataFromOpenAI", getDataFromOpenAI);
router.post("/v1/api/getYogaPostures", getYogaPostures);
router.get("/v1/api/yogaAsanas", getAllYogaAsanas);
router.post("/v1/api/getYogaPoseImage", getYogaPostureImageFromUnSplash);
router.get("/v1/api/getYogaByDayTime", getYogaAsanasByTime);
router.post("/v1/api/getYogaAsanasByGenderMood", getYogaAsanasByGenderMood);
router.post(
	"/v1/api/getYogaAsanasForHealthProblems",
	getYogaAsanasForHealthProblems
);
router.post("/v1/api/getAllYogaPoses", getAllYogaPoses);
router.post("/v1/api/getSingleThreadTweet", getSingleThreadTweet);

router.get("/v1/api/getIndianCuisines", getIndianCuisine);
router.get("/v1/api/getCuisineImage", getImageFromOpenAI);

router.get(
	"/v1/api/getUniqueLinksFromNewsletters",
	getUniqueLinksFromNewsletters
);
router.post("/v1/api/createRepo", createRepo);

// aggregator APIs
router.post("/v1/api/getNewsFeeds", getNewsFeeds);
router.post("/v1/api/getSingleChannelFeeds", getSingleChannelFeeds);
router.get("/v1/api/getAllChannels", getAllChannels);
router.post(
	"/v1/api/checkNewsWebsiteAndAddInSupabase",
	checkNewsWebsiteAndAddInSupabase
);
router.get("/v1/api/getJobPortals", getJobsPortals);
router.get("/v1/api/fetchAndSummarizeArticles", fetchAndSummarizeArticles);

// Summary update APIs
router.put("/v1/api/update-article-summary/:docId", updateArticleSummary);
router.get(
	"/v1/api/batch-update-article-summaries",
	batchUpdateArticleSummaries
);

// find jobs portals APIs
router.post("/v1/api/resume-build-websites", resumeBuildingWebsite);

// Data migration API
router.get("/v1/api/migrate-data", async (req, res) => {
	try {
		const db = await admin
			.firestore()
			.collection("mini-saas")
			.orderBy("timeStamp", "desc")
			.get();

		const results = db.docs.map((doc) => {
			return {
				subject: doc.data().subject,
				createdAt: doc.data().createdAt,
			};
		});

		res.send(results);
	} catch (error) {
		console.error("Migration error:", error);
		res.status(500).send({ error: "Migration failed" });
	}
});

export default router;
