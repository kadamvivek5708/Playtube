import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";


const uploadVideo = asyncHandler(async(req, res) => {
    let videoPublicId
    let thumbnailPublicId
    try {
        // 1.take video and thumbnail and validate
        const videoLocalPath = req.files?.videoFile?.[0]?.path
        if (!videoLocalPath) {
            throw new ApiError(400,"Video File is required")
        }
        
        const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path
        if (!thumbnailLocalPath) {
            throw new ApiError(400,"Thumbnail Image is required")
        }
        
        // 2.upload it on cloudinary
        const videoFile = await uploadOnCloudinary(videoLocalPath)
        videoPublicId = videoFile?.public_id

        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
        thumbnailPublicId = thumbnail?.public_id

        if (!videoFile || !thumbnail) {
            throw new ApiError(400,"Video and Thumbnail must required")
        }

        // 3.take title, description from user
        const {title, description, duration} = req.body

        if([title,description].some((field) => field?.trim() === "")) {
            throw new ApiError(400,"All fields are required")
        } 
        if(!duration || duration === 0){
            throw new ApiError(400,"Video duration is required")
        }

        // 4.create db object
        const video = await Video.create({
            title,
            description,
            duration,
            thumbnail:thumbnail?.url,
            videoFile:videoFile?.url,
            videoPublicId,
            thumbnailPublicId
        })

        // 5.check for db object creation
        if(!video){
            throw new ApiError(500,"Something went wrong while adding video and thumbnail")
        }
        // console.log(video)

        // 6.response
        return res
            .status(200)
            .json(
                new ApiResponse(200, video, "Video Uploaded Successfully")
            )

    } catch (error) {
        
        if(videoPublicId){
            await deleteFromCloudinary(videoPublicId, "video")
        }
        
        if(thumbnailPublicId){
            await deleteFromCloudinary(thumbnailPublicId, "image")
        }

        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, `An unexpected error occurred while uploading the video: ${error.message}`);

    }
})

const deleteVideo = asyncHandler(async(req, res) => {
    const {videoId} = req.params
    const video = await Video.findById(videoId)

    if(!video) throw new ApiError(404,"Video not found")

    const videoPublicId = video.videoPublicId;
    const thumbnailPublicId = video.thumbnailPublicId;
    
    if(videoPublicId) await deleteFromCloudinary(videoPublicId,"video");
    if(thumbnailPublicId) await deleteFromCloudinary(thumbnailPublicId,"image");

    await Video.findByIdAndDelete(videoId)

    return res  
        .status(200)
        .json(new ApiResponse(200,{},"Video deleted Succesfully"))
})

const viewVideo = asyncHandler(async(req, res) => {

})

const editThumbnail = asyncHandler(async(req, res) => {

})

const editInfo = asyncHandler(async(req, res)=> {

})

export {uploadVideo,
        deleteVideo,
        viewVideo,
        editThumbnail,
        editInfo
    }   