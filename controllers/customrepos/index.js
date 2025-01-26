import admin from "firebase-admin";
import { supabaseApp } from "../../utils/supabase.js";

export const getCustomReposApi = async (req, res) => {
	try {
		let repos = [];
		const data = await admin.firestore().collection("CustomRepos").get();
		data.docs.forEach((item) => {
			repos.push({
				id: item.id,
				demoLink: "",
				...item.data(),
			});
		});
		console.log(repos, "repos");
		res.json(repos);
	} catch (e) {
		console.log(e, "error in fetching custom repos");
		res.status(500).send(e);
	}
};

export const updateCustomReposApi = async (req, res) => {
	try {
		const { data: repos, error: fetchError } = await supabaseApp
			.from("CustomRepos")
			.select("id, demoLink");

		if (fetchError) {
			return res.status(500).send("Failed to fetch documents");
		}

		const updates = repos.map(async (repo) => {
			const updatedDemoLink = repo.demoLink.replace(
				"projects",
				"custom-components"
			);

			const { error: updateError } = await supabaseApp
				.from("CustomRepos")
				.update({ demoLink: updatedDemoLink })
				.eq("id", repo.id);

			if (updateError) {
				throw new Error(`Failed to update document with ID: ${repo.id}`);
			}
		});

		await Promise.all(updates);

		res.status(200).send("All demoLink fields updated successfully.");
	} catch (error) {
		res.status(500).send(error.message);
	}
};


export const updateCustomRepoByIdApi = async (req, res) => {
	try {
		const { id } = req.body;

		const { data, error } = await supabaseApp
			.from("CustomRepos")
			.select("demoLink")
			.eq("id", id)
			.single();

		console.log(error);
		if (error) {
			return res.status(404).send("Document not found");
		}

		const updatedDemoLink = data.demoLink.replaceAll(
			"iamshrey.me",
			"ihatereading.in"
		);
		console.log(updatedDemoLink, "updatedDemoLink");

		const { error: updateError } = await supabaseApp
			.from("CustomRepos")
			.update({ demoLink: updatedDemoLink })
			.eq("id", id);

		if (updateError) {
			return res.status(500).send("Failed to update document");
		}

		res.status(200).send(`Updated demoLink for document with ID: ${id}`);
	} catch (error) {
		res.status(500).send(error.message);
	}
};
