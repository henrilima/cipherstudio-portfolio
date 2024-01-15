require("dotenv").config();

const session = require("express-session");
const bodyParser = require("body-parser");
const passport = require("passport");
const express = require("express");
const path = require("path");

express.urlencoded({
    extended: true,
});
const app = express();

const connectFirebase = require("connect-session-firebase");
const database = require("./database");
require("./strategy");

const FirebaseStore = connectFirebase(session);
const store = new FirebaseStore({
    database: database.firebase.database(),
    sessions: "sessions",
});

app.use(
    session({
        secret: "henrilimapassword",
        cookie: {
            maxAge: 172800000,
        },
        saveUninitialized: false,
        resave: false,
        name: "google.oauth2",
        store: store,
    })
);

// Port
const port = process.env.PORT || 8080;
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    if (req.path.endsWith("/") && req.path.length > 1) {
        const newPath = req.path.slice(0, -1);
        const query = req.url.slice(req.path.length);
        res.redirect(301, newPath + query);
    } else {
        next();
    }
});

// Passport
app.use(passport.initialize());
app.use(passport.session());
app.enable("trust proxy");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "assets")));

const authRoute = require("./routes/google");
const apiRoute = require("./routes/api");

function isAuthorized(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect("/google");
    }
}

// Middleware Routes
app.use("/google", authRoute);
app.use("/api", isAuthorized, apiRoute);

// Routes
app.get("/", async (req, res, next) => {
    res.render("index", {
        portfolio: (await database.database.get("portfolio")) || undefined,
        user: req.user || undefined,
    });
});

app.use((req, res) => {
    res.redirect("/");
});

// Listen
app.listen(port, () => {
    console.log(`Conectado a porta: ${port}!`);
});
