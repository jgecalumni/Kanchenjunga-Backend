import express from "express";
import { authentication } from "../middlewares/authentication";
import {
	createReview,
	deleteReview,
	getAllReviews,
} from "../controllers/review.controller";

const router = express.Router();

router.route("/create/:id").post(authentication, createReview);
router.route("/").get(getAllReviews);
router.route("/delete/:id").delete(authentication, deleteReview);
export default router;
