import * as CM from './common.js';

const myLicense = document.getElementById('myLicense');
const registerForm = document.getElementById('registerForm');
const licenseInfo = document.getElementById('licenseInfo');

async function initWindow() {
    const licenseToken = await license.getLicense();
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
    console.log('initRegisterForm');
    const licenseInput = document.getElementById('licenseInput');
    const licenseInputError = CM.selectSiblingElement(licenseInput, '.inputError');
    const submitLicenseBtn = document.getElementById('submitLicenseBtn');

    licenseInput.addEventListener('keyup', (event) => {
        if (event.target.value === '') {
            submitLicenseBtn.disabled = true;
        } else {
            submitLicenseBtn.disabled = false;
        }
    });

    submitLicenseBtn.addEventListener('click', async (event) => {
        let licenseValue = licenseInput.value;
        const res = await license.register(licenseValue);
        if (res.statusCode = 401) {
            console.log(licenseInputError);
        }
        console.log(licenseToken);
    });
    return;
}

function showRegisterForm() {
    console.log('showRegisterForm');
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