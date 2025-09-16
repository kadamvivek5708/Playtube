import mongoose ,{Schema} from "mongoose";

const UserSchema = new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
    },
    fullName:{
        type:String,
        required:true,
        trim:true,
        index:true
    },
    avatar:{
        // cloudinary URL
        type:String,
        required:true,
    },
    coverImage:{
        type:String
    },
    password:{
        type:String,
        required:[true,"Password Is required"]
    },
    watchHistory:[
        {
            type: Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    refreshTokens:{
        type:String,
    }
},{timestamps:true})

export const User = mongoose.model("User", UserSchema)