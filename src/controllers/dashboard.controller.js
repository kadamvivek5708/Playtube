import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized request");
    }

    const [totalVideos, totalSubscribers, videoStats, totalLikes] =
    await Promise.all([
      // using Promise.all to run all database queres in parallel, if anyone rejects then it throws error directly
      // total number of videos
      Video.countDocuments({ owner: userId }),

      // total number of subscribers
      Subscription.countDocuments({ channel: userId }),

      // using aggregation to get total views
      Video.aggregate([
        {
          $match: {
            owner: new mongoose.Types.ObjectId(userId), 
          },
        },
        {
          $group: {
            _id: null,
            totalViews: { $sum: "$views" }, 
          },
        },
      ]),

      Video.aggregate([
        {
          $match: {
            owner: new mongoose.Types.ObjectId(userId), 
          },
        },
        {
          $lookup: {
            from: "likes",
            localField: "_id",
            foreignField: "video",
            as: "likes",
          },
        },
        {
          $project: {
            likesCount: { $size: "$likes" }, 
          },
        },
        {
          $group: {
            _id: null,
            totalLikes: { $sum: "$likesCount" }, 
          },
        },
      ]),
    ]);
    const stats = {
    totalVideos,
    totalSubscribers,
    // aggregation returns an array so safely accessing the first element
    totalViews: videoStats[0]?.totalViews || 0,
    totalLikes: totalLikes[0]?.totalLikes || 0,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Channel stats fetched successfully"));
});


const getChannelVideos = asyncHandler(async (req, res) => {
    // Get all the videos uploaded by the channel
    const {channelId} = req.params
    if(!isValidObjectId(channelId)){
        new ApiError(401,"please give valid channel id")
    }

    // 2.compare this id with the owner in Video db
    const publicVideos = await Video.find(
        {
            isPublished:true,
            owner:channelId
        })
    if(!publicVideos || publicVideos.length === 0){
        throw new ApiError(404,"Channel Not Found !!!")
    }
    return res  
            .status(200)
            .json(new ApiResponse(200,publicVideos,"Channel Videos Fetched Successfully"))
})

export {
    getChannelStats, 
    getChannelVideos
    }