process.removeAllListeners('warning');

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const bodyParser = require("body-parser")
require('dotenv').config()

const imagesRouter = require('./routers/images/router');
const usersRouter = require('./routers/users/router');
const dashboardRouter = require('./routers/dashboard/router');

const app = express();
const MONGODB_URI = process.env.MONGODB_URI;
const SECRET = process.env.SECRET;

mongoose.connect(MONGODB_URI).then(() => {
    console.log("Connected to DB");
}).catch((e) => {
    console.error(e);
});

const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});

app.set('trust proxy', true);
app.use(express.static('src/views/public'));
app.set('views', './src/views/pages');
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.json());
app.use(session({
    secret: SECRET,
    resave: false,
    saveUninitialized: true,
    store: store
}));

app.use('/', dashboardRouter);
app.use('/api/file', imagesRouter);
app.use('/api/users', usersRouter);


app.listen(8080);
console.log('Server listening in port 8080');