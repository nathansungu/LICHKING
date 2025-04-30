const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);

const options = {
    host: "localhost",
    port: 3306,
    user: "root", 
    password: "",
    database: "lichking"
};

const sessionStore = new MySQLStore(options);

const sessionConfig = session({
    secret: "1234", // Replace with a secure, random key
    resave: false,
    saveUninitialized: false, // Do not save empty sessions
    store: sessionStore,
    cookie: {
        httpOnly: true, // Prevent client-side access to cookies
        secure: false, // Set to true if using HTTPS
        sameSite: 'Lax', // Prevent CSRF attacks
        maxAge: 24 * 60 * 60 * 10000, // Session expires after 1 day
    },
});

module.exports = sessionConfig;
