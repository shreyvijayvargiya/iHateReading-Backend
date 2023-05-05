import axios from "axios";

export const connectGithub = async (req, res) => {
	let response = {
		token: String,
		success: Boolean,
		message: String,
		data: {},
	};

	const body = {
		client_id: process.env.clientId,
		client_secret: process.env.clientSecret,
		code: req.query.code,
	};
	await axios
		.post(process.env.GITHUB_LOGIN_URL, body, {
			headers: { accept: "application/json" },
		})
		.then((res) => {
			if (res.data && res.data.access_token) {
				response.token = res.data.access_token;
				response.success = true;
			} else {
				response.success = false;
				response.message = "Error in authorization";
				response.token = "";
			}
		});
	res.cookie("githubToken", response.token);
	// res.send({ success: true, data: { message: "Github Connected successfully"}});
	res.redirect(`http://localhost:3000/createrepo`);
};

export const getGithubUser = async (req, res) => {
	const token = req.headers["authorization"]?.split(" ")[1];
	if (!token) {
		response.success = false;
		response.message = "Authorization required";
	} else {
		await axios
			.get("https://api.github.com/user", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
			.then((res) => {
				response.data = res.data;
				response.success = true;
				response.message = "";
			})
			.catch((error) => {
				response.success = false;
				response.message = error.message;
				response.data = {};
			});
	}
	res.send(response);
};


export const createRepository = async (req, res) => {
	const token = req.headers["authorization"]?.split(" ")[1];
	const { name } = req.body;
	if (!name) {
		responseBody.error = true;
		responseBody.message = "Name required";
	}
	if (!token) {
		responseBody.error = true;
		responseBody.message = "Unauthorised user";
	} else {
		// const dirPath = fs.readFileSync(path.join(process.cwd() + '/repos/root'));
		axios
			.post(
				"https://api.github.com/user/repos",
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
				{ params: { name: name } }
			)
			.then((data) => {
				console.log("data", data);
			})
			.catch((error) => console.log(error, "error"));
		res.send("done");
	}
};

module.exports = { connectGithub, getGithubUser, createRepository };
