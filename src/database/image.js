const { Schema, model } = require('mongoose');
const uuid = require('uuid');
const { decreaseUsage } = require('./user');

const imageSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    data: {
        type: Buffer,
        required: true
    },
    timestamp: {
        type: Number,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    contentType: {
        type: String,
        required: true
    }
});

const ImageSchema = model('Image', imageSchema, 'Images');

const saveImage = async (userId, data, contentType, size, name) => {
    try {
        const id = uuid.v4();
        const timestamp = Date.now();
        await ImageSchema.create({ id, userId, data, contentType, timestamp, size, name });
        return id;
    } catch (e) {
        throw e;
    }
}

const findImage = async (id) => {
    try {
        const image = await ImageSchema.findOne({ id });

        if (!image) throw { status: 404, message: 'Image not found' };

        return image;
    } catch (e) {
        throw e;
    }
}

const getImagesInfo = async (userId, skip) => {
    try {
        const imagesInfo = await ImageSchema.find({ userId }).select('-_id -__v -data').skip(skip).limit(10);
        const end = skip + 10 >= await ImageSchema.countDocuments({ userId });
        return { imagesInfo, end };
    } catch (e) {
        throw e;
    }
}

const removeImage = async (userId, imageId) => {
    try {
        const done = await ImageSchema.findOneAndDelete({ id: imageId, userId });
        if (!done) throw { status: 400, message: 'Image is not from user' };

        const decreased = await decreaseUsage(userId, done.size);
        if (!decreased) throw { status: 500, message: 'Error decreasing usage, contact via email' };

        return true;
    } catch (e) {
        throw e;
    }
}

module.exports = { saveImage, findImage, getImagesInfo, removeImage };