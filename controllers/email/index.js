const courier = require("../../utils/CourierClient");
const admin = require("firebase-admin");

const sendLogEmail = async (req, res) => {
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

const sendListToCourier = async (req, res) => {
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

const getLists = async (req, res) => {
	const lists = await courier.lists.list();
	res.send(lists);
};

const addUserInList = async (req, res) => {
	const { userEmail } = req.body;
	try {
		const data = await courier.addRecipientToLists({
			recipientId: userEmail,
			lists: [{ listId: "subscribers.free" }],
		});
		console.log(data, "data");
		res.send("Added in the lists");
	} catch (e) {
		console.log(e, "error");
		res.send("Error in adding email in the lists");
	}
};

const sendSignUpEmail = async (req, res) => {
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
const sendFirstEmail = async (req, res) => {
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

const sendEmailToListUsers = async (req, res) => {
	try {
		const users = await admin.auth().listUsers();
		const toData = users.users.map(item => {
			return {
				email: item.email,
			};
		});
		const { logIds } = req.body;
		const dbRef = await admin.database().ref("articles/publish");
		const allLogs = (await dbRef.once("value")).val();
		const filteredLogs = logIds.map(item => {
			return {
				title: allLogs[item].title,
				description: allLogs[item].description,
				bannerImage: allLogs[item].bannerImage,
			};
		});
		const { requestId } = await courier.send({
			message: {
				to: [
					{
						email: "shreyvijayvargiya26@gmail.com",
					},
				],
				template: "GCPDH98BDX4APJG7G18VNQRAKNYF",
				data: {
					logsData: filteredLogs,
				},
			}
		});
		res.json({ requestId: requestId, message: "Email sent to the users" });
	} catch (e) {
		console.log(e, "error in sending email");
		res.send("Error in sending email to the list users");
	}
};

const addRecipient = async (req, res) => {
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

module.exports = {
	sendLogEmail,
	sendListToCourier,
	addUserInList,
	getLists,
	sendSignUpEmail,
	sendEmailToListUsers,
	addRecipient,
	sendFirstEmail,
};


//  <div class="logsContainer">
//       {{#each logsData }}
//         <a href={{ link }} target="_blank" class="titlelink">
//           <div class="logContainer">
//             <h2 class="title">{{  title }}</h2>
//             <hr class="divider" color="#eeeeee" />
//             <img  src={{ bannerImage }} class="img"  />
//             <hr class="divider" color="#eeeeee" />
//             <p class="description">{{ description }}</p>
//           </div>
//         </a>
//       {{/each}}
//     </div>