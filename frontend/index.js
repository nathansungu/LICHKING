//run ..api/api.js
const { response } = require("express");
const router  = require("../api/api.js");

function login() {
    document.getElementById("loginform").addEventListener("submit", async (event) =>{
        event.preventDefault();

        var email = document.getElementById("email").value;
        var password = document.getElementById("password").value;
        fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ email, password })
        })
        .then(res => res.json())
        .then(data => {
            if (response.ok) {
            if (data.role === "admin") {
                window.location.href = "/admin/dashboard"; // Redirect to admin page
            } else if (data.role === "customer") {
                window.location.href = "/customer/profile"; // Redirect to customer page
            }
            register();
            } else {
            alert(data.message); // Display error message
            console.error("Error:", data);
            }
        })
        .catch(error => console.error('Error:', error));
    });
}

function register() {
    document.getElementById("register_form").addEventListener("submit", async (event) =>{
        event.preventDefault();

        var first_name = document.getElementById("first_name").value;
        var second_name = document.getElementById("second_name").value;
        var phone_no = document.getElementById("phone_no").value;
        var email = document.getElementById("email").value;
        var password = document.getElementById("password").value;        
        var confirmPassword = document.getElementById("confirmPassword").value;
        fetch('http://localhost:3000/register',{
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ first_name, second_name, phone_no, email, password, confirmPassword})
        })
        .then(response => response.json())
        .then(data => {
            if (response.ok) {
                alert(data.message);
            } else {
                alert(data.message); // Display error message
                console.error("Error:", data);
            }
        })
        .catch(error => console.error('Error:', error));
    });
} 