import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";

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
        const {title, description} = req.body

        if([title,description].some((field) => !field || field?.trim() === "")) {
            throw new ApiError(400,"All fields are required")
        } 
        

        // 4.create db object
        const video = await Video.create({
            title,
            description,
            owner:req.user?._id,
            thumbnail:thumbnail?.url,
            videoFile:videoFile?.url,
            duration:videoFile?.duration,
            videoPublicId,
            thumbnailPublicId,
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

const getVideoById = asyncHandler(async(req, res) => {
    // console.log(req)
    const {videoId} = req.params
    const video = await Video.findById(videoId)
    if(!video) throw new ApiError(404,"Video not found")

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video Fetched Successfully"))
})

const updateVideo = asyncHandler(async(req,res) => {
    const {videoId} = req.params

    // 1.check if user is owner
    const video = await Video.findOne({
        _id:videoId,
        owner:req.user?._id
    })
    if(!video) throw new ApiError(404,"Video not found or you don't have permissions")

    // 2.take fields to update
    const newThumbnail = req.file?.path
    const {title, description} = req.body

    let uploadedThumbnail = null;
    try {
        // 3.if thumbnail is present upload it on cloudinary
        if(newThumbnail){
            uploadedThumbnail = await uploadOnCloudinary(newThumbnail)
            if (!uploadedThumbnail) {
                throw new ApiError(500,"Error while uploading on cloudinary")
            }       
        }
    
        // 4.update db 
        const fieldsToUpdate = {};
        if (title !== undefined) fieldsToUpdate.title = title;
        if (description !== undefined) fieldsToUpdate.description = description;
        if (uploadedThumbnail) {
            fieldsToUpdate.thumbnail = uploadedThumbnail?.url
            fieldsToUpdate.thumbnailPublicId = uploadedThumbnail?.public_id
        }
    
        const updatedFields = await Video.findByIdAndUpdate(
            videoId,
            {
                $set: fieldsToUpdate
            },
            { new: true }
        )
        if(!updatedFields) throw new ApiError(500,"Something went wrong while updating DB")
    
        // 5.If thumbnail is updated then delete old from cloudinary
        if(newThumbnail && video?.thumbnailPublicId) await deleteFromCloudinary(video?.thumbnailPublicId,"image");
    
        // 6.response
        return res
            .status(200)
            .json(new ApiResponse(200, updatedFields, "Fields updated succesfully !!!"))
    
    } catch (error) {
        if (uploadedThumbnail?.public_id) {
            await deleteFromCloudinary(uploadedThumbnail.public_id, "image");
        }
        throw error;
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

const getAllPublicVideos = asyncHandler(async(req,res) => {
    // 1.take userId to find all videos of that particular user
    const {userId} = req.params

    // 2.compare this id with the owner in Video db
    const publicVideos = await Video.find(
        {
            isPublished:true,
            owner:userId
        })

    return res  
            .status(200)
            .json(new ApiResponse(200,publicVideos,"Okkkk"))
})

const getAllVideos = asyncHandler(async(req,res)=> {
    const { page = 1, limit = 10, isPublished, sortBy, sortType, userId } = req.query
    const isPublishedBool = isPublished === 'true';
    const sorting = sortType === "asc" ? 1 : -1;

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
    };
    
    const aggregationPipeline = Video.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(userId),
                isPublished:isPublishedBool,
            }
        },
        {
            $lookup:{
                from:"users",
                localField: "owner",
                foreignField: "_id",
                as:"ownerDetails",
                pipeline:[{
                    $project:{
                        username:1,
                        avatar:1
                    }
                }]
            }
        },
        {
            $addFields: {
                owner: { $first: "$ownerDetails" }
            }
        },
        {
            $project:{
                _id: 1,
                title: 1,
                thumbnail: 1, 
                videoFile: 1, 
                duration: 1,
                views: 1,
                createdAt: 1,
                owner: 1
            }
        },
        {
            $sort:{
                [sortBy || "createdAt"]: sorting
            }
        },
    ]);  
    // console.log(aggregationPipeline)
    
    const videos = await Video.aggregatePaginate(aggregationPipeline,options);
    // console.log(videos)
    if (!videos || videos.docs.length === 0) {
        return res
            .status(200)
            .json(new ApiResponse(200, [], "No videos found"));
    }

    return res  
            .status(200)
            .json(new ApiResponse(200,videos,"Videos Fetched Succesfuly"))
})

const tooglePublishStatus = asyncHandler(async(req,res) => {
    const {videoId} = req.params
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        [
            {$set:{isPublished : {$not:"$isPublished"}}}
        ]
    )
    return res  
        .status(200)
        .json(new ApiResponse(200,updatedVideo,"Toogle Status"))
})

export {uploadVideo,
        deleteVideo,
        getVideoById,
        updateVideo,
        getAllVideos,
        tooglePublishStatus,
        getAllPublicVideos,
    }   