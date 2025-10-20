import mongoose, {isValidObjectId} from "mongoose";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {Likes} from "../models/likes.model.js"
import {Video} from "../models/video.model.js"
import {Comments} from "../models/comments.model.js"
import { Tweets } from "../models/tweets.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";

// TODO : Make a reusable function (correct this)
async function toogleLike(Id, Model, Obj) {

    const userId = req?.user?._id

    const isVideoExist = await Video.findById(Id)
    if (!isValidObjectId(Id) || !isVideoExist) {
        throw new ApiError(400, `Invalid Id or ${Obj} not exists`)
    }
    const unLiked = await Model.findOneAndDelete({
        likedBy : userId,
        Obj : Id,
    })
    
    let Liked
    if(!unLiked){
        Liked = await Model.create({
            Obj : Id,
            likedBy : userId
        })
    }
        
    return res
        .status(200)
        .json(new ApiResponse(200,Liked || unLiked , Liked ? "Liked" : "Unliked"))
    
}

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const userId = req?.user?._id

    const isVideoExist = await Video.findById(videoId)
    
    if (!isValidObjectId(videoId) || !isVideoExist) {
        throw new ApiError(400, "Invalid videoId or Video not exists")
    }
    
    // 1.find and delete if Liked
    // TODO: increment like count for video
    const unLiked = await Likes.findOneAndDelete({
        likedBy : userId,
        video : videoId,
    })
    
    // 2.if not then Like
    let Liked
    if(!unLiked){
        Liked = await Likes.create({
            video : videoId,
            likedBy : userId
        })
    }
        
    // 3.return response
    return res
        .status(200)
        .json(new ApiResponse(200,Liked || unLiked , Liked ? "Liked Video" : "Unliked Video"))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const userId = req?.user?._id
    
    const isCommentExist = await Comments.findById(commentId)
    if (!isValidObjectId(commentId) || !isCommentExist) {
        throw new ApiError(400, "Invalid commentId or Comment Not Exists")
    }
    
    // 1.find and delete if Liked
    // TODO: increment like count for comment
    const unLiked = await Likes.findOneAndDelete({
        likedBy : userId,
        comment : commentId,
    })
    
    // 2.if not then Like
    let Liked
    if(!unLiked){
        Liked = await Likes.create({
            comment : commentId,
            likedBy : userId
        })
    }
        
    // 3.return response
    return res
        .status(200)
        .json(new ApiResponse(200,Liked || unLiked , Liked ? "Liked Comment" : "Unliked Comment"))

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const userId = req?.user?._id
    
    const isTweetExist = await Tweets.findById(tweetId)
    if (!isValidObjectId(tweetId) || !isTweetExist) {
        throw new ApiError(400, "Invalid tweetId or Tweet not Exists")
    }
    
    // 1.find and delete if Liked
    // TODO: increment like count for comment
    const unLiked = await Likes.findOneAndDelete({
        likedBy : userId,
        tweet : tweetId,
    })
    
    // 2.if not then Like
    let Liked
    if(!unLiked){
        Liked = await Likes.create({
            tweet : tweetId,
            likedBy : userId
        })
    }
        
    // 3.return response
    return res
        .status(200)
        .json(new ApiResponse(200,Liked || unLiked , Liked ? "Liked tweet" : "Unliked tweet"))
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id
    // TODO
    const LikedVideos = await Likes.aggregate([
        {
            $match:{
                likedBy:userId,
                video:{ $exists: true },
            }
        },
        {
            $lookup:{
                from: "Video",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails",
                pipeline:[{
                    $project:{
                        avatar:1
                    }
                }]
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