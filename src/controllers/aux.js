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
    const newBuffer = await sharp(buffer)
        .webp()
        .toBuffer();
    const newSize = Buffer.byteLength(newBuffer);
    return { newBuffer, newSize }
}

const isImage = (mimetype) => {
    const partitioned = mimetype.split('/');

    return partitioned[0] == 'image';
}

module.exports = { handleException, handleError, compressImage, isImage }