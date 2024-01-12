import { courier } from "../../utils/CourierClient.js";
import admin from "firebase-admin";
import Sib from "sib-api-v3-sdk";

const client = Sib.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.SEND_IN_BLUE_KEY;

export const sendSignUpEmail = async (req, res) => {
	const { email } = req.body;
	try {
		const { requestId } = await courier.send({
			message: {
				to: {
					email: email,
				},
				template: "GCPDH98BDX4APJG7G18VNQRAKNYF",
			},
		});
		res.send({
			data: requestId,
			success: true,
			error: false,
			message: "",
		});
	} catch (e) {
		console.log(e, "e");
		res.send({
			data: null,
			message: e,
			error: true,
		});
	}
};

export const addSubscriber = async (req, res) => {
	const { username, email } = req.body;
	try {
		const isEmailExists = await admin
			.firestore()
			.collection("subscribers")
			.doc("list")
			.collection("newsletter")
			.where("email", "==", email)
			.get()
			.then((item) => item.size);

		if (isEmailExists === 0) {
			const obj = {
				email,
				subscribedAt: Date.now(),
				username: email.split("@")[0],
			};
			await admin
				.firestore()
				.collection("subscribers")
				.doc("list")
				.collection("newsletter")
				.add(obj);
			res.send("Successfully subscribed");
		} else {
			res.send("Email already exists");
		}
	} catch (e) {
		console.log(e, "error");
		res.send({
			error: true,
			status: false,
			message: "Something went wrong",
		});
	}
};
export const sendFirstEmail = async (req, res) => {
	const { userName, userEmail } = req.body.data;
	try {
		const { requestId } = await courier.send({
			message: {
				data: {
					receiptName: userName,
				},
				to: {
					email: userEmail,
				},
				template: "EKZZAQHHN5MY70KEJWYVBNCE8Y85",
			},
		});
		res.send({
			success: true,
			data: requestId,
			error: false,
			message: null,
		});
	} catch (e) {
		console.log(e, "error in sending message");
		res.send({
			success: false,
			data: null,
			error: true,
			message: e,
		});
	}
};

export const sendEmailToListUsers = async (req, res) => {
	const { templateId, start, end } = req.body;
	try {
		const users = await admin
			.firestore()
			.collection("subscribers")
			.doc("list")
			.get();
		const toData = users
			.data()
			["newsletters"].slice(start, end)
			.map((item) => ({ email: item }));
		const { requestId } = await courier.send({
			message: {
				to: toData,
				template: templateId,
			},
		});
		res.json({ requestId: requestId, message: "Email sent to the users" });
	} catch (e) {
		console.log(e, "error in sending email");
		res.send("Error, check console");
	}
};

export const sendEmailToUsers = async (req, res) => {
	const { templateId, users } = req.body;
	try {
		const toData = users.map((item) => ({ email: item }));
		const { requestId } = await courier.send({
			message: {
				to: toData,
				template: templateId,
			},
		});
		res.json({ requestId: requestId, message: "Email sent to the users" });
	} catch (e) {
		console.log(e, "error in sending email");
		res.send("Error, check console");
	}
};

export const sendTestingEmail = async (req, res) => {
	const { templateId } = req.body;
	try {
		const users = await admin
			.firestore()
			.collection("subscribers")
			.doc("list")
			.get();
		const toData = users
			.data()
			["testingEmails"].map((item) => ({ email: item }));
		const { requestId } = await courier.send({
			message: {
				to: toData,
				template: templateId,
			},
		});
		res.json({ requestId: requestId, message: "Email sent to the users" });
	} catch (e) {
		console.log(e, "error in sending email");
		res.send("Error, check console");
	}
};
