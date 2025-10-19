import {isValidObjectId} from "mongoose";
import { Tweets } from "../models/tweets.model.js";
import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"

const createTweet = asyncHandler(async(req, res) => {
    // 1.get user id and content to create a tweet with owner
    const userId = req.user?._id
    const {content} = req.body
    if(!content){
        throw new ApiError(400,"content required")
    }
    // console.log(userId,"   ", content)

    // 2.create a db collection for storing tweets and add this tweet to it
    const tweet = await Tweets.create({
        owner:userId,
        content,
    })
    if(!tweet){
        throw new ApiError(500,"Something went wrong while creating db instance")
    }

    // 3.response
    return res  
            .status(200)
            .json(new ApiResponse(200,tweet, "tweet created succesfully"))
})

const updateTweet = asyncHandler(async(req, res) => {
    const {tweetId} = req.params
    const {content} = req.body

    if(!content || !isValidObjectId(tweetId)){
        throw new ApiError(400,"content and valid tweetId required ")
    }

    const updatedTweet = await Tweets.findOneAndUpdate(
        {
            owner : req.user?._id,
            _id : tweetId
        },
        {
            $set:{
                content,
            }
        },
        {new:true}
    )
    if(!updatedTweet){
        throw new ApiError(404,"Tweet not found or you do not have permission to update it.")
    }

    return res  
            .status(200)
            .json(new ApiResponse(200, updatedTweet, "Successfully Updated tweet"))
})

const deleteTweet = asyncHandler(async(req, res) => {
    const {tweetId} = req.params
    const userId = req.user?._id

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Please give a valid tweet Id")
    }
    const deletedTweet = await Tweets.findOneAndDelete(
        {
            _id:tweetId,
            owner:userId,
        }
    )
    if(!deletedTweet){
        throw new ApiError(404,"Tweet not found or you dont have permissions")
    }

    return res
            .status(200)
            .json(new ApiResponse(200, {}, "Tweet deleted"))
})

const getUserTweets = asyncHandler(async(req, res) => {
    const {tweetId} = req.params
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Please give a valid tweet Id")
    }
    const tweet = await Tweets.findById(tweetId).populate(
        "owner",
        "username avatar"
    );
    if(!tweet){
        throw new ApiError(404,"Tweet Not Found")
    }

    return res  
            .status(200)
            .json(new ApiResponse(200,tweet, "Successfully Fetched tweet"))
})

export {createTweet,
        updateTweet,
        deleteTweet,
        getUserTweets
}
