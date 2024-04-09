import jwt from "jsonwebtoken";

export const Authorization = async (req, res, next) => {
    let token = req.header("Authorization");
    token = token && token.split(" ")[1];
    const secretKey = process.env.JWT_SECRET;
   
     // Check if the token is missing
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: Missing token" });
  }

 // Verify the token
 jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    // Check if the token has expired
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTimestamp) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Token has expired" });
    }

    // If the token is valid and not expired, you can access the user information in the decoded object
    let userData = decoded?.user?.data;
    if (userData) {
      delete userData?.password;
    }
    req.user = userData;
   
    // Call the next middleware or route handler
    next();
  });
};
