import axios from "axios";

const lemonSqueezyRequest = async (endpoint, method = "GET", data = null) => {
	try {
		const BASE_URL = `https://api.lemonsqueezy.com/v1`;
		const response = await axios({
			method,
			url: `${BASE_URL}${endpoint}`,
			headers: {
				Authorization: `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
				Accept: "application/vnd.api+json",
				"Content-Type": "application/vnd.api+json",
			},
			data,
		});
		return response.data;
	} catch (error) {
		throw error.response ? error.response.data : error.message;
	}
};

export const getLemonSquezyAllProducts = async (req, res) => {
	try {
		const response = await lemonSqueezyRequest("/products");
		console.log(response.data, "response");
		res.send(response.data);
	} catch (error) {
		console.error("Error making payment:", error);
		res.status(500).json({ error: "Failed to process payment" });
	}
};

export const payViaLemonSquezy = async (req, res) => {
	try {
		const { productVariantId } = req.body;

		if (!productVariantId) {
			return res.send({ error: "Product variant ID is required" });
		}

		const payload = {
			type: "checkouts",
			attributes: {
				checkout_options: {
					button_color: "#000000",
					embed: true,
				},
				checkout_data: {
					custom: {
						user_id: 124,
					},
				},
				expires_at: "2022-10-30T15:20:06Z",
				preview: true,
			},
			relationships: {
				store: {
					data: {
						type: "stores",
						id: process.env.LEMON_SQUEEZY_STORE_ID,
					},
				},
				variant: {
					data: {
						type: "variants",
						id: productVariantId.toString(),
					},
				},
			},
		};
		const response = await lemonSqueezyRequest("/checkouts", "POST", payload);
		console.log(response.data, "ded");
		return res.send(response.data);
	} catch (error) {
		console.error("Error making payment:", error);
		return res.send({ error: "Failed to process payment" });
	}
};
