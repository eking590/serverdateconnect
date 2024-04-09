import bcrypt from "bcrypt";
import { generatedOtp } from "../../../utils/otpGenerator.js";
import asyncHandler from 'express-async-handler';
import PasswordValidator from "password-validator";
import validator from 'validator';
import jwt from 'jsonwebtoken';
import User from '../../models/user.js';
import Otp from '../../models/otp.js';
import { PasswordCorrect, hashPassword } from "../../../utils/hashpassword.js";
import { sendOTPMail } from "../../views/emails/sendOtp.js";
import { sendEmail } from "../../views/emails/sendEmail.js";
import {uploadSingleMedia,getSingleMedia} from "../../../utils/mediaUploads.js"

class AuthController {
    constructor() {
        // constructor code here
    }

    register = async (req, res) => {
        const requiredFields = ['fullName', 'email', 'phoneNumber', 'displayname', 'gpsLocation', 'interest', 'gender', 'sexuality',  'age', 'profileImage', 'password','about','image1','image2','image3'];
   
        // Check if all required fields are present in req.body
        const missingFields = requiredFields.filter(field => !(field in req.body));
        if (missingFields.length > 0) {
            const missingFieldsString = missingFields.join(', ');
            return res.status(400).json({ error: `Missing required fields: ${missingFieldsString}` });
        }
    
        const {
            fullName, email, phoneNumber, displayname, location, gpsLocation,
            interest, gender, sexuality, age, profileImage, password, about,image1,image2,image3
        } = req.body;
    
        try {
            // Check if the user already exists
            const userExists = await User.find({ email });
    
            if (userExists.length > 0) {
                return res.status(409).send({ msg: "User Already exists!!!" });
            }
    
            const hashedPassword = await hashPassword(password);
    
            const user = new User({
                fullName, email, phoneNumber, displayname, gpsLocation,
                interest, gender, sexuality, age,about, password:hashedPassword,image1,image2,image3
            });
    
            const savedUser = await user.save();
            //save otp

            const otp = new Otp({
                userId:savedUser.id,
                otp:generatedOtp
            })
            await otp.save()
            // Upload profile image after saving the user
            await uploadSingleMedia(savedUser.id, "PROFILE_IMAGE", true, profileImage);
            await uploadSingleMedia(savedUser.id, "IMAGE_1", true, image1);
            await uploadSingleMedia(savedUser.id, "IMAGE_2", true, image2);
            await uploadSingleMedia(savedUser.id, "IMAGE_3", true, image3);
            const profilePhoto = await getSingleMedia(savedUser.id);
            const accessToken = jwt.sign({ user: { data: savedUser } }, process.env.JWT_SECRET, {
                expiresIn: '1h',
            });
            const data = { 
                savedUser,
                token:accessToken,
                profilePhoto
            }; // Consider including only necessary data in the response
    
            res.status(201).send({ data, msg: "Signup successful" });
        } catch (error) {
            // // If any process fails, delete the user record
            // if (savedUser) {
            //     await User.findByIdAndDelete(savedUser._id);
            // }
    
            console.error('There was an error', error);
            res.status(400).send(error);
        }
    };
    

    login = async (req, res) => {
        try {
            const { email, password } = req.body;

            const userExists = await User.findOne({ email });

            if (!userExists) {
                return res.status(404).send({ msg: 'User not found' });
            }

            const passwordCorrect = await PasswordCorrect(password, userExists);
            if (passwordCorrect) {
                const accessToken = jwt.sign({ user: { data: userExists } }, process.env.JWT_SECRET, {
                    expiresIn: '1h',
                });
                const profilePhoto = await getSingleMedia(userExists.id);
                delete userExists.password ;
                let data = {
                    userExists,
                    profilePhoto,
                    token:accessToken,
                }
                return res.status(200).send({
                    msg: 'Login Successful',
                    data 
                });
            }

            return res.status(401).send({ msg: 'Invalid email or password' });
        } catch (error) {
            console.error('Login error:', error);
            return res.status(500).send({ msg: 'Internal Server Error' });
        }
    };

