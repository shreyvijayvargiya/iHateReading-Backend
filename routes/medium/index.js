const express = require("express");
const mediumApiRouter = express.Router();
const { getUserMediumArticles } = require("../../controllers/medium-api");

mediumApiRouter.get();

module.exports = mediumApiRouter;