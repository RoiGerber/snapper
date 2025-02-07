const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const axios = require("axios");
const { Buffer } = require("buffer");

admin.initializeApp();

// UPSEND Credentials
const UPSEND_USERNAME = "UPSEND19791";
const UPSEND_PASSWORD = "7c05d46d-8e8b-45af-a48a-f10733aeb6dd";
const UPSEND_API_URL = "https://capi.upsend.co.il/api/v2/SMS/SendSms";

exports.sendSmsOnEventChange = onDocumentWritten("events/{eventId}", async (change) => {
  const beforeData = change.data.before.exists ? change.data.before.data() : null;
  const afterData = change.data.after.exists ? change.data.after.data() : null;

  if (!afterData) {
    logger.info("No after data found. Exiting function.");
    return null;
  }

  const newStatus = afterData.status;
  logger.info(`Event ${afterData.name} changed to status: ${newStatus}`);

  // --- New Event Created (client registration & posting the event) ---
  // When a client posts a new event, the event is created with status "submitted"
  if (!beforeData && newStatus === "submitted") {
    // Look up the client’s phone number from usersDB
    const clientSnap = await admin.firestore().collection("usersDB").doc(afterData.user).get();
    if (!clientSnap.exists || !clientSnap.data().phoneNumber) {
      logger.info("Client not found or missing phone number.");
      return null;
    }
    const clientPhone = clientSnap.data().phoneNumber;
    const message = `תודה על יצירת האירוע "${afterData.name}". האירוע נוצר במערכת, כעת עליך להזין פרטי אשראי באתר.`;
    return sendSms(clientPhone, message);
  }

  // --- Status change handling ---
  if (beforeData && beforeData.status !== newStatus) {
    // When the event status changes, we take different actions:
    if (newStatus === "paid") {
      // After the client enters their credit card details the event becomes "paid".
      // Alert X photographers that a new job is available.
      const photographersSnap = await admin.firestore()
        .collection("usersDB")
        .where("role", "==", "photographer")
        .get();
      if (photographersSnap.empty) {
        logger.info("No photographers found to notify.");
      }
      // Send an SMS to each photographer
      photographersSnap.forEach(async (doc) => {
        const photographer = doc.data();
        if (photographer.phoneNumber) {
          const message = `אירוע חדש "${afterData.name}" זמין! מיקום: ${afterData.address}, ${afterData.city}. היכנס לפרטים והרשם כצלם לאירוע במהירות.
            https://tsalamim.com/marketplace`;
          await sendSms(photographer.phoneNumber, message);
        }
      });
      return null;
    } else if (newStatus === "accepted") {
      // When a photographer accepts the job the status changes to "accepted".
      // Two SMS messages should be sent:
      //  1. To the client: include photographer contact details.
      //  2. To the photographer: include client contact details and full event details.
      if (!afterData.photographerId) {
        logger.info("No photographer ID found on the event.");
        return null;
      }
      // Fetch photographer details
      const photographerSnap = await admin.firestore().collection("usersDB").doc(afterData.photographerId).get();
      // Fetch client details
      const clientSnap = await admin.firestore().collection("usersDB").doc(afterData.user).get();
      if (!photographerSnap.exists || !clientSnap.exists) {
        logger.info("Either photographer or client record not found.");
        return null;
      }
      const photographerData = photographerSnap.data();
      const clientData = clientSnap.data();
      const eventDate = afterData.date?.toDate().toLocaleDateString('he-IL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      // Prepare messages (assumes that the photographer/client documents have fields for phoneNumber and contactDetails)
      const clientMessage = `נמצאה התאמה במערכת, הצלם ${photographerData.email} נרשם עבור האירוע "${afterData.name}". פרטים ליצירת קשר, מספר טלפון: ${photographerData.phoneNumber}.`;
      const photographerMessage = `נרשמת במערכת כצלם עבור האירוע "${afterData.name}". אנא התקשר ללקוח במספר טלפון: ${clientData.phoneNumber}. שם הלקוח: ${afterData.contactName}. תאריך האירוע: ${eventDate}. שעת האירוע: ${afterData.time}.`;

      // Send SMS to both parties
      await sendSms(clientData.phoneNumber, clientMessage);
      await sendSms(photographerData.phoneNumber, photographerMessage);
      if (!afterData.transaction_id) {
        logger.error("Transaction ID is missing. Cannot commit transaction.");
        return null;
      }

      const hypParams = new URLSearchParams();
      hypParams.append("action", "commitTrans");
      hypParams.append("Masof", "5601886329");
      hypParams.append("TransId", afterData.transaction_id);
      hypParams.append("PassP", "yaad");

      try {
        const hypResponse = await axios.post(
          "https://pay.hyp.co.il/p/",
          hypParams,
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );
        logger.info("Hyp transaction committed successfully:", hypResponse.data);
      } catch (error) {
        logger.error("Failed to commit Hyp transaction:", error);
      }
      return null;
    } else if (newStatus === "pending-upload") {
      // On the day of the event the status automatically changes to "pending-upload"
      // and the photographer is alerted to upload photos within 24H.
      if (!afterData.photographerId) {
        logger.info("No photographer ID found on event for pending-upload status.");
        return null;
      }
      const photographerSnap = await admin.firestore().collection("usersDB").doc(afterData.photographer).get();
      if (!photographerSnap.exists || !photographerSnap.data().phoneNumber) {
        logger.info("Photographer record not found or missing phone number.");
        return null;
      }
      const photographerPhone = photographerSnap.data().phoneNumber;
      const message = `אירוע "${afterData.name}" הסתיים. אנא העלה את התמונות תוך 24 שעות.`;
      await sendSms(photographerPhone, message);
      return null;
    } else if (newStatus === "uploaded") {
      // Once the photographer uploads the images the event status changes to "uploaded"
      // and an SMS is sent to the client notifying them that the photos are available.
      const clientSnap = await admin.firestore().collection("usersDB").doc(afterData.user).get();
      if (!clientSnap.exists || !clientSnap.data().phoneNumber) {
        logger.info("Client record not found or missing phone number.");
        return null;
      }
      const clientPhone = clientSnap.data().phoneNumber;
      const message = `התמונות לאירוע "${afterData.name}" הועלו בהצלחה. ניתן כעת להוריד אותן. (התמונות יימחקו לאחר חודש)`;
      await sendSms(clientPhone, message);
      return null;
    }
    // If additional statuses are added later (for example, a confirmation on event day) add them here.
    else {
      logger.info(`Status changed to "${newStatus}" but no SMS logic defined for this status.`);
    }
  }
  return null;
});

/**
 * Sends an SMS via UPSEND.
 *
 * @param {string} phone - The recipient's phone number.
 * @param {string} message - The SMS text.
 * @returns {Promise<void>}
 */
async function sendSms(phone, message) {
  try {
    const authHeader = `Basic ${Buffer.from(`${UPSEND_USERNAME}:${UPSEND_PASSWORD}`).toString("base64")}`;

    const response = await axios.post(
      UPSEND_API_URL,
      {
        Data: {
          Message: message,
          Recipients: [{ Phone: phone }],
          Settings: { Sender: "Tsalamim" },
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
      }
    );

    logger.info("SMS sent successfully:", response.data);
  } catch (error) {
    logger.error("Failed to send SMS:", error);
  }
}
