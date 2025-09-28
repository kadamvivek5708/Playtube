import {v2 as cloudinary} from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
        try {
            if(!localFilePath) return null;
            //upload file on cloudinary
            const response = await cloudinary.uploader.upload(localFilePath,{
                resource_type: 'auto'
            })

            // console.log("File has been Uploaded Successfully !",response.url);
            fs.unlinkSync(localFilePath);
            return response;
            
        //   console.log(response);
        //   response : {
        //   asset_id: '5b4b7b3b7c09ec81bf5ee09160a76c60',
        //   public_id: 'rzfjmtoemxb5rvpwzl4w',
        //   version: 1759062480,
        //   version_id: '3112bc8575ea293a53e0792cd6c99424',
        //   signature: 'd4bc8bd33696641d3270a133d39d34874b4e6811',
        //   width: 687,
        //   height: 1200,
        //   format: 'jpg',
        //   resource_type: 'image',
        //   created_at: '2025-09-28T12:28:00Z',
        //   tags: [],
        //   bytes: 121853,
        //   type: 'upload',
        //   etag: '5b684c19e1162dd2f26326c7ea33e15a',
        //   placeholder: false,
        //   url: 'http://res.cloudinary.com/ddsj4bt3u/image/upload/v1759062480/rzfjmtoemxb5rvpwzl4w.jpg',
        //   secure_url: 'https://res.cloudinary.com/ddsj4bt3u/image/upload/v1759062480/rzfjmtoemxb5rvpwzl4w.jpg',
        //   asset_folder: '',
        //   display_name: 'rzfjmtoemxb5rvpwzl4w',
        //   original_filename: 'avatar',
        //   api_key: '393326621978116'
        // }
        // {
        //   asset_id: 'f0c789b4418b704ccbad440cf0667f7f',
        //   public_id: 'a9bwbpp2dzpp9f9evqny',
        //   version: 1759062483,
        //   version_id: '6c1e515a4d571dc3930a76f1d22d7a60',
        //   signature: 'e495aeed95fb66948922742ced6c27d8422d1edf',
        //   width: 1024,
        //   height: 1024,
        //   format: 'webp',
        //   resource_type: 'image',
        //   created_at: '2025-09-28T12:28:03Z',
        //   tags: [],
        //   pages: 1,
        //   bytes: 373500,
        //   type: 'upload',
        //   etag: '7a77272e191d0a90e2a0f02f1e587c90',
        //   placeholder: false,
        //   url: 'http://res.cloudinary.com/ddsj4bt3u/image/upload/v1759062483/a9bwbpp2dzpp9f9evqny.webp',
        //   secure_url: 'https://res.cloudinary.com/ddsj4bt3u/image/upload/v1759062483/a9bwbpp2dzpp9f9evqny.webp',
        //   asset_folder: '',
        //   display_name: 'a9bwbpp2dzpp9f9evqny',
        //   original_filename: 'Profile',
        //   api_key: '393326621978116'
        // }


        } catch (error) {
            // remove the locally stored temp file as upload operation got failed
            fs.unlinkSync(localFilePath)
            return null;
        }
}

export {uploadOnCloudinary}