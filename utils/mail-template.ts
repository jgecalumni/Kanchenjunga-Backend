export const otpMail = (otp: string, name: string) => {
	return `<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f9; color: #333; line-height: 1.6;">
    <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
      
      <!-- Header Section -->
      <div style="background-color: #516ab6; color: #080A0D; text-align: center; padding: 20px;">
        <img src="https://res.cloudinary.com/daanphoru/image/upload/v1744962756/Logo_vx2vnz.png"
             alt="JGEC Alumni Association Logo"
             style="max-width: 160px; margin-bottom: 10px; object-fit: contain;" />
        <h1 style="margin: 0; font-size: 25px; font-weight: 600; color:white">Password Reset Request</h1>
      </div>

      <!-- Content Section -->
      <div style="padding: 20px">
        <!-- Greeting -->
        <div>
          <h4 style="color: #516bb7; font-size: 16px; margin-bottom: 4px;">Dear ${name},</h4>
          <p style="font-size: 14px; margin-bottom: 10px;">
            You have requested to reset your password. Please use the OTP below to proceed. This code is valid for <strong>10 minutes</strong>.
          </p>
        </div>

        <!-- OTP -->
        <div style="text-align: center; margin: 20px 0;">
          <div style="display: inline-block; background-color: #f0f4f8; padding: 15px 25px; border-radius: 8px; font-size: 24px; letter-spacing: 4px; font-weight: bold; color: #2c3e50;">
            ${otp}
          </div>
        </div>

        <!-- Note -->
        <div>
          <p style="font-size: 14px;">
            If you did not request this, please ignore this email or contact support immediately.
          </p>
        </div>

        <!-- Closing -->
        <div>
          <h2 style="color: #080A0D; font-size: 14px;">Warm regards,</h2>
          <p style="font-size: 14px;">
            The <strong>JGEC Alumni Association</strong><br>
            <em>"Driven by Gratitude, Bonded with Nostalgia"</em>
          </p>
        </div>
      </div>

      <!-- Footer Section -->
      <div style="background-color: #f4f4f9; text-align: center; padding: 15px; font-size: 14px; color: #555;">
        <p>If you have any questions, feel free to reach us at <a href="mailto:alumnijgec320@gmail.com" style="color: #516bb7; text-decoration: none;">alumnijgec320@gmail.com</a>.</p>
        <p>Stay safe and secure.</p>
      </div>
    </div>
  </body>`;
};
export const RoomBookingMail = (
	name: string,
	roomName: string,
	roomType: string,
	checkIn: string,
	checkOut: string,
	totalAmount: Number,
	bookingId: string
) => {
	return `
  <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #eef1f7; color: #333; line-height: 1.6;">
  <div style="max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
    
    <!-- Header -->
    <div style="background-color: #516bb7; text-align: center; padding: 25px 20px;">
      <img src="https://res.cloudinary.com/daanphoru/image/upload/v1744962756/Logo_vx2vnz.png"
           alt="Booking Logo"
           style="max-width: 140px; margin-bottom: 10px;" />
      <h1 style="margin: 0; font-size: 24px; color: #ffffff;">Room Booking Confirmed!</h1>
    </div>

    <!-- Body -->
    <div style="padding: 25px;">
      <h4 style="color: #516bb7; font-size: 16px; margin: 0 0 8px;">Hello ${name},</h4>
      <p style="font-size: 14px; margin-bottom: 16px;">
        Thank you for choosing us! We're pleased to confirm your stay in <strong>${roomName}</strong>. Here are your booking details:
      </p>

      <!-- Booking Info -->
      <div style="background-color: #f5f7fa; padding: 16px 20px; border-radius: 8px; font-size: 14px; margin-bottom: 20px;">
        <p><strong>Room:</strong> ${roomName}</p>
        <p><strong>Type:</strong> ${roomType}</p>
        <p><strong>Check-in:</strong> ${checkIn}</p>
        <p><strong>Check-out:</strong> ${checkOut}</p>
        <p><strong>Booking ID:</strong> ${bookingId}</p>
        <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
      </div>

      <!-- Message -->
      <p style="font-size: 14px; margin-bottom: 20px;">
        If you have any questions about your reservation or need assistance, don't hesitate to reach out. We look forward to hosting you!
      </p>

      <!-- Signature -->
      <div style="margin-top: 20px;">
        <p style="margin: 0; font-size: 14px;">Warm regards,</p>
        <p style="font-size: 14px; font-weight: 600; margin: 4px 0;">The JGEC Alumni Association</p>
        <p style="font-size: 13px; font-style: italic; color: #555;">"Driven by Gratitude, Bonded with Nostalgia"</p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f0f2f5; text-align: center; padding: 15px; font-size: 13px; color: #666;">
      <p style="margin: 0;">Questions? Email us at 
        <a href="mailto:alumnijgec320@gmail.com" style="color: #516bb7; text-decoration: none;">
          alumnijgec320@gmail.com
        </a>
      </p>
      <p style="margin: 4px 0 0;">Safe travels and see you soon!</p>
    </div>

  </div>
</body>

  `;
};

