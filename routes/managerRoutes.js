const router = require("express").Router();
const {loginManager} = require('../controllers/managerController')
router.post('/login',loginManager);
module.exports =router