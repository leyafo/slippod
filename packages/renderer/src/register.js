document.getElementById("licenseForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const licenseKey = document.getElementById("licenseKey").value;

    if (validateLicense(licenseKey)) {
        document.getElementById("message").textContent = "License successfully registered!";
        document.getElementById("message").style.color = "green";
    } else {
        document.getElementById("message").textContent = "Invalid license key!";
        document.getElementById("message").style.color = "red";
    }
});

function validateLicense(licenseKey) {
    license.register(licenseKey)
    // Replace this with your own license validation logic
}
