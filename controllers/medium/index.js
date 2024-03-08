import axios from "axios";
import { supabaseApp } from "../../utils/supabase.js";
import admin from "firebase-admin";
import cron from "node-cron";

// getting HTML content from the supabase storage
const fetchHTMLContent = async (filename) => {
	try {
		const data = await supabaseApp.storage
			.from("iHateReading_Bucket/threads")
			.download(filename);
		return data.data.text();
	} catch (e) {
		return null;
	}
};

export const getHTMLFileContent = async (req, res) => {
	try {
		let response = [];
		const drafts = (await admin.firestore().collection("/drafts").get()).docs;
		drafts.forEach((item) => {
			const content = item.data();
			if (content) {
				response.push({
					...item.data(),
					id: item.id,
				});
			}
			return null;
		});

		let output = [];
		const filteredDrafts = response.filter((item) => !item.content);
		await Promise.all(
			filteredDrafts.map(async (item) => {
				const content = await fetchHTMLContent(item.name);
				const obj = {
					name: item.name,
					id: item.id,
					created_at: new Date(item.name.split("_")[0]).toLocaleDateString(),
					content,
				};
				output.push(obj);
			})
		);
		output.forEach(async (draft) => {
			await admin.firestore().collection("drafts").doc(draft.id).update(draft);
		});
		res.send(output);
	} catch (e) {
		console.log(e, "error on fetching HTML content");
		res.status(500).send("Error");
	}
};

const renderAPIURL = "https://api.render.com/v1/services";
const renderAPIToken = process.env.RENDER_TOKEN;

const getCronExpression = (dateTime) => {
	const date = new Date(dateTime);
	const minutes = date.getMinutes();
	const hours = date.getHours();
	const day = date.getDay();
	const month = date.getMonth();

	return `${minutes} ${hours} ${day} ${month} *`;
};

export const publishScheduleDraft = async (req, res) => {
	try {
		const snapshot = await admin
			.firestore()
			.collection("scheduledTask")
			.limit(1)
			.get();
		let newThread;
		let id;
		if (snapshot.docs.length > 0) {
			newThread = snapshot.docs[0].data();
			id = snapshot.docs[0].id;
		}
		const data = await (
			await admin
				.firestore()
				.collection("scheduledTask")
				.doc(id)
				.collection("data")
				.get()
		).docs[0].data();
		console.log(newThread.title + " thread is scheduled at ");

		const dbRef = await admin
			.firestore()
			.collection("threads")
			.add(newThread);

		await admin
			.firestore()
			.collection("threads")
			.doc(dbRef.id)
			.collection("data")
			.add(data);
		await admin.firestore().collection("scheduledTask").doc(id).delete();
		res.send(dbRef.id);
	} catch (e) {
		console.log(e, "error in scheduling");
		res.status(500).send("Error in service");
	}
};