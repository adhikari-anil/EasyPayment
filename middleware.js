const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const headers = req.headers;
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({
      message: "authHeader or .startsWith() is not getting value..."
    });
  }

  const token = authHeader.split(" ")[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
    if (decoded.userId) {
      req.userId = decoded.userId;
      next();
    }else{
        return res.status(403).json({
          message: "User not matched..."
        });    
    }
  } catch (error) {
    return res.status(403).json({
      message: "Problem in verifying JWT..."
    });
  }
};

module.exports = {
  authMiddleware,
};
