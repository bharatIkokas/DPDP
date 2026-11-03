////////////////////////////Button active on Radio checked///////////////////////////////


(function () {
    "use strict";

    var consentRadios = document.querySelectorAll(
        '.consent-radio-group input[name="consent-preference"]'
    );

    var proceedButton = document.getElementById(
        "manage_constant_radio_proceed"
    );

    if (!consentRadios.length || !proceedButton) {
        return;
    }

    function updateProceedButton() {

        var isSelected = Array.from(consentRadios).some(function (radio) {
            return radio.checked;
        });

        proceedButton.disabled = !isSelected;

        proceedButton.setAttribute(
            "aria-disabled",
            String(!isSelected)
        );

        proceedButton.classList.toggle("gray-btn", !isSelected);
    }

    // Update Proceed button when radio selection changes
    consentRadios.forEach(function (radio) {
        radio.addEventListener("change", updateProceedButton);
    });

    // Initial state
    updateProceedButton();

})();



////////////////////////////Show Switch Checkbox Screen//////////////////////////

(function () {
    "use strict";

    var radioSection = document.getElementById("manage_constant_radio");
    var switchSection = document.getElementById("manage_constant_swicth");
    var radioProceedButton = document.getElementById("manage_constant_radio_proceed");

    if (!radioSection || !switchSection || !radioProceedButton) {
        return;
    }

    radioProceedButton.addEventListener("click", function () {

        // Hide radio section
        radioSection.classList.add("d-none");

        // Show switch section
        switchSection.classList.remove("d-none");

        // Focus first enabled switch for keyboard users
        var firstSwitch = switchSection.querySelector(
            'input[type="checkbox"]:not(:disabled)'
        );

        if (
            firstSwitch &&
            radioProceedButton.matches(":focus-visible")
        ) {
            firstSwitch.focus();
        }

    });

})();



/////////////////////////////Notice Popup (on uncheck) + Show OTP Block///////////////////////////

(function () {
    "use strict";

    var switchProceedButton = document.getElementById("manage_constant_swicth_proceed");
    var otpSection = document.querySelector(".manage-constant-otp");
    var popup = document.getElementById("constant_popup");
    var popupDialog = popup ? popup.querySelector('[role="dialog"]') : null;
    var popupClose = document.getElementById("constant_close_popup");
    var withdrawRadio = document.getElementById("withdraw-consent");
    var captureRadio = document.getElementById("capture-consent");
    var nonMandatory1 = document.getElementById("non-mandatory-consent-1");

    if (!switchProceedButton || !otpSection || !popup || !popupDialog || !popupClose ||
        !withdrawRadio || !captureRadio || !nonMandatory1) {
        return;
    }

    var lastTrigger = null;
    var BODY_CLASS = "constant-pop-opened";

    // Popup opens ONLY when the user UNCHECKS "Non-Mandatory Consent" (id non-mandatory-consent-1)
    // while "Capture Consent" is the selected option. With "Withdraw Consent" it never opens.
    function shouldShowPopup() {
        return captureRadio.checked && !nonMandatory1.checked;
    }

    nonMandatory1.addEventListener("change", function () {
        if (shouldShowPopup()) {
            openPopup(nonMandatory1);
        }
    });

    function getFocusable() {
        return Array.prototype.slice.call(
            popupDialog.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')
        );
    }

    function openPopup(trigger) {
        lastTrigger = trigger;
        popup.hidden = false;
        document.body.classList.add(BODY_CLASS);
        popupDialog.focus();                       // announces dialog title + description
        document.addEventListener("keydown", onKeydown, true);
    }

    function closePopup() {
        popup.hidden = true;
        document.body.classList.remove(BODY_CLASS);
        document.removeEventListener("keydown", onKeydown, true);
        if (lastTrigger && document.body.contains(lastTrigger)) {
            lastTrigger.focus();                   // return focus to the opener
        }
    }

    function onKeydown(e) {
        if (popup.hidden) { return; }

        if (e.key === "Escape" || e.key === "Esc") {
            e.preventDefault();
            e.stopPropagation();
            closePopup();
            return;
        }

        if (e.key === "Tab") {                     // keep focus inside the dialog
            var items = getFocusable();
            if (!items.length) { e.preventDefault(); return; }
            var first = items[0];
            var last = items[items.length - 1];
            var active = document.activeElement;

            if (e.shiftKey && (active === first || active === popupDialog)) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && active === last) {
                e.preventDefault();
                first.focus();
            } else if (!popupDialog.contains(active)) {
                e.preventDefault();
                first.focus();
            }
        }
    }

    popupClose.addEventListener("click", closePopup);

    // Click on the dark overlay (outside the dialog) closes it
    popup.addEventListener("mousedown", function (e) {
        if (e.target === popup) { closePopup(); }
    });

    switchProceedButton.addEventListener("click", function () {

        otpSection.style.display = "block";

        // Move focus to OTP section heading or first input
        var firstFocusable = otpSection.querySelector(
            'input:not(:disabled), button:not(:disabled), a[href], [tabindex="0"]'
        );

        if (firstFocusable && switchProceedButton.matches(":focus-visible")) {
            firstFocusable.focus();
        }
    });

})();




