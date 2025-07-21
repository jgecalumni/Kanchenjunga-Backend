import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler";
export const authentication = asyncHandler(
	(req: Request, res: Response, next: NextFunction) => {
		const cookie = req.headers?.cookie;
		let token: string | undefined;

		if (cookie) {
			const match = cookie.match(/token=([^;]+)/);
			if (match) {
				token = match[1];
			}
		}
		try {
			if (!token) {
				res
					.status(404)
					.json({ error: true, success: false, message: "No token provided" });
				res.clearCookie("token");
				return;
			}
			const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
			if (!decoded) {
				res.status(401).json({
					error: true,
					success: false,
					message: "Invalid token",
				});
				res.clearCookie("token");
				return;
			}

			(req as any).user = decoded;
		} catch (error) {
			res.status(401).json({
				error: true,
				success: false,
				message: "Invalid or expired token",
			});
			return;
		}
		next();
	}
);

//check for admin
export const isAdmin = asyncHandler(
	(req: Request, res: Response, next: NextFunction) => {
		if (
			(req as any).user.email !== process.env.ADMIN_EMAIL &&
			(req as any).user.role !== "ADMIN"
		) {
			res
				.status(403)
				.json({ error: true, success: false, message: "Access denied" });
			return;
		}
		next();
	}
);
