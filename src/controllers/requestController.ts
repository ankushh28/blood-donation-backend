import { Request, Response } from "express";
import { upload } from "../helper/multer";
import { IAddress, IUser, User } from "../models/user";
import BloodRequest from '../models/bloodRequest';
import { io } from '../index';
import { generateOTP } from "../utils/generateOtp";
import Otp from "../models/otp";
import { sendConfirmation } from "../utils/sendSms";
import Notification from '../models/master/notification';
import mongoose from "mongoose";

const notifyNearbyUsers = async (nearbyUsers: any, bloodRequest: any, io: any) => {
    for (const user of nearbyUsers) {
        const { socketId, _id } = user;
        console.log(bloodRequest, "bloodrequest");
        const message: string = `New blood request near you by ${bloodRequest.userId} is available for you.`;
        if (socketId) {
            io.to(socketId).emit('newBloodRequest', message);
        }
        try {
            const newNotification = new Notification({
                userId: _id,
                requestId: bloodRequest._id,
                message: message
            });
            await newNotification.save();
            console.log(`Notification saved for user`);
        } catch (error) {
            console.error(`Failed to save notification for user`, error);
        }
    }
};

const notifyAcceptRequest = async (user: any, bloodRequest: any, io: any) => {
        console.log(bloodRequest, "bloodrequest");
        const message: string = `New Donor for Blood Request for ${bloodRequest.patientName} is accepted your request.`;
        console.log(user)
        if (user.socketId) {
            io.to(user.socketId).emit('newBloodRequest', message);
        }
        try {
            const newNotification = new Notification({
                userId: user._id,
                requestId: bloodRequest._id,
                message: message
            });
            await newNotification.save();
            console.log(`Notification saved for user`);
        } catch (error) {
            console.error(`Failed to save notification for user`, error);
        }

};

export class BloodRequestController {
    static async createBloodRequest(req: Request, res: Response) {
        //update function to not include user who created the bloodrequest using the userId this userId belongs to the user who is requesting the blood
        
        const { userId, patientName, patientPhone, bloodGroup, requiredDate, units, location, isCritical, additionalNote } = req.body;

        try {
            const bloodRequest = new BloodRequest({
                userId,
                patientName,
                patientPhone,
                bloodGroup,
                requiredDate,
                units,
                location,
                isCritical,
                additionalNote,
                status: "pending",
            });

            await bloodRequest.save();
            const nearbyUsers = await User.find({
                userId: { $ne: userId },
                "addresses": {
                    $elemMatch: {
                        isCurrent: true,
                        location: {
                            $geoWithin: {
                                $centerSphere: [
                                    location.location.coordinates,
                                    9.32057 / 3963.2 //15km
                                ]
                            }
                        }
                    }
                }
            });
            await notifyNearbyUsers(nearbyUsers, bloodRequest, io);
            return res.status(201).json({ success: true, message: "Blood request created" });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: "Error creating blood request", error: error.message });
        }
    }

    static async getAllBloodRequests(req: Request, res: Response) {
        const { longitude, latitude, userId } = req.body;

        try {
            const nearbyRequests = await BloodRequest.find({
                userId: { $ne: userId },
                "location.location": {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [longitude, latitude],
                        },
                        $maxDistance: 50000, //50km
                    },
                },
            });
            return res.status(200).json({ success: true, nearbyRequests });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: "Error creating blood request", error: error.message });
        }
    }

    static async acceptBloodRequest(req: Request, res: Response) {
        const { requestId, userId } = req.params;

        try {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }
       
            const updatedRequest = await BloodRequest.findByIdAndUpdate(
                requestId,
                { $addToSet: { donors: userId } },
                { new: true }
            ).populate('donors');
            const requestUserId = updatedRequest?.userId
            console.log(requestUserId, "requestUserId");
            const requestUser = await User.findOne({userId: requestUserId});
            const otpExpiry = 5 * 60 * 1000;
            const otp = generateOTP();
            const expiry = new Date(Date.now() + otpExpiry);
            const email = user?.email
            const newOtp = new Otp({ email, otp, expiry });
            const response = await newOtp.save();

            if (!updatedRequest) {
                return res.status(404).json({ success: false, message: 'Blood request not found' });
            }
            await notifyAcceptRequest(requestUser, updatedRequest, io);
            await sendConfirmation(email, otp, updatedRequest)
            res.status(200).json({ success: true, message: 'Request accepted', bloodRequest: updatedRequest });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'An error occurred while accepting the request' });
        }
    }

    static async getDonorsAccepted(req: Request, res: Response) {
        const { requestId } = req.params;
        try {
            const bloodRequest = await BloodRequest.findById(requestId).populate('donors');
            if (!bloodRequest) {
                return res.status(404).json({ success: false, message: 'Blood request not found' });
            }
            res.status(200).json({ success: true, donors: bloodRequest.donors });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'An error occurred while fetching donors' });
        }
    }
}