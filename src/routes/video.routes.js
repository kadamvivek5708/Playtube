import { Router } from "express";

import {    deleteVideo, 
            editFields, 
            editThumbnail, 
            uploadVideo, 
            viewVideo 
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
router.route("/view/:videoId").get(verifyJWT,viewVideo)
router.route("/edit-thumbnail/:videoId").post(
    verifyJWT,
    upload.single("thumbnail"),
    editThumbnail
)
router.route("/edit-fields/:videoId").patch(verifyJWT,editFields)


export default router