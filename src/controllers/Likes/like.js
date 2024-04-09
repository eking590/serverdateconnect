import asyncHandler from 'express-async-handler'; 
import User from '../../models/user.js';

//use class here 
class  LikeController { 
    accept =  asyncHandler(async(req, res) => {
        const { id } = req.params; 
        const userId = req.user._id; 

      //find the myself and check if the user sent me a request. then accept the request and remove the user from the pending array
      const acceptUser = await User.findOneAndUpdate(
        { _id: userId, pendingRequest: id }, 
        {$push : { acceptedRequest: id }, $pull: { pendingRequest: id }},// Add the id to the acceptedRequest array and remove it from the pendingRequest array
        {new: true} //return the updated document
        ); 
        if (acceptUser) {
            return res.json({msg:'Request successfully accepted'})
        } else { 
            res.status(404)
            throw new Error('user not found or request already accepted!!') 
        }  
       
})
   
    //reject controller 
    reject = asyncHandler(async(req, res)=>{
        const { id } = req.params; 
        const userId = req.user._id; 

        const rejectUser = await User.findOneAndUpdate( 
            { _id: userId, pendingRequest: id}, 
            { $push : {rejectedRequest: id}, $pull: {pendingRequest: id}}, 
            {new: true} ); 

            if (rejectUser) {
                return res.json({msg:'Request successfully reject'})
            } else { 
                res.status(404)
                throw new Error('Oop!! user not found or request already rejected!!') 
            }  

    })



 

    //sendRequest  controller 

    sendRequest = asyncHandler(async(req, res)=>{
        const { id } = req.params; 
        const userId = req.user._id; 

        // find the user and check if i have send a request or my request has been reviewed before
        const addUser = await User.findOneAndUpdate(
            {_id: id, 
            pendingRequest: { $ne: userId }, 
            acceptedRequest: { $ne: userId },}, // Find the user by ID and ensure the userId is not already in the pendingRequest array
            {$push: { pendingRequest: userId }}, // Add the userId to the pendingRequest array
            {new: true} //return the updated document 
        )

        if (addUser) {
            return res.json({msg:'Request successfully Sent!!'})
        } else { 
            res.status(404)
            throw new Error('Oop!! user not found or request already send!!') 
        }  


    })
    


}  


export default LikeController; 