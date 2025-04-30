function login() {
    document.getElementById("loginform").addEventListener("submit", async (event) => {
        event.preventDefault();

        var email = document.getElementById("email").value;
        var password = document.getElementById("password").value;

        fetch('http://127.0.0.1:3000/login', {
            method: 'POST', 
            credentials: 'include',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        })
        .then(response => response.json().then(data => ({ status: response.ok, data })))
        .then(({ status, data }) => {
            if (status) {
                showNotification(data.message, "notification");
                if (data.role === "admin") {
                    window.location.href = "/admin_dashboard";
                } else if (data.role === "customer") {
                    // Sleep for 2 seconds before redirecting to the customer page
                    setTimeout(() => {
                        fetchcustomerpage();
                        
                    }, 3000);                    
                                       
                }
            } else {
                showNotification(data.message, "notification");
            }
        })
        .catch(error => {
            showNotification( error.message, "notification");
        });
    });
}
//fech users profile
function fetchcustomerpage() {
    fetch('http://localhost:3000/customer', {
        method: 'GET',
        headers: { "Accept": "text/html" }
    })
    .then(response => {
        if (response.ok) {
            return response.text().then(html => {
                // Open the page returned by the API
                const newWindow = window.open();
                newWindow.document.write(html);
                if (newWindow) {
                    setTimeout(() => {
                        customerProfile();
                        newWindow.location.reload(); // Reload the new window after 2 seconds
                    }, 2000);
                    newWindow.document.close();
                }
                
            });
        } else {
            return response.text().then(errorMessage => {
                showNotification(errorMessage, "notification");
            });
        }


    })
    .catch(error => {
        showNotification(error.message, "notification");
    });
}
function customerProfile() {    
    // Redirect to the customer profile page
        
    fetch('http://127.0.0.1:3000/customer/profile', {
        method: 'GET',
        credentials: "include",
        headers: { "Content-Type": "application/json" }
    })
    .then(response => 
        response.json().then(data =>
             ({ status: response.ok,
                 data 
                }))
        )
    .then(({ status, data }) => {
        if (status) {
            document.getElementById("customer_first_name").innerText = data.user.name;
            //document.getElementById("customer_second_name").innerText = data.second_name;
            //document.getElementById("customer_phone_no").innerText = data.user.phone_no;
            document.getElementById("customer_email").innerText = data.user.email;
        } else {
            showNotification(data.message, "notification");
        }
    })
    .catch(error => {
        showNotification( error.message, "notification");
        console.error('Error:', error);
    });
}
//admin profile
function adminProfile() { 
    fetch('http://localhost:3000/admin/profile', {
        method: 'GET',
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.json().then(data => ({ status: response.ok, data })))
    .then(({ status, data }) => {
        if (status) {
            document.getElementById("first_name").innerText = data.first_name;
            //document.getElementById("second_name").innerText = data.second_name;
            //document.getElementById("phone_no").innerText = data.phone_no;
            document.getElementById("email").innerText = data.email;
        } else {
            showNotification(data.message, "notification");
        }
    })
    .catch(error => {
        showNotification( error.message, "notification");
        console.error('Error:', error);
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
