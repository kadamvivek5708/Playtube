import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { User } from "../models/users.model.js"
import {deleteFromCloudinary, uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessTokens()
        const refreshToken = user.generateRefreshTokens()
        user.refreshToken = refreshToken
        user.save({validateBeforeSave : false})
        return{accessToken,refreshToken}

    } catch (error) {
        throw new ApiError(500,"Something Went Wrong while generating refresh and access tokens")
    }
}

const registerUser = asyncHandler( async (req,res) => {

    // get user details from frontend
    const {fullName,email,username,password} = req.body
    // console.log(req.body)

    // validate - not empty
    if([fullName,email,username,password].some((field) => field?.trim() === "")) {
        throw new ApiError(400,"All fields are required")
    } 

    // check if user already exists - email, username
    const existedUser = await User.findOne({
        $or :[{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409,"User with email or username already Exist");
    }

    // check for images - avatar
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    // console.log(avatarLocalPath)
    if (!avatarLocalPath) {
        throw new ApiError(400,"Avatar Image is required")
    }

    // upload it on cloudinary,avatar
    // await uploadOnCloudinary(avatarLocalPath,() => (console.log("Avatar Uploaded Successfully")))
    // await uploadOnCloudinary(coverImageLocalPath,() => (console.log("Cover Image Uploaded Successfully")))

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!avatar) {
        throw new ApiError(400,"Avatar Image is required")
    }

    // create user object - create entry in db
    const user = await User.create({
        fullName,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username : username.toLowerCase()
    })

    // remove password and tokens from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // check for user creation
    if (!createdUser) {
        throw new ApiError(500,"Something went wrong while registering user")
    }

    // return response  
    return res.status(201).json(
        new ApiResponse(
            201,
            createdUser,
            "User Registered Succesfully"
        )
    )

})

const loginUser = asyncHandler(async (req,res) => {

    // 1.Get data
    const {email,username,password} = req.body
    if(!email && !password){
        throw new ApiError(400,"Please Enter Valid Username or Email");
    }

    // 2.is user signed up
    const user = await User.findOne({
        $or :[{ username }, { email }]
    })
    if (!user) {
        throw new ApiError(404,"User not Found !");
    }

    // 3.Password check
    // User <--- this is mongodb object
    // user <--- this is the user at that instance
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401,"Invalid User Credentials");
    }

    // 4.generate tokens
    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    const options ={
        httpOnly:true,
        secure:true
    }

    return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(
            new ApiResponse(
                200,
                {
                    loggedInUser,accessToken,refreshToken
                },
                "User Logged In Successfully"
            )
        )
})

const logoutUser = asyncHandler(async(req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined
            }
        },
        {
            new:true
        }
    )

    const options ={
        httpOnly:true,
        secure:true
    }

    return res
            .status(200)
            .clearCookie("accessToken",options)
            .clearCookie("refreshToken",options)
            .json(new ApiResponse(200,{}, "User Logged Out"))
})

const refreshAccessToken = asyncHandler(async(req,res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized access")
    }
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401,"Invalid Refresh Token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"Refresh Token is Expired")
        }
    
        const options ={
            httpOnly:true,
            secure:true
        }
        const {accessToken,newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res
            .status(200)
            .cookie("accessToken",accessToken,options)
            .cookie("refreshToken",newRefreshToken,options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken,
                        refreshToken: newRefreshToken
                    },
                    "Access Token Refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401,error?.message || "Error while generating Tokens")
    }
})

const changeCurrentPassword = asyncHandler(async(req, res)=> {
    const {oldPassword, newPassword} = req.body
    const user =await User.findById( req.user._id)
    const isPassCorrect = await user.isPasswordCorrect(oldPassword)
    if(!isPassCorrect) {
        throw new ApiError(400,"Invalid Password !")
    }
    user.password = newPassword
    await user.save({validateBeforeSave:false})

    return res
        .status(200)
        .json(
            new ApiResponse (200,{},"Password Changed Succesfully")
        )
})

const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(200,req.user,"Current user fetched Succesfully"))
})

const updateAccountDetails = asyncHandler(async(req,res) =>{
    const {fullName, email} = req.body
    if (!fullName || !email) {
        throw new ApiError(400,"All fields are required")
    }
    const user =await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName,
                email
            }
        },
        {new:true}
    ).select("-password")

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Account Details Updated Successfully")
        )
})

const updateUserAvatar = asyncHandler(async(req, res) =>{

    const avatarLocalPath = req.file?.path
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar required")
    }
    const oldUser = await User.findById(req.user?._id)
    const oldPublicId = oldUser?.avatar?.public_id;

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar?.url) {
        throw new ApiError(400,"Error while uploading avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url,
                public_id:avatar.public_id
            }
        },
        {
            new:true
        }
    ).select("-password")

    // Delete file from cloudinary
    if (oldPublicId) {
        await deleteFromCloudinary(oldPublicId);
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200,user,"Avatar Updated Succesfully")
        )
})

const updateUserCoverImage = asyncHandler(async(req, res) => {
    const coverImageLocalPath = req.file?.path
    if(!coverImageLocalPath){
        throw new ApiError(400,"Cover Image Required")
    }
    const oldUser = await User.findById(req.user?._id)
    const oldPublicId = oldUser?.avatar?.public_id;

    const coverImage = uploadOnCloudinary(coverImageLocalPath)
    if (!coverImage?.url) {
        throw new ApiError(400,"Error while uploading cover image")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url,
                public_id: avatar.public_id,
            }
        },
        {new:true}
    ).select("-password")

    if (oldPublicId) {
        await deleteFromCloudinary(oldPublicId);
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200,user,"Cover Image Updated Succesfully")
        )

})

const getUserChannelProfile = asyncHandler(async(req,res) => {
    const {username} = req.params
    if(!username?.trim()){
        throw new ApiError(400,"User is missing")
    }

    const channel = await User.aggregate([
        {
            $match:{
                username: username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField: "_id",
                foreignField : "channel",
                as : "subscribers"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField: "_id",
                foreignField : "subscriber",
                as : "subscribedTo"
            }
        },
        {
            $addFields:{
                subscribersCount:{
                    $size: "$subscribers"
                },
                channelsSubscribedTo:{
                    $size:"$subscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if:{$in : [req.user?._id, "$subscribers.subscriber"]},
                        then:true,
                        else:false
                }}
            }
        },
        {
            $project:{
                fullName:1,
                username:1,
                avatar:1,
                email:1,
                subscribersCount: 1,
                channelsSubscribedTo:1,
                isSubscribed:1
                
            }
        }
    ])

    if(!channel?.length){
        throw new ApiError(404,"Channel Does not exists")
    }
    // console.log(channel)
        // {
        //     _id: new ObjectId('68d929d483308fff692072c5'),
        //     username: 'vivek5708',
        //     email: 'kadam22@gmail.com',
        //     fullName: 'Vivek Kadam',
        //     avatar: 'http://res.cloudinary.com/ddsj4bt3u/image/upload/v1759062480/rzfjmtoemxb5rvpwzl4w.jpg',
        //     subscribersCount: 0,
        //     channelsSubscribedTo: 0,
        //     isSubscribed: false
        // }

    return res
        .status(200)
        .json(
            new ApiResponse(200,channel[0],"User data fetched succesfully")
        )
})

export  {   registerUser,
            loginUser,
            logoutUser,
            refreshAccessToken,
            changeCurrentPassword,
            getCurrentUser,
            updateAccountDetails,
            updateUserAvatar,
            updateUserCoverImage,
            getUserChannelProfile,
        }