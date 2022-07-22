const express = require('express');
const router = require('./routes/routes');
const githubRouter = require("./routes/github");
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require("cors");
const admin = require('firebase-admin');
const mustacheExpress = require("mustache-express");
const handlebars = require('express-handlebars');
const path = require('path');
const cmsRouter = require('./routes/cms');

dotenv.config();

// const passport = require('./middlewares/passportMiddleware');
const server = express();
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(cors("*"));

server.set("view engine", 'hbs' )
server.set("views", path.join(__dirname + '/views'))
server.engine("hbs", handlebars({
    layoutsDir: path.join(__dirname + '/views'),
    extname: '.hbs'
}));


// server.use(passport.initialize());

admin.initializeApp({
    credential: admin.credential.cert("./service-account-file.json"),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
})
server.use(router);
server.use("/cms", cmsRouter);
server.use('/github', githubRouter);


server.listen(process.env.PORT || 4000, () => console.log('Server is running on port 4000'));