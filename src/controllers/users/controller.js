const { registerUser, loginUser, getToken, changePassword, changeEmail } = require("../../database/user");
const { handleError } = require("../aux");

const controller = {};

controller.register = async (req, res) => {
    try {
        const email = req.body.email ? String(req.body.email) : false;
        const password = req.body.password ? String(req.body.password) : false;

        if (!email || !password) throw { status: 400, message: 'Missing email or password' };
        const id = await registerUser(email, password);

        req.session.regenerate(function (err) {
            if (err) return next(err);

            req.session.user = id;
            req.session.save(function (err) {
                if (err) return next(err);
                res.redirect('/dashboard');
            });
        });
    } catch (e) {
        handleError(e, res);
    }
}

controller.login = async (req, res) => {
    try {
        const email = req.body.email ? String(req.body.email) : false;
        const password = req.body.password ? String(req.body.password) : false;

        if (!email || !password) throw { status: 400, message: 'Missing email or password' };
        const id = await loginUser(email, password);

        req.session.regenerate(function (err) {
            if (err) return next(err);

            req.session.user = id;
            req.session.save(function (err) {
                if (err) return next(err);
                res.redirect('/dashboard');
            });
        });
    } catch (e) {
        handleError(e, res);
    }
}

controller.logOut = async (req, res) => {
    req.session.destroy(err => {
        if (err) {
            handleError({ status: 400, message: 'Unable to log out' }, res);
        } else {
            res.redirect('/');
        }
    });
}

controller.getToken = async (req, res) => {
    try {
        const id = req.session.user ? String(req.session.user) : false;
        if (!id) throw { status: 401, message: 'User not authenticated' };

        const token = await getToken(id);

        res.status(200).send(token);

    } catch (e) {
        handleError(e, res);
    }
}

controller.changePassword = async (req, res) => {
    try {
        const id = req.session.user ? String(req.session.user) : false;
        if (!id) throw { status: 401, message: 'User not authenticated' };

        const password = req.body.password ? String(req.body.password) : false;
        if (!password) throw { status: 400, message: 'Password not present' };

        await changePassword(id, password);

        res.redirect('/dashboard?c=2');
    } catch (e) {
        handleError(e, res);
    }
}

controller.changeEmail = async (req, res) => {
    try {
        const id = req.session.user ? String(req.session.user) : false;
        if (!id) throw { status: 401, message: 'User not authenticated' };

        const email = req.body.email ? String(req.body.email) : false;
        if (!email) throw { status: 400, message: 'Email not present' };

        await changeEmail(id, email);

        res.redirect('/dashboard?c=2');
    } catch (e) {
        handleError(e, res);
    }
}

module.exports = controller;