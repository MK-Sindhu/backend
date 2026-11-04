import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadToCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import fs from "fs";

const removeTempFiles = (files) => {
    Object.values(files ?? {}).flat().forEach((file) => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path)
    })
    }


const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty, etc 
    // check if user already exist: username, email
    // check for images
    // check for avatar
    // upload them to cloudinary, avatar
    // create a user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const { fullName, email, username, password } = req.body ?? {}
    console.log("email: ", email);

    // if (fullName === "") {
    //     throw new ApiError(400, "Full name is required")
    // } we have to do if separately for all but 

    if (
        [fullName, email, username, password].some((field) =>
        !field?.trim())
    ) {
        removeTempFiles(req.files)
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }] 
    })
    if (existedUser) {
        removeTempFiles(req.files)
        throw new ApiError(409, "User with name or email already exist")
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        removeTempFiles(req.files)
        throw new ApiError(400, "Avatar file is required")
    }
    
    const avatar = await uploadToCloudinary(avatarLocalPath)
    const coverImage = await uploadToCloudinary(coverImageLocalPath)

    if (!avatar) {
        removeTempFiles(req.files)
        throw new ApiError(400, "Avatar file required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        removeTempFiles(req.files)
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully",)
    )
})

export {registerUser} 