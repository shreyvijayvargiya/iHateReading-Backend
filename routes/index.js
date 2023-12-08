import express from "express";
import passport from "passport";
import { firebaseLogin } from "../controllers/login/firebaseLogin.js";
import { downloadRepo } from "../controllers/repo/downloadRepo.js";
import {
	scrapMetaTags,
	scrapLink,
	scrapRSSFeed,
} from "../controllers/scrap/index.js";
import {
	sendTestingEmail,
	sendEmailToListUsers,
	sendFirstEmail,
	sendSignUpEmail,
	addSubscriber,
} from "../controllers/email/index.js";
import { postTweet } from "../controllers/tweet/index.js";
import {
	addGumroadTemplate,
	latestTemplates,
} from "../controllers/templates/index.js";
import {
	getAllYogaAsanas,
	getAllYogaPoses,
	getDataFromOpenAI,
	getSingleThreadTweet,
	getYogaAsanasByGenderMood,
	getYogaAsanasByTime,
	getYogaAsanasForHealthProblems,
	getYogaPostureImageFromUnSplash,
	getYogaPostures,
} from "../controllers/openai/index.js";
const router = express.Router();

router.get("/", (req, res) => {
	res.send("Welcome to basic ihatereading-backend repository ");
});
router.get("/v1/custom-repo/login", firebaseLogin);

// custom repo download api
router.post("/v1/custom-repo/download-repo", downloadRepo);

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
router.post("/v1/api/get-link-tags", scrapLink);
router.post("/v1/api/get-meta-tags", scrapMetaTags);
router.post("/v1/api/scrap-rss-feed", scrapRSSFeed);


// gumroad API routes
router.get("/v1/api/gumroad/addTemplate", addGumroadTemplate);
router.get("/v1/api/latest-templates", latestTemplates);

// courier api for email
router.get("/v1/api/signup-email", sendSignUpEmail);
router.get("/v1/api/addSubscriber", addSubscriber);
router.post("/v1/api/send-testing-email", sendTestingEmail);
router.post("/v1/api/send-email-list-users", sendEmailToListUsers);
router.post("/v1/api/send-first-email", sendFirstEmail);

// twitter api
router.get("/v1/api/postTweet", postTweet);

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

export default router;
