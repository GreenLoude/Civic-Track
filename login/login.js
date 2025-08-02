import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Initialize Supabase client
const supabaseUrl = 'https://wgbnbjxmoiefbhrdqeko.supabase.co/'; // Replace with your Supabase URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnYm5ianhtb2llZmJocmRxZWtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMjU4NzEsImV4cCI6MjA2OTcwMTg3MX0.5IzXYHN3abPsbP6Zo3oosPFTUBC5f0LFUFbeGwMAqFE'; // Replace with your Supabase API key
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', function() {
    // Login Form Submission
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Clear previous error messages
            if (errorMessage) errorMessage.textContent = '';
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Basic validation
            if (!email || !password) {
                if (errorMessage) errorMessage.textContent = 'Please fill in all fields';
                return;
            }
            
            try {
                // Sign in with Supabase Auth
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });

                if (error) {
                    console.error('Login error:', error.message);
                    if (errorMessage) errorMessage.textContent = `Error: ${error.message}`;
                    return;
                }

                if (data.user) {
                    if (errorMessage) errorMessage.textContent = 'Login successful! Redirecting to dashboard...';
                    // Redirect to dashboard
                    // window.location.href = 'dashboard.html';
                }
            } catch (err) {
                console.error('Unexpected error during login:', err);
                if (errorMessage) errorMessage.textContent = 'An unexpected error occurred. Please try again later.';
            }
        });
    }
    
    // Forgot Password Link
    const forgotPasswordLink = document.querySelector('.forgot-password');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', async function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            
            if (!email) {
                if (errorMessage) errorMessage.textContent = 'Please enter your email address first';
                return;
            }

            try {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: 'YOUR_RESET_PASSWORD_PAGE_URL' // Replace with your reset password page URL
                });

                if (error) {
                    console.error('Password reset error:', error.message);
                    if (errorMessage) errorMessage.textContent = `Error: ${error.message}`;
                    return;
                }

                if (errorMessage) errorMessage.textContent = 'Password reset link has been sent to your email';
            } catch (err) {
                console.error('Unexpected error during password reset:', err);
                if (errorMessage) errorMessage.textContent = 'An unexpected error occurred. Please try again later.';
            }
        });
    }
    
    // Sign Up Link
    const signupLink = document.querySelector('.signup-link');
    if (signupLink) {
        signupLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'signup.html';
        });
    }
});