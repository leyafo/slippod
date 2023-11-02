import * as CM from './common.js';

const registerDiv = document.querySelector(".register")
const infoDiv = document.querySelector(".info")

const emailInput = document.querySelector("#emailInput")
const licenseKeyInput = document.querySelector("#licenseKeyInput")

CM.clickHandle("#commitBtn", function(e){
    const key = document.getElementById('licenseInput').value
    license.register(key).then(function(response){
        if(response.statusCode == 200){
            const licenseToken = JSON.parse(response.body)
            license.checkLicense(licenseToken).then(function(isValid){
                if (isValid){
                    registerDiv.classList.add("hidden")
                    emailInput.value = licenseToken.Email
                    licenseKeyInput.value = licenseToken.License
                }
            })
        }else{
            window.alert("invalid license");
        }
    })
})

window.addEventListener('DOMContentLoaded', function() {
    license.getLicense().then(function(licenseToken){
        window.licenseToken = licenseToken
        const registerDiv = document.querySelector(".register")
        const infoDiv = document.querySelector(".info")
        if (licenseToken == {}){
            infoDiv.classList.add("hidden")
            return
        }
        license.checkLicense(licenseToken).then(function(isValid){
            if (isValid){
                if(licenseToken.Type == 'trial'){
                    infoDiv.classList.add("hidden")
                }else{ //license is OK, hidden the notification bar
                    registerDiv.classList.add("hidden")
                }
            }else{
                registerDiv.classList.add("hidden")
            }
        })
    })
})