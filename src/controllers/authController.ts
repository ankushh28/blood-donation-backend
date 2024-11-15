import { Request, Response } from "express";
import { sendSMS } from "../utils/sendSms";
import { generateOTP } from "../utils/generateOtp";
import Otp from "../models/otp";
import fs from 'fs';
import { upload } from "../helper/multer";
import { IAddress, IUser, User } from "../models/user";
import { config } from "../config/config";
var crypto = require('crypto');
const jwt = require('jsonwebtoken');

const calculateAge = (dob: Date): string => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age.toString();
};
const generateUserId = (): string => `RS${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
export class AuthController {
    static async sendOtpController(req: Request, res: Response) {
        try {
            const otpExpiry = 5 * 60 * 1000;
            const { email } = req.body;
            console.log({ email })
            const otp = generateOTP();
            const expiry = new Date(Date.now() + otpExpiry);

            const newOtp = new Otp({ email, otp, expiry });
            const response = await newOtp.save();
            console.log({ response })

            await sendSMS(email, otp);
            res.status(200).json({ success: true, message: 'OTP sent to your phone number. Please verify.' });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async verifyOtp(req: Request, res: Response) {
        try {
            const { email, otp } = req.body;

            const otpRecord = await Otp.findOne({ email, otp });
            if (!otpRecord) {
                return res.status(400).json({success: false, message: 'Invalid or expired OTP.' });
            }
            await Otp.deleteOne({ _id: otpRecord._id });
            res.status(200).json({ success: true, message: "OTP verified successfully." });

        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async checkUserExists(req: Request, res: Response) {
        try {
            const { email } = req.body;
            const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '24h' });
            const user = await User.findOne({ email });
            if (user) {
                return res.status(200).json({success: true, exists: true, user, token });
            }
            return res.status(200).json({success: true, exists: false });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async createUser(req: Request, res: Response) {
        const { fullname, dob, avatar, bloodGroup, gender, weight, phone, activeDonor, addresses, lastDonationDate, email } = req.body;
      
        try {
          const user = await User.findOne({ email });
          if (user) {
            return res.status(200).json({ exists: true, message: "User already exists", user });
          }
          const age = calculateAge(dob);
          let userId = generateUserId(); 
          for (let i = 0; i < 5; i++) {
            const existingUser = await User.findOne({ userId });
            if (!existingUser) break;
            userId = generateUserId();
          }
          const formattedAddresses = addresses.map((address: any) => ({
            ...address,
            location: {
              type: "Point",
              coordinates: [address.location.longitude, address.location.latitude]
            }
          }));
          const newUser = new User({
            userId,
            fullname,
            dob,
            age,
            avatar,
            bloodGroup,
            activeDonor: activeDonor ?? false,
            gender,
            weight,
            email,
            aadharVerified: false,
            phone,
            lastDonationDate,
            addresses: formattedAddresses
          });
          await newUser.save();
          return res.status(201).json({success: true, message: "Profile completed successfully", user: newUser });
        } catch (error: any) {
          return res.status(500).json({success: false, message: "Error completing profile", error: error.message });
        }
      }
    static async uploadAvatar(req: Request, res: Response) {
        try {
            upload(req, res, async (err) => {
                if (err) {
                    return res.status(500).json({ success: false, message: 'Error uploading files.' });
                }
                const uploadedFiles = req.files as Express.Multer.File[];
                const uploadedFilePaths = uploadedFiles.map(file => `${config.IMAGE_BACKEND_URL}/avatar/${file.filename}`);

                try {
                    await Promise.all(uploadedFilePaths.map(async (filePath) => {
                        console.log({ filePath })
                        if (fs.existsSync(filePath)) {
                            fs.unlinkSync(filePath);
                        }
                    }));

                    uploadedFilePaths.forEach(filePath => {
                        res.write(`${filePath}\n`);
                    });
                    res.end();;
                } catch (error) {
                    return res.status(500).json({ success: false, message: 'Error handling files.' });
                }
            });
        } catch (error: any) {
            res.status(500).send({ error: error?.message });
        }
    }

    static async editAddress(req: Request, res: Response) {
        try {
            const { userId, addressId } = req.params;
            const { addressLine, city, state, country, postalCode, latitude, longitude, isCurrent } = req.body;
            if (isCurrent) {
                await User.updateOne(
                    { _id: userId, "addresses.isCurrent": true },
                    { $set: { "addresses.$[].isCurrent": false } }
                );
            }
            const updatedUser = await User.findOneAndUpdate(
                { _id: userId, "addresses._id": addressId },
                {
                    $set: {
                        "addresses.$.addressLine": addressLine,
                        "addresses.$.city": city,
                        "addresses.$.state": state,
                        "addresses.$.country": country,
                        "addresses.$.postalCode": postalCode,
                        "addresses.$.isCurrent": isCurrent,
                        "addresses.$.location.latitude": latitude,
                        "addresses.$.location.longitude": longitude,
                    },
                },
                { new: true }
            );

            if (!updatedUser) {
                return res.status(404).json({success: false, message: "User or address not found" });
            }

            res.status(200).json({success: true, message: "Address updated successfully", user: updatedUser });
        } catch (error) {
            res.status(500).json({success: false, message: "Error updating address", error });
        }
    };

    static async deleteAddress(req: Request, res: Response) {
        try {
            const { userId, addressId } = req.params;

            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { $pull: { addresses: { _id: addressId } } },
                { new: true }
            );

            if (!updatedUser) {
                return res.status(404).json({success: false, message: "User or address not found" });
            }

            return res.status(200).json({success: true, message: "Address deleted successfully", user: updatedUser });
        } catch (error) {
            return res.status(500).json({success: false, message: "Error deleting address", error });
        }
    }
    static async getUsers(req: Request, res: Response) {
        try {
            const users = {
                "test": "hey"
            }
            res.status(200).json({
              success: true,
              users,
            });
          } catch (error: any) {
            console.log(error);
          }
    }

    static async addAddress(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            const { addressLine, city, state, country, postalCode, latitude, longitude, isCurrent } = req.body;
            if (isCurrent) {
                await User.updateOne(
                    { _id: userId, "addresses.isCurrent": true },
                    { $set: { "addresses.$[].isCurrent": false } }
                );
            }
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                {
                    $push: {
                        addresses: {
                            addressLine,
                            city,
                            state,
                            country,
                            postalCode,
                            isCurrent,
                            location: {
                                type: "Point",
                                coordinates: [longitude, latitude]
                            }
                        }
                    }
                },
                { new: true }
            );

            if (!updatedUser) {
                return res.status(404).json({success: false, message: "User not found" });
            }

            res.status(200).json({success: true, message: "Address added successfully", user: updatedUser });
        } catch (error) {
            res.status(500).json({success: false, message: "Error adding address", error });
        }
    }

}