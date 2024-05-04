import User from "../models/UserModel.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Photo from "../models/PhotoModel.js";

const createUser = async (req, res) => {

  try {
    const user = await User.create(req.body);
    // res.status(201).json({
    //   success: true,
    //   user,
    // });
    res.status(201).json({user: user._id})
  } catch (err) {

    console.log("Error", err);
    let errors2 = {}

    if(err.code === 11000){
      errors2.email = "The email is already registered"
    }

    if(err.name === "ValidationError"){
      Object.keys(err.errors).forEach((key) => {
        errors2[key] = err.errors[key].message
      })
    }
    console.log("errors2: ",errors2);

    // res.status(500).json({
    //     success: false,
    //     err
    // })

    res.status(400).json(errors2)
  }
};

//veritabanında oluşan şemayı çeker

const loginUser = async (req, res) => {
  // console.log(req.body);

  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    // console.log(user);

    let same = false;

    if (user) {
      same = await bcrypt.compare(password, user.password);
    } else {
      return res.status(401).json({
        success: false,
        err: 'There is no such user',
      });
    }
    if(same){
      // res.status(200).send("You are logged in")

      const token = createToken(user._id) 
      res.cookie("jwt", token, {
        httpOnly: true,
        maxAge:1000*60*60*24
      })

      res.redirect("/users/dashboard")
    }
    else{
      return res.status(401).json({
        success: false,
        err: "Password are not matched",
      })
    }
  } catch (err) {
    res.status(500).json({
        success: false,
        err
    })
  }
};

const createToken = (userId) => {
  return jwt.sign({userId}, process.env.JWT_SECRET, {
    expiresIn: "1d"
  })
}

const getDashboardPage = async(req, res) => {
  const photos = await Photo.find({user: res.locals.user._id})
  const user = await User.findById({_id: res.locals.user._id}).populate(["followings", "followers"])
  res.render("dashboard", {
    link: "dashboard",
    photos,
    user
  });
};


const getAllUsers = async (req, res) => {
  try{
      const users = await User.find({_id: {$ne: res.locals.user._id}})
      // res.status(200).json({
      //     success: true,
      //     photos
      // })

      res.status(200).render("users", {
        users,
        link: "photos"
      })
  }catch(err){
      res.status(500).json({
          success: false,
          err
      })
  }
}

const getUser = async (req, res) => {
  try{
      const user = await User.findById({_id : req.params.id})

      const inFollowers = user.followers.some((follower) => {
        return follower.equals(res.locals.user._id)
      })

      const photos = await Photo.find({user: user._id})

      res.status(200).render("user", {
        user,
        photos,
        link: "users",
        inFollowers
      })
  }catch(err){
      res.status(500).json({
          success: false,
          err
      })
  }
}
const follow = async (req, res) => {
  try{
    let user = await User.findByIdAndUpdate(
      {_id: req.params.id}, //takip eden
      {
        $push: {followers: res.locals.user._id}
      },
      {
        new: true //push işleminden sonra yeni oluşturulan user döndürülür
      }
    ) 
    user = await User.findByIdAndUpdate(
      {_id: res.locals.user._id},
      {
        $push: {followings: req.params.id}
      },
      {
        new: true
      }
    )

    // res.status(200).json({
    //   success: true,
    //   user
    // })

    res.status(200).redirect(`/users/${req.params.id}`)

  }catch(err){
      res.status(500).json({
          success: false,
          err
      })
  }
}

const unfollow = async (req, res) => {
  try{
    let user = await User.findByIdAndUpdate(
      {_id: req.params.id}, //takip eden
      {
        $pull: {followers: res.locals.user._id}
      },
      {
        new: true //push işleminden sonra yeni oluşturulan user döndürülür
      }
    ) 
    user = await User.findByIdAndUpdate(
      {_id: res.locals.user._id},
      {
        $pull: {followings: req.params.id}
      },
      {
        new: true
      }
    )

    // res.status(200).json({
    //   success: true,
    //   user
    // })

    res.status(200).redirect(`/users/${req.params.id}`)


  }catch(err){
      res.status(500).json({
          success: false,
          err
      })
  }
}

export { createUser, loginUser, getDashboardPage, getAllUsers, getUser, follow, unfollow };
