// Firebase configuration is now in config.js

// DOM Elements
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const qrSection = document.getElementById('qr-section');
const otpSection = document.getElementById('otp-section');

// Check URL parameters for initial form display
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const formType = urlParams.get('form');
    if (formType === 'signup') {
        toggleForm('signup');
    } else {
        toggleForm('login');
    }
});

// Toggle between login and signup forms
function toggleForm(formType) {
    if (formType === 'login') {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
        qrSection.classList.add('hidden');
        otpSection.classList.add('hidden');
        // Update URL without refreshing
        const newUrl = window.location.pathname;
        window.history.pushState({}, '', newUrl);
    } else if (formType === 'signup') {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
        qrSection.classList.add('hidden');
        otpSection.classList.add('hidden');
        // Update URL without refreshing
        const newUrl = window.location.pathname + '?form=signup';
        window.history.pushState({}, '', newUrl);
    }
}

// Generate QR Code
function generateQRCode(email) {
    // Get the base URL (works for both local and deployed environments)
    const baseUrl = window.location.origin;
    const otpUrl = `${baseUrl}/otp.html?email=${encodeURIComponent(email)}`;
    const qrcode = new QRCode(document.getElementById("qrcode"), {
        text: otpUrl,
        width: 200,
        height: 200
    });
}

// Generate OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000);
}

// Handle Login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        // Attempt to sign in directly
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        console.log('User logged in:', userCredential.user.email);
        localStorage.setItem('userEmail', email);
        showQRCode(email);
    } catch (error) {
        console.error('Login Error:', error);
        if (error.code === 'auth/user-not-found') {
            // User doesn't exist, redirect to signup
            alert('Account not found. Please sign up first.');
            toggleForm('signup');
            // Pre-fill the signup email field
            document.getElementById('signupEmail').value = email;
        } else if (error.code === 'auth/wrong-password') {
            alert('Incorrect password. Please try again.');
        } else {
            alert('Login Error: ' + error.message);
        }
    }
});

// Handle Signup
document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const name = document.getElementById('signupName').value;

    try {
        // Create the user account
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        console.log('User signed up:', userCredential.user.email);
        
        // Update profile
        await userCredential.user.updateProfile({
            displayName: name
        });
        
        // Store email and show QR code directly
        localStorage.setItem('userEmail', email);
        showQRCode(email);
        
        // Show success message
        alert('Account created successfully! You are now logged in.');
        
    } catch (error) {
        console.error('Signup Error:', error);
        alert('Signup Error: ' + error.message);
    }
});

