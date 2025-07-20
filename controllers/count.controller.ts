import { error } from "console";
import prisma from "../prisma";
import { asyncHandler } from "../utils/asyncHandler";

export const CountData = asyncHandler(async (req, res) => {
	const booking = await prisma.booking.count();
	const users = await prisma.user.count();
	const listings = await prisma.listing.count();
	const getBookings = await prisma.booking.findMany();
	const totalRevenue = getBookings.reduce((sum, b) => sum + b.total, 0);
	const data = {
		booking,
		users,
		listings,
		totalRevenue,
	};
	res.status(200).json({
		message: "All counts fetched.",
		success: true,
		error: false,
		data,
	});
});
