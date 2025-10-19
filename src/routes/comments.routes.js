
import { addComment, 
        updateComment, 
        deleteComment, 
        getVideoComments } from "../controllers/comments.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";

const router = Router()

router.route("/addComment/:videoId").post(verifyJWT, addComment)
router.route("/updateComment/:videoId/:commentId").patch(verifyJWT, updateComment)
router.route("/deleteComment/:commentId").delete(verifyJWT, deleteComment)
router.route("/getComments/:videoId").get(verifyJWT, getVideoComments)

export default router