// Show QR Code
function showQRCode(email) {
    loginForm.classList.add('hidden');
    signupForm.classList.add('hidden');
    qrSection.classList.remove('hidden');
    otpSection.classList.add('hidden');
    
    // Clear previous QR code
    const qrContainer = document.getElementById('qrcode');
    qrContainer.innerHTML = '';
    
    // Center the QR container
    qrContainer.style.display = 'flex';
    qrContainer.style.flexDirection = 'column';
    qrContainer.style.alignItems = 'center';
    qrContainer.style.justifyContent = 'center';
    qrContainer.style.width = '100%';
    
    // Add white background container for QR code
    const qrWrapper = document.createElement('div');
    qrWrapper.style.backgroundColor = 'white';
    qrWrapper.style.padding = '15px';
    qrWrapper.style.borderRadius = '10px';
    qrWrapper.style.display = 'inline-block';
    qrWrapper.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    qrContainer.appendChild(qrWrapper);
    
    // Store email in localStorage for OTP verification
    localStorage.setItem('userEmail', email);
    
    // Generate QR code with email parameter - use absolute path
    const baseUrl = window.location.origin;
    const otpUrl = `${baseUrl}/otp.html?email=${encodeURIComponent(email)}`;
    
    console.log('Generated QR URL:', otpUrl);
    
    // Create QR code with better visibility - smaller size
    new QRCode(qrWrapper, {
        text: otpUrl,
        width: 200,
        height: 200,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
    
    // Add instructions for scanning
    const qrInstructions = document.createElement('p');
    qrInstructions.style.marginTop = '20px';
    qrInstructions.style.color = '#666';
    qrInstructions.style.textAlign = 'center';
    qrInstructions.style.maxWidth = '80%';
    qrInstructions.innerHTML = `
        <i class="fas fa-info-circle"></i> 
        Scan this QR code with your mobile device to receive the OTP.
        The OTP page will open on your mobile device.
    `;
    qrContainer.appendChild(qrInstructions);
    
    // Add timer display
    const timerDisplay = document.createElement('div');
    timerDisplay.id = 'qr-timer';
    timerDisplay.style.marginTop = '15px';
    timerDisplay.style.fontSize = '1.2rem';
    timerDisplay.style.fontWeight = 'bold';
    timerDisplay.style.color = '#4f46e5';
    qrContainer.appendChild(timerDisplay);
    
    // Start 30-second timer
    let secondsLeft = 30;
    timerDisplay.textContent = `Time remaining: ${secondsLeft} seconds`;
    
    const timer = setInterval(() => {
        secondsLeft--;
        timerDisplay.textContent = `Time remaining: ${secondsLeft} seconds`;
        
        if (secondsLeft <= 0) {
            clearInterval(timer);
            // After 30 seconds, show verification page
            showVerificationPage();
        }
    }, 1000);
}

// Show Verification Page
function showVerificationPage() {
    qrSection.classList.add('hidden');
    otpSection.classList.remove('hidden');
    
    // Get user email from localStorage
    const userEmail = localStorage.getItem('userEmail');
    
    // Create OTP display element if it doesn't exist
    let otpDisplay = document.getElementById('otp-display');
    if (!otpDisplay) {
        otpDisplay = document.createElement('div');
        otpDisplay.id = 'otp-display';
        otpDisplay.style.marginBottom = '20px';
        otpDisplay.style.fontSize = '1.2rem';
        otpDisplay.style.fontWeight = 'bold';
        otpDisplay.style.color = '#4f46e5';
        otpDisplay.style.textAlign = 'center';
        otpSection.insertBefore(otpDisplay, document.getElementById('otpForm'));
    }
    
    // Display message about OTP being sent
    otpDisplay.textContent = `Please enter the verification code sent to ${userEmail}`;
    
    // Add verification instructions
    const verificationInstructions = document.createElement('p');
    verificationInstructions.style.marginTop = '15px';
    verificationInstructions.style.color = '#666';
    verificationInstructions.style.textAlign = 'center';
    verificationInstructions.innerHTML = `
        <i class="fas fa-info-circle"></i> 
        Enter the verification code you received to complete the process.
    `;
    otpSection.insertBefore(verificationInstructions, document.getElementById('otpForm'));
    
    // Add error message container
    const errorContainer = document.createElement('div');
    errorContainer.id = 'verification-error';
    errorContainer.style.marginTop = '15px';
    errorContainer.style.color = '#ef4444';
    errorContainer.style.textAlign = 'center';
    errorContainer.style.display = 'none';
    otpSection.insertBefore(errorContainer, document.getElementById('otpForm'));
}

// Handle OTP Verification
document.getElementById('otpForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const enteredOTP = document.getElementById('otpInput').value;
    const userEmail = localStorage.getItem('userEmail');
    const errorContainer = document.getElementById('verification-error');
    
    try {
        // Get OTP from Firebase
        const otpRef = firebase.database().ref('otps/' + userEmail.replace('.', '_'));
        const snapshot = await otpRef.once('value');
        const otpData = snapshot.val();
        
        if (!otpData) {
            throw new Error('No OTP found for this email');
        }

        // Check if OTP is expired (5 minutes)
        const otpTimestamp = otpData.timestamp;
        const currentTime = Date.now();
        const fiveMinutes = 5 * 60 * 1000;
        
        if (currentTime - otpTimestamp > fiveMinutes) {
            throw new Error('OTP has expired. Please request a new one.');
        }

        if (enteredOTP === otpData.code) {
            // Clear the OTP from Firebase
            await otpRef.remove();
            // Clear local storage
            localStorage.removeItem('userEmail');
            // Redirect to success page
            window.location.href = 'success.html';
        } else {
            // Show error message
            errorContainer.textContent = 'Invalid verification code. Please try again.';
            errorContainer.style.display = 'block';
            // Clear the input field
            document.getElementById('otpInput').value = '';
        }
    } catch (error) {
        errorContainer.textContent = error.message || 'Verification failed. Please try again.';
        errorContainer.style.display = 'block';
        document.getElementById('otpInput').value = '';
    }
});