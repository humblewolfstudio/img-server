const express = require('express');
const controller = require('../../controllers/users/controller');
const router = express.Router();

router.post('/register', controller.register);
router.post('/login', controller.login);
router.get('/logout', controller.logOut);
router.get('/token', controller.getToken);
//router.post('/changeEmail', controller.changeEmail);
router.post('/changePassword', controller.changePassword);

module.exports = router;