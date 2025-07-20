import express from "express";
import { authentication, isAdmin } from "../middlewares/authentication";
import { CountData } from "../controllers/count.controller";
const router = express.Router();

router.route("/").get(authentication, isAdmin, CountData);
export default router;
