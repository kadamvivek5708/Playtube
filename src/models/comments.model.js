import mongoose from "mongoose"; 
import { Schema } from "mongoose";

const CommentsSchema = new Schema({
    content:{
        type: String,
        required: true
    },
    videos:{
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref: "User"
    }
},{timestamps: true})

export const Comments = mongoose.model("Comment",CommentsSchema)