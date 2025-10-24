import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Likes } from "../models/likes.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const {channelId} = req.params
    if(!isValidObjectId(channelId)){
        new ApiError(401,"please give valid channel id")
    }

})

// Pagination
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