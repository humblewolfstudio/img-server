const express = require('express');
const controller = require('../../controllers/dashboard/controller');
const router = express.Router();

router.get('/', controller.main);
router.get('/docs', controller.docs);
router.get('/contact', controller.contact);
router.get('/about', controller.about);
router.get('/login', controller.login);
router.get('/register', controller.register);
router.get('/dashboard', controller.dashboard);

module.exports = router;