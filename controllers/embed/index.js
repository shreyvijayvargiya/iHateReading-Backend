export const embedCard = (req, res) => {
	const { link } = req.body;
	console.log(link);
	res.send("Done");
};
