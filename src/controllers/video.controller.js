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
            throw new ApiError(500,"Error while uploading on cloudinary")
        }

        // 3.take title, description from user
        const {title, description, duration, isPublished} = req.body

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
            owner:req.user?._id,
            isPublished,
            thumbnail:thumbnail?.url,
            videoFile:videoFile?.url,
            videoPublicId,
            thumbnailPublicId
        })

        // 5.check for db object creation
        const createdVideo = await Video.findById(video?._id);

        if(!createdVideo){
            throw new ApiError(500,"Something went wrong while adding video and thumbnail")
        }
        // console.log(createdVideo)

        // 6.response
        return res
            .status(200)
            .json(
                new ApiResponse(200, createdVideo, "Video Uploaded Successfully")
            )

    } catch (error) {
        // if error occured then delete files from cloudinary
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

    // if the logged in userId equals to video ownerId then only delete
    const video = await Video.findOneAndDelete({
        _id:videoId,
        owner:req.user?._id
    })
    if(!video) throw new ApiError(404,"Video not found or you don't have permission")

    // get video and thumbnail id from db
    const videoPublicId = video.videoPublicId;
    const thumbnailPublicId = video.thumbnailPublicId;

    // delete from cloudinary
    if(videoPublicId) await deleteFromCloudinary(videoPublicId,"video");
    if(thumbnailPublicId) await deleteFromCloudinary(thumbnailPublicId,"image");

    return res  
        .status(200)
        .json(new ApiResponse(200,{},"Video deleted Succesfully"))
})

const viewVideo = asyncHandler(async(req, res) => {
    // console.log(req)
    const {videoId} = req.params
    const video = await Video.findById(videoId)
    if(!video) throw new ApiError(404,"Video not found")

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video Fetched Successfully"))
})

const editThumbnail = asyncHandler(async(req, res) => {

    // 1.check if user is owner
    const {videoId} = req.params
    const video = await Video.findOne({
        _id:videoId,
        owner:req.user?._id
    })
    if(!video) throw new ApiError(404,"Video not found or you Don't have permission")

    // 2.take thumbnail 
    const newThumbnail = req.file?.path
    if (!newThumbnail) {
            throw new ApiError(400,"Thumbnail Image is required")
        }

    // 3.upload thumbnail on cloudinary
    const uploaded = await uploadOnCloudinary(newThumbnail)
    if (!uploaded) {
        throw new ApiError(500,"Error while uploading on cloudinary")
    }

    // 4.update db thumbnail url and public id
    const updatedvideo = await Video.findByIdAndUpdate(
            videoId,
            {
                $set:{
                    thumbnail:uploaded?.url,
                    thumbnailPublicId : uploaded?.public_id
                }
            },
            {
                new:true
            }
    )
    if(!updatedvideo) throw new ApiError(500,"Error while updating DB")

    // 4.delete old thumbnail from cloudinary
    if(video?.thumbnailPublicId) await deleteFromCloudinary(video?.thumbnailPublicId,"image");

    // 6.response
    return res
        .status(200)
        .json( new ApiResponse(200,updatedvideo,"Thumbnail Edited"))
})

const editFields = asyncHandler(async(req, res)=> {
 
    const {videoId} = req.params
    const video = await Video.findOne({
        _id:videoId,
        owner:req.user?._id
    })
    if(!video) throw new ApiError(404,"Video not found ")

    // take fields to update
    const {title, description, duration, isPublished} = req.body;

    const fieldsToUpdate = {};
    if (title !== undefined) fieldsToUpdate.title = title;
    if (description !== undefined) fieldsToUpdate.description = description;
    if (duration !== undefined) fieldsToUpdate.duration = duration;
    if (isPublished !== undefined) fieldsToUpdate.isPublished = isPublished; 


    const updatedFields = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: fieldsToUpdate
        },
        { new: true }
    )
    if(!updatedFields) throw new ApiError(500,"Something went wrong while updating DB")

    return res
            .status(200)
            .json(new ApiResponse(200, updatedFields, "Field updated succesfully !!!"))

})

export {uploadVideo,
        deleteVideo,
        viewVideo,
        editThumbnail,
        editFields
    }   