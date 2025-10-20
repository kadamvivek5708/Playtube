import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {toggleVideoLike,
        toggleCommentLike,
        toggleTweetLike,
        getLikedVideos, 
        } from "../controllers/likes.controller.js";


const router = Router()

router.route("/likeVideo/:videoId").post(verifyJWT, toggleVideoLike)
router.route("/likeComment/:commentId").post(verifyJWT, toggleCommentLike)
router.route("/likeTweet/:tweetId").post(verifyJWT, toggleTweetLike)
router.route("/getLikedVideos").get(verifyJWT, getLikedVideos)

export default router

