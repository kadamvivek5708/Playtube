import { createTweet, updateTweet, deleteTweet, getUserTweets} from "../controllers/tweets.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";

const router = Router();

router.route("/create-tweet").post(verifyJWT, createTweet)
router.route("/update-tweet/:tweetId").patch(verifyJWT,updateTweet)
router.route("/delete-tweet/:tweetId").delete(verifyJWT,deleteTweet)
router.route("/get-user-tweet/:tweetId").get(verifyJWT,getUserTweets)


export default router