import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import prisma from "../prisma";

export const createReview = asyncHandler(
	async (req: Request, res: Response) => {
		try {
			const { content, rating } = req.body;
									
			await prisma.review.create({
				data: {
					listingId: Number(req.params.id),
					userId: (req as any).user.id ,
					content,
					rating,
				},
			});
			res.status(200).json({
				error: false,
				success: true,
				message: "Thank you for your valuable feedback",
			});
		} catch (error) {
			res.status(500).json({
				erro: true,
				success: false,
				message: (error as any).message,
			});
			return;
		}
	}
);

export const getAllReviews = asyncHandler(
	async (req: Request, res: Response) => {
		try {
			const data = await prisma.review.findMany({
				select:{
					id: true,
					content: true,
					rating: true,
					createdAt: true,
					user: {
						select: {
							id: true,
							name: true,
							email: true,
							role: true,
							phone: true,
						},
					},
					listing:{
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
					}
				},
			});
			
			res.status(200).json({
				error: false,
				success: true,
				message: "Reviews fetched successfully",
				data,
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

export const deleteReview = asyncHandler(
	async (req: Request, res: Response) => {
		try {
			const reviewId = Number(req.params.id);
			const review = await prisma.review.findUnique({
				where: { id: reviewId },
			});
			if (!review) {
				res.status(404).json({
					error: true,
					success: false,
					message: "Review not found",
				});
				return;
			}
			await prisma.review.delete({ where: { id: reviewId } });
			res.status(200).json({
				error: false,
				success: true,
				message: "Review deleted successfully",
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
