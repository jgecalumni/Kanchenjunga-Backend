import PDFDocument from "pdfkit";

export const generateReceipt = async (receipt: any): Promise<Buffer> => {
	return new Promise((resolve, reject) => {
		const doc = new PDFDocument({ margin: 50, size: "A4" });
		const buffers: Buffer[] = [];

		doc.on("data", (chunk) => buffers.push(chunk));
		doc.on("end", () => resolve(Buffer.concat(buffers)));
		doc.on("error", (err) => reject(err));

		// Header
		// Add the header image
		let currentY = 200;
		// try {
		// 	const imageUrl =
		// 		"https://cdn.builder.io/api/v1/image/assets%2Fd61b7566d21a470b9134984f4b744c44%2Fdcee570befad41be8d8bea0b8e54c6dc?format=png&width=800";
		// 	const imageResponse = await fetch(imageUrl);

		// 	if (imageResponse.ok) {
		// 		const imageBuffer = await imageResponse.arrayBuffer();
		// 		const imageWidth = 450;
		// 		const imageHeight = 130;
		// 		const pageWidth = doc.page.width;
		// 		const imageX = (pageWidth - imageWidth) / 2;

		// 		doc.image(Buffer.from(imageBuffer), imageX, 30, {
		// 			width: imageWidth,
		// 			fit: [imageWidth, imageHeight],
		// 		});

		// 		currentY = 180; // Position content below image
		// 	}
		// } catch (error) {
		// 	console.error("Failed to load header image:", error);
		// 	// Add a simple text header as fallback
		// 	doc
		// 		.fontSize(16)
		// 		.fillColor("#1f2937")
		// 		.text("JGEC Alumni Association", 50, 30, { align: "center" })
		// 		.fontSize(12)
		// 		.fillColor("#6b7280")
		// 		.text("Jalpaiguri Government Engineering College", 50, 55, {
		// 			align: "center",
		// 		});
		// 	currentY = 90;
		// }

		doc.image("public/Logo.png", 40, 40, { width: 500 });
		doc.moveDown(10);
		doc
			.font("Helvetica-Oblique") // Italic for initial part
			.fontSize(12)
			.fillColor("#374151")
			.text("Thank you for choosing ", 120, currentY, { continued: true })
			.font("Helvetica-BoldOblique") // Bold + Italic for roomName
			.text(receipt.roomName, { continued: true })
			.font("Helvetica-Oblique") // Revert back to italic
			.text(" in Kanchenjunga convention centre.");

		currentY += 30;
		// Add receipt title (moved down to account for image)
		doc
			.fontSize(18)
			.font("Helvetica")
			.fillColor("#111827")
			.text("PAYMENT RECEIPT", 210, currentY);
		currentY += 30;

		// Add horizontal line
		doc
			.moveTo(50, currentY)
			.lineTo(550, currentY)
			.strokeColor("#e5e7eb")
			.lineWidth(1)
			.stroke();

		currentY += 20;

		// Customer Information
		doc
			.fontSize(14)
			.fillColor("#374151")
			.text("Alumni/ Student Details:", 50, currentY);

		currentY += 20;
		doc
			.fontSize(12)
			.fillColor("#6b7280")
			.text(`Name: ${receipt.name} (${receipt.numberOfGuests})`, 50, currentY);

		currentY += 20;
		doc.text(`Receipt ID: ${receipt.receiptId}`, 50, currentY);

		// Payment Information
		const amount = receipt.amount; // Convert from paisa to rupees
		const amountPaid = receipt.amount;
		const amountDue = receipt.amount;
		const paymentDate = new Date(receipt.date * 1000).toLocaleDateString(
			"en-IN",
			{
				year: "numeric",
				month: "long",
				day: "numeric",
			}
		);

		currentY += 30;

		doc
			.fontSize(14)
			.fillColor("#374151")
			.text("Payment Details:", 50, currentY);

		currentY += 20;
		doc
			.fontSize(12)
			.fillColor("#6b7280")
			.text(`Order ID: ${receipt.razorpay_order_id}`, 50, currentY);

		currentY += 20;
		doc.text(`Payment Date: ${paymentDate}`, 50, currentY);

		currentY += 30;

		doc
			.fontSize(14)
			.fillColor("#374151")
			.text("Reservation Details:", 50, currentY);

		currentY += 20;
		
		doc
			.fontSize(12)
			.fillColor("#6b7280")
			.text(`Check-In: ${receipt.startDate}`, 50, currentY);

		currentY += 20;
		doc.text(`Check-Out: ${receipt.endDate}`, 50, currentY);

		currentY += 40;

		// Amount breakdown in a table-like format
		doc.fontSize(14).fillColor("#374151").text("Amount Paid:", 50, currentY);

		currentY += 25;

		// Table header background
		doc
			.rect(50, currentY, 500, 25)
			.fillColor("#f9fafb")
			.fill()
			.strokeColor("#e5e7eb")
			.lineWidth(1)
			.stroke();

		// Table headers
		doc
			.fontSize(12)
			.fillColor("#374151")
			.text("Description", 60, currentY + 10)
			.font(`public/DejaVuSans.ttf`)
			.text("Amount (\u20B9)", 450, currentY + 8);

		// Table rows
		const tableY = currentY + 25;
		doc.rect(50, tableY, 500, 25).fillColor("#ffffff").fill().stroke();

		doc
			.fillColor("#6b7280")
			.text("Total Amount", 60, tableY + 10)
			.text(`\u20B9${amount.toLocaleString("en-IN")}`, 450, tableY + 10);

		doc
			.rect(50, tableY + 25, 500, 25)
			.fillColor("#f9fafb")
			.fill()
			.stroke();

		doc
			.text("Amount Paid", 60, tableY + 35)
			.text(`\u20B9${amountPaid.toLocaleString("en-IN")}`, 450, tableY + 35);

		doc
			.rect(50, tableY + 50, 500, 25)
			.fillColor("#ffffff")
			.fill()
			.stroke();

		doc
			.text("Amount Due", 60, tableY + 60)
			.text(`\u20B9${amountDue.toLocaleString("en-IN")}`, 450, tableY + 60);

		// Update currentY to after the table
		currentY = tableY + 65;

		// Payment status badge
		doc.fontSize(12).fillColor("#374151").text("Status:", 50, currentY);
		currentY += 8;
		if (receipt.status === "Paid") {
			doc
				.rect(50, currentY + 10, 100, 25)
				.fillColor("#10b981")
				.fill();

			doc
				.fontSize(12)
				.fillColor("#ffffff")
				.text("Paid", 85, currentY + 16);

			currentY += 45; // Move down after badge
		} else {
			currentY += 20; // Small space if no badge
		}

		// Add more space before footer
		currentY += 15;

		if (currentY > 700) {
			currentY = 692; // Pull back to avoid auto page break
		}
		doc.fontSize(10).fillColor("#000000").text(
			"This is a computer-generated receipt and does not require a signature. For Food & other things please contact our beloved brother Papai: +91 7001096910",
			50,
			currentY,
			{ width: 500 } // restrict width so text wraps instead of overflowing
		);

		currentY += 35;

		doc.text(
			`Generated on: ${new Date().toLocaleDateString("en-IN")}`,
			50,
			currentY
		);
		// Finalize the PDF
		doc.end();
	});
};
