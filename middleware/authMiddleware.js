import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";

const checkUser = async(req, res, next) => {
  const token = req.cookies.jwt

  if(token){
    jwt.verify(token, process.env.JWT_SECRET, async(err, decodedToken) => {
      if(err){
        console.log(err.message);
        res.locals.user = null // o anki kullanıcı girişi için null dedik, yani herhangi bir kullanıcı giriş yapmadı.
        next()
      }
      else{
        const user = await User.findById(decodedToken.userId) //createToken'daki parametreden dolayı userId ekledik
        res.locals.user = user //veritabanındaki giriş yapan kullanıcıyı çeker ve localde barındırır. 
        next()
      }
    })
  }
  else{
    res.locals.user = null 
    next()
  }
}

const authenticateToken = async (req, res, next) => {
  try {
    // const authHeader = req.headers["authorization"];
    // // console.log("auth header: ",authHeader);

    // const token = authHeader && authHeader.split(" ")[1];
    // console.log("token: ",token);


    const token = req.cookies.jwt //userController'dan geliyor

    if(token){
      jwt.verify(token, process.env.JWT_SECRET, (err) => {
        if(err){
          console.log(err.message);
          res.redirect("/login")
        }
        else{
          next()
        }
      })
    }
    else{
      res.redirect("/login")
    }

  } catch (error) {
    res.status(401).json({
        success:false,
        error: "Not authorized"
    })
  }
};

export { authenticateToken, checkUser };







// -----------------ilk hali-----------------------

// if (!token) {
//   return res.status(401).json({
//     success: false,
//     err: "No token available",
//   });
// }

// req.user = await User.findById(
//   jwt.verify(token, process.env.JWT_SECRET).userId
// );
// next();

