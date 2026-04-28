const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    // 1. Check if the token exists in the headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 2. Extract the token
            token = req.headers.authorization.split(' ')[1];

            // 3. Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');

            // 4. Find the user in MongoDB
            // We use .findById() and .select('-password') to exclude the password field
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ success: false, message: "User no longer exists" });
            }

            // 5. Success! Move to the next function
            next();
        } catch (error) {
            console.error("Auth Middleware Error:", error.message);
            return res.status(401).json({ success: false, message: "Not authorized, token failed" });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, message: "Not authorized, no token" });
    }
};

module.exports = { protect };