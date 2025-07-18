import express from "express";
import {
	deleteUser,
	getAllUsers,
	getProfile,
	login,
	logout,
	register,
	resetOTP,
	updatePassword,
	updateUser,
	updateUserByAdmin,
	verifyOtp,
} from "../controllers/auth.controller";
import { authentication, isAdmin } from "../middlewares/authentication";
const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/get-user").get(authentication, getProfile);
router.route("/update").patch(authentication, updateUser);
router.route("/logout").post(logout);

//admin
router.route("/admin/").get(authentication, isAdmin, getAllUsers);
router.route("/admin/delete").delete(authentication, isAdmin, deleteUser);
router
	.route("/admin/update/:id")
	.patch(authentication, isAdmin, updateUserByAdmin);

//reset password
router.route("/forget-password").post(resetOTP);
router.route("/verify-otp").post(verifyOtp);
router.route("/reset-password").patch(updatePassword);

export default router;
