import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRouter from "./router/auth.route";
import listingRouter from "./router/listings.route";
import bookingRouter from "./router/bookings.route";
import reviewRouter from "./router/review.route";
import countRouter from "./router/count.route";
import { sendStayCompletionEmails } from "./controllers/booking.controller";
//config
const app = express();
dotenv.config();

//cors
const corsOptions = {
	origin: [
		process.env.CORS_ORIGIN as string,
		process.env.CORS_ORIGIN_DEV as string,
		process.env.CORS_ORIGIN_ADMIN as string,
	],
	methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
	credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use("/public/rooms", express.static("public/rooms"));

//test route
app.get("/", (req: Request, res: Response) => {
	res.send("Hello World!~");
});

//routes
app.use("/v1/api/auth", authRouter);
app.use("/v1/api/rooms", listingRouter);
app.use("/v1/api/bookings", bookingRouter);
app.use("/v1/api/reviews", reviewRouter);
app.use("/v1/api/counts", countRouter);

sendStayCompletionEmails();

//server start
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
