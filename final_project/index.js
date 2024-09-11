const express = require('express');
const jwt = require('jsonwebtoken');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer/auth", (req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: "Authorization token is missing" });
    }

    jwt.verify(token, 'access_secret_key', (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token" });
        }
        req.user = user;
        next();
    });
});

app.use("/customer", customer_routes);
app.use("/", genl_routes);

const PORT = 5000;

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
