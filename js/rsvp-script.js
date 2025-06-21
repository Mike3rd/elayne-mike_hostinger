document.addEventListener('DOMContentLoaded', function() {

    // DOM elements
    const rsvpForm = document.getElementById('rsvp-form');
    const guestCountSelect = document.getElementById('rsvp-guest-count');
    const guestNamesContainer = document.getElementById('rsvp-guest-names');
    const attendeesList = document.getElementById('rsvp-attendees-list');
    const totalCountSpan = document.getElementById('rsvp-total-count');
    const totalGuestsSpan = document.getElementById('rsvp-total-guests');
	const toggleButton = document.getElementById('toggle-attendees');

	
	
	
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
	
// check captcha
 document.addEventListener('DOMContentLoaded', function () {
    try {
      // Initialize Firebase
      firebase.initializeApp({
        apiKey: "6LfwImgrAAAAANOHxw6Q_-KM5obFh1YB2Pq5b7nA",
        authDomain: "thematic-runner-459319-g4.firebaseapp.com",
        projectId: "thematic-runner-459319-g4",
        // ...other config
      });

      // ✅ Activate App Check with reCAPTCHA v3
      const appCheck = firebase.appCheck().activate(
        "6LfwImgrAAAAANOHxw6Q_-KM5obFh1YB2Pq5b7nA", // Site key from Google reCAPTCHA
        true // auto-refresh App Check token
      );

      // Optional: add observer for token errors
      firebase.appCheck().onTokenChanged((token) => {
        console.log("App Check token received:", token);
      }, (error) => {
        console.error("⚠️ App Check token error:", error);
        // Optional: fallback message for user
        alert("Warning: Could not verify this browser. Submissions may fail.");
      });

    } catch (e) {
      console.error("⚠️ Firebase/App Check failed to initialize:", e);
      alert("Something went wrong initializing security checks. Please try refreshing the page or contact us.");
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

	firebase.appCheck().activate(
  '6LfwImgrAAAAANOHxw6Q_-KM5obFh1YB2Pq5b7nA', // Site key from Google reCAPTCHA admin
  true // Set to true to auto-refresh App Check token
);
	
	
    
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
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
        
        try {
            const name = document.getElementById('rsvp-name').value.trim();
			const email = document.getElementById('rsvp-email').value.trim();
            const attending = document.querySelector('input[name="rsvp-attending"]:checked').value === 'yes';
            const guestCount = parseInt(guestCountSelect.value);
            
            // Collect guest names
            const guests = [];
            if (attending) {
                guests.push(name); // Primary guest
                
                // Collect additional guest names
                for (let i = 1; i < guestCount; i++) {
                    const guestNameInput = document.getElementById(`rsvp-guest-${i}`);
                    if (guestNameInput && guestNameInput.value.trim()) {
                        guests.push(guestNameInput.value.trim());
                    }
                }
            }
			

            // Save to Firestore
            await guestsRef.add({
                name: name,
                email: email,
                attending: attending,
                guests: guests,
				totalAttendees: guestCount,
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
                <p>Your RSVP has been submitted successfully.</p>
            `;
            
            // Clear form and show message
            rsvpForm.reset();
            rsvpForm.style.display = 'none';
            rsvpForm.parentNode.insertBefore(thankYouMessage, rsvpForm.nextSibling);
            
            // Reset form fields
            updateGuestNameFields(1);
            
            // Hide message and show form again after 5 seconds
            setTimeout(() => {
                thankYouMessage.remove();
                rsvpForm.style.display = 'block';
            }, 5000);
            
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