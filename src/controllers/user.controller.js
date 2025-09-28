import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { User } from "../models/users.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

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
    const avatarLocalPath = req.files?.avatar[0]?.path;
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

export  {registerUser}