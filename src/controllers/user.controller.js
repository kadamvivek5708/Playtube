import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { User } from "../models/users.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

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

const loginUser = asyncHandler(async (req,res) => {

    // 1.Get data
    const {email,username,password} = req.body
    if(!email || !password){
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
})

export  {registerUser,loginUser}