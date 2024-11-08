const axios = require('axios');
import { mailSender } from "./mailSender";

export const sendSMS = async (receiver: string, otp: string) => {
    try {
        const mailResponse = await mailSender(
        receiver,
          "Verification Email - DonorLink",
          `<!DOCTYPE html>
          <html>
          <head>
              <title>OTP for Blood Donation App</title>
              <style>
                  body {
                      font-family: Arial, sans-serif;
                      line-height: 1.6;
                      background-color: #f4f4f4;
                      margin: 0;
                      padding: 20px;
                  }
                  .container {
                      max-width: 600px;
                      margin: 0 auto;
                      background-color: #ffffff;
                      padding: 20px;
                      border-radius: 8px;
                      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                  }
                  .header {
                      text-align: center;
                      margin-bottom: 20px;
                  }
                  .otp {
                      font-size: 24px;
                      font-weight: bold;
                      color: #d9534f;
                      margin: 20px 0;
                      text-align: center;
                  }
                  .footer {
                      margin-top: 20px;
                      text-align: center;
                      font-size: 12px;
                      color: #777;
                  }
              </style>
          </head>
          <body>
              <div class="container">
                  <div class="header">
                      <h2>DonorLink - OTP Verification</h2>
                  </div>
                  <p>Hi User,</p>
                  <p>Thank you for using the DonorLink. To ensure the security of your account, please use the following One-Time Password (OTP) to complete your login:</p>
                  <div class="otp">${otp}</div>
                  <p>This OTP is valid for 10 minutes. Please do not share it with anyone for security reasons.</p>
                  <p>If you did not request this OTP, please ignore this email or contact our support team immediately.</p>
                  <div class="footer">
                      <p>Thank you for your support in making a difference!</p>
                      <p>Best regards,<br>Ankush<br>DonorLink</p>
                  </div>
              </div>
          </body>
          </html>`
        );
        console.log("Email sent successfully: ", mailResponse);
      } catch (error) {
        console.log("Error occurred while sending email: ", error);
        throw error;
      }
};
