import express from "express";
import { getUserMediumArticles } from "../../controllers/medium-api";
const mediumApiRouter = express.Router();

mediumApiRouter.get();

export default mediumApiRouter;
