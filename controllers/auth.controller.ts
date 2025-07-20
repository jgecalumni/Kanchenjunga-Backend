import { Request, Response } from "express";
import prisma from "../prisma";
import { asyncHandler } from "../utils/asyncHandler";
import bycrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendMail } from "../utils/mailer";
import { otpMail } from "../utils/mail-template";

//Register a new user
export const register = asyncHandler(async (req: Request, res: Response) => {
	try {
		const { name, email, password, role } = req.body;

		if (!name || !email || !password) {
			res.status(400).json({
				error: true,
				success: false,
				message: "All fields are required",
			});
			return;
		}
		const isExist = await prisma.user.findFirst({
			where: {
				email: email,
			},
		});
		if (isExist) {
			res.status(400).json({
				error: true,
				success: false,
				message: "User already exists",
			});
			return;
		}
		const hashedPassword = await bycrypt.hash(password, 10);
		const user = await prisma.user.create({
			data: {
				name,
				email,
				role,
				password: hashedPassword,
			},
		});
		res.status(201).json({
			success: true,
			message: "Registered successfully",
			error: false,
		});
	} catch (error) {
		res
			.status(500)
			.json({ error: true, success: false, message: (error as any).message });
	}
});
//Login a user
export const login = asyncHandler(async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			res.status(400).json({
				error: true,
				success: false,
				message: "All fields are required",
			});
			return;
		}
		const user = await prisma.user.findFirst({
			where: {
				email: email,
			},
		});
		if (!user) {
			res.status(400).json({
				error: true,
				success: false,
				message: "User not found",
			});
			return;
		}
		const isMatch = await bycrypt.compare(password, user.password);
		if (!isMatch) {
			res.status(400).json({
				error: true,
				success: false,
				message: "Invalid credentials",
			});
			return;
		}
		// Generate JWT token
		const token = jwt.sign(
			{ id: user.id, email: user.email, name: user.name, role: user.role },
			process.env.JWT_SECRET as string,
			{ expiresIn: "1d" }
		);
		res.cookie("token", token, {
			expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
			httpOnly: true,
			secure: false,
			sameSite: "none",
			// domain: ".jgecalumni.in",
		});
		res.status(200).json({
			success: true,
			message: "User logged in successfully",
			token: token,
			error: false,
		});
	} catch (error) {
		res
			.status(500)
			.json({ error: true, success: false, message: (error as any).message });
	}
});

//Get user profile
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
	try {
		const userId = (req as any).user.id;
		const user = await prisma.user.findUnique({
			where: {
				id: userId,
			},
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				phone: true,
				bookings: {
					select: {
						id: true,
						listing: {
							select: {
								id: true,
								images: true,
								description: true,
								doubleOccupancy: true,
								singleOccupancy: true,
								title: true,
								type: true,
								reviews: true,
							},
						},
						purpose: true,
						numberOfGuests: true,
						startDate: true,
						endDate: true,
						type: true,
						total: true,
					},
				},
				reviews: {
					select: {
						id: true,
						content: true,
						rating: true,
						listing: {
							select: {
								title: true,
							},
						},
					},
				},
				createdAt: true,
			},
		});
		if (!user) {
			res.status(404).json({
				error: true,
				success: false,
				message: "User not found",
			});
			return;
		}
		res.status(200).json({
			success: true,
			data: user,
			error: false,
		});
	} catch (error) {
		res
			.status(500)
			.json({ error: true, success: false, message: (error as any).message });
	}
});

//all users
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
	try {
		const users = await prisma.user.findMany({
			select: {
				id: true,
				name: true,
				email: true,
				listings: true,
				phone: true,
				role: true,
				bookings: true,
				reviews: true,
				createdAt: true,
			},
		});
		res.status(200).json({
			success: true,
			data: users,
			error: false,
		});
	} catch (error) {
		res
			.status(500)
			.json({ error: true, success: false, message: (error as any).message });
	}
});
//Delete user
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
	try {
		const userId = (req as any).user.id;
		const user = await prisma.user.delete({
			where: {
				id: userId,
			},
		});
		res.status(200).json({
			success: true,
			message: "User deleted successfully",
			error: false,
		});
	} catch (error) {
		res
			.status(500)
			.json({ error: true, success: false, message: (error as any).message });
	}
});
//Update user
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
	try {
		const userId = (req as any).user.id;
		const { name, email, phone } = req.body;

		if (!name || !email || !phone) {
			res.status(400).json({
				error: true,
				success: false,
				message: "All fields are required",
			});
			return;
		}
		const user = await prisma.user.update({
			where: {
				id: userId,
			},
			data: {
				name,
				email,

				phone: String(phone),
			},
		});
		res.status(200).json({
			success: true,
			message: "User updated successfully",
			error: false,
		});
	} catch (error) {
		res
			.status(500)
			.json({ error: true, success: false, message: (error as any).message });
	}
});

