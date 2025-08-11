import express from "express";
import { authentication, isAdmin } from "../middlewares/authentication";
import { upload } from "../middlewares/photo-upload";
import {
	createImage,
	createListing,
	deleteImage,
	deleteListing,
	getAllListings,
	getListingbyId,
	updateListing,
} from "../controllers/listing.controller";
const router = express.Router();

router
	.route("/create")
	.post(authentication,isAdmin,upload.array("images", 4), createListing);

router.route("/").get(getAllListings);
router.route("/delete/:id").delete(authentication, isAdmin, deleteListing);
router.route("/update/:id").patch(authentication,isAdmin,upload.array("images",4),  updateListing);

router
	.route("/create/image/:id")
	.post(authentication, isAdmin, upload.array("images", 4), createImage);
router.route("/delete/image/:id").delete(authentication, isAdmin, deleteImage);

router.route("/:id").get( authentication,getListingbyId);

export default router;
