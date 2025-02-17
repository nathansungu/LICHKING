// Load external API script
const script = document.createElement('script');
//script.src = "../api/api.js"; 
document.head.appendChild(script)

document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("loginform")) {
        login();
    }
    if (document.getElementById("register_form")) {
        register();
    }
});

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
                showNotification(data.message, "error");
                console.error("Error:", data);
            }
        })
        .catch(error => {
            showNotification('Error: ' + error.message, "error");
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

        if (password !== confirmPassword) {
            showNotification("Passwords do not match!", "reg_notification");
            return;
        }

        fetch('http://localhost:3000/register/customer', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ first_name, second_name, phone_no, email, password })
        })
        .then(response => response.json().then(data => ({ status: response.ok, data })))
        .then(({ status, data }) => {
            if (status) {
                showNotification("Registration successful! You can now log in.", "reg_notification");
            } else {
                showNotification(data.message, "reg_notification");
                console.error("Error:", data);
            }
        })
        .catch(error => {
            showNotification('Error: ' + error.message, "reg_notification");
            console.error('Error:', error);
        });
    });
}

function fetchproducts() {
    let products = [];
    // products.push("Orange");
    // products.push("Orange");
    // console.log(products);  

    fetch('http://localhost:3000/product', {
        method: 'GET',
        headers: { "Content-Type": "application/json" },
    })
    // .then(response => response.json())
    // .then(data => {

    //     // data.forEach(product => {
    //     //     products.push(product)})

    //     products.push(data);
    //     console.log(products); 
    //     displayProducts(products);   
 

    // })
    .then(response => response.json()) // Convert response to JSON
    .then(data => {
        if (data.message && Array.isArray(data.message)) { 
        products = [...data.message]; // Store products in array // Output the result
        products.push(products);
        products.pop(-1);
        } else {
        console.error("Invalid data format");

        }
        displayProducts(products); 
    })
    .catch(error => {
        showNotification("Error fetching products: " + error.message ,"product_notification" );
        console.error('Error:', error);
    });
}
function displayProducts(products) {
    let container = document.getElementById('productContainer');
    container.innerHTML = ""; // Clear previous content

    products.forEach(product => {
        let productCard = document.createElement('div');
        productCard.classList.add('product');
        ////<img src="${product.image}" alt="${product.name}">
        productCard.innerHTML = `
            <h3>${product.name}</h3>
            
            <p>${product.stock}</p>
            <strong>$${product.price}</strong>
        `;

        container.appendChild(productCard);
       
    });
}

//automaticaly load products 
fetchproducts();

function showNotification(message, id ) {
    const notification = document.getElementById(id);
    if (notification) {
        notification.style.display = "block";
        notification.innerText = message;
        //notification.className = notification; 

        setTimeout(() => {
            notification.style.display = "none";
        }, 7000); // Hide the notification after 3 seconds
    } else {
        console.error(`Notification element with id '${id}' not found.`);
    }
}
//toggle password visibility
function togglePasswordVisibility(id) {
    var passwordField = document.getElementById(id);
    if (passwordField.type === "password") {
        passwordField.type = "text";
    } else {
        passwordField.type = "password";
    }
}
