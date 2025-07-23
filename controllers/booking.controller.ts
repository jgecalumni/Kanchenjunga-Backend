import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import prisma from "../prisma";
import { sendMail, sendMailWithAttachment } from "../utils/mailer";
import { RoomBookingMail, StayCompletionMail } from "../utils/mail-template";
import { format } from "date-fns";
import crypto from "crypto";
import { razorpay } from "../utils/payment";
import cron from "node-cron";
import { generateReceipt } from "../utils/receipt";

export const createPayment = asyncHandler(
	async (req: Request, res: Response) => {
		const { listingId, startDate, endDate, total } = req.body;
		const start = new Date(startDate);

		const end = new Date(endDate);

		// Check availability
		const existingBookings = await prisma.booking.findMany({
			where: {
				listingId: Number(listingId),
				OR: [
					{
						startDate: { lte: end },
						endDate: { gte: start },
					},
				],
			},
		});

		if (existingBookings.length > 0) {
			res
				.status(400)
				.json({ error: "Room is already booked for selected dates" });
			return;
		}

		const options = {
			amount: total * 100, // Amount in paise
			currency: "INR",
			receipt: `receipt_${Date.now()}`,
		};

		const order = await razorpay.orders.create(options);

		res.status(200).json(order);
	}
);

export const createBooking = asyncHandler(
	async (req: Request, res: Response) => {
		const {
			razorpay_order_id,
			razorpay_payment_id,
			razorpay_signature,
			startDate,
			endDate,
			total,
			type,
			purpose,
			guests,
			receiptId,
			createdAt,
		} = req.body;

		const { id } = req.params;

		if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
			res.status(400).json({ error: "Missing payment details" });
			return;
		}

		if (
			!startDate ||
			!endDate ||
			!total ||
			!purpose ||
			!type ||
			!guests ||
			!receiptId
		) {
			res.status(400).json({ error: "All fields are required" });
			return;
		}

		if (!process.env.RAZORPAY_KEY_SECRET) {
			res.status(500).json({ error: "Missing Razorpay secret in environment" });
			return;
		}

		// Verify Signature
		const generated_signature = crypto
			.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
			.update(`${razorpay_order_id}|${razorpay_payment_id}`)
			.digest("hex");

		if (generated_signature !== razorpay_signature) {
			res.status(400).json({ error: "Invalid payment signature" });
			return;
		}

		// Set check-in time to 8 AM and check-out time to 9 AM
		const start = new Date(startDate);

		const end = new Date(endDate);

		// Check room availability again
		const isAvailable = await prisma.booking.findMany({
			where: {
				listingId: Number(id),
				OR: [
					{
						startDate: { lte: end },
						endDate: { gte: start },
					},
				],
			},
		});

		if (isAvailable.length > 0) {
			res.status(400).json({ error: "Room already booked for selected dates" });
			return;
		}

		// Create booking
		const booking = await prisma.booking.create({
			data: {
				listingId: Number(id),
				userId: (req as any).user.id,
				numberOfGuests: guests,
				startDate: start,
				endDate: end,
				type,
				purpose,
				total,
			},
		});

		// Get room details for email
		const getRoom = await prisma.listing.findUnique({
			where: { id: Number(id) },
			select: { title: true },
		});

		const pdfDetails = {
			roomName: getRoom?.title,
			name: (req as any).user.name,
			receiptId,
			razorpay_order_id,
			date: createdAt,
			startDate: format(start, "dd MMM, yyyy 'at' hh:mm a"),
			endDate: format(end, "dd MMM, yyyy 'at' hh:mm a"),
			status: "Paid",
			amount: total,
		};

		// Send confirmation email
		await sendMailWithAttachment(
			(req as any).user.email,
			"Room booking confirmation",
			RoomBookingMail(
				(req as any).user.name,
				getRoom?.title ?? "",
				type,
				format(start, "dd MMM, yyyy 'at' hh:mm a"),
				format(end, "dd MMM, yyyy 'at' hh:mm a"),
				total,
				booking.id.toString()
			),
			await generateReceipt(pdfDetails),
			(req as any).user.name
		);

		res.status(200).json({
			success: true,
			message: "Room booked successfully",
		});
	}
);

export const checkbooking = asyncHandler(
	async (req: Request, res: Response) => {
		const { id } = req.params;
		const { startDate, endDate } = req.body;
		if (!startDate || !endDate) {
			res.status(400).json({
				error: true,
				success: false,
				message: "All fields are required",
			});
			return;
		}
		const start = new Date(startDate);
		const end = new Date(endDate);

		try {
			const isAvailable = await prisma.booking.findMany({
				where: {
					listingId: Number(id),
					OR: [
						{
							startDate: { lte: end },
							endDate: { gte: start },
						},
					],
				},
			});
			if (isAvailable.length > 0) {
				res.status(400).json({
					error: false,
					success: true,
					message: "Room is already booked for the selected dates.",
					data: isAvailable,
				});
				return;
			}
			res.status(200).json({
				error: false,
				success: true,
				message: "Room is available for booking.",
				data: [],
			});
		} catch (error) {
			res.status(500).json({
				error: true,
				success: false,
				message: (error as any).message,
			});
		}
	}
);

