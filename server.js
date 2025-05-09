import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import admin from "firebase-admin";
import handlebars from "express-handlebars";
import path from "path";
import router from "./routes/index.js";
import compression from "compression";
import multer from "multer";
import geoip from "geoip-lite";

const forms = multer();
dotenv.config();

const server = express();
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.raw());
server.use(forms.single("image"));
server.use(cors("*"));
server.use((req, res, next) => {
	const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
	req.clientIp = clientIp;
	next();
});

server.set("view engine", "hbs");
server.set("views", path.join(path.dirname + "/views"));
server.engine(
	"hbs",
	handlebars({
		layoutsDir: path.join(path.dirname + "/views"),
		extname: ".hbs",
	})
);

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

server.use(express.text({ type: "text/html" }));

server.use((req, res, next) => {
	req.headers["User-Agent"] = userAgent;
	req.headers["Referer"] = Referer;
	const clientIp =
		req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";

	const location = geoip.lookup({ clientIp });
	console.log({ ...req.headers, location }, "headers");
	compression({
		threshold: 100 * 1000,
		level: 6,
	});
	next();
});

server.use((req, res, next) => {
	// Skip timeout for Server-Sent Events (SSE) endpoints
	if (req.headers.accept && req.headers.accept.includes("text/event-stream")) {
		next();
		return;
	}

	res.setTimeout(60000, () => {
		// Only send timeout response if headers haven't been sent
		if (!res.headersSent) {
			console.log("Request has timed out.");
			res.status(408).send("Request timed out. Please try again later.");
		}
	});
	next();
});

server.use("/", router);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
	console.log(`🚀 Server is running on port ${PORT}`);
	console.log(`📝 API Documentation available at http://localhost:${PORT}`);
});

export default server;
