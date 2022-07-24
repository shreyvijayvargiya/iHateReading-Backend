import admin from "firebase-admin";

export default async function checkUserValidity(userId) {
	return admin
		.auth()
		.getUser(userId)
		.then(() => {
			return { isUserValid: true };
		})
		.catch(() => {
			return { isUserValid: false };
		});
}
