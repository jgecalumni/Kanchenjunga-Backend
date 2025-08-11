import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import prisma from "../prisma";
import fs from "fs";
import { RoomType } from "@prisma/client";

export const createListing = asyncHandler(
	async (req: Request, res: Response) => {
		try {
			const { title, description, singleOccupancy, doubleOccupancy, type } =
				req.body;
			const imagesUrls = (req as any).files.map(
				(file: any) =>
					`/public/rooms/${title}/${file.originalname.replace(/\s+/g, "")}`
			);

			if (
				!title ||
				!description ||
				!singleOccupancy ||
				!doubleOccupancy ||
				!type
			) {
				res.status(400).json({
					error: true,
					success: false,
					message: "All fields are required",
				});
				return;
			}
			await prisma.listing.create({
				data: {
					title,
					description,
					singleOccupancy: parseFloat(singleOccupancy),
					doubleOccupancy: parseFloat(doubleOccupancy),
					type,
					userId: (req as any).user.id,
					images: {
						createMany: {
							data: imagesUrls.map((url: any) => ({ url })),
						},
					},
				},
			});
			res.status(200).json({
				error: false,
				success: true,
				message: "Room created successfully",
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

export const getAllListings = asyncHandler(
	async (req: Request, res: Response) => {
		const { search, type } = req.query;

		try {
			// Ensure type is a string and matches your RoomType enum
			const roomTypeValue =
				typeof type === "string" &&
				Object.values(RoomType).includes(type as RoomType)
					? (type as RoomType)
					: undefined;

			const data = await prisma.listing.findMany({
				where: {
					OR: [
						{
							title: {
								contains: (search as string) || "",
							},
						},
						{
							type: {
								equals: roomTypeValue || undefined,
							},
						},
					],
				},
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
					bookings: {
						select: {
							id: true,
							userId: true,
							startDate: true,
							endDate: true,
							type: true,
							total: true,
						},
					},
					reviews: {
						select: {
							id: true,
							userId: true,
							content: true,
							rating: true,
						},
					},
					user: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
				},
			});

			res.status(200).json({
				error: false,
				success: true,
				data,
				message: "Rooms fetched successfully",
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

export const deleteListing = asyncHandler(
	async (req: Request, res: Response) => {
		try {
			const { id } = req.params;
			const data = await prisma.listing.findUnique({
				where: {
					id: Number(id),
				},
				select: {
					title: true,
					images: {
						select: {
							url: true,
						},
					},
				},
			});
			if (data && data.images) {
				data.images.forEach((img) => {
					fs.unlink(`./${img.url}`, (err) => {
						if (err) {
							console.error(`Failed to delete file ${img.url}:`, err);
						}
					});
				});
				try {
					fs.rmdirSync(`./public/rooms/${data.title}`, { recursive: true });
				} catch (err) {
					console.error(
						`Failed to delete directory ./public/rooms/${data.title}:`,
						err
					);
				}
			}

			await prisma.listing.delete({
				where: {
					id: Number(id),
				},
			});
			res.status(200).json({
				error: false,
				success: true,
				message: "Room deleted successfully",
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

export const createImage = asyncHandler(async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const data = await prisma.listing.findUnique({
			where: {
				id: Number(id),
			},
		});
		const imagesUrls = (req as any).files.map(
			(file: any) =>
				`/public/rooms/${data?.title}/${file.originalname.replace(/\s+/g, "")}`
		);
		await prisma.image.createMany({
			data: imagesUrls.map((url: any) => ({
				listingId: Number(id),
				url,
			})),
		});
		res.status(200).json({
			error: false,
			success: true,
			message: "Image added successfully",
		});
	} catch (error) {
		res.status(500).json({
			error: true,
			success: false,
			message: (error as any).message,
		});
	}
});

export const deleteImage = asyncHandler(async (req: Request, res: Response) => {
	const { id } = req.params;
	const data = await prisma.image.findUnique({
		where: {
			id: Number(id),
		},
	});
	await prisma.image.delete({
		where: {
			id: Number(id),
		},
	});
	fs.unlink(`./${data?.url}`, (err) => {
		if (err) {
			console.error(`Failed to delete file ${data?.url}:`, err);
		}
	});
	res.status(200).json({
		error: false,
		success: true,
		message: "Image deleted successfully",
	});
});

export const getListingbyId = asyncHandler(
	async (req: Request, res: Response) => {
		try {
			
			const data = await prisma.listing.findUnique({
				where: {
					id: Number(req.params.id),
				},
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
					bookings: {
						select: {
							id: true,
							userId: true,
							startDate: true,
							endDate: true,
							type: true,
							total: true,
						},
					},
					reviews: {
						select: {
							id: true,
							user: {
								select: {
									name: true,
									role:true,
								},
							},
							content: true,
							rating: true,
						},
					},
				},
			});
			res.status(200).json({
				error: false,
				success: true,
				message: "Room fetched",
				data: data,
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

import path from "path";

// Assuming multer is configured to store files in 'public/rooms/:title'

export const updateListing = asyncHandler(
	async (req: Request, res: Response) => {
		try {
			const { id } = req.params;
			const {
				title,
				description,
				singleOccupancy,
				doubleOccupancy,
				type,
				existingImages,
			} = req.body;
			const uploadDir = path.join("./public/rooms", title);

			// Validate required fields
			if (
				!title ||
				!description ||
				!singleOccupancy ||
				!doubleOccupancy ||
				!type
			) {
				res.status(400).json({
					error: true,
					success: false,
					message: "All fields are required",
				});
				return;
			}

			// Parse existingImages (sent as JSON string)
			let existingImageIds: number[] = [];
			if (existingImages) {
				try {
					existingImageIds = JSON.parse(existingImages).map((id: string) =>
						Number(id)
					);
				} catch (error) {
					res.status(400).json({
						error: true,
						success: false,
						message: "Invalid existingImages format",
					});
					return;
				}
			}

			// Get uploaded files (assuming multer with array field 'images')
			const newImages = (req.files as Express.Multer.File[]) || [];

			// Construct image URLs similar to createListing
			const imagesUrls = newImages.map(
				(file) =>
					`/public/rooms/${title}/${file.originalname.replace(/\s+/g, "")}`
			);

			// Start a Prisma transaction to ensure atomicity
			const updatedListing = await prisma.$transaction(async (prisma) => {
				// Update listing details
				const listing = await prisma.listing.update({
					where: { id: Number(id) },
					data: {
						title,
						description,
						singleOccupancy: parseFloat(singleOccupancy),
						doubleOccupancy: parseFloat(doubleOccupancy),
						type,
					},
					include: { images: true }, // Include images to return in response
				});

				// Delete images not included in existingImageIds
				if (existingImageIds.length > 0) {
					const imagesToDelete = await prisma.image.findMany({
						where: {
							listingId: Number(id),
							id: { notIn: existingImageIds },
						},
					});
					console.log(imagesToDelete);

					// Delete files from the filesystem
					for (const image of imagesToDelete) {
						const filePath = path.join(uploadDir, path.basename(image.url));
						try {
							fs.unlinkSync(filePath);
						} catch (error) {
							console.error(`Failed to deletepath file ${filePath}:`, error);
						}
					}

					// Delete image records from the database
					await prisma.image.deleteMany({
						where: {
							listingId: Number(id),
							id: { notIn: existingImageIds },
						},
					});
				} else {
					// If no existing images are specified, delete all images
					const imagesToDelete = await prisma.image.findMany({
						where: { listingId: Number(id) },
					});

					for (const image of imagesToDelete) {
						const filePath = path.join(uploadDir, path.basename(image.url));
						try {
							fs.unlink(filePath, (err) => {
								if (err) {
									console.error(`Failed to delete file ${filePath}:`, err);
								}
							});
						} catch (error) {
							console.error(`Failed to delete file ${filePath}:`, error);
						}
					}

					await prisma.image.deleteMany({
						where: { listingId: Number(id) },
					});
				}

				// Add new images
				if (imagesUrls.length > 0) {
					await prisma.image.createMany({
						data: imagesUrls.map((url: string) => ({
							listingId: Number(id),
							url,
						})),
					});
				}

				// Fetch the updated listing with images
				return await prisma.listing.findUnique({
					where: { id: Number(id) },
					include: { images: true },
				});
			});

			res.status(200).json({
				error: false,
				success: true,
				message: "Room updated successfully",
				data: updatedListing,
			});
		} catch (error) {
			console.error("Error updating listing:", error);
			res.status(500).json({
				error: true,
				success: false,
				message: (error as any).message || "Failed to update listing",
			});
		}
	}
);
