# AYURVRITTI Appointment System Setup Guide

## Overview
This advanced appointment system includes:
1. **Appointment Form** (Website) with **Time Slot Selection** (15-minute intervals)
2. **Date Picker** - Shows 5 available weekdays (Monday-Friday, no weekends)
3. **Time Slots** - 10:00 AM - 1:00 PM (Morning) and 6:00 PM - 8:30 PM (Evening)
4. **Availability Status** - Green (Available) / Red (Booked) / Others (Flexible, allows duplicates)
5. **Data Storage** → **Google Sheets** with Patient IDs (AVPID01, AVPID02, etc.)
6. **Email Confirmations** with appointment details
7. **Duplicate Prevention** - Same time same day only once (except "Others" option)

---

## Step 1: Setup Google Sheets

### 1.1 Create a Google Sheet
1. Go to https://sheets.google.com
2. Create a new spreadsheet named "AYURVRITTI Appointments"
3. Get the Sheet ID from the URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`

### 1.2 Initialize the Sheet
The Google Apps Script will auto-create the sheet with headers when you run `initializeSheet()`, OR manually add these column headers in Row 1:

| Column | Header |
|--------|--------|
| A | Patient ID |
| B | Name |
| C | Phone |
| D | Email |
| E | Reason for Consultation |
| F | Appointment Date |
| G | Appointment Time |
| H | Submission Time |
| I | Status |
| J | Created At |

---

## Step 2: Setup Google Apps Script

### 2.1 Create Apps Script Project
1. Go to https://script.google.com
2. Create a new project named "AYURVRITTI"
3. Copy the entire `GoogleAppsScript.gs` file content into the editor

### 2.2 Configure Variables
Replace these placeholders in the script:

```javascript
const SHEET_ID = "YOUR_GOOGLE_SHEET_ID"; // Your sheet ID from Step 1.1
const CLINIC_EMAIL = "ayurvriti01@gmail.com"; // Your clinic email
const CLINIC_PHONE = "+91 7358368399"; // Your clinic phone
```

### 2.3 Initialize the Sheet (First Time Only)
1. In the script editor, find the `initializeSheet()` function
2. Click **Select function** dropdown and choose `initializeSheet`
3. Click **Run** button
4. This will create the headers in your Google Sheet

### 2.4 Deploy as Web App
1. Click **Deploy** → **New Deployment**
2. Select **Type**: Web app
3. Set **Execute as**: Your email
4. Set **Who has access**: Anyone
5. Click **Deploy**
6. Copy the **Deployment URL** (looks like: `https://script.google.com/macros/d/SCRIPT_ID/usercontent`)

---

## Step 3: Update Website Configuration

### 3.1 Update script.js
In your `script.js` file, update line 1:

```javascript
const GOOGLE_APPS_SCRIPT_URL = "YOUR_GOOGLE_APPS_SCRIPT_DEPLOYMENT_URL";
```

Replace with the deployment URL from **Step 2.4**

---

## Step 4: Features Explained

### 4.1 Date Picker
- Shows only **5 available weekdays** (Monday-Friday)
- **Excludes weekends** (Saturday and Sunday automatically)
- User must select a date first
- Date format: `YYYY-MM-DD`

### 4.2 Time Slots
- **Morning**: 10:00 AM - 1:00 PM (15-minute intervals)
- **Evening**: 6:00 PM - 8:30 PM (15-minute intervals)
- **Color Coding**:
  - 🟢 **Green** = Available
  - 🔴 **Red** = Already Booked
  - **Others** = Flexible timing (allows multiple bookings)

### 4.3 Booking Rules
- ❌ **NOT allowed**: Same time, same day (duplicate prevention)
- ✅ **Allowed**: Same time, different days (same person can book same time on different dates)
- ✅ **Allowed**: "Others" option (flexible timing, multiple people can select)

### 4.4 Form Flow
1. User selects date from 5 available options
2. Time slots load for the selected date
3. User selects a time
4. User fills in name, phone, email, reason for consultation
5. Clicks "Confirm Appointment"
6. Confirmation popup: "Thank you for submitting! We have received your submission and will wait for the call back confirmation."
7. Email confirmation sent to customer

