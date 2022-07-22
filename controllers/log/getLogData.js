const admin = require("firebase-admin");

const getLogDetail = async (req, res) => {
	const logId = req.body.logId;
	if (!logId) {
		res.send({
			data: null,
			error: true,
			message: "Log id is required",
		});
	} else {
		const db = admin.database().ref("articles/publish").child(logId);
		const data = (await db.once("value")).val();
		res.send(data);
	}
};

module.exports = getLogDetail;
