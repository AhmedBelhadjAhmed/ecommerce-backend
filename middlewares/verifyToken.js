const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    try {
        const header = req.headers['authorization'];
        
        if (!header) {
            return res.status(403).send({ error: "No token provided!" });
        }

        const token = header.split(' ')[1];
      
        jwt.verify(token, process.env.JWT_SECRET , (err, decoded) => {
            if (err) {
                return res.status(500).send({ error: 'Token is not valid!' });
            }
            req.userId = decoded.id;
            
            next();
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Internal Server Error" });
    }
};

module.exports = verifyToken;
