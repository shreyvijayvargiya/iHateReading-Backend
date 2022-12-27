import axios from "axios";
import admin from "firebase-admin";

const url = "https://api.gumroad.com/v2/products";

export const addGumroadTemplate = async(req, res) => {
  const templates = req.body.templates;
  const finalTemplates = [];
  templates.forEach(item => {
    finalTemplates.push({
			name: item.name,
			id: item.id,
			summary: item.custom_summary,
			description: item.description,
			price: item.price,
			image: [],
			currency: item.currency,
			thumbnail: item.thumbnail_url,
			link: item.short_url,
		});
  });
  finalTemplates.forEach(
		async (template) =>
			await admin.firestore().collection("templates").add(template)
	);
  res.send({ status: "success", message: "Data pushed in Firebase collection" });
};

