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
                showNotification(data.message, "reg_notification");
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
//registeradmin
function registeradmin() {
    const first_name = document.getElementById("first_name").value;
    const second_name = document.getElementById("second_name").value;
    const email = document.getElementById("email").value;
    const phone_no = document.getElementById("phone_no").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm_password").value;

    if (password !== confirmPassword) {
        showNotification("Passwords do not match!", "adminreg_notification");
        return;
    }
    fetch('http://localhost:3000/admin/register', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first_name, second_name, phone_no, email, password })
    })
    .then(response => response.json().then(data => ({ status: response.ok, data })) )
    .then(({ status, data }) => {
        if (status) {
            showNotification(data.message, "adminreg_notification");
        } else {
            showNotification(data.message, "adminreg_notification");
            console.error("Error:", data);
        }
    })
}
//fetch admins
function fetchadmins(){
    fetch('http:/localhost:3000/admins',{
        method: 'post',
        headers: {"Content-Type": "application/json"},        
    })
    .then (response => response.json().then(data => ({ status: response.ok, data })) )
    .then(({ status, data }) => {
        if (status) {
            showNotification(data.message, "adminreg_notification");
        } else {
            showNotification(data.message, "adminreg_notification");
            console.error("Error:", data);
        }
    })
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

//add products
function addproducts() {
    const name = document.getElementById("name").value;
    const company_id = document.getElementById("company_id").value;
    const category_id = document.getElementById("category_id").value;
    const price = document.getElementById("price").value;
    const stock = document.getElementById("stock").value;

    fetch('http://localhost:3000/product/add', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, company_id, category_id, price, stock })
    })
    .then(response => response.json())
    .then(data => ({ status: response.ok, data }))
    .then(({ status, data }) => {
        if (status) {
            showNotification( data.message, "admin_notification");
        } else {
            showNotification(data.message, "admin_notification");
            console.error("Error:", data);
        }
    })
}
//update product
function updateproducts() {
    const name = document.getElementById("name").value;
    const company_id = document.getElementById("company_id").value;
    const category_id = document.getElementById("category_id").value;
    const price = document.getElementById("price").value;
    const stock = document.getElementById("stock").value;

    fetch('http://localhost:3000/product/update', {
        method: 'PUT',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, company_id, category_id, price, stock })
    })
    .then (response => response.json())
    .then(data => ({ status: response.ok, data }))
    .then(({ status, data }) => {
        if (status) {
            showNotification(data.message, "admin_notification");
        } else {
            showNotification(data.message, "admin_notification");
            console.error("Error:", data);
        }
    })
}
// delete product
function deleteproduct(){
    const name = document.getElementById("name").value;
    fetch('http://localhost:3000/product/delete', {
        method: 'DELETE',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
    })
    .then(response => response.json())
    .then(data => ({ status: response.ok, data }))
    .then(({ status, data }) => {
        if (status) {
            showNotification(data.message, "admin_notification");
        } else {
            showNotification(data.message, "admin_notification");
            console.error("Error:", data);
        }
    })
}

//add product to cart
function addtocart() { 
    const customer_id = sessionStorage.getItem("customer_id");
    const product_id = document.getElementById("product_id").value;
    const quantity = document.getElementById("quantity").value;
    fetch('http://localhost:3000/product/addtocart', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_id, product_id, quantity })
    })
    .then(response => response.json())
    .then(data => ({ status: response.ok, data }))
    .then(({ status, data }) => {
        if (status) {
            showNotification(data.message, "cart_notification");
        } else {
            showNotification(data.message, "cart_notification");
            console.error("Error:", data);
        }
    })
}
//view cart
function viewcart() {
    const customer_id = sessionStorage.getItem("customer_id");
    fetch('http://localhost:3000/cart', {
        method: 'GET',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_id })
    })
    .then(response => response.json())
    .then(data => ({ status: response.ok, data }))
    .then(({ status, data }) => {
        if (status) {
            showNotification(data.order, "cart_notification");
        } else {
            showNotification(data.message, "cart_notification");
            console.error("Error:", data);
        }
    })
}
//place order
function placeorder() {
    const customer_id = sessionStorage.getItem("customer_id");
    fetch('http://localhost:3000/order', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_id })
    })
    .then(response => response.json())
    .then(data => ({ status: response.ok, data }))
    .then(({ status, data }) => {
        if (status) {
            showNotification(data.message, "cart_notification");
        } else {
            showNotification(data.message, "cart_notification");
            console.error("Error:", data);
        }
    })
}
// cancel order
//admin
function cancelorder() {
    // Get order_id from viewcart function response data
    viewcart().then(cartData => {
        const order_id = cartData.data.order.id;

        fetch('http://localhost:3000/order/cancel', {
            method: 'DELETE',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order_id })
        })
        .then(response => response.json())
        .then(data => ({ status: response.ok, data }))
        .then(({ status, data }) => {
            if (status) {
                showNotification(data.message, "admin_notification");
            } else {
                showNotification(data.message, "admin_notification");
                console.error("Error:", data);
            }
        });
    });
}

