const router = require('express').Router();
const {createManagerAuth,loginManager,getManager} = require('../controllers/managerAuthController')

router.post('/create',createManagerAuth);
router.post('/login',loginManager);
router.get('/get',getManager)

module.exports = router;