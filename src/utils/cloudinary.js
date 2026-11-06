import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has been uploaded successfully
    // console.log("File is uploaded on cloudinary ", response.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
    return null;
  }
};

// delete an asset from cloudinary using the url we stored in the db
// e.g. http://res.cloudinary.com/<cloud>/image/upload/v1793780445/abc123.webp
const deleteFromCloudinary = async (fileUrl) => {
  try {
    if (!fileUrl) return null;

    // resource type is the segment before "/upload/" (image | video | raw)
    const match = fileUrl.match(
      /\/(image|video|raw)\/upload\/(?:v\d+\/)?(.+?)(?:\.[^./]+)?$/
    );
    if (!match) return null;

    const [, resourceType, publicId] = match;

    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return response; // { result: "ok" } when deleted, "not found" otherwise
  } catch (error) {
    console.log("Cloudinary delete failed: ", error);
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
