import { courier } from "../../utils/CourierClient.js";
import admin from "firebase-admin";
import NotionPageToHtml from "notion-page-to-html";
import Sib from "sib-api-v3-sdk";
import axios from "axios";

const client = Sib.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.SEND_IN_BLUE_KEY;

export const sendLogEmail = async (req, res) => {
	const { logIds } = req.body;
	const db = admin.database().ref("articles/publish");
	const data = (await db.once("value")).val();

	const logsData = [];

	const filterLogs = async () => {
		await logIds.forEach((item) => {
			if (Object.keys(data).includes(item)) {
				const title = data[item].title.replaceAll(" ", "-");
				const newObj = {
					...data[item],
					id: item,
					link: `https://www.ihatereading.in/log?id=${item}&title=${title}`,
				};
				logsData.push(newObj);
			}
		});
	};
	filterLogs();
	try {
		const { requestId } = await courier.send({
			message: {
				data: {
					logsData: logsData,
				},
				to: [
					{
						email: "shreyvijayvargiya26@gmail.com",
					},
				],
				template: "GCPDH98BDX4APJG7G18VNQRAKNYF",
			},
		});
		res.send({
			success: true,
			data: requestId,
			error: false,
			message: null,
		});
	} catch (e) {
		console.log(e, "error in sending messaged");
		res.send({
			success: false,
			data: null,
			error: true,
			message: e,
		});
	}
};

export const createTemplateAndSendEmail = async(req, res) => {
	const { subject, body } = req.body;
	const templates = await courier.notifications.postVariations()
	console.log(templates);
	res.send("Done")
};

export const sendListToCourier = async (req, res) => {
	const db = admin.database().ref("users");
	const users = (await db.once("value")).val();
	const usersKeys = Object.keys(users);
	const lists = usersKeys.map((key) => {
		if (users[key].userEmail) {
			const email = users[key].userEmail;
			const list_id = users[key].userId;
			return { name: email, id: list_id };
		}
	});
	try {
		lists.map(async (item) => {
			await courier.lists.put(item.email, {
				name: "Emails lists ",
				id: item.id,
			});
		});
		res.send("Done");
	} catch (e) {
		console.log(e);
		res.send({ error: e, data: null });
	}
};

export const getLists = async (req, res) => {
	const lists = await courier.lists.list();
	res.send(lists);
};

export const addUserInList = async (req, res) => {
	try {
		const newsletters = await (
			await admin.database().ref("users").once("value")
		).val();
		// const users = await (await admin.auth().listUsers(300)).users;
		// let finalEmails = []
		// users.filter(item =>{ if(!newsletters.includes(item.email) && item.email && item.email !== null){ finalEmails.push(item.email) }else return undefined });
		const finalEmails = Object.keys(newsletters).filter(
			(item) => newsletters[item]["userEmail"]
		);
		const newsletter = finalEmails.map((item) => {
			return newsletters[item]["userEmail"];
		});
		admin
			.firestore()
			.collection("subscribers")
			.doc("list")
			.update({
				newsletters: admin.firestore.FieldValue.arrayUnion(...newsletter),
			});
		res.json(newsletter);
	} catch (e) {
		console.log(e, "error");
		res.send("Error in adding email in the lists");
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
	const { list, templateId } = req.body;
	try {
		if(!templateId && !list) throw new Error("Please send template id and list")
		const users = await admin
			.firestore()
			.collection("subscribers")
			.doc("list")
			.get();
		const toData = users.data()[list].map((item) => ({ email: item }));
		const { requestId } = await courier.send({
			message: {
				to: toData,
				template: templateId,
			},
		});
		res.json({ requestId: requestId, message: "Email sent to the users" });
	} catch (e) {
		console.log(e, "error in sending email");
		res.send("Error in sending email to the list users");
	}
};

export const addRecipient = async (req, res) => {
	const { status: recipientId } = await courier.replaceProfile({
		recipientId: req.body.id,
		profile: { email: req.body.email },
	});
	res.send({
		success: true,
		message: "User added",
		data: recipientId,
		error: false,
	});
};

export const sendEmailUsingSendInBlue = async (req, res) => {
	const tranEmailApi = new Sib.TransactionalEmailsApi();
	const { subject, body } = req.body;
	let response = {
		error: false,
		success: true,
		data: null,
		status: 200,
	};
	if (!body || !subject) {
		response.error = "Please add body and subject";
		response.status = 400;
		response.success = false;
		response.data = "Body and subject are required";
	} else {
		const sender = {
			email: "shreyvijayvargiya26@gmail.com",
			name: "Shrey",
		};
		const users = await admin
			.firestore()
			.collection("subscribers")
			.doc("list")
			.get();
		const receivers = users
			.data()
			["newsletters"].map((item) => ({ email: item }));
		await tranEmailApi
			.sendTransacEmail({
				sender,
				to: receivers,
				subject: subject,
				htmlContent: body,
			})
			.then((data) => {
				response.data = data;
				response.error = false;
				response.success = true;
				response.status = 200;
			})
			.catch((error) => {
				response.data = null;
				response.error = error;
				response.success = false;
				response.status = 500;
			});
	}
	res.send(response);
};

export const sendTestingEmailUsingSendInBlue = async (req, res) => {
	const tranEmailApi = new Sib.TransactionalEmailsApi();
	const { subject, body } = req.body;
	let response = {
		error: false,
		success: true,
		data: null,
		status: 200,
	};
	if (!body || !subject) {
		response.error = "Please add body and subject";
		response.status = 400;
		response.success = false;
		response.data = "Body and subject are required";
	} else {
		const sender = {
			email: "shreyvijayvargiya26@gmail.com",
			name: "Shrey",
		};
		const receivers = [
			{
				email: "shreyvijayvargiya26@gmail.com",
			},
		];
		// const emailBody = `<html><div style="width:50%; margin: auto;">${body}</div></html>`;
		await tranEmailApi
			.sendTransacEmail({
				sender,
				to: receivers,
				subject: subject,
				htmlContent: body,
			})
			.then((data) => {
				response.data = data;
				response.error = false;
				response.success = true;
				response.status = 200;
			})
			.catch((error) => {
				response.data = null;
				response.error = error;
				response.success = false;
				response.status = 500;
			});
	}
	res.send(response);
};

export const checkSendEmails = async (req, res) => {
	const apiKey = process.env.SEND_IN_BLUE_KEY;
	const response = await axios.get(
		"https://api.sendinblue.com/v3/smtp/emails", {
			params: { "limit": 10, "offset": 0 },
			headers: {
				"api-key": apiKey
			}
		}
	);
	console.log(response.json()["result"]);
	res.send("Done")
};

export const notiontohtml = async (req, res) => {
	const { title, icon, cover, html } = await NotionPageToHtml.convert(
		req.body.url,
		{ excludeHeaderFromBody: true }
	);
	res.send(html);
};
// 
export const sendEmailToSubscriber = async(req, res) => {
	const email = req.body.email;
	const userName = email.split("@")[0]
	const { requestId } = await courier.send({
		message: {
			data: {
				name: userName,
			},
			to: {
				email,
			},
			template: "AJ2RYFKPXNMFHJPDM3B2JB43ENS7",
		},
	});
	res.send(requestId)
}
