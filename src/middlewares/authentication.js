const { authenticateUser } = require("../database/user");

const authenticationMiddleware = async (req, res, next) => {
    const auth = req.headers.authorization ? req.headers.authorization : false;
    if (!auth) {
        return res.status(403).send('No credentials sent');
    }
    try {
        const user = await authenticateUser(auth);
        req.userId = user;
        next();
    } catch (e) {
        if (e.status) {
            res.status(e.status).send(e.message);
        } else {
            console.error(e);
            res.status(500).send('Internal server error');
        }
    }
}

module.exports = authenticationMiddleware;