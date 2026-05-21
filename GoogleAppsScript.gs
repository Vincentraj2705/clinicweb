/**
 * AYURVRITTI Google Apps Script - Appointment Management with Time Slots
 * This script handles:
 * 1. Receiving appointment form data (with date and time slots)
 * 2. Storing data in Google Sheets
 * 3. Generating Patient IDs
 * 4. Checking slot availability (same date + same time only once, except "Others")
 * 5. Sending email confirmations
 */

// Configuration
const SHEET_ID = "10Ob7KkH4tJnEs9yltpZsDsREb-aE2fYX7wqc52ali1o"; // Replace with your Google Sheet ID
const SHEET_NAME = "Appointments";
const CLINIC_EMAIL = "ayurvriti01@gmail.com"; // Clinic email for confirmation emails
const CLINIC_PHONE = "+91 7358368399"; // Clinic contact phone

/**
 * Main function to handle form submissions and API requests
 */
function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);
        
        // Check if this is a duplicate booking (same date + same time, unless it's "Others")
        if (data.time !== "Others" && isDuplicateBooking(data.date, data.time)) {
            return ContentService.createTextOutput(JSON.stringify({
                success: false,
                error: "This time slot is already booked. Please select another time."
            })).setMimeType(ContentService.MimeType.JSON);
        }
        
        // Add data to Google Sheets
        const patientId = addAppointmentToSheet(data);
        
        // Send email confirmation
        sendEmailConfirmation(data, patientId);
        
        return ContentService.createTextOutput(JSON.stringify({
            success: true,
            patientId: patientId,
            message: "Appointment saved successfully"
        })).setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
        Logger.log("Error: " + error);
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            error: error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

/**
 * Handle GET requests for fetching booked slots
 */
function doGet(e) {
    try {
        const action = e.parameter.action;
        
        if (action === "getBookedSlots") {
            const date = e.parameter.date;
            const bookedSlots = getBookedSlotsForDate(date);
            
            return ContentService.createTextOutput(JSON.stringify({
                success: true,
                bookedSlots: bookedSlots
            })).setMimeType(ContentService.MimeType.JSON);
        }
        
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            error: "Invalid action"
        })).setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
        Logger.log("Error in doGet: " + error);
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            error: error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

/**
 * Check if same date + same time already exists (excluding "Others")
 */
function isDuplicateBooking(date, time) {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    // Start from row 2 (skip header)
    for (let i = 1; i < data.length; i++) {
        const appointmentDate = data[i][5]; // Column F: Appointment Date
        const appointmentTime = data[i][6]; // Column G: Appointment Time
        
        // Convert Date object to YYYY-MM-DD string format if needed
        let dateStr = appointmentDate;
        if (appointmentDate instanceof Date) {
            const year = appointmentDate.getFullYear();
            const month = String(appointmentDate.getMonth() + 1).padStart(2, '0');
            const day = String(appointmentDate.getDate()).padStart(2, '0');
            dateStr = `${year}-${month}-${day}`;
        }
        
        // Compare dates as strings
        if (dateStr === date && appointmentTime === time && time !== "Others") {
            Logger.log("Duplicate booking detected: " + date + " " + time);
            return true;
        }
    }
    
    return false;
}

/**
 * Get booked slots for a specific date
 */
function getBookedSlotsForDate(date) {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    const bookedSlots = {};
    
    // Start from row 2 (skip header)
    for (let i = 1; i < data.length; i++) {
        const appointmentDate = data[i][5]; // Column F: Appointment Date
        const appointmentTime = data[i][6]; // Column G: Appointment Time
        
        // Convert Date object to YYYY-MM-DD string format if needed
        let dateStr = appointmentDate;
        if (appointmentDate instanceof Date) {
            const year = appointmentDate.getFullYear();
            const month = String(appointmentDate.getMonth() + 1).padStart(2, '0');
            const day = String(appointmentDate.getDate()).padStart(2, '0');
            dateStr = `${year}-${month}-${day}`;
        }
        
        // Compare dates as strings
        if (dateStr === date && appointmentTime) {
            bookedSlots[`${date}_${appointmentTime}`] = appointmentTime;
            Logger.log("Booked slot found: " + date + " " + appointmentTime);
        }
    }
    
    Logger.log("Booked slots for date " + date + ": " + JSON.stringify(bookedSlots));
    return bookedSlots;
}

/**
 * Add appointment to Google Sheets and generate Patient ID
 */
function addAppointmentToSheet(data) {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    
    // Get last row to determine next patient ID
    const lastRow = sheet.getLastRow();
    const patientNumber = lastRow; // Starting from row 2 (row 1 is header)
    const patientId = "AVPID" + String(patientNumber).padStart(2, '0');
    
    // Prepare row data
    const timestamp = new Date();
    const rowData = [
        patientId,
        data.name,
        data.phone,
        data.email,
        data.reason,
        data.date,
        data.time === "Others" ? "Others (Flexible)" : data.time,
        data.submissionTime,
        "Pending", // Status
        timestamp
    ];
    
    // Add row to sheet
    sheet.appendRow(rowData);
    
    Logger.log("New appointment added with ID: " + patientId + " Date: " + data.date + " Time: " + data.time);
    return patientId;
}

/**
 * Send email confirmation using Gmail API
 */
function sendEmailConfirmation(data, patientId) {
    const recipientEmail = data.email;
    const subject = `AYURVRITTI - Appointment Confirmation | Patient ID: ${patientId}`;
    
    const timeDisplay = data.time === "Others" ? "Others (Flexible Timing)" : formatTimeForEmail(data.time);
    
    const emailBody = `Dear ${data.name},

Thank you for submitting! We have received your submission and will wait for the call back confirmation.

=== APPOINTMENT DETAILS ===
Patient ID: ${patientId}
Name: ${data.name}
Appointment Date: ${data.date}
Appointment Time: ${timeDisplay}
Reason for Consultation: ${data.reason}
Submitted: ${data.submissionTime}

=== CONTACT INFORMATION ===
Phone: ${CLINIC_PHONE}
Email: ${CLINIC_EMAIL}
Instagram: @ayur.vritti_

💚 Your booking confirmed! We will contact you shortly to confirm final details.
Your health is our commitment.

Best regards,
AYURVRITTI Team
Panchakarma and Wellness Clinic`;
    
    try {
        MailApp.sendEmail(recipientEmail, subject, emailBody);
        Logger.log("Email confirmation sent to: " + recipientEmail);
    } catch (error) {
        Logger.log("Email error: " + error);
    }
}

/**
 * Format time from 24-hour to 12-hour format for email
 */
function formatTimeForEmail(time24) {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

/**
 * Initialize Google Sheet with headers (run this once)
 */
function initializeSheet() {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME) || 
                  SpreadsheetApp.openById(SHEET_ID).insertSheet(SHEET_NAME);
    
    const headers = [
        "Patient ID",
        "Name",
        "Phone",
        "Email",
        "Reason for Consultation",
        "Appointment Date",
        "Appointment Time",
        "Submission Time",
        "Status",
        "Created At"
    ];
    
    sheet.appendRow(headers);
    Logger.log("Sheet initialized with headers");
}