// customer
function customercancelorder() {
    const customer_id = sessionStorage.getItem("customer_id");
    viewcart().then(cartData => {
        const order_id = cartData.data.order.id;

        fetch('http://localhost:3000/order/cancel', {
            method: 'DELETE',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ customer_id, order_id })
        })
        .then(response => response.json())
        .then(data => ({ status: response.ok, data }))
        .then(({ status, data }) => {
            if (status) {
                showNotification(data.message, "cart_notification");
            } else {
                showNotification(data.message, "cart_notification");
                console.error("Error:", data);
            }
        });
    });
}
//update delivery status
function updatedeliverystatus() {
    const order_id =  viewcart().then(cartData => {
        let id = cartData.data.order.id;
        return id;
    });
    const status = document.getElementById("status").value;
    fetch('http://localhost:3000/order/update_delivery_status', {
        method: 'PUT',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id, status })
    })
    .then(response => response.json())
    .then(data => ({ status: response.ok, data }))
    .then(({ status, data }) => {
        if (status) {
            showNotification(data.message, "admin_notification");
        } else {
            showNotification(data.message, "admin_notification");
            console.error("Error:", data);
        }
    })
}
//check delivery status
function checkdeliverystatus() {
    const order_id = viewcart().then(cartData => {
        let id = cartData.data.order.id;
        return id;
    });
    fetch('http://localhost:3000/order/delivery_status', {
        method: 'GET',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id })
    })
    .then(response => response.json())
    .then(data => ({ status: response.ok, data }))
    .then(({ status, data }) => {
        if (status) {
            showNotification(data.message + status, "cart_notification");
        } else {
            showNotification(data.message, "cart_notification");
            console.error("Error:", data);
        }
    })
}
//function to add company 
function addcompany(){
    const name = document.getElementById("companyname").value;
    const location = document.getElementById("companylocation").value;
    const phone_no = document.getElementById("phone_no").value;
    const email = document.getElementById("email").value;

    fetch('http://localhost:3000/company/add', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, location, phone_no, email })
    })
    .then(response => response.json())
    .then(data => ({ status: response.ok, data }))
    .then(({ status, data }) => {
        if (status) {
            showNotification(data.message, "company_notification");
        } else {
            showNotification(data.message, "company_notification");
            console.error("Error:", data);
        }
    })
    .catch(error => {
        showNotification('Error: ' + error.message, "company_notification");
        console.error('Error:', error);
    });
}
//get all companies
function getcompanies() {
    fetch('http://localhost:3000/company', {
        method: 'GET',
        headers: { "Content-Type": "application/json" },
    })
    .then(response => response.json())
    .then(data => ({ status: response.ok, data }))
    .then(({ status, data }) => {
        if (status) {
            showNotification(data.message, "company_notification");
        } else {
            showNotification(data.message, "company_notification");
            console.error("Error:", data);
        }
    })
    .catch(error => {
        showNotification('Error: ' + error.message, "company_notification");
        console.error('Error:', error);
    });
}
//add category
function addcategory() {
    const name = document.getElementById("categoryname").value;
    fetch('http://localhost:3000/category/add', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
    })
    .then(response => response.json())
    .then(data => ({ status: response.ok, data }))
    .then(({ status, data }) => {
        if (status) {
            showNotification(data.message, "category_notification");
        } else {
            showNotification(data.message, "category_notification");
            console.error("Error:", data);
        }
    })
    .catch(error => {
        showNotification('Error: ' + error.message, "category_notification");
        console.error('Error:', error);
    });
}
//get all categories
function getcategories() {
    fetch('http://localhost:3000/category', {
        method: 'GET',
        headers: { "Content-Type": "application/json" },
    })
    .then(response => response.json())
    .then(data => ({ status: response.ok, data }))
    .then(({ status, data }) => {
        if (status) {
            showNotification(data.message, "category_notification");
        } else {
            showNotification(data.message, "category_notification");
            console.error("Error:", data);
        }
    })
    .catch(error => {
        showNotification('Error: ' + error.message, "category_notification");
        console.error('Error:', error);
    });
}

function showNotification(message, id) {
    const notification = document.getElementById(id);
    if (notification) {
        notification.style.display = "block";
        notification.innerText = message;

        setTimeout(() => {
            notification.style.display = "none";
        }, 7000); // Hide the notification after 7 seconds
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
