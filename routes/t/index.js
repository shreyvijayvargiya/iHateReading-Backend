import { createSummary } from "../../controllers/openai";
import express from "express";
const threadRouter = express.Router();

threadRouter.post("/api/v1/get-summary", createSummary);

export default threadRouter;