    otpGeneration = async (req, res) => {
        const id = req.body.id;
        const otp = generatedOtp;

        const findId = await User.findById({ _id: id });

        if (!findId) {
            return res.status(404).json({ msg: `Cannot find the user with id ${id}` });
        }

        function AddMinutesToDate(date, minutes) {
            return new Date(date.getTime() + minutes * 60000);
        }

        const now = new Date();
        const expiresAt = AddMinutesToDate(now, 60);

        const NewOtp = new Otp({
            User_id: findId,
            otp: otp,
            expiresAt: expiresAt,
        });

        try {
            const otpCreated = await NewOtp.save();
            res.status(201).json({
                data: otpCreated,
                message: 'OTP sent to your email...'
            });
        } catch (error) {
            res.status(400).json(error);
        }

        sendOTPMail(findId.email, findId.fullName, otp);
    }

    verifyOtp = async (req, res) => {
        const otp = req.body.otp;
        const id = req.body.id;

        const CheckOtp = await Otp.findOne({ otp: otp });

        try {
            if (!CheckOtp) {
                return res.status(404).json({ msg: 'OTP not found!!' });
            }

            const findUserId = await User.findById({ _id: id });

            if (!findUserId) {
                return res.status(404).json({ msg: 'User not found' });
            }

            const updateUser = await User.updateMany({ isVerified: false },
                { $set: { isVerified: true } })
                .then((result) => {
                    console.log(`${result.nModified} isVerified updated!!!`);
                })
                .catch((error) => {
                    console.error('Error updating isVerified');
                });

            const email = findUserId.email;
            const fullName = findUserId.fullName;

            sendEmail(
                email,
                fullName
            );

            return res.status(200).json({
                data: updateUser,
                msg: `User with the id ${findUserId._id} verified successfully and has been sent an email!!`
            });

        } catch (error) {
            return res.json(error);
        }
    }

    getCurrentUser = async (req, res) => {
        console.log(req.user);
        return res.status(200).send(req.user);
    }

    forgetPassword = async (req, res) => {
        const email = req.body.email;
        const id = req.body.id;

        const findUserEmail = await User.findOne({ email: email });

        if (!findUserEmail) {
            return res.status(404).json({ msg: 'Email not found!!!' });
        }

        const newOtp = generatedOtp;

        function AddMinutesToDate(date, minutes) {
            return new Date(date.getTime() + minutes * 60000);
        }

        const now = new Date();
        const expiresAt = AddMinutesToDate(now, 60);

        const updateOtp = await Otp.updateMany({ User_id: id },
            { $set: { otp: newOtp, expiresAt: expiresAt, verified: false } },
            { new: true, useFindAndModify: true })
            .then((result) => {
                console.log(`${result.nModified} OTP updated!!!`);
            })
            .catch((error) => {
                console.error('Error updating OTP');
            });

        const fullName = req.user.fullName;

        sendOTPMail(
            email,
            fullName,
            newOtp
        );

        return res.status(200).json({
            data: updateOtp,
            msg: `User with the email ${email} OTP updated successfully!!`
        });
    }

    changePassword = async (req, res) => {
        const newPassword = req.body.newPassword;
        const confirmPassword = req.body.confirmPassword;
        const userId = req.user._id;

        if (newPassword !== confirmPassword) {
            return res.status(404).json({ msg: 'Password does not match' });
        }

        const hash = await hashPassword(req.body.newPassword);

        await User.updateOne(
            { _id: userId },
            { $set: { password: hash, confirmPassword: confirmPassword } },
            { new: true }
        );

        return res.json({ msg: "Password reset successfully!!!" });
    }
    unique = async (req, res) => {
        try {
            const { email, phoneNumber } = req.body;
    
            const emailExists = await User.findOne({ email });
            const phoneExists = await User.findOne({ phoneNumber });
    
            if (emailExists) {
                return res.status(409).json({
                    msg: "Email already in use",
                });
            }else if (phoneExists) {
                return res.status(409).json({
                    msg: "Phone number already in use",
                });
            }else{
                return res.json({
                    msg: "Good to go",
                });
            }       
        } catch (err) {
            console.error(err);
            return res.status(500).json({
                msg: "Internal server error",
            });
        }
    };
    uniqueDisplayName = async(req,res)=>{
        try{
            //find the display name 
            const {displayname} = req.body
            const displayNameExists =  await User.findOne({displayname})
            if(displayNameExists){
                res.status(409).json({
                    msg:'Display name already in use',
                })
            }else{
                res.status(200).send('okay')
            }
        }catch(err){
            throw err
        }
    }
}

export default AuthController;
