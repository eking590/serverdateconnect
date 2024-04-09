import express from 'express'; 
import { celebrate } from 'celebrate'; 
import  AuthController   from '../controllers/Auth/auth.js';
import { Authorization } from '../middlewares/authorization.js';
import recommendationController from '../controllers/Recomendation/index.js';


const router = express.Router(); 


const authController = new AuthController(); 


//create user 
router.post("/register", authController.register); 

//check if the email or phonenumber is taken
router.post("/unique-user",authController.unique)
//check if the display name is taken
router.post("/unique-display",authController.uniqueDisplayName)
//keep server awake
router.get('/keep-alive',(req,res)=>{
    res.send('working and awake')
})

//login user or use celebrate( { body:SecureLogin })
router.post("/login",  authController.login); 

//user forgot password 
router.post("/forget-password", Authorization, authController.forgetPassword) 


//change password 
router.post("/change-password", Authorization, authController.changePassword); 


//otp 
router.post("/otpgenerator",  authController.otpGeneration); 

//get current user 
router.get("/current-user", Authorization, authController.getCurrentUser); 

//recommendation engine 
router.get("/recommend", Authorization, recommendationController.basicRecommendation)
//to verify otp

router.post("/verifyotp",  authController.verifyOtp); 
// //get current user info 
// router.get("/api/v1/current-user",ValidateToken, CurrentUser); 



export { router as userRoute }