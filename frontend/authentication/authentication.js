const { error } = require("console");

function login() {
    document.getElementById("loginform").addEventListener("submit", async (event) => {
        event.preventDefault();

        var email = document.getElementById("email").value;
        var password = document.getElementById("password").value;

        fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        })
        .then(response => response.json().then(data => ({ status: response.ok, data })))
        .then(({ status, data }) => {
            if (status) {
                if (data.role === "admin") {
                    window.location.href = "/admin/dashboard";
                } else if (data.role === "customer") {
                    window.location.href = "/customer/profile";
                }
            } else {
                showNotification(data.message, "notification");
                console.error("Error:", error);
            }
        })
        .catch(error => {
            showNotification('Error: ' + error.message, "notification");
            console.error('Error:', error);
        });
    });
}

function register() {
    document.getElementById("register_form").addEventListener("submit", async (event) => {
        event.preventDefault();

        var first_name = document.getElementById("first_name").value;
        var second_name = document.getElementById("second_name").value;
        var phone_no = document.getElementById("phone_no").value;
        var email = document.getElementById("email").value;
        var password = document.getElementById("password").value;
        var confirmPassword = document.getElementById("confirm_password").value;

    //clear the form
    document.getElementById("register_form").reset();

        if (password !== confirmPassword) {
            showNotification("Passwords do not match!", "notification");
            return;
        }

        fetch('http://localhost:3000/register/customer', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ first_name, second_name, phone_no, email, password ,confirmPassword})
        })
        .then(response => response.json().then(data => ({ status: response.ok, data })))
        .then(({ status, data }) => {
            if (status) {
                showNotification(data.message, "notification");
            } else {
                showNotification(data.message, "notification");
                console.error("Error:", data);
            }
        })
        .catch(error => {
            showNotification('Error: ' + error.message, "notification");
            console.error('Error:', error);
        });
    });
}

function showNotification(message, id) {
    const notification = document.getElementById(id);
    if (notification) {
        notification.style.display = "block";
        notification.style.backgroundColor = "green"; // Set background color to red
        notification.style.color = "white"; // Set text color to white
        notification.innerText = message;

        setTimeout(() => {
            notification.style.display = "none";
        }, 5000); // Hide the notification after 7 seconds
    } else {
        console.error(`Notification element with id '${id}' not found.`);
    }
}

// toggle password visibility
function togglePasswordVisibility(id) {
    var passwordField = document.getElementById(id);
    if (passwordField.type === "password") {
        passwordField.type = "text";
    } else {
        passwordField.type = "password";
    }
}
