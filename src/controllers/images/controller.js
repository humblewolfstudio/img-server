const { findImage, saveImage, removeImage } = require("../../database/image");
const { increaseUsage, canIncreaseUsage } = require("../../database/user");
const { handleException, compressImage } = require("../aux");

const controller = {};

controller.uploadImage = async (req, res) => {
    try {
        if (!req.file) return res.status(400).send('There has to be an image with the post');
        const id = req.userId;
        const size = req.file.size;

        const canIncrease = await canIncreaseUsage(id, size);
        if (!canIncrease) throw { status: 400, message: 'Cannot add image: Maximum usage reached' };

        await increaseUsage(id, size);
        const contentType = req.file.mimetype;
        const data = req.file.buffer;
        const name = req.file.originalname;
        const imageId = await saveImage(id, data, contentType, size, name);

        return res.status(200).send(imageId);
    } catch (e) {
        handleException(e, res);
    }
}

controller.uploadImageDashboard = async (req, res) => {
    try {
        const id = req.session.user ? String(req.session.user) : false;
        if (!id) throw { status: 401, message: 'User not authenticated' };


        if (!req.file) throw { status: 400, message: 'Image not found' };
        const compress = req.body.compressImage == 'on' ? true : false;

        if (compress) {
            const { newBuffer, newSize } = await compressImage(req.file.buffer);
            req.file.size = newSize;
            req.file.buffer = newBuffer;
            req.file.mimetype = 'image/webp';
        }

        const size = req.file.size;


        const canIncrease = await canIncreaseUsage(id, size);
        if (!canIncrease) throw { status: 400, message: 'Cannot add image: Maximum usage reached' };

        await increaseUsage(id, size);
        const contentType = req.file.mimetype;
        const data = req.file.buffer;
        const name = req.file.originalname;
        await saveImage(id, data, contentType, size, name);

        return res.redirect('/dashboard?c=1')
    } catch (e) {
        handleException(e, res);
    }
}

controller.deleteImageDashboard = async (req, res) => {
    try {
        const id = req.session.user ? String(req.session.user) : false;
        if (!id) throw { status: 401, message: 'User not authenticated' };

        const imageId = req.params.imageId ? String(req.params.imageId) : false;

        if (!imageId) throw { status: 400, message: 'Image ID not found in request' };

        await removeImage(id, imageId);

        return res.redirect('/dashboard?c=1')
    } catch (e) {
        handleError(e, res);
    }
}

controller.getImage = async (req, res) => {
    try {
        const imageId = String(req.params.id);

        const image = await findImage(imageId);

        res.set('Content-Type', image.contentType);
        res.send(image.data);
    } catch (e) {
        handleException(e, res);
    }
}

module.exports = controller;