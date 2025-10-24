import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit : "16kb"}))
app.use(express.urlencoded({extended:true, limit : "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


// router routes
import userRouter from "./routes/user.routes.js";
app.use("/api/v1/users",userRouter)
// https://localhost:3000/api/v1/users/register  <--- url will be generated like this

import videoRouter from "./routes/video.routes.js"
app.use("/api/v1/video",videoRouter)

import subscriptionRouter from "./routes/subscription.routes.js"
app.use("/api/v1/subscription", subscriptionRouter)

import tweetRouter from "./routes/tweets.routes.js"
app.use("/api/v1/tweets", tweetRouter)

import commentRouter from "./routes/comments.routes.js"
app.use("/api/v1/comments", commentRouter)

import likeRouter from "./routes/likes.route.js"
app.use("/api/v1/likes", likeRouter)

import playlistRouter from "./routes/playlists.routes.js"
app.use("/api/v1/playlists", playlistRouter)
export {app} 