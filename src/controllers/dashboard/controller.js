const { getImagesInfo } = require("../../database/image");
const { getInfo } = require("../../database/user");
const helper = require('./helper');

const controller = {};

controller.main = async (req, res) => {
    const data = {
        pageTitle: 'IMG Server',
        currentDate: new Date().toDateString(),
        user: req.session.user
    };
    res.render('index', data);
}

controller.docs = async (req, res) => {
    const data = {
        pageTitle: 'Documentation',
        user: req.session.user
    };
    res.render('docs', data);
}

controller.contact = async (req, res) => {
    const data = {
        pageTitle: 'Contact',
        user: req.session.user
    };
    res.render('contact', data);
}

controller.about = async (req, res) => {
    const data = {
        pageTitle: 'About',
        user: req.session.user
    };
    res.render('about', data);
}

controller.login = async (req, res) => {
    const data = {
        pageTitle: 'Login',
        user: req.session.user
    };
    res.render('login', data);
}

controller.register = async (req, res) => {
    const data = {
        pageTitle: 'Register',
        user: req.session.user
    };
    res.render('register', data);
}

controller.dashboard = async (req, res) => {
    try {
        var skip = parseInt(req.query.s) || 0;
        if (skip < 0) skip = 0;

        const id = req.session.user ? String(req.session.user) : false;
        if (!id) throw { status: 401, message: 'User not authenticated' };

        const userInfo = await getInfo(id);
        const { imagesInfo, end } = await getImagesInfo(id, skip);

        const data = {
            pageTitle: 'Dashboard',
            user: req.session.user,
            userInfo,
            imagesInfo,
            end,
            skip,
            helper
        };
        res.render('dashboard', data);
    } catch (e) {
        helper.handleError(e, res);
    }
}

module.exports = controller;