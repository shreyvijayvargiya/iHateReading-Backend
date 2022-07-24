import { getMediumArticles } from "medium-api-npm";

export const getUserMediumArticles = async (req, res) => {
	const articles = await getMediumArticles({
		"auth-code": process.env.MEDIUM_TOKEN,
	});
	res.json(articles);
};
