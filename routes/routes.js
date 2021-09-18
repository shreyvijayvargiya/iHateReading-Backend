const express = require('express');
const router = express.Router();
const firebaseLogin = require('../controllers/login/firebaseLogin');
const downloadRepo = require("../controllers/repo/downloadRepo");
const runCustomRepo = require('../controllers/repo/runCustomRepo');

router.get('/', (req, res) => {
    res.send('Welcome to basic express setup repository');
});
router.get("/v1/custom-repo/login", firebaseLogin);

router.post("/v1/custom-repo/download-repo", downloadRepo);
router.post("/v1/custom-repo/run-repo", runCustomRepo)

module.exports = router;

