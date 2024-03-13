const { Schema, model } = require('mongoose');
const uuid = require('uuid');
const bcrypt = require('bcrypt');
const crypto = require('crypto');


const userSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    hashedPw: {
        type: String,
        required: true
    },
    currentUsage: {
        type: Number,
        required: true
    },
    maxUsage: {
        type: Number,
        required: true
    },
    token: {
        type: String
    }
});

const defaultMaxUsage = 524288000; //500MB -> bytes

const UserSchema = model('User', userSchema, 'Users');

const registerUser = async (email, password) => {
    try {
        const exists = await UserSchema.findOne({ email });
        if (exists) throw { status: 400, message: 'User with this email already exists' };

        const id = uuid.v4();
        const hashedPw = await bcrypt.hash(password, 12);
        const maxUsage = defaultMaxUsage;
        const currentUsage = 0;

        await UserSchema.create({ id, email, hashedPw, currentUsage, maxUsage });

        return id;
    } catch (e) {
        throw e;
    }
}

const loginUser = async (email, password) => {
    try {
        const user = await UserSchema.findOne({ email });
        if (!user) throw { status: 404, message: 'User with this email not found' };

        const matchPassword = await bcrypt.compare(password, user.hashedPw);
        if (!matchPassword) throw { status: 400, message: 'Password incorrect' };

        return user.id;
    } catch (e) {
        throw e;
    }
}

function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

const authenticateUser = async (token) => {
    try {
        const hashedToken = hashToken(token);

        const user = await UserSchema.findOne({ token: hashedToken });
        if (!user) throw { status: 404, message: 'Token not valid' };

        return user.id;
    } catch (e) {
        throw e;
    }
}

const getToken = async (id) => {
    try {
        const user = await UserSchema.findOne({ id });
        if (!user) throw { status: 404, message: 'User not found' };

        const token = uuid.v4();
        const hashed = hashToken(token);
        user.token = hashed;

        await user.save();

        return token;
    } catch (e) {
        throw e;
    }
}

const increaseUsage = async (id, size) => {
    try {
        await UserSchema.updateOne({ id }, { $inc: { currentUsage: size } });
        return true;
    } catch (e) {
        throw e;
    }
}

const decreaseUsage = async (id, size) => {
    try {
        await UserSchema.updateOne({ id }, { $inc: { currentUsage: -size } });
        return true;
    } catch (e) {
        throw e;
    }
}

const canIncreaseUsage = async (id, size) => {
    try {
        const user = await UserSchema.findOne({ id });
        if (!user) throw { status: 404, message: 'User not found' };

        return user.currentUsage + size <= user.maxUsage;
    } catch (e) {
        throw e;
    }
}

const changeEmail = async (id, email) => {
    try {
        await UserSchema.updateOne({ id }, { email });

        return true;
    } catch (e) {
        throw e;
    }
}

const changePassword = async (id, password) => {
    try {
        const hashedPw = await bcrypt.hash(password, 12);
        await UserSchema.updateOne({ id }, { hashedPw });

        return true;
    } catch (e) {
        throw e;
    }
}

const getInfo = async (id) => {
    try {
        const user = await UserSchema.findOne({ id });
        if (!user) throw { status: 404, message: 'User not found' };

        const token = user.token ? true : false;

        return { currentUsage: user.currentUsage, maxUsage: user.maxUsage, token };
    } catch (e) {
        throw e;
    }
}

module.exports = { registerUser, loginUser, authenticateUser, getToken, increaseUsage, canIncreaseUsage, changeEmail, changePassword, getInfo, decreaseUsage };