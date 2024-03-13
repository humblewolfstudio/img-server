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

module.exports = { handleException, handleError }