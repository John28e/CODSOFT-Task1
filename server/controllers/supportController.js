import Support from "../models/Support.js";

/**
 * POST /api/support
 * Create a new support ticket / contact inquiry
 */
export const createSupportTicket = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      res.status(400);
      throw new Error("Please provide all required fields");
    }

    const ticketData = {
      name,
      email,
      subject,
      message,
    };

    // If request contains authenticated user context, link it
    if (req.user) {
      ticketData.user = req.user._id;
    }

    const ticket = await Support.create(ticketData);

    res.status(201).json({
      success: true,
      message: "Support inquiry submitted successfully. Our team will contact you shortly.",
      ticket,
    });
  } catch (error) {
    next(error);
  }
};