export const getAllBookings = asyncHandler(
	async (req: Request, res: Response) => {
		try {
			const data = await prisma.booking.findMany({
				select: {
					id: true,
					startDate: true,
					endDate: true,
					type: true,
					total: true,
					listingId: true,
					listing: {
						select: {
							id: true,
							title: true,
							description: true,
							singleOccupancy: true,
							doubleOccupancy: true,
							type: true,
							images: {
								select: {
									id: true,
									url: true,
								},
							},
						},
					},
					user: {
						select: {
							id: true,
							name: true,
							email: true,
							phone: true,
							role: true,
						},
					},
				},
			});

			res.status(200).json({
				error: false,
				success: true,
				data: data,
				message: "All bookings fetched successfully",
			});
		} catch (error) {
			res.status(500).json({
				error: true,
				success: false,
				message: (error as any).message,
			});
		}
	}
);

export const getBookingsUserId = asyncHandler(
	async (req: Request, res: Response) => {
		try {
			const data = await prisma.booking.findMany({
				where: {
					userId: Number((req as any).user.id),
				},
				select: {
					id: true,
					startDate: true,
					endDate: true,
					type: true,
					total: true,
					listing: {
						select: {
							id: true,
							title: true,
							description: true,
							singleOccupancy: true,
							doubleOccupancy: true,
							type: true,
							images: {
								select: {
									id: true,
									url: true,
								},
							},
						},
					},
				},
			});
			if (data.length === 0) {
				res.status(404).json({
					error: true,
					success: false,
					messsage: "No rooms booked by the user",
				});
				return;
			}
			res.status(200).json({
				error: false,
				success: true,
				message: "All bookings fetched by the user",
				data: data,
			});
		} catch (error) {
			res.status(500).json({
				error: true,
				success: false,
				message: (error as any).message,
			});
		}
	}
);

export const deleteBooking = asyncHandler(
	async (req: Request, res: Response) => {
		try {
			await prisma.booking.delete({
				where: {
					id: Number(req.params.id),
				},
			});
			res.status(200).json({
				error: false,
				success: true,
				message: "Booking deleted successfully",
			});
		} catch (error) {
			res.status(500).json({
				error: true,
				success: false,
				message: (error as any).message,
			});
		}
	}
);

export const updateBooking = asyncHandler(
	async (req: Request, res: Response) => {
		const { startDate, endDate, total } = req.body;
		const start = new Date(startDate);
		const end = new Date(endDate);
		const getbooking = await prisma.booking.findUnique({
			where: {
				id: Number(req.params.id),
			},
		});
		const isAvailable = await prisma.booking.findMany({
			where: {
				listingId: getbooking?.listingId,
				OR: [
					{
						startDate: { lte: end },
						endDate: { gte: start },
					},
				],
			},
		});
		if (isAvailable.length > 0) {
			res.status(400).json({
				error: true,
				success: false,
				message: "Please select another dates",
			});
			return;
		}
		await prisma.booking.update({
			where: {
				id: Number(req.params.id),
			},
			data: {
				startDate: start,
				endDate: end,
				total,
			},
		});
		res.status(200).json({
			error: false,
			success: true,
			message: "booking updated successfully",
		});
	}
);

export const sendStayCompletionEmails = () => {
	cron.schedule("0 9 * * *", async (res) => {
		// Runs daily at 9 AM
		console.log("Running Stay Completion Email Job...");
		const bookings = await prisma.booking.findMany({
			where: {
				endDate: {
					lte: new Date(),
				},
				notified: false,
			},
			include: {
				user: true,
				listing: true,
			},
		});

		if (bookings.length === 0) {
			return {
				message: "No users to notify today.",
			};
		}

		for (const booking of bookings) {
			try {
				const emailBody = StayCompletionMail(
					booking.user.name,
					booking.listing.title,
					booking.type,
					format(booking.startDate, "dd MMM, yyyy 'at' hh:mm a"),
					format(booking.endDate, "dd MMM, yyyy 'at' hh:mm a"),
					booking.id,
					booking.total,
					process.env.BASE_URL || "http://localhost:3000"
				);

				await sendMail(
					booking.user.email,
					"We Hope You Enjoyed Your Stay!",
					emailBody
				);

				await prisma.booking.update({
					where: { id: booking.id },
					data: { notified: true },
				});

				console.log(`Email sent to ${booking.user.email}`);
			} catch (err) {
				console.error(`Failed to notify ${booking.user.email}:`, err);
			}
		}
	});
};

export const getBookingbyID = asyncHandler(
	async (req: Request, res: Response) => {
		try {
			const data = await prisma.booking.findUnique({
				where: {
					id: Number(req.params.id),
				},
				select: {
					id: true,
					startDate: true,
					endDate: true,
					type: true,
					total: true,
					numberOfGuests: true,
					listing: {
						select: {
							id: true,
							title: true,
							images: true,
						},
					},
				},
			});
			if (!data) {
				res.status(404).json({
					error: true,
					success: false,
					messsage: "No rooms booked",
				});
				return;
			}
			res.status(200).json({
				error: false,
				success: true,
				message: "Booking fetched",
				data: data,
			});
		} catch (error) {
			res.status(500).json({
				error: true,
				success: false,
				message: (error as any).message,
			});
		}
	}
);
