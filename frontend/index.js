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



function fetchproducts() {
    let products = [];

    fetch('http://localhost:3000/product', {
        method: 'GET',
        headers: { "Content-Type": "application/json" },
    })
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
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3><br>
            <p>${product.stock}</p><br>
            <strong>$${product.price}</strong><br>
            <button onclick="addtocart()">Add to Cart</button>
        `;

        container.appendChild(productCard);
       
    });
}

//automaticaly load products 
fetchproducts();
//create new products
function addproduct() {
    const name = document.getElementById("name");
    const company_id =document.getElementById("company_id");
    const category_id = document.getElementById("category_id");
    const price = document.getElementById("price");
    const stock = document.getElementById("");
    fetch('http:/localhost:3000//product/add',{
        method: 'post', 
        header: {"Content-Type": "application/json"},
        body: JSON.stringify({ name,company_id, category_id, price, stock})
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
            showNotification(data.message, "admin_notification");
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
