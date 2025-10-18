import { Router } from "express";

import {    uploadVideo,
            deleteVideo,
            getVideoById,
            updateVideo,
            getAllVideos,
            tooglePublishStatus,
            getAllPublicVideos,
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
router.route("/delete-video/:videoId").delete(verifyJWT,deleteVideo)
router.route("/get-video/:videoId").get(verifyJWT,getVideoById)
router.route("/update-video/:videoId").patch(
    verifyJWT,
    upload.single("thumbnail"),
    updateVideo
)
router.route("/get-all-videos").get(verifyJWT, getAllVideos)
router.route("/toogle-publish-status/:videoId").put(verifyJWT, tooglePublishStatus)
router.route("/get-all-public-videos/:userId").get(verifyJWT, getAllPublicVideos)


export default router