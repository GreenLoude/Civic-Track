import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Initialize Supabase client
const supabaseUrl = 'https://wgbnbjxmoiefbhrdqeko.supabase.co/'; // Replace with your Supabase URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnYm5ianhtb2llZmJocmRxZWtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMjU4NzEsImV4cCI6MjA2OTcwMTg3MX0.5IzXYHN3abPsbP6Zo3oosPFTUBC5f0LFUFbeGwMAqFE'; // Replace with your Supabase API key
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', function() {
    // Get form and error elements
    const signupForm = document.getElementById('signupForm');
    const errorMessage = document.getElementById('errorMessage');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');

    // Real-time validation functions
    const validateEmail = () => {
        const email = emailInput.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email) && email.length > 0) {
            emailError.textContent = 'Enter valid email address';
            emailError.style.display = 'block';
            emailError.style.color = 'red';
            emailInput.style.borderColor = 'red';
        } else {
            emailError.textContent = '';
            emailInput.style.borderColor = '';
        }
    };

    const validatePassword = () => {
        const password = passwordInput.value;
        if ((password.length < 6 || !/\d/.test(password)) && password.length > 0) {
            passwordError.textContent = 'Password must be greater than 6 characters and include a number';
        } else {
            passwordError.textContent = '';
        }
        // Re-validate confirm password when password changes
        validateConfirmPassword();
    };

    const validateConfirmPassword = () => {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        if (password !== confirmPassword && confirmPassword.length > 0) {
            confirmPasswordError.textContent = 'Passwords do not match';
        } else {
            confirmPasswordError.textContent = '';
        }
    };

    // Debounce function to limit rapid validation calls
    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        };
    };

    // Add real-time event listeners
    if (emailInput) {
        emailInput.addEventListener('input', debounce(validateEmail, 300));
        emailInput.addEventListener('blur', validateEmail);
    }
    if (passwordInput) {
        passwordInput.addEventListener('input', debounce(validatePassword, 300));
        passwordInput.addEventListener('blur', validatePassword);
    }
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', debounce(validateConfirmPassword, 300));
        confirmPasswordInput.addEventListener('blur', validateConfirmPassword);
    }

    // Form submission
    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Clear previous error messages
            if (errorMessage) errorMessage.textContent = '';
            if (emailError) emailError.textContent = '';
            if (passwordError) passwordError.textContent = '';
            if (confirmPasswordError) confirmPasswordError.textContent = '';
            
            const fullName = document.getElementById('fullName').value;
            const email = emailInput.value;
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            const neighborhood = document.getElementById('neighborhood').value;
            
            // Validation for required fields
            if (!fullName || !email || !password || !confirmPassword || !neighborhood) {
                if (errorMessage) errorMessage.textContent = 'Please fill in all required fields';
                return;
            }

            // Email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                if (emailError) {
                    emailError.textContent = 'Enter valid email address';
                    emailError.style.display = 'block';
                    emailError.style.color = 'red';
                }
                emailInput.style.borderColor = 'red';
                return;
            emailInput.style.borderColor = '';
            }

            // Password validation: at least 6 characters and contains a number
            if (password.length < 6 || !/\d/.test(password)) {
                if (passwordError) passwordError.textContent = 'Password must be greater than 6 characters and include a number';
                return;
            }

            // Confirm password validation
            if (password !== confirmPassword) {
                if (confirmPasswordError) confirmPasswordError.textContent = 'Passwords do not match';
                return;
            }

            try {
                // Sign up with Supabase Auth
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                            neighborhood: neighborhood
                        }
                    }
                });

                if (error) {
                    console.error('Signup error:', error.message);
                    // If error is about email, show in email field
                    if (error.message && error.message.toLowerCase().includes('email')) {
                        emailError.textContent = error.message;
                        emailError.style.display = 'block';
                        emailError.style.color = 'red';
                        emailInput.style.borderColor = 'red';
                    } else {
                        if (errorMessage) errorMessage.textContent = `Error: ${error.message}`;
                    }
                    return;
                }

                if (data.user) {
                    // Redirect to confirm-password page
                    window.location.href = 'confirm-password.html';
                }
            } catch (err) {
                console.error('Unexpected error during signup:', err);
                if (errorMessage) errorMessage.textContent = 'An unexpected error occurred. Please try again later.';
            }
        });
    }
});