import axios from "axios";
import admin from "firebase-admin";

const url = `https://api.gumroad.com/v2/products/FQOqkH9RelgkwcZkGHQZXw==`;

export const addGumroadTemplate = async (req, res) => {
	const data = await axios.get(url, {
		data: {
			access_token: process.env.GUMROAD_ACCESS_TOKEN,
		},
	});
	const item = data.data.product;
	const template = {
		name: item.name,
		id: item.id,
		summary: item.custom_summary,
		description: item.description,
		price: item.price,
		image: [],
		currency: item.currency,
		thumbnail: item.thumbnail_url,
		link: item.short_url,
	};
	await admin.firestore().collection("templates").add(template);
	res.send({ status: "success", message: "Added" });
};
