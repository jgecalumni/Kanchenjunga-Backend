import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler";
export const authentication = asyncHandler((req, res, next) => {
    let token: string | undefined;

    // Mobile app → Authorization header
    if (req.headers.authorization?.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }

    // Web app → Cookie
    if (!token && req.headers?.cookie) {
        const match = req.headers.cookie.match(/token=([^;]+)/);
        if (match) token = match[1];
    }

    if (!token) {
        return res.status(404).json({ error: true, success: false, message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        (req as any).user = decoded;
        next();
    } catch {
        res.status(401).json({ error: true, success: false, message: "Invalid or expired token" });
    }
});


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
