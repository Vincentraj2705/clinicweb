// Loading Screen Initialization
console.log("Script.js loaded!");

// Hamburger menu functionality - make it global
window.setupHamburgerMenu = function setupHamburgerMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    console.log("setupHamburgerMenu called - hamburger:", hamburger, "navMenu:", navMenu);
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            console.log("Hamburger clicked");
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('mobile-open');
        });
        
        // Close menu when a link is clicked
        navMenu.querySelectorAll('a, button').forEach(item => {
            item.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('mobile-open');
            });
        });
        console.log("Hamburger menu setup complete");
    } else {
        console.error("Hamburger or navMenu not found!");
    }
};

// Call setupHamburgerMenu when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log("DOMContentLoaded event fired");
        window.setupHamburgerMenu();
        
        // Loading screen will auto-fade after 2 seconds due to CSS animation
        setTimeout(() => {
            const loadingOverlay = document.getElementById('loadingOverlay');
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
            }
        }, 2600);
    });
} else {
    // DOM is already loaded
    console.log("DOM already loaded, calling setupHamburgerMenu immediately");
    window.setupHamburgerMenu();
}

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

// Initialize animations on page scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe elements that need animation
document.addEventListener('DOMContentLoaded', () => {
    const elementsToAnimate = document.querySelectorAll('.section-title, .panchakarma .service-card, .doctors-grid');
    elementsToAnimate.forEach(el => {
        if (!el.classList.contains('fade-in-up')) {
            observer.observe(el);
        }
    });
});

// Google Apps Script URL - Replace with your deployed script URL
const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby2AWhIVT_iVtz7-qq6otNmL2itt4JrXLHMVigQTzuBQSn1gJU6y5Wdjt2GIb-GMkB6kA/exec";

// Time slot configuration
const TIME_SLOTS = {
    morning: ["10:00", "10:15", "10:30", "10:45", "11:00", "11:15", "11:30", "11:45", "12:00", "12:15", "12:30", "12:45", "13:00"],
    evening: ["17:00", "17:15", "17:30", "17:45", "18:00", "18:15", "18:30", "18:45", "19:00", "19:15", "19:30", "19:45", "20:00"]
};

let bookedSlots = {};
let selectedDate = null;
let selectedTime = null;

// Make these variables globally accessible
window.selectedDate = selectedDate;
window.selectedTime = selectedTime;
window.bookedSlots = bookedSlots;

// Appointment Modal Functions - GLOBAL SCOPE
window.openAppointmentModal = function openAppointmentModal() {
    console.log("openAppointmentModal called");
    const modal = document.getElementById("appointmentModal");
    console.log("Modal element:", modal);
    
    if (modal) {
        modal.style.display = "block";
        console.log("Modal display set to:", modal.style.display);
        console.log("Modal visibility:", window.getComputedStyle(modal).display);
        
        if (window.initializeForm) {
            window.initializeForm();
            console.log("initializeForm called");
        } else {
            console.error("initializeForm not found");
        }
    } else {
        console.error("Modal element appointmentModal not found in DOM");
    }
};

window.closeAppointmentModal = function closeAppointmentModal() {
    console.log("closeAppointmentModal called");
    const modal = document.getElementById("appointmentModal");
    if (modal) {
        modal.style.display = "none";
        console.log("Modal closed");
        if (window.resetForm) {
            window.resetForm();
        }
    }
};

function initializeForm() {
    generateDatePicker();
    selectedDate = null;
    selectedTime = null;
    document.getElementById("timeSlotGroup").style.display = "none";
    document.getElementById("timeSlots").innerHTML = "";
}

function resetForm() {
    const form = document.querySelectorAll('#appointmentModal form')[0];
    if (form) {
        form.reset();
    }
    document.getElementById("date").value = "";
    document.getElementById("time").value = "";
    document.getElementById("selectedDate").textContent = "";
    document.getElementById("selectedTime").textContent = "";
    selectedDate = null;
    selectedTime = null;
}

// Expose to global scope
window.initializeForm = initializeForm;
window.resetForm = resetForm;

