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

const getCronExpression = (dateTime) => {
	const date = new Date(dateTime);
	const minutes = date.getMinutes();
	const hours = date.getHours();
	const day = date.getDate();
	const month = date.getMonth() + 1;
	const year = date.getFullYear();

	return `${minutes} ${hours} ${day} ${month} * ${year}`;
};

export const scheduleDraft = async (req, res) => {
	try {
		const { time: scheduledTime, data } = req.body;
		if (!scheduledTime || !data) {
			return res
				.status(400)
				.send('Invalid request format. Both "time" and "data" are required.');
		}
		cron.schedule(scheduledTime, async () => {
			console.log(
				req.body.data.title + " thread is scheduled at " + scheduledTime
			);
			const dbRef = await admin
				.firestore()
				.collection("publish")
				.add(req.body.data);
			console.log(dbRef.id, "id of the article pushed");
		});
		res.send("Done");
	} catch (e) {
		console.log(e, "error in scheduling");
		res.status(500).send("Error in service");
	}
};
