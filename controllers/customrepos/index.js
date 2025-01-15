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
		const collectionRef = admin.firestore().collection("CustomRepos");
		const snapshot = await collectionRef.get();

		const batch = admin.firestore().batch();

		snapshot.docs.forEach((doc) => {
			const data = doc.data();
			const updatedDemoLink = data.demoLink.replace(
				"iamshrey.me",
				"ihatereading.in"
			);
			batch.update(doc.ref, { demoLink: updatedDemoLink });
		});

		await batch.commit();

		console.log("Updated all demoLink fields successfully.");
		res.status(200).send("All demoLink fields updated successfully.");
	} catch (error) {
		console.error("Error updating demoLink fields:", error);
		res.status(500).send(error.message);
	}
};

export const updateCustomRepoByIdApi = async (req, res) => {
	try {
		const { id } = req.body;
		const docRef = admin.firestore().collection("CustomRepos").doc(id);

		const docSnapshot = await docRef.get();

		if (!docSnapshot.exists) {
			return res.status(404).send("Document not found");
		}

		const data = docSnapshot.data();
		const updatedDemoLink = data.demoLink.replace(
			"iamshrey.me",
			"ihatereading.in"
		);

		await docRef.update({ demoLink: updatedDemoLink });

		console.log(`Updated demoLink for document with ID: ${id}`);
		res.status(200).send(`Updated demoLink for document with ID: ${id}`);
	} catch (error) {
		console.error("Error updating demoLink for document:", error);
		res.status(500).send(error.message);
	}
};
