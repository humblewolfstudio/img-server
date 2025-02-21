const sharp = require('sharp');

const handleException = (e, res) => {
    if (e.status) {
        res.status(e.status).send(e.message);
    } else {
        console.error(e);
        res.status(500).send('Internal server error');
    }
}

const handleError = (e, res) => {
    var data;
    if (e.status) {
        data = e;
    } else {
        console.error(e);
        data = { status: 500, message: 'Internal server error' };
    }

    data.pageTitle = 'Error';
    data.user = null;

    res.render('error', data);
}

const compressImage = async (buffer) => {
    const image = sharp(buffer);
    const metadata = await image.metadata();

    const newBuffer = await image
        .jpeg({ quality: 80 })
        .toBuffer();
    const newSize = Buffer.byteLength(newBuffer);
    return { newBuffer, newSize, width: metadata.width, height: metadata.height }
}

const convertToWebp = async (buffer) => {
    const image = sharp(buffer);
    const metadata = await image.metadata();

    const newBuffer = await image
        .webp()
        .toBuffer();
    const newSize = Buffer.byteLength(newBuffer);
    return { newBuffer, newSize, width: metadata.width, height: metadata.height }
}

const noConvert = async (buffer) => {
    const image = sharp(buffer);
    const metadata = await image.metadata();

    return { width: metadata.width, height: metadata.height }
}

const isImage = (mimetype) => {
    const partitioned = mimetype.split('/');

    return partitioned[0] == 'image';
}

const getNameWithoutExtension = (name) => {
    return name.split('.').slice(0, -1).join('.');
}

module.exports = { handleException, handleError, compressImage, convertToWebp, noConvert, isImage, getNameWithoutExtension }