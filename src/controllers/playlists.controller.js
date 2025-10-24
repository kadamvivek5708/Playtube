import mongoose,{isValidObjectId} from "mongoose"
import { Playlist } from "../models/playlists.model.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    const userId = req.user?._id
    if(!name.trim()){
        throw new ApiError(401, "valid name required")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: userId
    })
    if(!playlist){
        throw new ApiError(500, "Internal Error occured while creating db instance")
    }
    return res
            .status(201)
            .json(new ApiResponse(201, playlist, "Playlist created successfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    //get user playlists
    const {userId} = req.params
    if(!isValidObjectId(userId)){
        throw new ApiError(401,"valid userId required")
    }
    
    const userPlaylist = await Playlist.find({
        owner:userId
    })
    if(!userPlaylist){
        throw new ApiError(404,"Playlist not found")
    }

    return res
            .status(201)
            .json(new ApiResponse(201,userPlaylist,"User Playlist Fetched Successfully"))

})

const getPlaylistById = asyncHandler(async (req, res) => {
    //get playlist by id
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId)){
        throw new ApiError(401,"valid playlistId required")
    }
    
    const userPlaylist = await Playlist.aggregate([
        {
            $match:{
                    _id: new mongoose.Types.ObjectId(playlistId)
                }
        },
        {
            $lookup:{
                from:"videos",
                localField:"videos",
                foreignField:"_id",
                as:"playlistVideos",
                pipeline:[{
                    $project:{
                        thumbnail:1,
                        title:1,
                        duration:1,
                        owner:1
                    }
                }]
            }
        },
        {
            $project:{
                name:1,
                description:1,
                playlistVideos:1
            }
        }
    ])
    if(!userPlaylist){
        throw new ApiError(404,"Playlist not found")
    }
    return res
            .status(201)
            .json(new ApiResponse(201, userPlaylist, "User Playlist Fetched Successfully"))

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(401, "playlistId and videoId must be valid")
    }

    const updatedPlaylist = await Playlist.findOneAndUpdate(
        {
            _id:playlistId
        },
        {
            $addToSet: { videos: videoId }
        },
        {
            new:true
        }
    )
    // console.log(updatedPlaylist)
    if(!updatedPlaylist){
        throw new ApiError(404,"Playlist not found")
    }

    return res
            .status(201)
            .json(new ApiResponse(201,updatedPlaylist, "Video added to playlist"))
    
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    // remove video from playlist
    const {playlistId, videoId} = req.params
    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(401, "playlistId and videoId must be valid")
    }

    const updatedPlaylist = await Playlist.findOneAndUpdate(
        {
            _id:playlistId
        },
        {
            $pull: { videos: videoId }
        },
        {
            new:true
        }
    )
    if(!updatedPlaylist){
        throw new ApiError(404,"Playlist not found")
    }

    return res
            .status(201)
            .json(new ApiResponse(201,updatedPlaylist, "Video deleted from playlist"))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId)){
        throw new ApiError(401, "playlistId must be valid")
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)
    if(!deletedPlaylist){
        throw new ApiError(404,"Playlist not found")
    }

    return res
            .status(201)
            .json(new ApiResponse(201,deletedPlaylist, "Playlist Deleted Successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    //update playlist
    const {playlistId} = req.params
    const {name, description} = req.body

    if(!isValidObjectId(playlistId)){
        throw new ApiError(401, "playlistId must be valid")
    }
    if(!name.trim() || !description.trim()){
        throw new ApiError(401, "must required a field to update")
    }

    const updatedPlaylist = await Playlist.findOneAndUpdate(
        {
            _id:playlistId
        },
        {
            name,
            description
        },
        {
            new:true
        }
    )
    if(!updatedPlaylist){
        throw new ApiError(404,"Playlist not found")
    }
    return res
            .status(201)
            .json(new ApiResponse(201,updatedPlaylist, "Playlist Updated Successfully"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}