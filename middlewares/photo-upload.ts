import multer from "multer";
import prisma from "../prisma";

const storage = multer.diskStorage({
	destination: async function (req, file, cb) {		
		const data = await prisma.listing.findUnique({
			where: {
				id: Number(req.params.id||0),
			},
		});
		const fs = require("fs");
		const dir = `./public/rooms/${!data ? req.body.title : data.title}`;
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}
		cb(null, dir);
	},
	filename: function (req, file, cb) {		
		cb(null, file.originalname.replace(/\s+/g, ""));
	},
});

export const upload = multer({ storage: storage });
