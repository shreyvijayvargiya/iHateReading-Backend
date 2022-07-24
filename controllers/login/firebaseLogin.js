import admin from "firebase-admin";

export const firebaseLogin = (req, res) => {
	let response = {
		success: false,
		error: false,
		message: "",
		data: null,
	};
	const { userId } = req.body;
	if (!userId) {
		response.message = "User id is required";
		response.error = true;
		res.send(response);
		return;
	}
	admin
		.auth()
		.getUser(userId)
		.then((data) => {
			const { uid, email } = data;
			response.data = { uid, email };
			response.success = true;
			res.send({
				success: true,
				data: { uid, email },
				error: false,
				message: "",
			});
		})
		.catch((error) => {
			response.message = error.message;
			response.success = false;
			response.error = true;
			res.send(response);
		});
};