// Generate date picker with 5 available weekdays (starting from today)
function generateDatePicker() {
    const datePickerContainer = document.getElementById("datePicker");
    if (!datePickerContainer) {
        console.error("datePicker element not found");
        return;
    }
    
    datePickerContainer.innerHTML = "";
    
    const today = new Date();
    const availableDates = [];
    let daysAdded = 0;
    let checkDate = new Date(today);
    // Start from today (no +1)
    
    // Get next 7 available days (include all days: Monday-Sunday)
    // Clinic is open: Monday-Saturday (10-1, 5-8), Sunday (10-1 only)
    while (daysAdded < 7) {
        availableDates.push(new Date(checkDate));
        daysAdded++;
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
    window.selectedDate = dateKey;  // Update global scope
    document.getElementById("date").value = dateKey;
    document.getElementById("selectedDate").textContent = `Date selected: ${button.textContent}`;
    
    // Show time slot group immediately (before fetching)
    document.getElementById("timeSlotGroup").style.display = "block";
    
    // Fetch booked slots for this date
    await fetchBookedSlots(dateKey);
    
    // Display time slots
    displayTimeSlots(dateKey);
}

// Fetch booked slots from Google Sheets
async function fetchBookedSlots(date) {
    try {
        bookedSlots = {};
        window.bookedSlots = bookedSlots;
        
        const url = GOOGLE_APPS_SCRIPT_URL + "?action=getBookedSlots&date=" + date;
        console.log("📅 Fetching booked slots for date:", date);
        
        const response = await fetch(url, {
            method: 'GET'
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log("📨 Response received:", data);
            
            if (data.bookedSlots && Object.keys(data.bookedSlots).length > 0) {
                // Clear previous slots for other dates
                bookedSlots = {};
                Object.assign(bookedSlots, data.bookedSlots);
                window.bookedSlots = bookedSlots;
                console.log("✅ Booked slots FOUND:", bookedSlots);
                for (let key in bookedSlots) {
                    console.log(`   - ${key}: ${bookedSlots[key]}`);
                }
            } else {
                console.log("ℹ️ No booked slots for this date");
            }
        } else {
            console.error("❌ Response error:", response.statusText);
        }
    } catch (error) {
        console.error("❌ Error loading booked slots:", error);
        bookedSlots = {};
        window.bookedSlots = bookedSlots;
        console.warn("⚠️ Booked slots reset due to error. All slots available.");
    }
}

// Display time slots with availability status
function displayTimeSlots(dateKey) {
    const timeSlotContainer = document.getElementById("timeSlots");
    timeSlotContainer.innerHTML = "";
    
    console.log("=== displayTimeSlots called for date:", dateKey);
    console.log("Current bookedSlots:", bookedSlots);
    
    // Get the day of week from dateKey
    const date = new Date(dateKey);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Morning slots
    const morningLabel = document.createElement("div");
    morningLabel.style.gridColumn = "1 / -1";
    morningLabel.style.fontWeight = "bold";
    morningLabel.style.marginTop = "10px";
    morningLabel.textContent = "Morning (10:00 AM - 1:00 PM)";
    timeSlotContainer.appendChild(morningLabel);
    
    TIME_SLOTS.morning.forEach(time => {
        const slotKey = `${dateKey}_${time}`;
        const isBooked = bookedSlots[slotKey] && bookedSlots[slotKey] !== "Others (Flexible)";
        
        console.log(`Slot ${slotKey}: booked=${isBooked}, value=${bookedSlots[slotKey]}`);
        
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
    
    // Evening slots - only show if not Sunday (0)
    if (dayOfWeek !== 0) {
        const eveningLabel = document.createElement("div");
        eveningLabel.style.gridColumn = "1 / -1";
        eveningLabel.style.fontWeight = "bold";
        eveningLabel.style.marginTop = "10px";
        eveningLabel.textContent = "Evening (5:00 PM - 8:00 PM)";
        timeSlotContainer.appendChild(eveningLabel);
        
        TIME_SLOTS.evening.forEach(time => {
            const slotKey = `${dateKey}_${time}`;
            const slotValue = bookedSlots[slotKey];
            const isBooked = slotValue && slotValue !== "Others (Flexible)";
            
            console.log(`Evening Slot ${slotKey}: value='${slotValue}', isBooked=${isBooked}`);
            
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
    }
    
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
    window.selectedTime = time;  // Update global scope
    document.getElementById("time").value = slotKey;
    
    const timeDisplay = time === "Others" ? "Others (Flexible)" : formatTimeDisplay(time);
    document.getElementById("selectedTime").textContent = `Time selected: ${timeDisplay}`;
}

// Submit appointment form
window.submitAppointment = function submitAppointment(event) {
    event.preventDefault();
    
    // Validate date and time selection
    if (!selectedDate || !selectedTime) {
        alert("Please select both date and time before submitting.");
        return;
    }
    
    // Check for duplicate bookings (front-end validation)
    if (selectedTime !== "Others") {
        const slotKey = `${selectedDate}_${selectedTime}`;
        if (bookedSlots[slotKey] && bookedSlots[slotKey] !== "Others (Flexible)") {
            alert("This time slot is already booked! Please select another time.");
            return;
        }
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
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log("✅ Appointment confirmed with ID:", data.patientId);
            const confirmationMessage = "Thank you for submitting! We have received your submission and will wait for the call back confirmation.\n\nPatient ID: " + data.patientId;
            alert(confirmationMessage);
        } else {
            console.error("❌ Server error:", data.error);
            alert('Error: ' + data.error);
            return;
        }
        
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
        console.log("Modal closed via outside click");
        if (window.resetForm) {
            window.resetForm();
        }
    }
}

// Expose all critical functions to global scope
window.generateDatePicker = generateDatePicker;
window.selectDate = selectDate;
window.displayTimeSlots = displayTimeSlots;
window.selectTime = selectTime;
window.formatDate = formatDate;
window.formatDisplayDate = formatDisplayDate;
window.formatTimeDisplay = formatTimeDisplay;

// Function to initialize form when opening modal
window.openFormModal = function() {
    document.getElementById('appointmentModal').style.display = 'block';
    selectedDate = null;
    selectedTime = null;
    document.getElementById('timeSlotGroup').style.display = 'none';
    generateDatePicker();
};

// Fallback handler for book button
window.handleBookClick = function() {
    console.log("handleBookClick called");
    try {
        document.getElementById('appointmentModal').style.display = 'block';
        selectedDate = null;
        selectedTime = null;
        document.getElementById('timeSlotGroup').style.display = 'none';
        if (window.generateDatePicker) {
            window.generateDatePicker();
        }
        console.log("Modal opened successfully");
    } catch (error) {
        console.error("Error in handleBookClick:", error);
        alert("Error opening appointment form: " + error.message);
    }
};

// Add event listener to Book Appointment button
function attachBookButtonListener() {
    const bookBtn = document.getElementById('bookBtn');
    console.log("Looking for bookBtn...", bookBtn);
    
    if (bookBtn) {
        console.log("Book button found! Attaching listener...");
        bookBtn.addEventListener('click', function(e) {
            console.log("Book button clicked!");
            e.preventDefault();
            document.getElementById('appointmentModal').style.display = 'block';
            selectedDate = null;
            selectedTime = null;
            document.getElementById('timeSlotGroup').style.display = 'none';
            generateDatePicker();
            console.log("Modal opened and date picker generated");
        });
    } else {
        console.log("Book button not found yet, retrying...");
        setTimeout(attachBookButtonListener, 500);
    }
}

// Try to attach listener when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachBookButtonListener);
} else {
    attachBookButtonListener();
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
window.scrollToServices = function scrollToServices() {
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
        servicesSection.scrollIntoView({
            behavior: 'smooth'
        });
    }
}

// Typewriter effect
function startTypewriter() {
    const text = "Welcome to AYURVRITTI";
    const typingElement = document.getElementById("typing-text");

    let index = 0;

    function type() {
        if (index < text.length) {
            typingElement.textContent += text.charAt(index);
            index++;
            setTimeout(type, 120); // typing speed
        }
    }

    typingElement.textContent = "";
    type();
}

// Start when page loads
document.addEventListener("DOMContentLoaded", startTypewriter);