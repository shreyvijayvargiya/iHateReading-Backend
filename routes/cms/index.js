const express = require("express");
const cmsRouter = express.Router();
const { postToDevCommunity } =  require("../../controllers/cms");

cmsRouter.post("/api/v1/post-to-dev-community", postToDevCommunity);

module.exports = cmsRouter;