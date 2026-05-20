import Region from "../models/region.js";
import Form from "../models/form.js";
export const getRegions = async (req, res) => {
  try {
    const regions = await Region.find({});
    res.json(regions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch regions" });
  }
};
export const getFormsRegions = async (req, res) => {
  try {
    const now = new Date();

    // Find all currently open forms (published and within date range)
    const openForms = await Form.find({
      published: true,
      // startDate: { $lte: now },
      // endDate: { $gte: now },
    })
      .select("region")
      .populate("region", "name");

    // Extract unique regions from the open forms
    const uniqueRegionIds = [
      ...new Set(openForms.map((form) => form.region?._id)),
    ];

    // Get full region details for the unique regions
    const regions = await Region.find({
      _id: { $in: uniqueRegionIds },
    }).select("name");
    res.status(200).json({
      success: true,
      data: regions,
    });
  } catch (error) {
    console.error("Error fetching form regions:", error);
    res.status(500).json({
      success: false,
      error: "Server error retrieving form regions",
    });
  }
};
