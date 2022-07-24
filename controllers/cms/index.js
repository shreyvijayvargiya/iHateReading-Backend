// import axios from "axios";
// import parser from "editorjs-parser";
// import { convertLogToMarkdown } from "../../utils/convertLogToMarkdown";
// import admin from "firebase-admin";

// export const postToDevCommunity = async (req, res) => {
// 	const url = "https://dev.to/api/articles";
// 	try {
// 		const { logId } = req.body;
// 		if (!logId) throw new Error("Please provide valid log Id");
// 		const log = await convertLogToMarkdown({ logId });
// 		const article = {
// 			title: log.title,
// 			published: true,
// 			body_markdown: "Hello DEV, this is my first post",
// 			// tags: log.tags.splice(0, 3),
// 			main_image: log.bannerImage,
// 			description: log.description,
// 		};
// 		return;
// 		const response = await axios.post(
// 			url,
// 			{ article: article },
// 			{ headers: { "api-key": process.env.DEV_TO_API_KEY } }
// 		);
// 		console.log(response, "response");
// 		res.send("Post added to dev community");
// 	} catch (e) {
// 		console.log(e, "error");
// 		res.send("Error in posting in dev community");
// 	}
// };

// export const convertPost = (req, res) => {
// 	const { logId } = req.body;
// 	try {
// 	} catch (error) {
// 		console.log(error, "error");
// 		res.send("Error in parsing");
// 	}
// };
