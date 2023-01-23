import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import admin from "firebase-admin";
import handlebars from "express-handlebars";
import path from "path";
import router from "./routes/index.js";
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

// Firebase initialization
admin.initializeApp({
	credential: admin.credential.cert("./service-account-file.json"),
	databaseURL: process.env.FIREBASE_DATABASE_URL,
	projectId: process.env.FIREBASE_PROJECT_ID,
});
admin.firestore().settings({ ignoreUndefinedProperties: true });

// user agent as HTTP headers
const userAgent =
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36";
const Referer = "https://www.google.com";

server.use((req, res, next) => {
	req.headers["User-Agent"] = userAgent;
	req.headers["Referer"] = Referer;
	console.log(req.headers, "headers")
	compression({
		threshold: 100 * 1000,
		level: 6,
	});
	next();
});

server.use("/", router);

server.listen(process.env.PORT || 4000, () =>
	console.log("Server is running on port 4000")
);
