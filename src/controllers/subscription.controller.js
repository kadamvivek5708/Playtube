import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/apiError.js";

// Toggle subscription to subscribe or unsubscribe
const toggleSubscription  = asyncHandler(async(req, res)=> {
    const {channelId} = req.params
    const subscriberId = req?.user?._id

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId")
    }
    // console.log(channelId,"  ",subscriberId)

    // 1.find and delete if present
    // TODO: increment subscribe count for channel
    const unSubscribe = await Subscription.findOneAndDelete({
        subscriber : subscriberId,
        channel : new mongoose.Types.ObjectId(channelId),
    })
    // console.log(unSubscribe)

    // 2.if not then subscribe
    let subscription
    if(!unSubscribe){
        subscription = await Subscription.create({
            channel:new mongoose.Types.ObjectId(channelId),
            subscriber:subscriberId
        })
    }
    
    // 3.return response
    return res
        .status(200)
        .json(new ApiResponse(200,subscription || unSubscribe , subscription ? "Subscribed" : "Unsubscribed"))
})

// Controller to get all subscribers of a channel
const getUserChannelSubscribers = asyncHandler(async(req, res)=> {
    const {channelId} = req.params
    if(!channelId) {
        throw new ApiError(400,"Channel Id required")
    }
    console.log(channelId)

    const Subscribers = await Subscription.aggregate([
        {
            $match:{
                channel: new mongoose.Types.ObjectId(channelId)            }
        },
        {
            $lookup:{
                from:"users",
                localField:"subscriber",
                foreignField:"_id",
                as:"subscribers",
                pipeline:[{
                    $project:{
                        username:1,
                        fullName:1,
                        avatar:1
                    }
                }]
            }
        },
        {
            $project:{
                subscribers:1
            }
        }
    ])
    if(!Subscribers){
        throw new ApiError(404, "No subscribers found for this channel")
    }
    // console.log(Subscribers)

    return res
            .status(200)
            .json(new ApiResponse(200, Subscribers, "Successfully Fetched subscribers"))
})

// controller to get all subscribed channels of user
const getSubscribedChannels = asyncHandler(async(req, res) => {
    const {userId}  = req.params
    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid subscriberId")
    }

    const channels = await Subscription.aggregate([
        {
            $match:{
                subscriber:new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup:{
                from : "users",
                localField : "channel",
                foreignField : "_id",
                as:"channels",
                pipeline:[{
                    $project:{
                        username:1,
                        fullName:1,
                        avatar:1,
                        coverImage:1
                    }
                }]
            }
        },
        {
            $project:{
                channels:1
            }
        }
    ])
     if(!channels){
        throw new ApiError(404, "User has not subscribed to any channel")
    }
    // console.log(channels)
    return res
            .status(200)
            .json(new ApiResponse(200, channels, "Successfully Fetched Channels"))
})

export {
    toggleSubscription,
    getSubscribedChannels,
    getUserChannelSubscribers
}