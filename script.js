// Loading Screen Initialization
window.addEventListener('DOMContentLoaded', function() {
    // Loading screen will auto-fade after 2 seconds due to CSS animation
    // This event ensures the page is fully loaded before hiding the overlay
    setTimeout(() => {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }, 2600); // Slightly more than 2 seconds to account for animation duration
});

// Smooth Scroll to Contact Section
document.querySelectorAll('a[href="#contact"]').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Google Apps Script URL - Replace with your deployed script URL
const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyEoPHm5uzqf40Om94H5WT3AP_dNEtMwxeD7omDPw3HeMYbrUmL-rF7Ud0ZZnay2gcVxQ/exec";

// Time slot configuration
const TIME_SLOTS = {
    morning: ["10:00", "10:15", "10:30", "10:45", "11:00", "11:15", "11:30", "11:45", "12:00", "12:15", "12:30", "12:45", "13:00"],
    evening: ["18:00", "18:15", "18:30", "18:45", "19:00", "19:15", "19:30", "19:45", "20:00", "20:15", "20:30"]
};

let bookedSlots = {};
let selectedDate = null;
let selectedTime = null;

// Appointment Modal Functions
function openAppointmentModal() {
    document.getElementById("appointmentModal").style.display = "block";
    initializeForm();
}

function closeAppointmentModal() {
    document.getElementById("appointmentModal").style.display = "none";
    resetForm();
}

function initializeForm() {
    generateDatePicker();
    selectedDate = null;
    selectedTime = null;
    document.getElementById("timeSlotGroup").style.display = "none";
    document.getElementById("timeSlots").innerHTML = "";
}

function resetForm() {
    document.querySelectorAll('#appointmentModal form')[0].reset();
    document.getElementById("date").value = "";
    document.getElementById("time").value = "";
    document.getElementById("selectedDate").textContent = "";
    document.getElementById("selectedTime").textContent = "";
    selectedDate = null;
    selectedTime = null;
}

// Generate date picker with 5 available weekdays (excluding weekends)
function generateDatePicker() {
    const datePickerContainer = document.getElementById("datePicker");
    datePickerContainer.innerHTML = "";
    
    const today = new Date();
    const availableDates = [];
    let daysAdded = 0;
    let checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() + 1); // Start from tomorrow
    
    // Get next 5 available weekdays (skip Saturday=6 and Sunday=0)
    while (daysAdded < 5) {
        const dayOfWeek = checkDate.getDay();
        // Skip Saturday (6) and Sunday (0)
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            availableDates.push(new Date(checkDate));
            daysAdded++;
        }
        checkDate.setDate(checkDate.getDate() + 1);
    }
    
    // Display date buttons
    availableDates.forEach(date => {
        const dateStr = formatDate(date);
        const dateKey = dateStr; // YYYY-MM-DD format
        
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "date-btn";
        btn.textContent = formatDisplayDate(date);
        btn.onclick = () => selectDate(dateKey, btn);
        
        datePickerContainer.appendChild(btn);
    });
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDisplayDate(date) {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
}

function formatTimeDisplay(time24) {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

// Select date and load available time slots
async function selectDate(dateKey, button) {
    // Remove previous selection
    document.querySelectorAll('.date-btn').forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
    
    selectedDate = dateKey;
    document.getElementById("date").value = dateKey;
    document.getElementById("selectedDate").textContent = `Date selected: ${button.textContent}`;
    
    // Fetch booked slots for this date
    await fetchBookedSlots(dateKey);
    
    // Display time slots
    displayTimeSlots(dateKey);
    
    // Show time slot selection
    document.getElementById("timeSlotGroup").style.display = "block";
}

// Fetch booked slots from Google Sheets
async function fetchBookedSlots(date) {
    try {
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL + "?action=getBookedSlots&date=" + date, {
            method: 'GET',
            mode: 'no-cors'
        });
        
        // Since we're using no-cors, we can't directly parse JSON
        // We'll fetch from Google Sheets API in the backend function
        // For now, assume response is handled by server
        
    } catch (error) {
        console.log("Loading booked slots...");
    }
}

