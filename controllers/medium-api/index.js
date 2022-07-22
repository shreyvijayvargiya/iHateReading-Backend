const { getMediumArticles } = require("medium-api-npm");

const getUserMediumArticles = async(req, res) => {
  const articles = await getMediumArticles({
    "auth-code": process.env.MEDIUM_TOKEN
  });
  res.json(articles);
};
module.exports = { getUserMediumArticles };