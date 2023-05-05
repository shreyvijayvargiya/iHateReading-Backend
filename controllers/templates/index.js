import axios from "axios";
import admin from "firebase-admin";

const url = `https://api.gumroad.com/v2/products/`;

export const addGumroadTemplate = async (req, res) => {
	const id = "FQOqkH9RelgkwcZkGHQZXw==";
	const data = await axios.get(url + id, {
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

export const latestTemplates = async (req, res) => {
	const data = await axios.get(url, {
		data: {
			access_token: process.env.GUMROAD_ACCESS_TOKEN,
		},
	});
	const ids = [];
	data.data.products.filter((item) => {
		ids.push(item.id);
	});
	const firebaseIds = [];
	(await admin.firestore().collection("templates").get()).docs?.map((item) => {
		firebaseIds.push(item.data().id);
	});
	const remainingIds = ids.filter((item) => !firebaseIds.includes(item));
	const finalData = data.data.products.filter((item) =>
		remainingIds.includes(item.id) ? item : null
	);
	res.send(finalData);
};
