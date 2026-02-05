document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password-input');
    const togglePasswordButton = document.getElementById('toggle-password');
    const strengthBar = document.getElementById('strength-bar');
    const entropyScoreEl = document.getElementById('entropy-score');
    const criteriaList = {
        length: document.getElementById('length'),
        uppercase: document.getElementById('uppercase'),
        lowercase: document.getElementById('lowercase'),
        number: document.getElementById('number'),
        special: document.getElementById('special'),
        common: document.getElementById('common'),
    };
    const toggleEducationButton = document.getElementById('toggle-education');
    const educationContent = document.getElementById('education-content');

    // --- Event Listeners ---
    passwordInput.addEventListener('input', () => {
        updatePasswordStrength(passwordInput.value);
    });

    togglePasswordButton.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        togglePasswordButton.textContent = isPassword ? 'HIDE' : 'SHOW';
    });

    toggleEducationButton.addEventListener('click', () => {
        toggleEducationButton.classList.toggle('active');
        const span = toggleEducationButton.querySelector('span');
        span.textContent = span.textContent === '+' ? '-' : '+';
        if (educationContent.style.maxHeight) {
            educationContent.style.maxHeight = null;
        } else {
            educationContent.style.maxHeight = educationContent.scrollHeight + "px";
        }
    });

    // --- Main Update Function ---
    function updatePasswordStrength(password) {
        let score = 0;
        const checks = {
            length: password.length >= 8,
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSpecial: /[!@#$%^&*]/.test(password),
            notCommon: !commonPasswords.includes(password.toLowerCase()),
        };

        // Update criteria list UI
        updateCriteriaUI('length', checks.length);
        updateCriteriaUI('uppercase', checks.hasUppercase);
        updateCriteriaUI('lowercase', checks.hasLowercase);
        updateCriteriaUI('number', checks.hasNumber);
        updateCriteriaUI('special', checks.hasSpecial);
        updateCriteriaUI('common', checks.notCommon);

        // Calculate score
        if (checks.length) score++;
        if (checks.hasUppercase) score++;
        if (checks.hasLowercase) score++;
        if (checks.hasNumber) score++;
        if (checks.hasSpecial) score++;
        if (checks.notCommon && password.length > 0) score++;
        if (password.length > 12) score++; // Bonus for longer passwords

        // Calculate Entropy
        const entropy = calculateEntropy(password);
        entropyScoreEl.textContent = `${entropy.toFixed(2)} bits`;

        // Update strength bar
        updateStrengthBar(score, entropy);
    }

    function updateCriteriaUI(criterion, isValid) {
        const element = criteriaList[criterion];
        if (isValid) {
            element.classList.add('valid');
        } else {
            element.classList.remove('valid');
        }
    }

    function updateStrengthBar(score, entropy) {
        let width, color;

        if (entropy < 40) {
            width = (entropy / 40) * 50;
            color = 'var(--weak-color)';
        } else if (entropy < 80) {
            width = 50 + ((entropy - 40) / 40) * 25;
            color = 'var(--medium-color)';
        } else {
            width = 75 + Math.min(25, (entropy - 80) / 2); // Cap at 100%
            color = 'var(--strong-color)';
        }

        width = Math.min(100, Math.max(0, width)); // Clamp between 0 and 100

        strengthBar.style.width = `${width}%`;
        strengthBar.style.backgroundColor = color;
    }

    function calculateEntropy(password) {
        if (!password) {
            return 0;
        }
        let characterSetSize = 0;
        if (/[a-z]/.test(password)) characterSetSize += 26;
        if (/[A-Z]/.test(password)) characterSetSize += 26;
        if (/[0-9]/.test(password)) characterSetSize += 10;
        if (/[!@#$%^&*]/.test(password)) characterSetSize += 8;
        if (/[^a-zA-Z0-9!@#$%^&*]/.test(password)) characterSetSize += 32; // Other symbols

        if (characterSetSize === 0) return 0;

        const entropy = password.length * Math.log2(characterSetSize);
        return entropy;
    }

    // Initial state
    updatePasswordStrength('');
});