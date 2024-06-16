import { courier } from "../../utils/CourierClient.js";
import admin from "firebase-admin";
import SibApiV3Sdk from "sib-api-v3-sdk";

export const sendEmail = async (req, res) => {
	var defaultClient = SibApiV3Sdk.ApiClient.instance;
	var apiKey = defaultClient.authentications["api-key"];
	apiKey.apiKey = process.env.SEND_IN_BLUE_KEY;
	var apiInstance = new SibApiV3Sdk.EmailCampaignsApi();
	var emailCampaign = new SibApiV3Sdk.CreateEmailCampaign();
	try {
		emailCampaign.name = "Campaign sent via the API";
		emailCampaign.subject = "My subject";
		emailCampaign.sender = {
			name: "Shrey",
			email: "shreyvijayvargiya26@gmail.com",
		};
		emailCampaign.type = "classic";
		emailCampaign.htmlContent =
			"Congratulations! You successfully sent this example campaign via the Brevo API.";
		const response = await apiInstance.createEmailCampaign(emailCampaign);
		console.log(response);
		res.send("Done");
	} catch (e) {
		console.log(e, "error in sending email");
		res.send("Error in sending email");
	}
};
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
	const { email } = req.body;
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
	const { templateId, start, end, email } = req.body;
	try {
		if (email) {
			const { requestId } = await courier.send({
				message: {
					to: [{ email }],
					template: templateId,
				},
			});
			res.send(requestId).status(200);
		} else {
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
		}
	} catch (e) {
		console.log(e, "error in sending email");
		res.send(e);
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

export const sendEmailToSpecificUser = async (req, res) => {
	const { userName, userEmail, templateId } = req.body;
	try {
		const { requestId } = await courier.send({
			message: {
				data: {
					userName: userName,
				},
				to: {
					email: userEmail,
				},
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
