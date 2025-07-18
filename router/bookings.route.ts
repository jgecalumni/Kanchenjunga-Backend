import express from "express";
import { authentication, isAdmin } from "../middlewares/authentication";
import {
	checkbooking,
	createBooking,
	createPayment,
	deleteBooking,
	getAllBookings,
	getBookingbyID,
	getBookingsUserId,
	sendStayCompletionEmails,
	updateBooking,
} from "../controllers/booking.controller";
const router = express.Router();

router.route("/create-payment").post(authentication, createPayment);
router.route("/create/:id").post(authentication, createBooking);
router.route("/").get(authentication,isAdmin,getAllBookings)
router.route("/user/:id").get(authentication, getBookingsUserId);
router.route("/delete/:id").delete(authentication, deleteBooking);
router.route("/update/:id").patch(authentication, updateBooking);
router.route("/check-availability/:id").post(checkbooking)
router.route("/get-booking/:id").get(getBookingbyID)

export default router;
