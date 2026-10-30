const router = require('express').Router();
const {createManagerAuth,loginManager} = require('../controllers/managerAuthController')

router.post('/create',createManagerAuth);
router.post('/login',loginManager);

module.exports = router;