import { supabaseApp } from "../../utils/supabase.js";
import admin from "firebase-admin";

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

export const publishScheduleDraft = async (req, res) => {
	try {
		const scheduledTaskCollectionRef = admin
			.firestore()
			.collection("scheduledThreads");

		const batch = admin.firestore().batch();

		const snapshot = await scheduledTaskCollectionRef
			.limit(1)
			.orderBy("createdAt", "desc")
			.get();

		if (snapshot.docs.length > 0) {
			const scheduledTaskDoc = snapshot.docs[0];
			const scheduledTaskData = scheduledTaskDoc.data();
			const scheduledTaskId = scheduledTaskDoc.id;

			const threadsCollectionRef = admin.firestore().collection("publish");
			const newThreadRef = threadsCollectionRef.doc();
			batch.set(newThreadRef, { ...scheduledTaskData, timeStamp: Date.now() });
			batch.delete(scheduledTaskCollectionRef.doc(scheduledTaskId));

			// Commit the batched writes
			await batch.commit();

			res.send(newThreadRef.id);
		} else {
			throw new Error("No scheduledTask document found");
		}
	} catch (e) {
		console.error(e, "Error in scheduling");
		res.status(500).send("Error in service");
	}
};
