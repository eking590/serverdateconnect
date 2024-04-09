import express from 'express'; 
import { celebrate } from 'celebrate'; 
import  LikeController from '../controllers/Likes/like.js'
import { Authorization } from '../middlewares/authorization.js';


const router = express.Router(); 


const likeController = new LikeController(); 






//matching
// sending a user like
router.patch("/send-like/:id", Authorization, likeController.sendRequest);
//accepting a user like
router.patch("/accept-like/:id", Authorization, likeController.accept);
//rejecting a user like
router.patch("/reject-like/:id", Authorization, likeController.reject);

export { router as likeRoute }