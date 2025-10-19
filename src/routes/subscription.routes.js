import { 
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
 } from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";

const router = Router();

router.route("/toggle-subscription/:channelId").post(verifyJWT,toggleSubscription)
router.route("/get-user-channel-subscribers/:channelId").get(verifyJWT,getUserChannelSubscribers)
router.route("/get-subscribed-channel/:userId").get(verifyJWT,getSubscribedChannels)


export default router