export const updateUserByAdmin = asyncHandler(
	async (req: Request, res: Response) => {
		try {
			const { id } = req.params;
			const { name, email, phone, role } = req.body;

			if (!name || !email || !phone || !role) {
				res.status(400).json({
					error: true,
					success: false,
					message: "All fields are required",
				});
				return;
			}
			const user = await prisma.user.update({
				where: {
					id: Number(id),
				},
				data: {
					name,
					email,
					role,
					phone: String(phone),
				},
			});
			res.status(200).json({
				success: true,
				message: "User updated successfully",
				error: false,
			});
		} catch (error) {
			res
				.status(500)
				.json({ error: true, success: false, message: (error as any).message });
		}
	}
);

//forgot password
export const resetOTP = asyncHandler(async (req: Request, res: Response) => {
	try {
		const { email } = req.body;

		if (!email) {
			res.status(400).json({
				error: true,
				success: false,
				message: "All fields are not provided",
			});
			return;
		}
		const isExist = await prisma.user.findFirst({
			where: {
				email: email,
			},
		});
		if (!isExist) {
			res.status(404).json({
				error: true,
				success: false,
				message: "User not found",
			});
			return;
		}

		//Generating 6 digit otp
		const otp = Math.floor(100000 + Math.random() * 900000).toString();
		//setting otp expiration for 10mins
		const otpExpire = new Date(Date.now() + 60 * 10 * 1000);

		await prisma.user.update({
			where: {
				email: email,
			},
			data: {
				resetOTP: otp,
				resetOTPExpire: otpExpire,
			},
		});
		await sendMail(email, "OTP for Password Reset", otpMail(otp, isExist.name));
		res.status(200).json({
			error: false,
			success: true,
			message: "Otp sent succesfully",
		});
	} catch (error) {
		console.log(error);

		res.status(500).json({
			error: true,
			success: false,
			message: (error as any).message,
		});
		return;
	}
});
//verify otp and update password
// Verify OTP
export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
	try {
		const { email, otp } = req.body;
		if (!email || !otp) {
			res.status(400).json({
				error: true,
				success: false,
				message: "All fields are required",
			});
			return;
		}
		const isExist = await prisma.user.findFirst({
			where: {
				email: email,
			},
		});
		if (!isExist) {
			res.status(404).json({
				error: true,
				success: false,
				message: "User not found",
			});
			return;
		}
		if (
			isExist?.resetOTP !== otp ||
			!isExist?.resetOTPExpire ||
			isExist.resetOTPExpire < new Date()
		) {
			res.status(400).json({
				error: true,
				success: false,
				message: "Invalid or expired OTP",
			});
			return;
		}
		res.status(200).json({
			error: false,
			success: true,
			message: "OTP verified successfully",
		});
	} catch (error) {
		res.status(500).json({
			error: true,
			success: false,
			message: (error as any).message,
		});
		return;
	}
});

// Update Password
export const updatePassword = asyncHandler(
	async (req: Request, res: Response) => {
		try {
			const { email, password } = req.body;
			if (!email || !password) {
				res.status(400).json({
					error: true,
					success: false,
					message: "All fields are required",
				});
				return;
			}
			const isExist = await prisma.user.findFirst({
				where: {
					email: email,
				},
			});
			if (!isExist) {
				res.status(404).json({
					error: true,
					success: false,
					message: "User not found",
				});
				return;
			}
			const hashedPassword = await bycrypt.hash(password, 10);
			await prisma.user.update({
				where: {
					email: email,
				},
				data: {
					password: hashedPassword,
					resetOTP: null,
					resetOTPExpire: null,
				},
			});
			res.status(200).json({
				error: false,
				success: true,
				message: "Password updated successfully",
			});
		} catch (error) {
			res.status(500).json({
				error: true,
				success: false,
				message: (error as any).message,
			});
			return;
		}
	}
);
export const logout = asyncHandler((req: Request, res: Response) => {
	try {
		res.clearCookie("token", {
			httpOnly: true,
			secure: true,
			sameSite: "none",
			domain: ".jgecalumni.in",
		});
		res.status(200).json({
			error: false,
			success: true,
			message: "Logout successful",
		});
	} catch (error) {
		res.status(500).json({
			error: true,
			success: false,
			message: (error as any).message,
		});
		return;
	}
});
