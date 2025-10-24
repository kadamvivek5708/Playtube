import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {    addVideoToPlaylist,
            createPlaylist, 
            deletePlaylist, 
            getPlaylistById, 
            getUserPlaylists,
            removeVideoFromPlaylist,
            updatePlaylist,
        } from "../controllers/playlists.controller.js";

const router = Router();


router.route("/create-playlist").post(verifyJWT, createPlaylist)
router.route("/get-user-playlist/:userId").get(verifyJWT, getUserPlaylists)
router.route("/get-playlist/:playlistId").get(verifyJWT, getPlaylistById)
router.route("/add-video/:playlistId/:videoId").patch(verifyJWT, addVideoToPlaylist)
router.route("/delete-video/:playlistId/:videoId").patch(verifyJWT, removeVideoFromPlaylist)
router.route("/delete-playlist/:playlistId").delete(verifyJWT, deletePlaylist)
router.route("/update-playlist/:playlistId").patch(verifyJWT, updatePlaylist)


export default router