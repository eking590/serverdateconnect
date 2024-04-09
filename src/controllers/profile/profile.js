import asyncHandler from 'express-async-handler'; 
import User from '../../models/user.js';

class ProfileController {
    //get user profile details 
    getUserprofile = asyncHandler(async( req, res) => {
        // const userId = req.body.id; 
        const userId = req.user._id; 
        //compare the id passed to the existing ids in the database 

        //use projection to retrieve only necessary information 
        const currentUser = await User.findById(userId).select( "fullName email phoneNumber displayname about interest isVerified gender sexuality intention category age").lean().exec(); 

        if (!currentUser) {

            res.status(404);
            throw new Error('User not found!!')
            
        } 

        return res.json(currentUser); 
    }) 


     //delete user profile 
     deleteUserprofile = asyncHandler(async(req, res) => {
        const UserId = req.user._id; 
        //find and delete the user 
        const deletedUser = await User.findByIdAndDelete(UserId).exec(); 
        if (!deletedUser) {
            res.status(404); 
            throw new Error('User not found')
        } else if (deletedUser === " " || deletedUser === false ){ 
            res.status(400); 
            throw new Error('some error occurred while deleting profile!!!'); 
        } else {
            
            return res.json({msg:`${req.user.displayname } account has been deleted!!`})

        }
   
    })


    //updated profile 

    updateUserprofile = asyncHandler(async(req, res) => { 
        const UserId = req.user._id; 
        const {
            phoneNumber,
            about,
            interest,
            gender,
            sexuality,
            age
        } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            UserId,{ phoneNumber,about,interest,gender,sexuality,age
            },
            { new: true }
        );
        if (!updatedUser) {
            res.status(404);
            throw new Error('User not found');
        }
        return res.json(updatedUser);
    })






}




export default ProfileController; 