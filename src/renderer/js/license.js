import * as CM from './common.js';

const myLicense = document.getElementById('myLicense');
const registerForm = document.getElementById('registerForm');
const licenseInfo = document.getElementById('licenseInfo');

async function initWindow() {
    const licenseToken = await license.getLicense();
    console.log(licenseToken);
    if (licenseToken == {}) {
        const trialLicenseToken = await CM.startTrial();
        if (trialLicenseToken.Type === 'trial') {
            window.licenseToken = trialLicenseToken;
        }
    }

    const isValid = await license.checkLicense(licenseToken);
    if (isValid) {
        window.licenseToken = licenseToken;
        if (licenseToken.Type === 'trial') {
            initRegisterForm();
            showRegisterForm();
            return;
        }
        if (licenseToken.Type === 'long') {
            showLicenseInfo();
            return;
        }
    } else {
        // showErrorMessage();
        return;
    }
};

function initRegisterForm() {
    const licenseInput = document.getElementById('licenseInput');
    const licenseInputError = CM.selectSiblingElement(licenseInput, '.inputError');
    const submitLicenseBtn = document.getElementById('submitLicenseBtn');

    licenseInput.addEventListener('keyup', (event) => {
        if (event.target.value === '') {
            submitLicenseBtn.disabled = true;
            licenseInputError.textContent = '';
        } else {
            submitLicenseBtn.disabled = false;
            licenseInputError.textContent = '';
        }
    });

    submitLicenseBtn.addEventListener('click', async (event) => {
        let licenseValue = licenseInput.value;
        const res = await license.register(licenseValue);
        console.log(res);
        if (res.statusCode === 401) {
            licenseInputError.textContent = "Invalid license. Please enter again.";
        }
        if (res.statusCode === 200) {
            
        }
    });
    return;
}

function showRegisterForm() {
    CM.toggleElementShown(registerForm);
    CM.toggleElementHidden(licenseInfo);
    return;
}

function showLicenseInfo() {
    console.log('showLicenseInfo');
    CM.toggleElementShown(licenseInfo);
    CM.toggleElementHidden(registerForm);
    return;
}

window.addEventListener('DOMContentLoaded', function(event) {
    initWindow();
});