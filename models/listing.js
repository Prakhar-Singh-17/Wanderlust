import mongoose, { mongo } from "mongoose";

const listingSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true,
    },
    description : {
        type : String,
        required : true,
    },
    image : {
        url : String,
        filename : String,
    },
    price : {
        type : Number,
        min : 100,
    },
    location : {
        type : String,
        required : true,
    },
    country : {
        type : String,
        required : true,
    },
    reviews : [{
        type : mongoose.Schema.ObjectId,
        ref : "Review"
    }],
    owner : {
        type : mongoose.Schema.ObjectId,
        ref : "User"
    }
});


let Listing = mongoose.model("Listing",listingSchema);

export default Listing;