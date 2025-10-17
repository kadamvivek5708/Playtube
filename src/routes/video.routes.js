import { Router } from "express";

import {    deleteVideo, 
            updateVideo, 
            tooglePublishStatus, 
            uploadVideo, 
            getVideoById, 
            getAllPublicVideos
        } from "../controllers/video.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.route("/upload-video").post(verifyJWT, upload.fields([
    {
        name:"videoFile",
        maxCount:1
    },
    {
        name:"thumbnail",
        maxCount:1
    }
]), uploadVideo)

router.route("/videos/:videoId").delete(verifyJWT,deleteVideo)
router.route("/view/:videoId").get(verifyJWT,getVideoById)
router.route("/edit-video/:videoId").patch(
    verifyJWT,
    upload.single("thumbnail"),
    updateVideo
)

router.route("/toogle-publish-status/:videoId").put(verifyJWT,tooglePublishStatus)
router.route("/getAllPublicVideos/:userId").get(verifyJWT,getAllPublicVideos)


export default router