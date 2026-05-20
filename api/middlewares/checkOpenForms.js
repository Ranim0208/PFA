// Middleware to check if form is still open
import Form from "../models/form.js";

export const checkFormOpen = async (req, res, next) => {
  try {
    const form = await Form.findById(req.params.formId);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Form not found",
      });
    }

    const now = new Date();
    if (now < form.startDate || now > form.endDate) {
      return res.status(400).json({
        success: false,
        message: "This form is not currently accepting submissions",
      });
    }

    req.form = form;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error checking form availability",
      error: error.message,
    });
  }
};
