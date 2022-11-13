import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import admin from "firebase-admin";
import handlebars from "express-handlebars";
import path from "path";
import router from "./routes/index.js";
import threadRouter from "./routes/t/index.js";
import githubRouter from "./routes/github/index.js";
import compression from "compression";

dotenv.config();

const server = express();
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(cors("*"));

server.set("view engine", "hbs");
server.set("views", path.join(path.dirname + "/views"));
server.engine(
	"hbs",
	handlebars({
		layoutsDir: path.join(path.dirname + "/views"),
		extname: ".hbs",
	})
);

// server.use(passport.initialize());

admin.initializeApp({
	credential: admin.credential.cert("./service-account-file.json"),
	databaseURL: process.env.FIREBASE_DATABASE_URL,
	projectId: process.env.FIREBASE_PROJECT_ID,
});

server.use(
	compression({
		threshold: 100 * 1000,
		level: 6,
	})
);
server.use("/", router);
server.use("/github", githubRouter);
server.use("/t", threadRouter);

server.listen(process.env.PORT || 4000, () =>
	console.log("Server is running on port 4000")
);



