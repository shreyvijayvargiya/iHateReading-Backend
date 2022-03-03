const express = require('express');
const passport = require('passport');
const router = express.Router();
const firebaseLogin = require('../controllers/login/firebaseLogin');
const { downloadRepo, createSandboxTreeFromRepoTree } = require("../controllers/repo/downloadRepo");
const { getLinkPreview } = require("link-preview-js");
const scrapLink = require('../controllers/scrap');
const getMetaData = require('../controllers/scrap/getMetadata');
const getLogDetail = require('../controllers/log/getLogData');
const { sendLogEmail, sendListToCourier, addUserInList, getLists, sendFirstEmail, sendSignUpEmail, subscribeLists, addRecipient  } = require("../controllers/email");


router.get('/', (req, res) => {
    res.send('Welcome to basic ihatereading-backend repository ');
});
router.get("/v1/custom-repo/login", firebaseLogin);

router.post("/v1/custom-repo/download-repo", (req, res) => downloadRepo(req, res));

router.get("/v1/ejs", (req, res) => {
    res.render('server')
});

router.get('/v1/auth/google', passport.authenticate('google', { session: false, scope: ['profile', 'email'] }));

router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/'}),(req, res) => {
    res.cookie('authToken', req.user.token);
    res.redirect('/');
});

router.get('/v1/custom-repo', (req, res) => res.send('New Custom Repo API '))
router.post('/v1/deploy-custom-repo', (req, res) => createSandboxTreeFromRepoTree(req, res));
router.post('/v1/scrap-link', (req, res) => scrapLink(req, res))

router.get('/v1/preview', (req, res) => {
    getLinkPreview('https://ihatereading.in/createrepo?framework=Next%20JS&repoId=-MgQlG5flVPCV7sJyRYh').then(data => {
        console.debug(data)
    });
    res.send("Done")
});

router.get("/v1/embed-log", (req, res) => embedLog);
router.post('/v1/get-meta-data', getMetaData);
router.post('/v1/get-log-data', getLogDetail);

router.post("/v1/api/sendLogEmail", sendLogEmail);

router.get("/v1/api/logsEmail", (req, res) => {
    res.render('logsEmail');
});
router.get("/v1/api/sendList", sendListToCourier);
router.get("/v1/api/add-user-in-List", addUserInList);
router.get("/v1/api/get-lists", getLists);
router.get("/v1/api/signup-email", sendSignUpEmail);
router.get("/v1/api/subscribe-lists", subscribeLists);
router.get("/v1/api/add-user", addRecipient);
router.get("/v1/api/send-first-email", sendFirstEmail);

module.exports = router;

