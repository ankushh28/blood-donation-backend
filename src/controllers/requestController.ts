import { Request, Response } from "express";
import { upload } from "../helper/multer";
import User, { IAddress, IUser } from "../models/user";
import BloodRequest from '../models/bloodRequest';
import { io } from '../index';

export class BloodRequestController {

    static async createBloodRequest(req: Request, res: Response) {
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
                "addresses": {
                    $elemMatch: {
                        isCurrent: true,
                        location: {
                            $geoWithin: {
                                $centerSphere: [
                                    location.location.coordinates,
                                    9.32057/3963.2 //15km
                                ]
                            }
                        }
                    }
                }
            });
            // nearbyUsers.forEach(user => {
            //     const socketId = user.socketId;
            //     if (socketId) {
            //         io.to(socketId).emit('newBloodRequest', bloodRequest);
            //     }
            // });
            return res.status(201).json({success: true, message: "Blood request created"});
        } catch (error: any) {
            return res.status(500).json({success: false, message: "Error creating blood request", error: error.message });
        }
    }

    static async getAllBloodRequests(req: Request, res: Response) {
        const {longitude, latitude} = req.body;

        try {
            const nearbyRequests = await BloodRequest.find({
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
            return res.status(200).json({success: true, nearbyRequests});
        } catch (error: any) {
            return res.status(500).json({success: false, message: "Error creating blood request", error: error.message });
        }
    }
}