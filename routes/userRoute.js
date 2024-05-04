import express from 'express'
import {createUser, follow, getAllUsers, getDashboardPage, getUser, loginUser, unfollow} from '../controller/userController.js'
import { authenticateToken } from '../middleware/authMiddleware.js'

const router = express.Router()

router.route("/register").post(createUser) //anlamı --> .../users/register
router.route("/login").post(loginUser)
router.route("/dashboard").get(authenticateToken,getDashboardPage)
router.route("/").get(authenticateToken,getAllUsers)
router.route("/:id").get(authenticateToken, getUser)
router.route("/:id/follow").put(authenticateToken, follow)
router.route("/:id/unfollow").put(authenticateToken, unfollow)

export default router