export const StayCompletionMail = (
	name: string,
	roomName: string,
	roomType: string,
	checkIn: string,
	checkOut: string,
	bookingId: number,
	totalAmount: number,
	baseUrl: string
) => {
	return `<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #eef1f7; color: #333; line-height: 1.6;">
  <div style="max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
    
    <!-- Header -->
    <div style="background-color: #516bb7; text-align: center; padding: 25px 20px;">
      <img src="https://res.cloudinary.com/daanphoru/image/upload/v1744962756/Logo_vx2vnz.png"
           alt="Booking Logo"
           style="max-width: 140px; margin-bottom: 10px;" />
      <h1 style="margin: 0; font-size: 24px; color: #ffffff;">Thank You for Staying With Us!</h1>
    </div>

    <!-- Body -->
    <div style="padding: 25px;">
      <h4 style="color: #516bb7; font-size: 16px; margin: 0 0 8px;">Hello ${name},</h4>
      <p style="font-size: 14px; margin-bottom: 16px;">
        We hope you had a pleasant stay in <strong>${roomName}</strong>. We'd love to hear your feedback about your experience!
      </p>

      <!-- Booking Info -->
      <div style="background-color: #f5f7fa; padding: 16px 20px; border-radius: 8px; font-size: 14px; margin-bottom: 20px;">
        <p><strong>Room:</strong> ${roomName}</p>
        <p><strong>Type:</strong> ${roomType}</p>
        <p><strong>Check-in:</strong> ${checkIn}</p>
        <p><strong>Check-out:</strong> ${checkOut}</p>
        <p><strong>Booking ID:</strong> ${bookingId}</p>
        <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
      </div>

      <!-- Review Button -->
      <div style="text-align: center; margin: 20px 0;">
        <a href="${baseUrl}/review/${bookingId}" 
           style="display: inline-block; background-color: #516bb7; color: #fff; padding: 12px 24px; border-radius: 5px; text-decoration: none; font-size: 14px;">
          Leave a Review
        </a>
      </div>

      <!-- Message -->
      <p style="font-size: 14px; margin-bottom: 20px;">
        Your feedback helps us improve and serve our alumni community better. Thank you for choosing us!
      </p>

      <!-- Signature -->
      <div style="margin-top: 20px;">
        <p style="margin: 0; font-size: 14px;">Warm regards,</p>
        <p style="font-size: 14px; font-weight: 600; margin: 4px 0;">The JGEC Alumni Association</p>
        <p style="font-size: 13px; font-style: italic; color: #555;">"Driven by Gratitude, Bonded with Nostalgia"</p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f0f2f5; text-align: center; padding: 15px; font-size: 13px; color: #666;">
      <p style="margin: 0;">Questions? Email us at 
        <a href="mailto:alumnijgec320@gmail.com" style="color: #516bb7; text-decoration: none;">
          alumnijgec320@gmail.com
        </a>
      </p>
      <p style="margin: 4px 0 0;">Safe travels and see you again soon!</p>
    </div>

  </div>
</body>
`;
};
