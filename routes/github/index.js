import axios from "axios";
import express from "express";
import { getGithubUser } from "../../controllers/github/getGithubUser";
import { connectGithub } from "../../controllers/github/connectGithub";
import { createRepository } from "../../controllers/github/createRepository";
import shellJs from "shelljs";
import simpleGit from "simple-git";

const githubRouter = express.Router();
const gitSimple = simpleGit();

let response = {
	token: String,
	success: Boolean,
	message: String,
	data: {},
};

githubRouter.get("/", (req, res) => {
	res.send("Hello");
});

githubRouter.get("/v1/api/github/login", async (req, res) => {
	res.redirect(
		`https://github.com/login/oauth/authorize?client_id=${process.env.clientId}`
	);
});

githubRouter.get("/v1/api/github/oauth-callback", connectGithub);
githubRouter.get("/v1/api/github/getUser", getGithubUser);

githubRouter.get("/getrepo", async (req, res) => {
	const token = req.headers["authorization"].split(" ")[1];
	if (!token) {
		res.send("Token and repository link required");
	} else {
		await axios
			.get(`https://api.github.com/repos/shreyvijayvargiya/iHateReadingLogs`, {
				headers: { Authorization: `Bearer ${token}` },
			})
			.then((res) => {
				response.success = true;
				response.data = res.data;
			});
		res.send(response);
	}
});

githubRouter.post("/v1/api/github/create-repository", (req, res) =>
	createRepository(req, res)
);

githubRouter.get("/create-repo", async (req, res) => {
	shellJs.cd(process.cwd() + "/repos/root");
	const repo = "Dummy";
	const username = "shreyvijayvargiya";
	const password = "Treyvijay26";
	const githubUrl = "https://github.com/shreykoo/ihatereading-repos.git";

	gitSimple.addConfig("user.email", "shreyvijayvargiya26@gmail.com");
	gitSimple.addConfig("user.name", username);

	// Add remore repo url as origin to repo
	gitSimple
		.init()
		.addRemote("origin", "https://github.com/shreykoo/ihatereading-repos.git");
	// Add all files for commit
	gitSimple.add(".").then(
		(addSuccess) => {
			console.log(addSuccess);
		},
		(failedAdd) => {
			console.log("adding files failed");
		}
	);
	// Commit files as Initial Commit
	gitSimple.commit("Intial commit by simplegit").then(
		(successCommit) => {
			console.log(successCommit);
		},
		(failed) => {
			console.log("failed commmit");
		}
	);
	// Finally push to online repository
	gitSimple.push("origin", "master").then(
		(success) => {
			console.log("repo successfully pushed");
		},
		(failed) => {
			console.log(failed);
			console.log("repo push failed");
		}
	);
});

export default githubRouter;
