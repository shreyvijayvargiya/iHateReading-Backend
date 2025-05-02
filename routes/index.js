import express from "express";
import passport from "passport";
import admin from "firebase-admin";
import {
	scrapMetaTags,
	scrapRSSFeed,
	scrapGoogleImagesApi,
	scrapGoogleMapsLocation,
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
	generateLandingPageApi,
	updateShuffleApi,
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

// find jobs portals APIs
router.post("/v1/api/resume-build-websites", resumeBuildingWebsite);

// Data migration API
router.get("/v1/api/migrate-data", async (req, res) => {
	const snapshot = await admin.firestore().collection("CustomRepos").get();
	const batch = admin.firestore().batch();

	snapshot.forEach(async (doc) => {
		const data = doc.data();

		if (data.demoLink && data.demoLink.includes("/projects/")) {
			const name = data.demoLink.split("/")[1];
			const newDemoLink = `custom-components/${name}`;
			console.log(newDemoLink, "new demo link");
			// const docRef = await admin.firestore().collection('CustomRepos').doc(doc.id);
			// batch.update(docRef, { demoLink: newDemoLink });
		}
	});

	await batch.commit();
	res.send("Done");

	// res.send("Data migration completed");
});

// Landing page generation API
router.post("/v1/api/generate-landing-page", generateLandingPageApi);
router.post("/v1/api/shuffle-theme", updateShuffleApi);

export default router;
