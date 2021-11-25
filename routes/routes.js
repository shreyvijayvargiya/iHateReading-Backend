const { default: axios } = require('axios');
const express = require('express');
const passport = require('passport');
const router = express.Router();
const firebaseLogin = require('../controllers/login/firebaseLogin');
const { downloadRepo, createSandboxTreeFromRepoTree } = require("../controllers/repo/downloadRepo");

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
router.get('/v1/deploy-custom-repo', (req, res) => createSandboxTreeFromRepoTree(req, res));

module.exports = router;

