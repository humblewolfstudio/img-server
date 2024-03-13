const getPercentage = (current, max) => {
    return ((current / max) * 100).toFixed(2);
}

const bytesToMegabytes = (bytes) => {
    return bytes / 1024 / 1024;
}

const bytesToKilobytes = (bytes) => {
    return (bytes / 1024).toFixed(2);
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

module.exports = { getPercentage, bytesToMegabytes, bytesToKilobytes, handleError };