const handleException = (e, res) => {
    if (e.status) {
        res.status(e.status).send(e.message);
    } else {
        console.error(e);
        res.status(500).send('Internal server error');
    }
}

module.exports = { handleException }