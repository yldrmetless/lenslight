import express from 'express'
import {createPhoto, deletePhoto, getAllPhotos, getPhoto, updatePhoto} from '../controller/photoController.js'

const router = express.Router()

router.route("/").post(createPhoto) //anlamı --> /photos/
//createPhoto fonk çalışır

router.route("/").get(getAllPhotos)
router.route("/:id").get(getPhoto)
router.route("/:id").delete(deletePhoto)
router.route("/:id").put(updatePhoto)

export default router