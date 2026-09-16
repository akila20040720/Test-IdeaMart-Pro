require("dotenv").config();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// Environment variables
const IDEAMART_BASE_URL = "https://api.ideamart.io";
const APPLICATION_ID = process.env.IDEAMART_APPLICATION_ID;
const PASSWORD = process.env.IDEAMART_PASSWORD;

// Check configuration on startup
if (!APPLICATION_ID || !PASSWORD) {
    console.warn("WARNING: IdeaMart credentials are missing in .env");
}

// ==========================================
// HOME PAGE
// ==========================================
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});


// ==========================================
// REQUEST OTP
// ==========================================
app.post("/api/otp/request", async (req, res) => {
    try {
        const { mobileNumber } = req.body;

        if (!mobileNumber) {
            return res.status(400).json({
                success: false,
                message: "Mobile number is required"
            });
        }

        // Unique hash for this OTP request
        const applicationHash = crypto.randomUUID();
        const normalizedMobileNumber = String(mobileNumber).trim();
        const subscriberId = normalizedMobileNumber.startsWith("tel:")
            ? normalizedMobileNumber
            : `tel:${normalizedMobileNumber}`;

        const payload = {
            applicationId: APPLICATION_ID,
            password: PASSWORD,
            subscriberId: subscriberId,
            applicationHash: applicationHash,
            applicationMetaData: {
                client: "M",
                device: "Chrome on Windows",
                os: "Windows 11",
                appCode: "http://localhost:3000"
            }
        };
        console.log("\n========== OTP REQUEST ==========");
        console.log("Mobile Number:", mobileNumber);
        console.log("Application ID:", APPLICATION_ID);
        console.log("Sending request to IdeaMart...");

        const response = await axios.post(
            `${IDEAMART_BASE_URL}/subscription/otp/request`,
            payload,
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("IdeaMart Response:");
        console.log(JSON.stringify(response.data, null, 2));
        console.log("=================================\n");

        res.json({
            success: response.data.statusCode === "S1000",
            data: response.data
        });

    } catch (error) {

        const errorData = error.response?.data || {
            message: error.message
        };

        console.error("\n========== OTP REQUEST ERROR ==========");
        console.error(JSON.stringify(errorData, null, 2));
        console.error("=======================================\n");

        res.status(error.response?.status || 500).json({
            success: false,
            message: "Failed to request OTP",
            error: errorData
        });
    }
});


// ==========================================
// VERIFY OTP
// ==========================================
app.post("/api/otp/verify", async (req, res) => {
    try {
        const { referenceNo, otp } = req.body;

        if (!referenceNo) {
            return res.status(400).json({
                success: false,
                message: "Reference number is required"
            });
        }

        if (!otp) {
            return res.status(400).json({
                success: false,
                message: "OTP is required"
            });
        }

        const payload = {
            applicationId: APPLICATION_ID,
            password: PASSWORD,
            referenceNo: referenceNo,
            otp: otp
        };

        console.log("\n========== OTP VERIFY ==========");
        console.log("Reference Number:", referenceNo);
        console.log("Verifying OTP...");

        const response = await axios.post(
            `${IDEAMART_BASE_URL}/subscription/otp/verify`,
            payload,
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("IdeaMart Response:");
        console.log(JSON.stringify(response.data, null, 2));
        console.log("================================\n");

        res.json({
            success: true,
            data: response.data
        });

    } catch (error) {

        const errorData = error.response?.data || {
            message: error.message
        };

        console.error("\n========== OTP VERIFY ERROR ==========");
        console.error(JSON.stringify(errorData, null, 2));
        console.error("======================================\n");

        res.status(error.response?.status || 500).json({
            success: false,
            message: "Failed to verify OTP",
            error: errorData
        });
    }
});


// ==========================================
// SEND SMS
// ==========================================
app.post("/api/sms/send", async (req, res) => {
    try {
        const { subscriberId, message } = req.body;

        if (!subscriberId) {
            return res.status(400).json({
                success: false,
                message: "Subscriber ID is required"
            });
        }

        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Message is required"
            });
        }

        const payload = {
            applicationId: APPLICATION_ID,
            password: PASSWORD,
            destinationAddresses: [
                subscriberId
            ],
            message: message
        };

        console.log("\n========== SMS REQUEST ==========");
        console.log("Subscriber ID:", subscriberId);
        console.log("Message:", message);
        console.log("Sending SMS...");

        const response = await axios.post(
            `${IDEAMART_BASE_URL}/sms/send`,
            payload,
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("IdeaMart Response:");
        console.log(JSON.stringify(response.data, null, 2));
        console.log("=================================\n");

        res.json({
            success: true,
            data: response.data
        });

    } catch (error) {

        const errorData = error.response?.data || {
            message: error.message
        };

        console.error("\n========== SMS ERROR ==========");
        console.error(JSON.stringify(errorData, null, 2));
        console.error("================================\n");

        res.status(error.response?.status || 500).json({
            success: false,
            message: "Failed to send SMS",
            error: errorData
        });
    }
});


// ==========================================
// START SERVER
// ==========================================
app.listen(PORT, () => {
    console.log("\n==========================================");
    console.log("IdeaPro Test Application");
    console.log(`Running at: http://localhost:${PORT}`);
    console.log("==========================================\n");
});