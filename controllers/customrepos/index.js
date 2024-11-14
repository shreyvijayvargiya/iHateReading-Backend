import admin from "firebase-admin";
import { supabaseApp } from "../../utils/supabase.js";

export const getCustomReposApi = async (req, res) => {
	try {
		const data = await admin.firestore().collection("CustomRepos").get();
		const repos = data.docs.map(async (item) => {
			return {
				id: item.id,
				...(await item.data()),
			};
		});
		const allRepos = (await Promise.all(repos)).map((item) => {
			const {
				createdAt,
				title,
				description,
				demoLink,
				htmlContent,
				bannerImageUrl,
				tags,
				id,
			} = item;
			return {
				id,
				createdAt,
				title,
				description,
				demoLink,
				bannerImageUrl,
				tags,
				htmlContent,
			};
		});
		const response = await supabaseApp.from("CustomRepos").insert(allRepos);
		if (response?.status === 200) {
			res.send("Done");
		} else {
			throw new Error("Error in pushing in supabase");
		}
	} catch (e) {
		console.log(e, "error in fetching custom repos");
		res.status(500).send(e);
	}
};