---

## Step 5: Test the System

### 5.1 Test Form Submission
1. Open your website
2. Click "Book Appointment"
3. Select a weekday from the 5 available options (Monday-Friday only)
4. Select a time slot (green/available)
5. Fill in required fields:
   - Full Name
   - Phone Number
   - Email Address
   - Reason for Consultation
6. Click "Confirm Appointment"

### 5.2 Expected Results
✅ Confirmation popup appears with message
✅ Email sent to customer with:
   - Patient ID (AVPID01, AVPID02, etc.)
   - Appointment date and time (formatted as 12-hour)
   - Reason for consultation
   - Clinic contact information

✅ Data appears in Google Sheets within 1-2 seconds

### 5.3 Test Duplicate Prevention
1. Book appointment for same date and time twice
2. Second attempt should show "This time slot is already booked"
3. User can book same time on a different day
4. User can select "Others" multiple times

---

## Troubleshooting

### Issue: Data not appearing in Google Sheets
- ✓ Check SHEET_ID is correct
- ✓ Sheet name exactly matches "Appointments"
- ✓ Verify you ran `initializeSheet()` function
- ✓ Check Apps Script execution logs for errors

### Issue: Email not received
- ✓ Check recipient email address is valid
- ✓ Check spam/promotions folder
- ✓ Verify email address was entered correctly in form
- ✓ Check Google Apps Script logs for mail errors

### Issue: 403 Forbidden Error
- ✓ Re-deploy with new deployment URL
- ✓ Make sure "Who has access" is set to "Anyone"
- ✓ Update script.js with new deployment URL

### Issue: Time slots not showing after date selection
- ✓ Check browser console (F12) for JavaScript errors
- ✓ Verify Google Apps Script URL is correct in script.js
- ✓ Make sure Google Apps Script is deployed and active

### Issue: "This time slot is already booked" on first booking
- ✓ Most likely data from previous tests in Google Sheets
- ✓ Clear the data rows (keep headers) and try again
- ✓ Make sure date format in sheet matches: YYYY-MM-DD

---

## File Structure

```
ayurvritti/
├── index.html (Updated - with date picker & time slots)
├── script.js (Updated - time slot logic, date picker)
├── styles.css (Updated - date/time slot styling)
├── GoogleAppsScript.gs (Updated - time slot booking, duplicate prevention)
├── logo.png
└── welcomebanner.png
```

---

## Quick Reference

### Time Slot Configuration
```javascript
Morning: 10:00, 10:15, 10:30, 10:45, 11:00, 11:15, 11:30, 11:45, 12:00, 12:15, 12:30, 12:45, 13:00
Evening: 18:00, 18:15, 18:30, 18:45, 19:00, 19:15, 19:30, 19:45, 20:00, 20:15, 20:30
```

### Database Columns
- Patient ID, Name, Phone, Email, Service, **Appointment Date**, **Appointment Time**, Notes, Submission Time, Status, Created At

### Email Confirmation Details
- Includes Patient ID
- Formatted time display (12-hour format)
- Appointment date
- Service name
- Submission timestamp
- Clinic contact info (phone, email, Instagram)

---

## Important Notes

1. **Free Tier Limitations**:
   - Twilio sandbox has limits, upgrade for production
   - Google Sheets has API rate limits

2. **Security**:
   - Don't share your credentials publicly
   - Use environment variables in production

3. **GDPR Compliance**:
   - Store consent for WhatsApp messages
   - Implement data deletion policies

4. **Phone Number Format**:
   - Must include country code (e.g., +917358368399)
   - Remove any spaces or special characters

---

## WhatsApp Message Template

The message sent will be:

```
Vannakkam [Patient Name]!

📋 Appointment Confirmed

Patient ID: AVPID01
Service: [Service Name]
Date: [Selected Date]

💚 Your booking is confirmed. See you soon!
Your health is our commitment.

- AYURVRITTI Team
```

---

## Next Steps

1. Complete all configuration steps
2. Test with a sample appointment
3. Monitor Google Sheets for data
4. Verify WhatsApp messages are received
5. Go live with your website!

For support, contact your development team.
