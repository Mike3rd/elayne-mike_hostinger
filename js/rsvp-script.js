document.addEventListener('DOMContentLoaded', function() {

    // DOM elements
    const rsvpForm = document.getElementById('rsvp-form');
    const guestCountSelect = document.getElementById('rsvp-guest-count');
    const guestNamesContainer = document.getElementById('rsvp-guest-names');
    const attendeesList = document.getElementById('rsvp-attendees-list');
    const totalCountSpan = document.getElementById('rsvp-total-count');
    const totalGuestsSpan = document.getElementById('rsvp-total-guests');
    const toggleButton = document.getElementById('toggle-attendees');
    const codeVerification = document.getElementById('code-verification');
    const verifyBtn = document.getElementById('verify-code');
    const codeInput = document.getElementById('rsvp-code');
    const guestContainer = document.getElementById('rsvp-guests-container');
		
    
    // Invitation Codes
    const CODES = {
        SOLO: "WED2025",    // 1 guest only
        COUPLE: "WED2025-PLUS1", // 2 guests max
        FAMILY: "WED2025-FAMILY"  // 4 guests max
    };

  // Initialize form states
    rsvpForm.style.display = 'none'; // Hide RSVP form initially
    codeVerification.style.display = 'block'; // Show code entry
	

    // Verify Code Button Click
    verifyBtn.addEventListener('click', function() {
        const code = codeInput.value.trim().toUpperCase();
        
        if (!Object.values(CODES).includes(code)) {
            alert("Invalid code. Please check your invitation.");
            return;
        }

        // Hide code verification, show RSVP form
        codeVerification.style.display = 'none';
        rsvpForm.style.display = 'block';
        
        // Configure form based on code
        if (code === CODES.SOLO) {
            // Hide guest selection for solo
            guestContainer.style.display = 'none';
            // Ensure guest count is set to 1
            guestCountSelect.value = "1";
        } else {
            // Show appropriate guest options
            guestContainer.style.display = 'block';
            const maxGuests = code === CODES.COUPLE ? 2 : 4;
            updateGuestOptions(maxGuests);
        }
    });

    // Helper function to update guest options
    function updateGuestOptions(maxGuests) {
        guestCountSelect.innerHTML = '';
        for (let i = 1; i <= maxGuests; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i + (i === 1 ? " (Just yourself)" : "");
            guestCountSelect.appendChild(option);
        }
        updateGuestNameFields(1); // Initialize with 1 guest
    }
	
	
	// Initialize as collapsed with right arrow
    attendeesList.classList.remove('expanded');
    toggleButton.textContent = '▶';
    toggleButton.setAttribute('aria-expanded', 'false'); // Initialize ARIA state
    
    // Toggle functionality
    toggleButton.addEventListener('click', function() {
        const isExpanding = !attendeesList.classList.contains('expanded');
        
        // Toggle the expanded state
        attendeesList.classList.toggle('expanded');
        
        // Update the arrow and ARIA state
        toggleButton.textContent = isExpanding ? '▼' : '▶';
        toggleButton.setAttribute('aria-expanded', isExpanding.toString()); // Update ARIA
        
        // Optional: Remove new data indicator when opened
        if (isExpanding) {
            toggleButton.classList.remove('new-data-available');
        }
    });
	

    
    // Initialize Firebase if not already initialized
	
 firebase.initializeApp({
             apiKey: "AIzaSyB5YUtuhtJh7bezkD8E6gpn0Rs1jzJCS7w",
			  authDomain: "thematic-runner-459319-g4.firebaseapp.com",
			  projectId: "thematic-runner-459319-g4",
			  storageBucket: "thematic-runner-459319-g4.firebasestorage.app",
			  messagingSenderId: "830236525210",
			  appId: "1:830236525210:web:75ae7d0b58a9b11dea1523",
			  measurementId: "G-QF69FE73JG"
        });

	
	
    
    // Get Firestore instance
    const db = firebase.firestore();
    const guestsRef = db.collection("wedding-rsvp");
    const totalsRef = db.collection("wedding-rsvp-totals");
    
    // Update guest name fields when count changes
    guestCountSelect.addEventListener('change', function() {
        updateGuestNameFields(parseInt(this.value));
    });
    
    // Initialize with 1 guest
    updateGuestNameFields(1);
    

    // Form submission
    rsvpForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const code = codeInput.value.trim().toUpperCase();
        const isSolo = code === CODES.SOLO;
        const guestCount = isSolo ? 1 : parseInt(guestCountSelect.value);
        
        // Validate code and guest count
        if (!Object.values(CODES).includes(code)) {
            alert("Please enter a valid reservation code");
            return;
        }
        
        // Validate guest count matches code type
        if ((code === CODES.SOLO && guestCount !== 1) ||
            (code === CODES.COUPLE && guestCount > 2) ||
            (code === CODES.FAMILY && guestCount > 4)) {
            alert("Guest count doesn't match invitation type");
            return;
        }

        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
        
        try {
            const name = document.getElementById('rsvp-name').value.trim();
            const email = document.getElementById('rsvp-email').value.trim();
            const attending = document.querySelector('input[name="rsvp-attending"]:checked').value === 'yes';
            
            // Collect guest names
            const guests = [];
            if (attending) {
                guests.push(name); // Primary guest
                
                // Collect additional guest names if not solo
                if (!isSolo) {
                    for (let i = 1; i < guestCount; i++) {
                        const guestNameInput = document.getElementById(`rsvp-guest-${i}`);
                        if (guestNameInput && guestNameInput.value.trim()) {
                            guests.push(guestNameInput.value.trim());
                        }
                    }
                }
            }
					
console.log("Submitting RSVP with:", {
  name,
  email,
  attending,
  guests,
  totalAttendees: guestCount,
  invitationCode: code,
});
	

            // Save to Firestore with code information
            await guestsRef.add({
                name: name,
                email: email,
                attending: attending,
                guests: guests,
                totalAttendees: guestCount,
                invitationCode: code,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Update totals
            if (attending) {
                await totalsRef.doc('counts').set({
                    count: firebase.firestore.FieldValue.increment(1),
                    guests: firebase.firestore.FieldValue.increment(guests.length),
                    lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            }
            
            // Show thank you message
            const thankYouMessage = document.createElement('div');
				thankYouMessage.className = 'rsvp-thank-you';
				thankYouMessage.innerHTML = `
					<h3>Thank You!</h3>
					<p>Your RSVP has been submitted successfully.<br>If you need to cancel or update your RSVP, please contact us</p>
				`;

				// Clear form and show message
				rsvpForm.reset();
				const formContainer = rsvpForm.parentNode;
				formContainer.replaceChild(thankYouMessage, rsvpForm);

				// Reset form fields
				updateGuestNameFields(1);
				
				
				/*Hide message after 5 seconds (form is already gone)
				setTimeout(() => {
					thankYouMessage.remove();
				}, 5000);*/
            
         } catch (error) {
            console.error("Submission error:", error);
            alert("Error submitting RSVP. Please try again.");
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit RSVP';
        }
    }); // Closing bracket for form submission event listener
    
    // Display attendees
    guestsRef.orderBy("timestamp", "desc").onSnapshot(function(snapshot) {
		  if (!attendeesList.classList.contains('expanded')) {
            toggleButton.classList.add('new-data-available');
        }

        attendeesList.innerHTML = '';
        let attendingCount = 0;
        let totalGuests = 0;
        
        snapshot.forEach(function(doc) {
            const guest = doc.data();
            if (guest.attending) {
                attendingCount++;
                totalGuests += guest.guests.length;
                
                const attendeeItem = document.createElement('div');
                attendeeItem.className = 'rsvp-attendee-item';
                attendeeItem.innerHTML = `
                    <span>${guest.guests.join(', ')}</span>
					<span>${guest.totalAttendees}</span>
                `;
                attendeesList.appendChild(attendeeItem);
            }
			
			  if (attendeesList.classList.contains('expanded') === false) {
        toggleButton.classList.add('new-data-available');
    }
        });
        
        totalCountSpan.textContent = attendingCount;
        totalGuestsSpan.textContent = totalGuests;
    }); // Closing bracket for onSnapshot listener
    
    function updateGuestNameFields(count) {
        guestNamesContainer.innerHTML = '';
        for (let i = 1; i < count; i++) {
            const guestDiv = document.createElement('div');
            guestDiv.className = 'rsvp-guest-name-input';
            guestDiv.innerHTML = `
                <label for="rsvp-guest-${i}" class="rsvp-label">Guest ${i} Name</label>
                <input type="text" id="rsvp-guest-${i}" class="rsvp-input">
            `;
            guestNamesContainer.appendChild(guestDiv);
        }
    } // Closing bracket for updateGuestNameFields function
    
    async function updateTotals(additionalGuests) {
        const totalsDoc = totalsRef.doc('counts');
        
        try {
            // First try the atomic update approach
            await totalsDoc.set({
                count: firebase.firestore.FieldValue.increment(1),
                guests: firebase.firestore.FieldValue.increment(additionalGuests),
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        } catch (error) {
            console.error("Atomic update failed, recalculating totals:", error);
            
            // Fallback: Recalculate totals from all documents
            const snapshot = await guestsRef.get();
            let totalCount = 0;
            let totalGuests = 0;
            
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.attending) {
                    totalCount++;
                    totalGuests += data.guests.length;
                }
            });
            
            await totalsDoc.set({
                count: totalCount,
                guests: totalGuests,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    } // Closing bracket for updateTotals function
}); // Closing bracket for DOMContentLoaded event listener