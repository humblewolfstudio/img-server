const express = require('express');
const slowDown = require('express-slow-down');
const multer = require('multer');
const controller = require('../../controllers/images/controller');
const authenticationMiddleware = require('../../middlewares/authentication');

const router = express.Router();

const uploadEndpoints = slowDown({
    windowMs: 15 * 60 * 1000,
    delayAfter: 10,
    delayMs: () => 100,
});

const storage = multer.memoryStorage();

const MAX_FILE_SIZE = 12000000;

const upload = multer({ storage, limits: { fileSize: MAX_FILE_SIZE } });

router.post('/upload', authenticationMiddleware, uploadEndpoints, upload.single('file'), controller.uploadImage);
router.get('/:id', controller.getImage);

router.get('/delete/:id', controller.deleteImage);
router.get('/info/:id', controller.getImageInfo);

router.post('/dashboardUpload', uploadEndpoints, upload.single('file'), controller.uploadImageDashboard);
router.get('/dashboardDelete/:imageId', controller.deleteImageDashboard);


module.exports = router;