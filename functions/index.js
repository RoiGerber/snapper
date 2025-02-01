const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");

const admin = require("firebase-admin");
const axios = require("axios");
const Buffer = require("buffer").Buffer;

admin.initializeApp();

// UPSEND Credentials
const UPSEND_USERNAME = "UPSEND19791";
const UPSEND_PASSWORD = "7c05d46d-8e8b-45af-a48a-f10733aeb6dd";
const UPSEND_API_URL = "https://capi.upsend.co.il/api/v2/SMS/SendSms";

exports.sendSmsOnEventChange = onDocumentWritten("events/{eventId}", async (event) => {
    const beforeData = event.data.before.exists ? event.data.before.data() : null;
    const afterData = event.data.after.exists ? event.data.after.data() : null;

    logger.info("Before Data:", beforeData);
    logger.info("After Data:", afterData);
    
    if (!afterData || !afterData.user) {
        logger.info("No user field found in event.");
        return null;
    }

    try {
        // Get phone number from usersDB/{userId}
        const userDoc = await admin.firestore().collection("usersDB").doc(afterData.user).get();
        if (!userDoc.exists || !userDoc.data().phoneNumber) {
            logger.info("User or phone number not found.");
            return null;
        }

        const phoneNumber = userDoc.data().phoneNumber;
        let message = `תודה שבחרת בנו לצלם את האירוע שלך (${afterData.name}) אנחנו מחפשים אחר הצלם בשבילך.`;

        if (!beforeData) {
            message += ` ${afterData.message}`;
        } else if (beforeData.status !== afterData.status) {
            message += ` Status updated: ${afterData.status}`;
        }

        return sendSms(phoneNumber, message);
    } catch (error) {
        logger.error("Error fetching user phone number:", error);
        return null;
    }
});

async function sendSms(phone, message) {
    try {
        const authHeader = `Basic ${Buffer.from(`${UPSEND_USERNAME}:${UPSEND_PASSWORD}`).toString("base64")}`;

        const response = await axios.post(UPSEND_API_URL, {
            Data: {
                Message: message,
                Recipients: [{ Phone: phone }],
                Settings: { Sender: "Snapper" },
            },
        }, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": authHeader,
            },
        });

        logger.info("SMS Sent:", response.data);
    } catch (error) {
        logger.error("Failed to send SMS:", error);
    }
}
