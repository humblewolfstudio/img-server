const { findImage, saveImage, removeImage } = require("../../database/image");
const { increaseUsage, canIncreaseUsage } = require("../../database/user");
const { handleException, compressImage, isImage, convertToWebp, getNameWithoutExtension, noConvert, handleError } = require("../aux");

const controller = {};

controller.uploadImage = async (req, res) => {
    try {
        if (!req.file) return res.status(400).send('There has to be an image with the post');

        const id = req.user ? String(req.user) : false;
        if (!id) throw { status: 401, message: 'User not authenticated' };

        const size = req.file.size;

        const canIncrease = await canIncreaseUsage(id, size);
        if (!canIncrease) throw { status: 400, message: 'Cannot add image: Maximum usage reached' };

        let imageWidth = 0;
        let imageHeight = 0;

        const webp = req.body.webpImage == 'on' ? true : false;
        const compress = req.body.compressImage == 'on' ? true : false;

        if (isImage(req.file.mimetype)) {
            if (webp) {
                const { newBuffer, newSize, width, height } = await convertToWebp(req.file.buffer);
                req.file.size = newSize;
                req.file.buffer = newBuffer;
                imageWidth = width;
                imageHeight = height;
                req.file.mimetype = 'image/webp';
            } else if (compress) {
                const { newBuffer, newSize, width, height } = await compressImage(req.file.buffer);
                req.file.size = newSize;
                req.file.buffer = newBuffer;
                imageWidth = width;
                imageHeight = height;
            } else {
                const { width, height } = await noConvert(req.file.buffer);
                imageWidth = width;
                imageHeight = height;
            }
        }

        await increaseUsage(id, size);
        const contentType = req.file.mimetype;
        const data = req.file.buffer;
        const name = getNameWithoutExtension(req.file.originalname);
        const imageId = await saveImage(id, data, contentType, size, name, imageWidth, imageHeight);

        return res.status(200).json({ id: imageId, name, size, contentType, dimensions: { height: imageHeight, width: imageWidth } });
    } catch (e) {
        handleException(e, res);
    }
}

controller.uploadImageDashboard = async (req, res) => {
    try {
        const id = req.session.user ? String(req.session.user) : false;
        if (!id) throw { status: 401, message: 'User not authenticated' };


        if (!req.file) throw { status: 400, message: 'File not found' };
        const webp = req.body.webpImage == 'on' ? true : false;
        const compress = req.body.compressImage == 'on' ? true : false;

        let imageWidth = 0;
        let imageHeight = 0;

        if (isImage(req.file.mimetype)) {
            if (webp) {
                const { newBuffer, newSize, width, height } = await convertToWebp(req.file.buffer);
                req.file.size = newSize;
                req.file.buffer = newBuffer;
                imageWidth = width;
                imageHeight = height;
                req.file.mimetype = 'image/webp';
            } else if (compress) {
                const { newBuffer, newSize, width, height } = await compressImage(req.file.buffer);
                req.file.size = newSize;
                req.file.buffer = newBuffer;
                imageWidth = width;
                imageHeight = height;
            } else {
                const { width, height } = await noConvert(req.file.buffer);
                imageWidth = width;
                imageHeight = height;
            }
        }

        const size = req.file.size;


        const canIncrease = await canIncreaseUsage(id, size);
        if (!canIncrease) throw { status: 400, message: 'Cannot add file: Maximum usage reached' };

        await increaseUsage(id, size);
        const contentType = req.file.mimetype;
        const data = req.file.buffer;
        const name = getNameWithoutExtension(req.file.originalname);
        await saveImage(id, data, contentType, size, name, imageWidth, imageHeight);

        return res.redirect('/dashboard?c=1')
    } catch (e) {
        handleException(e, res);
    }
}

controller.deleteImage = async (req, res) => {
    try {
        const id = req.user ? String(req.user) : false;
        if (!id) throw { status: 401, message: 'User not authenticated' };

        const imageId = req.params.id ? String(req.params.id) : false;

        if (!imageId) throw { status: 400, message: 'File ID not found in request' };

        await removeImage(id, imageId);

        return res.json({ deleted: true });
    } catch (e) {
        handleError(e, res);
    }
}

controller.deleteImageDashboard = async (req, res) => {
    try {
        const id = req.session.user ? String(req.session.user) : false;
        if (!id) throw { status: 401, message: 'User not authenticated' };

        const imageId = req.params.imageId ? String(req.params.imageId) : false;

        if (!imageId) throw { status: 400, message: 'File ID not found in request' };

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

controller.getImageInfo = async (req, res) => {
    try {
        const id = req.user ? String(req.user) : false;
        if (!id) throw { status: 401, message: 'User not authenticated' };

        const imageId = String(req.params.id);
        const image = await findImage(imageId);

        const imageData = {
            id: image.id,
            name: image.name,
            size: image.size,
            contentType: image.contentType,
            dimensions: {
                width: image.width,
                height: image.heigt
            }
        }

        res.json(imageData);
    } catch (e) {
        handleException(e, res);
    }
}

module.exports = controller;