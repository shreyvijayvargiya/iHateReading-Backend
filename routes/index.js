import express from "express";
import passport from "passport";
import { firebaseLogin } from "../controllers/login/firebaseLogin.js";
import {
	downloadRepo,
	createSandboxTreeFromRepoTree,
} from "../controllers/repo/downloadRepo.js";
import { getLinkPreview } from "link-preview-js";
import { scrapLink } from "../controllers/scrap/index.js";
import { getMetadata } from "../controllers/scrap/getMetadata.js";
import { getLogDetail } from "../controllers/log/getLogData.js";
import {
	sendLogEmail,
	sendListToCourier,
	sendEmailToListUsers,
	addUserInList,
	getLists,
	sendFirstEmail,
	sendSignUpEmail,
	addRecipient,
	notiontohtml,
	sendEmailUsingSendInBlue,
	sendTestingEmailUsingSendInBlue,
	checkSendEmails,
	createTemplateAndSendEmail,
} from "../controllers/email/index.js";
import { scrapMediumArticles } from "../controllers/scrap/index.js";
import { postTweet } from "../controllers/tweet/index.js";
import { addGumroadTemplate } from "../controllers/templates/index.js";
import rssToJson from "rss-to-json";
import { getNotionData } from "../controllers/notion/index.js";
import { getDataFromOpenAI } from "../controllers/openai/index.js";

const router = express.Router();

router.get("/", (req, res) => {
	res.send("Welcome to basic ihatereading-backend repository ");
});
router.get("/v1/custom-repo/login", firebaseLogin);

// custom repo download api
router.post("/v1/custom-repo/download-repo", (req, res) =>
	downloadRepo(req, res)
);


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

// codesandbox API
router.post("/v1/deploy-custom-repo", (req, res) =>
	createSandboxTreeFromRepoTree(req, res)
);
router.post("/v1/scrap-link", (req, res) => scrapLink(req, res));

router.get("/v1/preview", (req, res) => {
	getLinkPreview(
		"https://ihatereading.in/createrepo?framework=Next%20JS&repoId=-MgQlG5flVPCV7sJyRYh"
	).then((data) => {
		console.debug(data);
	});
	res.send("Done");
});

router.post("/v1/get-meta-data", getMetadata);
router.post("/v1/get-log-data", getLogDetail);


// sendinblue api for emailing
router.post("/v1/api/sendinblue/send-email", sendEmailUsingSendInBlue);
router.post("/v1/api/sendinblue/send-test-email", sendTestingEmailUsingSendInBlue);
router.get("/v1/api/sendinblue/check-send-emails", checkSendEmails);
router.get("/email-templates", createTemplateAndSendEmail);;
// gumroads
router.get("/v1/api/gumroad/addTemplate", addGumroadTemplate);

// notion apis
router.get("/v1/api/notion-to-html", notiontohtml);

// courier api for emails
router.post("/v1/api/sendLogEmail", sendLogEmail);
router.get("/v1/api/sendList", sendListToCourier);
router.post("/v1/api/add-user-in-list", addUserInList);
router.get("/v1/api/get-lists", getLists);
router.get("/v1/api/signup-email", sendSignUpEmail);
router.get("/v1/api/add-user", addRecipient);
router.post("/v1/api/send-email-list-users", sendEmailToListUsers);
router.post("/v1/api/send-first-email", sendFirstEmail);


// medium api 
router.get("/v1/api/get-medium-articles", scrapMediumArticles);
router.get("/get-medium-blogs", async(req, res) => {
	const data = await rssToJson("https://medium.com/feed/@shreyvijayvargiya26");
	res.send(data);
})

// twitter api
router.get("/v1/api/postTweet", postTweet);

// notion api
router.get("/v1/api/get-notion-page", getNotionData);


// openai API
router.post("/v1/api/get-openai-data", getDataFromOpenAI);
export default router;
