import express from 'express'; 
import { celebrate } from 'celebrate'; 

import { Authorization } from '../middlewares/authorization.js';
import ProfileController from '../controllers/profile/profile.js';


const router = express.Router(); 




const profileController = new ProfileController(); 






//profile 
router.get('/user-profile', Authorization, profileController.getUserprofile)

//delete profile 
router.delete('/delete-user-profile', Authorization, profileController.deleteUserprofile)

//update a profile 
router.patch('/update-user-profile', Authorization, profileController.updateUserprofile)

export { router as profileRoute }