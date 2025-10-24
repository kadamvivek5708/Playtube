import {isValidObjectId} from "mongoose";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {Likes} from "../models/likes.model.js"
import {Video} from "../models/video.model.js"
import {Comments} from "../models/comments.model.js"
import { Tweets } from "../models/tweets.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";


const toggleLike = async(Model, resourceId, userId) => {

    // 1.Validate id
    if (!isValidObjectId(resourceId)) {
        throw new ApiError(400, `Invalid resource Id`)
    }

    // 2.check if that resourse is present 
    const resource = await Model.findById(resourceId)
    if (!resource) {
        throw new ApiError(400, `${Model.modelName} not exists`)
    }

    // 3.check if already liked
    const resourceField = Model.modelName.toLowerCase()
    const likeCriteria = {
        likedBy: userId,
        [resourceField]: resourceId
    };
    const unLiked = await Likes.findOneAndDelete(likeCriteria)

    // 4.if not liked then like
    let Liked = null;
    if(!unLiked){
        Liked = await Likes.create(likeCriteria)
    }
        
    return {Liked,unLiked};
}

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const userId = req?.user?._id

    const result = await toggleLike(Video, videoId, userId)
    const actionMessage = result.Liked ? "Video Liked" : "Video Unliked";
    const responseData = result.Liked || result.unLiked;

    return res
            .status(200)
            .json(new ApiResponse(201, actionMessage, responseData))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const userId = req?.user?._id

    const result = await toggleLike(Comments, commentId, userId)
    const actionMessage = result.Liked ? "Comment Liked" : "Comment Unliked";
    const responseData = result.Liked || result.unLiked;

    return res
            .status(200)
            .json(new ApiResponse(201, actionMessage, responseData))

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const userId = req?.user?._id

    const result = await toggleLike(Tweets, tweetId, userId)
    const actionMessage = result.Liked ? "Tweet Liked" : "Tweet Unliked";
    const responseData = result.Liked || result.unLiked;

    return res
            .status(200)
            .json(new ApiResponse(201, actionMessage, responseData))
})

const getLikedVideos = asyncHandler(async (req, res) => {   
    const userId = req.user?._id
    const LikedVideos = await Likes.aggregate([
        {
            $match:{
                likedBy:userId,
                video:{ $exists: true },
            }
        },
        {
            $lookup:{
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails",
                pipeline:[{
                    $project:{
                        title:1,
                        thumbnail:1,
                        duration:1,
                        views:1,
                        owner:1
                    }
                }]
            }
        },
        {
            $addFields:{
                video: { $first: "$videoDetails" }
            }
        },
        {
            $project:{
                video:1,
            }
        }
    ])

    return res  
            .status(201)
            .json(new ApiResponse(201,LikedVideos , "Liked Videos Fetched Successfully"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}

// Avoid repetation and use a function to like just seperate the video,comment,tweet