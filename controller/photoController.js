import Photo from "../models/PhotoModel.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const createPhoto = async (req, res) => {
  // console.log("REQ BODY",req.body);

  const result = await cloudinary.uploader.upload(
    req.files.image.tempFilePath,
    {
      use_filename: true,
      folder: "lenslight",
    }
  );

  //cloudinary result

  // console.log("result: ", result )

  // console.log("result: ", result);

  try {
    // await Photo.create(req.body);
    await Photo.create({
      name: req.body.name,
      description: req.body.description,
      user: res.locals.user._id,
      url: result.secure_url,
      image_id: result.public_id
    });
    fs.unlinkSync(req.files.image.tempFilePath);
    res.status(201).redirect("/users/dashboard");
  } catch (err) {
    res.status(500).json({
      success: false,
      err,
    });
  }
};

//veritabanında oluşan şemayı çeker

const getAllPhotos = async (req, res) => {
  try {
    const photos = res.locals.user
      ? await Photo.find({ user: { $ne: res.locals.user._id } })
      : await Photo.find({}) 
      res.status(200).render("photos", {
        photos,
        link: "photos",
      });

  } catch (err) {
    res.status(500).json({
      success: false,
      err,
    });
  }
};

const getPhoto = async (req, res) => {
  try {
    const photo = await Photo.findById({ _id: req.params.id }).populate("user");

    // console.log("photo", photo);
    // console.log("res locals user id", res.locals.user._id);


    // res.status(200).json({
    //     success: true,
    //     photos
    // })

    let isOwner = false;

    if(res.local.user){
      isOwner = photo.user.equals(res.local.user._id)
    }

    res.status(200).render("photo", {
      photo,
      link: "photos",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      err,
    });
  }
};


const deletePhoto = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);

    const photoId = photo.image_id;

    await cloudinary.uploader.destroy(photoId);
    await Photo.findOneAndDelete({_id: req.params.id});
    
    res.status(200).redirect("/users/dashboard");
  } catch (err) {
    res.status(500).json({
      success: false,
      err,
    });
  }
};


const updatePhoto = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);

    if (req.files) {
      const photoId = photo.image_id;
      await cloudinary.uploader.destroy(photoId);

      const result = await cloudinary.uploader.upload(
        req.files.image.tempFilePath,
        {
          use_filename: true,
          folder: 'lenslight',
        }
      );

      photo.url = result.secure_url;
      photo.image_id = result.public_id;

      fs.unlinkSync(req.files.image.tempFilePath);
    }

    photo.name = req.body.name;
    photo.description = req.body.description;

    photo.save();

    res.status(200).redirect(`/photos/${req.params.id}`);
  } catch (error) {
    res.status(500).json({
      succeded: false,
      error,
    });
  }
};

export { createPhoto, getAllPhotos, getPhoto, deletePhoto, updatePhoto };

