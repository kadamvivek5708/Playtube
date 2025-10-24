import mongoose,{ Schema } from "mongoose"; 

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const PlaylistSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    description:{
        type: String
    },
    videos:[
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    owner:{
        type: Schema.Types.ObjectId,
        ref: "User"
    }

},{timestamps:true})

PlaylistSchema.plugin(mongooseAggregatePaginate);

export const Playlist = mongoose.model("Playlist", PlaylistSchema)