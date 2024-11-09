import { Request, Response } from "express";
import { upload } from "../helper/multer";
import  { IAddress,User, IUser } from "../models/user";
import BloodRequest from '../models/bloodRequest';
import { io } from '../index';

export class UserController{
    static async getUserRequestHistory(req: Request, res: Response){
        const {userId} = req.body;

        try {
            const user = await User.findOne({userId});
            if(!user){
                return res.status(404).json({success: false, message: "User not found"});
            }
            const requests = await BloodRequest.find({userId});
            return res.status(200).json({success: true, requests});
        } catch (error: any) {
            return res.status(500).json({success: false, message: "Error creating blood request", error: error.message });
        }
    }
}