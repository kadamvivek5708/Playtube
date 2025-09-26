import multer from "multer";

const storage = multer.diskStorage({
    destination: function( req, file, cb){
        cb(null,"./public/temp")
    },
    filename: function(req, file, cb){
        cb(null, file.originalname);
        //  Make the file name unique so that if user upload multiple file of same name then it will not overwrite
    }
})

export const upload = multer({
    storage,
});