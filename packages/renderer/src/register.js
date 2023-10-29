document.getElementById("licenseForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const licenseKey = document.getElementById("licenseKey").value;

    license.register(licenseKey)
});