// Display time slots with availability status
function displayTimeSlots(dateKey) {
    const timeSlotContainer = document.getElementById("timeSlots");
    timeSlotContainer.innerHTML = "";
    
    // Morning slots
    const morningLabel = document.createElement("div");
    morningLabel.style.gridColumn = "1 / -1";
    morningLabel.style.fontWeight = "bold";
    morningLabel.style.marginTop = "10px";
    morningLabel.textContent = "Morning (10:00 AM - 1:00 PM)";
    timeSlotContainer.appendChild(morningLabel);
    
    TIME_SLOTS.morning.forEach(time => {
        const slotKey = `${dateKey}_${time}`;
        const isBooked = bookedSlots[slotKey] && bookedSlots[slotKey] !== "Others";
        const isOthers = bookedSlots[slotKey] === "Others";
        
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `time-slot ${isBooked ? "booked" : "available"}`;
        btn.textContent = formatTimeDisplay(time);
        
        if (isBooked) {
            btn.disabled = true;
        } else {
            btn.onclick = () => selectTime(time, slotKey, btn);
        }
        
        timeSlotContainer.appendChild(btn);
    });
    
    // Evening slots
    const eveningLabel = document.createElement("div");
    eveningLabel.style.gridColumn = "1 / -1";
    eveningLabel.style.fontWeight = "bold";
    eveningLabel.style.marginTop = "10px";
    eveningLabel.textContent = "Evening (6:00 PM - 8:30 PM)";
    timeSlotContainer.appendChild(eveningLabel);
    
    TIME_SLOTS.evening.forEach(time => {
        const slotKey = `${dateKey}_${time}`;
        const isBooked = bookedSlots[slotKey] && bookedSlots[slotKey] !== "Others";
        
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `time-slot ${isBooked ? "booked" : "available"}`;
        btn.textContent = formatTimeDisplay(time);
        
        if (isBooked) {
            btn.disabled = true;
        } else {
            btn.onclick = () => selectTime(time, slotKey, btn);
        }
        
        timeSlotContainer.appendChild(btn);
    });
    
    // Others option
    const othersBtn = document.createElement("button");
    othersBtn.type = "button";
    othersBtn.className = "time-slot others";
    othersBtn.style.gridColumn = "1 / -1";
    othersBtn.textContent = "Others (Flexible timing)";
    othersBtn.onclick = () => selectTime("Others", `${dateKey}_Others`, othersBtn);
    timeSlotContainer.appendChild(othersBtn);
}

// Select time slot
function selectTime(time, slotKey, button) {
    // Remove previous selection
    document.querySelectorAll('.time-slot').forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
    
    selectedTime = time;
    document.getElementById("time").value = slotKey;
    
    const timeDisplay = time === "Others" ? "Others (Flexible)" : formatTimeDisplay(time);
    document.getElementById("selectedTime").textContent = `Time selected: ${timeDisplay}`;
}

// Submit appointment form
function submitAppointment(event) {
    event.preventDefault();
    
    // Validate date and time selection
    if (!selectedDate || !selectedTime) {
        alert("Please select both date and time before submitting.");
        return;
    }
    
    const name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;
    const email = document.getElementById("email").value;
    const reason = document.getElementById("reason").value;
    
    // Get current date and time
    const now = new Date();
    const submissionTime = now.toLocaleString();
    
    // Prepare data to send to Google Sheets
    const formData = {
        name: name,
        phone: phone,
        email: email,
        reason: reason,
        date: selectedDate,
        time: selectedTime,
        submissionTime: submissionTime
    };
    
    // Send data to Google Apps Script
    fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(formData),
        mode: 'no-cors'
    })
    .then(response => {
        // Show confirmation popup
        const confirmationMessage = "Thank you for submitting! We have received your submission and will wait for the call back confirmation.";
        alert(confirmationMessage);
        
        closeAppointmentModal();
        resetForm();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error submitting appointment. Please try again.');
    });
}

// Add to Cart Function
function addToCart(productName) {
    alert(`${productName} added to cart!\n\nProceeding to checkout...`);
}

// Close modal when clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById("appointmentModal");
    if (event.target == modal) {
        modal.style.display = "none";
        resetForm();
    }
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Know More button scroll functionality
function scrollToServices() {
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
        servicesSection.scrollIntoView({
            behavior: 'smooth'
        });
    }
}
