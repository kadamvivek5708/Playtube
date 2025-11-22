import mongoose, {isValidObjectId} from "mongoose";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comments } from "../models/comments.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { toxicityDetection } from "../utils/toxicityHandler.js";

const addComment = asyncHandler(async(req,res) => { 
    // need userId, videoId, content
    const {videoId} = req.params
    const {content} = req.body
    const userId = req.user?._id

    // check all validaton 
    if(!isValidObjectId(videoId) || !content?.trim()){
        throw new ApiError(400, "Please give a valid VideoId and content")
    }

    // AI MODERATION (HUGGING FACE ALTERNATIVE)
    await toxicityDetection(content)

    // create db instance
    const Comment = await Comments.create({
        video: videoId,
        owner: userId,
        content
    })
    if(!Comment){
        throw new ApiError(500,"something went wrong while creating db instance ")
    }
    // console.log(Comment)

    // response
    return res  
            .status(201)
            .json(new ApiResponse(201, Comment, "Comment added Succesfully"))

})

const updateComment = asyncHandler(async(req,res) => {
    const {videoId,commentId} = req.params
    const {content} = req.body
    const userId = req.user?._id

    if(!isValidObjectId(videoId) || !content?.trim()){
        throw new ApiError(400, "Please give a valid VideoId and content")
    }

    const updatedComment = await Comments.findOneAndUpdate(
        {
            video:videoId,
            owner:userId,
            _id:commentId
        },
        {
            content
        },
        {
            new:true
        })
    if(!updatedComment){
        throw new ApiError(500,"something went wrong or you dont have permissions")
    }

    return res  
            .status(201)
            .json(new ApiResponse(201, updatedComment, "Comment Updated Successfully"))

})

const deleteComment = asyncHandler(async(req,res) => {
    const {commentId} = req.params
    const userId = req.user?._id

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Please give a valid VideoId and content")
    }

    const deletedComment = await Comments.findOneAndDelete(
        {
            _id:commentId,
            owner:userId,
        }
    )

    if(!deletedComment){
        throw new ApiError(404,"Error while deleting comment or you dont have permissions")
    }

    return res  
        .status(201)
        .json(new ApiResponse(201, deletedComment, "Comment Deleted Succesfully"))
})

const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
    };

    const aggregationPipeline = Comments.aggregate([
        {
            $match:{
                video:new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"ownerDetails",
                pipeline:[{
                    $project:{
                        username:1,
                        avatar:1
                    }
                }]
            }
        },
        {
            $addFields: {
                owner: { $first: "$ownerDetails" }
            }
        },
        {
            $project:{
                content:1,
                owner:1
            }
        },
        {
            $sort:{
                createdAt : -1,
            }
        }
    ]);
    // console.log(aggregationPipeline)

    const Comment = await Comments.aggregatePaginate(aggregationPipeline,options);

    if(!Comment || Comment.docs.length ===0){
        throw new ApiError(404," No Comments Yet")
    }

    return res
            .status(201)
            .json(new ApiResponse(201,Comment, "Success"))

})

export {addComment, updateComment, deleteComment, getVideoComments}