import  User from '../src/models/user.js';
import Media from '../src/models/media.js';

export const uploadSingleMedia = async (userId, mediaType = "PROFILE_IMAGE", isNew = false, link) => {
    try {
        // Input validation
        if (!userId || !link) {
            throw new Error('Please pass all arguments to uploadSingleMedia');
        }

        if(!isNew){
            // Check if user exists
        const userExists = await User.findOne({ id: userId });
        if (!userExists) {
            throw new Error(`User with id ${userId} does not exist`);
        }
        }

        // Validate mediaType
        const validMediaTypes = ["PROFILE_IMAGE","IMAGE_1","IMAGE_2","IMAGE_3" /* add other valid types here */];
        if (!validMediaTypes.includes(mediaType)) {
            throw new Error(`Invalid mediaType: ${mediaType}`);
        }

        // Check if the user has uploaded that document, then update it if needed
        const existingMedia = await Media.findOne({ userId: userId, mediaType });
        if (existingMedia) {
            existingMedia.link = link;
            await existingMedia.save();
        } else {
            // If the media doesn't exist, create a new one
            await Media.create({
                link,
                mediaType,
                userId: userId,
            });
        }

        // Provide feedback or return message
        return {
            success: true,
            message: "File uploaded successfully",
        };
    } catch (error) {
        console.error('An error occurred while uploading file', error);
        throw error; // Rethrow the error for the caller to handle
    }
};

export const getSingleMedia = async(userId, mediaType = "PROFILE_IMAGE")=>{
    //check if file exists
    try{
        const fileExists = await Media.findOne({
            userId,            
            mediaType

        })
        if(fileExists) {
            return fileExists?.link
        }
        return null
    }catch(error){
        console.error(error)
        throw error
    }
}