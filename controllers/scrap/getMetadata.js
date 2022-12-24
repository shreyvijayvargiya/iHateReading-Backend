import urlMetaData from "url-metadata";
import getMetaData from "metadata-scraper";

export const getMetadata = async (req, res) => {
	const response = {
		data: null,
		message: "",
		error: false,
	};
	const link = req.body.link;
	if (!link) {
		response.error = true;
		response.message = "Please send link";
		res.send(response);
	} else {
		try {
			const metadata = await getMetaData(link);
			// res.send({
			//     title: metadata?.title,
			//     thumbnail: metadata.image,
			//     description: metadata?.description,
			//     author: metadata.author,
			//     link: link
			// });
			res.json(metadata);
		} catch (e) {
			console.log(e, "e");
			res.send({
				data: null,
				error: true,
				message: e,
			});
		}
	}
};
