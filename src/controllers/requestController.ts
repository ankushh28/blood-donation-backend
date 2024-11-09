import { Request, Response } from "express";
import { upload } from "../helper/multer";
import { IAddress, IUser, User } from "../models/user";
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

    static async acceptBloodRequest(req: Request, res: Response) {
        const { requestId, userId } = req.params;
        try {
            const updatedRequest = await BloodRequest.findByIdAndUpdate(
                requestId,
                { $addToSet: { donors: userId } },
                { new: true }
            ).populate('donors');
    
            if (!updatedRequest) {
                return res.status(404).json({success: false, message: 'Blood request not found' });
            }
    
            res.status(200).json({success: true, message: 'Request accepted', bloodRequest: updatedRequest });
        } catch (error) {
            console.error(error);
            res.status(500).json({success: false, message: 'An error occurred while accepting the request' });
        }
    }
    
    static async getDonorsAccepted(req:Request, res: Response){
        const { requestId } = req.params;
        try {
            const bloodRequest = await BloodRequest.findById(requestId).populate('donors');
            if (!bloodRequest) {
                return res.status(404).json({ success: false, message: 'Blood request not found' });
            }
            res.status(200).json({success: true, donors: bloodRequest.donors });
        } catch (error) {
            console.error(error);
            res.status(500).json({success: false, message: 'An error occurred while fetching donors' });
        }
    }
}