////////////////////////// OTP Block + Success Message //////////////////////////
(function () {
    "use strict";

    var form = document.getElementById('otp-form');
    var input = document.getElementById('otp-input');
    var error = document.getElementById('otp-error');
    var status = document.getElementById('otp-status');
    var resend = document.getElementById('otp-resend');
    var submitButton = document.getElementById('otp_submit');
    var cancelButton = document.getElementById('otp-cancel');

    // Success screen elements
    var successScreen = document.getElementById("sucess_screen");
    var constantScreens = document.getElementById("constant_screens");
    var otpScreen = document.getElementById("otp_screen");

    var OTP_LENGTH = 6;

    // Check required elements
    if (
        !form ||
        !input ||
        !error ||
        !status ||
        !resend ||
        !submitButton ||
        !cancelButton ||
        !successScreen ||
        !constantScreens ||
        !otpScreen
    ) {
        return;
    }

    // Update Submit button state based on OTP
    function updateSubmitButton() {
        var otpValue = input.value.trim();
        var isValid = new RegExp('^\\d{' + OTP_LENGTH + '}$').test(otpValue);

        submitButton.disabled = !isValid;

        submitButton.setAttribute(
            'aria-disabled',
            String(!isValid)
        );

        submitButton.classList.toggle('gray-btn', !isValid);
    }

    // Show OTP error
    function showError(msg) {
        error.textContent = msg;
        error.hidden = false;
        error.setAttribute('role', 'alert');

        input.setAttribute('aria-invalid', 'true');
        input.focus();
    }

    // Clear OTP error
    function clearError() {
        error.hidden = true;
        error.textContent = '';
        error.removeAttribute('role');

        input.removeAttribute('aria-invalid');
    }

    // OTP input event
    input.addEventListener('input', function () {

        // Allow digits only
        input.value = input.value.replace(/\D/g, '');

        if (!error.hidden) {
            clearError();
        }

        updateSubmitButton();
    });

    // OTP form submission
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        var otpValue = input.value.trim();

        if (!otpValue) {
            return showError('Enter the OTP. This field is required.');
        }

        if (otpValue.length !== OTP_LENGTH) {
            return showError(
                'The OTP must be ' +
                OTP_LENGTH +
                ' digits. You entered ' +
                otpValue.length +
                '.'
            );
        }

        clearError();

        // Show Success Screen
        successScreen.classList.remove("d-none");
        constantScreens.classList.add("d-none");
        otpScreen.classList.add("d-none");

        // Scroll to top to show success screen
window.scrollTo({
    top: 0,
    behavior: "smooth"
});
    });

    // Resend OTP with 30-second cooldown
    var cooling = false;
    var resendTimer = null;

    resend.addEventListener('click', function () {

        if (cooling) {
            return;
        }

        cooling = true;

        var remainingSeconds = 30;

        // Disable Resend button
        resend.disabled = true;
        resend.setAttribute('aria-disabled', 'true');

        resend.textContent = 'Resend OTP (' + remainingSeconds + 's)';

        status.textContent =
            'A new OTP has been sent to your mobile number. ' +
            'Resend OTP is disabled for 30 seconds.';

        // Countdown
        resendTimer = setInterval(function () {

            remainingSeconds--;

            resend.textContent =
                'Resend OTP (' + remainingSeconds + 's)';

            if (remainingSeconds <= 0) {

                clearInterval(resendTimer);
                resendTimer = null;

                cooling = false;

                // Enable Resend button
                resend.disabled = false;
                resend.removeAttribute('aria-disabled');

                resend.textContent = 'Resend OTP';

                status.textContent =
                    'You can request a new OTP now.';
            }

        }, 1000);

        // Keep focus on OTP input
        input.focus();
    });

    // Cancel button
    cancelButton.addEventListener('click', function () {
        window.history.back();
    });

    // Set initial Submit button state
    updateSubmitButton();

})();


/////////////////////// Switch Checkbox Not Clickable after click on Proceed Button////////////////////////////////////
(function () {
    "use strict";

    var proceedButton = document.getElementById("manage_constant_swicth_proceed");
    var consentBlock = document.getElementById("constant_active_switch");

    if (!proceedButton || !consentBlock) {
        return;
    }

    proceedButton.addEventListener("click", function () {
        consentBlock.classList.add("p-none");
    });

})();