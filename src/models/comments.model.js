import mongoose,{ Schema } from "mongoose"; 
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

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

CommentsSchema.plugin(mongooseAggregatePaginate)

export const Comments = mongoose.model("Comment",CommentsSchema)