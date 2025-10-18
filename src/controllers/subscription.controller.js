import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from "../models/subscription.model.js"


const toggleSubscription  = asyncHandler(async(req, res)=> {
    const {channelId} = req.params
    const subscriberId = req?.user?._id

    // 1.find and delete if present
    // TODO: increment subscribe count for channel
    const unSubscribe = await Subscription.findOneAndDelete({
        subscriber : subscriberId,
        channel : channelId,
    })
    console.log(unSubscribe)

    // 2.if not then subscribe
    let subscription
    if(!unSubscribe){
        subscription = await Subscription.create({
            channel:channelId,
            subscriber:subscriberId
        })
    }
    
    // 3.return response
    return res
        .status(200)
        .json(new ApiResponse(200,subscription || unSubscribe , subscription ? "Subscribed" : "Unsubscribed"))
})

const getUserChannelSubscribers = asyncHandler(async(req, res)=> {
    const {channelId} = req.params

    const Subscribers = await Subscription.find({
        channel:channelId
    })

    return res
            .status(200)
            .json(new ApiResponse(200, Subscribers, "Successfully Fetched subscribers"))
})

const getSubscribedChannels = asyncHandler(async(req, res) => {
    const userId  = req.user?._id

    const Channels = await Subscription.find({
        subscriber:userId
    })
    
    return res
            .status(200)
            .json(new ApiResponse(200, Channels, "Successfully Fetched Channels"))
})

export {
    toggleSubscription,
    getSubscribedChannels,
    getUserChannelSubscribers
}