document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('confirmForm');
    const codeInput = document.getElementById('confirmationCode');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            errorMessage.textContent = '';
            successMessage.textContent = '';
            const code = codeInput.value.trim();
            if (!code) {
                errorMessage.textContent = 'Please enter the confirmation code.';
                codeInput.style.borderColor = 'red';
                return;
            }
            // Simulate confirmation (replace with real API call)
            if (code === '123456') {
                successMessage.textContent = 'Your account has been confirmed!';
                codeInput.style.borderColor = '#38a169';
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                errorMessage.textContent = 'Invalid confirmation code.';
                codeInput.style.borderColor = 'red';
            }
        });
    }
});
