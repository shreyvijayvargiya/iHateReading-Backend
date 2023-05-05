import express from "express";
import passport from "passport";
import { firebaseLogin } from "../controllers/login/firebaseLogin.js";
import { downloadRepo } from "../controllers/repo/downloadRepo.js";
import { scrapFromRSSFeed, scrapLink } from "../controllers/scrap/index.js";
import {
	sendLogEmail,
	sendListToCourier,
	sendEmailToListUsers,
	sendFirstEmail,
	sendSignUpEmail,
	sendEmailUsingSendInBlue,
	sendTestingEmailUsingSendInBlue,
	sendEmailToSubscriber,
} from "../controllers/email/index.js";
import { postTweet } from "../controllers/tweet/index.js";
import { addGumroadTemplate } from "../controllers/templates/index.js";

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

router.post("/v1/api/get-link-tags", scrapLink);

// sendinblue api for emailing
router.post("/v1/api/sendinblue/send-email", sendEmailUsingSendInBlue);
router.post(
	"/v1/api/sendinblue/send-test-email",
	sendTestingEmailUsingSendInBlue
);

router.get("/v1/api/gumroad/addTemplate", addGumroadTemplate);

// courier api for emails
router.post("/v1/api/sendLogEmail", sendLogEmail);
router.get("/v1/api/sendList", sendListToCourier);
router.get("/v1/api/signup-email", sendSignUpEmail);
router.post("/v1/api/send-email-list-users", sendEmailToListUsers);
router.post("/v1/api/send-first-email", sendFirstEmail);
router.post("/v1/api/send-subscriber-email", sendEmailToSubscriber);

// twitter api
router.get("/v1/api/postTweet", postTweet);

router.post("/scrap-url", scrapFromRSSFeed);

export default router;
