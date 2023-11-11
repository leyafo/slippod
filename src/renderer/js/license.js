import * as CM from './common.js';
console.log(CM);
const myLicense = document.getElementById('licenseWindow');

function registerFormTemplate() {
    const template = `<div id="registerForm" class="form">
                        <div class="formBody">
                            <div class="formField">
                                <div class="fieldHeader">
                                    <p class="fieldDesc">Enter your license key below. You can purchase one from <a href="https://www.slippod.com/pricing">https://www.slippod.com/pricing</a></p>
                                </div>
                                <div class="fieldInput">
                                    <input id="licenseInput" type="text" placeholder="Enter license key">
                                    <p class="inputError"></p>
                                </div>
                            </div>
                        </div>
                        <div class="formCtrlBar">
                            <button id="submitLicenseBtn" disabled>Use License</button>
                        </div>
                    </div>`;
    return CM.htmlToElement(template);
}

function licenseInfoTemplate() {
    const template = `<div id="licenseInfo" class="form">
                          <div class="formHeader">
                              <p class="formHeaderDesc">Reach out to <a href="mailto:support@slippod.com">support@slippod.com</a> if you have any questions about your license.</p>
                          </div>
                          <div class="formBody">
                              <div class="formField">
                                  <div class="fieldHeader">
                                      <label for="emailInput">Email Address:</label>
                                  </div>
                                  <div class="fieldInput">
                                      <input id="emailInput" value="" readonly>
                                      <p class="inputError"></p>
                                  </div>
                              </div>
                              <div class="formField">
                                  <div class="fieldHeader">
                                      <label for="licenseKeyInput">License Code:</label>
                                  </div>
                                  <div class="fieldInput">
                                      <input id="licenseKeyInput" value="" readonly>
                                      <p class="inputError"></p>
                                  </div>
                              </div>
                          </div>
                      </div>`;
    return CM.htmlToElement(template);
}

function registerSuccessTemplate() {
    const template = `<div id="registerSuccess" class="dialog">
                          <div class="dialogGraphic success">
                              <span></span>
                          </div>
                          <p class="dialogMsg">You have licensed Slipped. Thank you.</p>
                          <div class="dialogCtrlBar">
                              <button id="dialogCloseBtn">OK</button>
                          </div>
                      </div>`;
    return CM.htmlToElement(template);
}

function invalidLicenseTemplate() {
    const template = `<div id="invalidLicense" class="dialog">
                          <div class="dialogGraphic invalid">
                              <span></span>
                          </div>
                          <p class="dialogMsg">Your licene is invalid.</p>
                          <div class="dialogCtrlBar">
                              <button id="dialogCloseBtn">OK</button>
                          </div>
                      </div>`;
    return CM.htmlToElement(template);
}

async function initWindow() {
    const licenseToken = await license.getLicense();
    console.log(licenseToken);
    let isValid = await license.checkLicense(licenseToken);

    if (isValid) {
        if (licenseToken.Type === undefined || licenseToken.Type === 'trial') {
            document.title = "Enter License";
            showRegisterForm();
        }
        if (licenseToken.Type === 'long') {
            document.title = "Your License";
            console.log('show license info');
            showLicenseInfo(licenseToken);
        }
        window.licenseToken = licenseToken;
        return;
    }
    else {
        showInvalidLicense();
    }
};

function showRegisterForm() {
    const registerFormDiv = registerFormTemplate();

    const licenseInput = registerFormDiv.querySelector('#licenseInput');
    const licenseInputError = CM.selectSiblingElement(licenseInput, '.inputError');
    const submitLicenseBtn = registerFormDiv.querySelector('#submitLicenseBtn');

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
        console.log(licenseInput.value)
        let licenseValue = licenseInput.value;
        const res = await license.register(licenseValue);
        console.log(res);
        if (res.statusCode === 401) {
            licenseInputError.textContent = "Invalid license. Please enter again.";
        }
        if (res.statusCode === 200) {
            console.log('success');
            showRegisterSuccess();
        }
    });
    
    myLicense.innerHTML = '';
    myLicense.appendChild(registerFormDiv);
}

function showRegisterSuccess() {
    const registerSuccessDiv = registerSuccessTemplate();
    const dialogCloseBtn = registerSuccessDiv.querySelector('#dialogCloseBtn');

    // 这里是想操作主窗口的，但是这两个方法要操作主窗口的dom元素，现在license窗口是没有的，所以报错了。现在需要想一下怎么操作主窗口的dom元素。
    // CM.hideTrialBar();
    // CM.unSetReadOnlyMode();

    dialogCloseBtn.addEventListener('click', () => {
        window.close();
    });

    myLicense.innerHTML = '';
    myLicense.appendChild(registerSuccessDiv);
}

function showLicenseInfo(license) {
    const licenseInfoDiv = licenseInfoTemplate();
    console.log(licenseInfoDiv);
    const emailInput = licenseInfoDiv.querySelector('#emailInput');
    const licenseKeyInput = licenseInfoDiv.querySelector('#licenseKeyInput');

    emailInput.value = license.Email;
    licenseKeyInput.value = license.License;

    myLicense.innerHTML = '';
    myLicense.appendChild(licenseInfoDiv);
}

function showInvalidLicense() {
    const invalidLicenseDiv = invalidLicenseTemplate();
    const dialogCloseBtn = invalidLicenseDiv.querySelector('#dialogCloseBtn');

    dialogCloseBtn.addEventListener('click', () => {
        window.close();
    });

    myLicense.innerHTML = '';
    myLicense.appendChild(invalidLicenseDiv);
}

window.addEventListener('DOMContentLoaded', function(event) {
    initWindow();
});