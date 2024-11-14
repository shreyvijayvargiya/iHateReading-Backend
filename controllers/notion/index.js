import admin from "firebase-admin";
import { Client } from "@notionhq/client";
import _ from "lodash";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const fetchDevLinkHubData = async () => {
	const db = admin.firestore();
	const snapshot = await db.collection("DevLinkHub").get();
	const data = snapshot.docs.map((doc) => ({
		id: doc.id,
		...doc.data(),
	}));
	return data;
};

export const createNotionTableApi = async (req, res) => {
	try {
		const databaseId = req.body.databaseId;
		const data = await fetchDevLinkHubData();
		for (const item of data) {
			await notion.pages.create({
				parent: { database_id: databaseId },
				properties: {
					Title: {
						title: [
							{
								text: {
									content: item.title,
								},
							},
						],
					},
					Description: {
						rich_text: [
							{
								text: {
									content: item.description,
								},
							},
						],
					},
					URL: {
						url: item.url,
					},
					Tags: {
						multi_select: _.isArray(item.tags)
							? item.tags.map((tag) => ({ name: tag }))
							: item.tags.split(",").map((tag) => ({ name: tag })),
					},
				},
			});
		}
	} catch (e) {
		console.log("error", e);
		res.send({ success: false, data: null });
	}
};

export const getNotionDatabaseIds = async (req, res) => {
	const databaseId = req.body.databaseId;
	const response = await notion.databases.retrieve({
		database_id: databaseId,
	});
	console.log(response.id);
	res.json(response);
};
