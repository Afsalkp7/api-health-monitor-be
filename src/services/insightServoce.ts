import insight from "../models/insight";

export const insightGetService = async (userId:string) => {

    const insights = await insight.find({})
      .populate({
        path: "monitor",
        match: { user: userId }, // Only return if monitor belongs to user
        select: "friendlyName url"
      })
      .sort({ isActive: -1, updatedAt: -1 }); // Active first, then newest

    // Filter out insights where monitor is null (because of the match filter above)
    return insights.filter(i => i.monitor !== null);

}