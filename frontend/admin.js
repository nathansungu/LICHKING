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
            showNotification(data.message, "admin_notification");
        } else {
            showNotification(data.message, "admin_notification");
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
            showNotification(data.message, "admin_notification");
        } else {
            showNotification(data.message, "admin_notification");
            console.error("Error:", data);
        }
    })
}
//display products
function displayProducts() {
    fetch('http://localhost:3000/product', {
        method: 'GET',
        headers: { "Content-Type": "application/json" }
    })  
    .then(response => response.json())
    .then(data => {
        const products =data.message;
        let container = document.getElementById('productContainer');
        renderProducts(products, container)

    })
    .catch(error => {
        showNotification(error.message, "product_notification");
        console.error("Unable to connect to server", error);
    });
}
// Render products in the container
function renderProducts(products, container) {
    container.innerHTML = ""; // Clear previous content

    products.forEach(product => {
        let productCard = document.createElement('div');
        productCard.classList.add('product');
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}"><br>
            <h3>Name: ${product.name}</h3><br>
            <p>Stock: ${product.stock}</p><br>
            <strong>Price: ${product.price}</strong><br>
            <p>Company: ${product.Company.name}</p><br>
            <p>Category: ${product.Category.name}</p><br>
            <p>Description: ${product.description}</p><br>
            <button onclick="addtocart()">Add to Cart</button>
        `;

        container.appendChild(productCard);
       
    });
}
displayProducts();

// add products
function addproduct() {
    const name = document.getElementById("name").value;
    const image = document.getElementById("image").value;
    const company_id = document.getElementById("company_id").value;
    const category_id = document.getElementById("category_id").value;
    const price = document.getElementById("price").value;
    const stock = document.getElementById("stock").value;
    const description = document.getElementById("description").value;

    fetch('http://localhost:3000/product/add',{
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, name, company_id, category_id, price, stock, description })
    })
    .then(async response => {
        const data = await response.json();
        return { status: response.ok, data };S
    })
    .then(({ status, data }) => {
        if (status) {
            showNotification(data.message, "addproductnotification");
        } else {
            showNotification(data.message, "addproductnotification");
            console.error("Error:", data);
        }
    })
    .catch(error => {
        showNotification("Unable to connect to server", "admin_notification");
        console.error("Unable to connect to server", error);
    });
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
    const product_id = document.getElementById("selected_product_id").value;
    fetch('http://localhost:3000/product/delete', {
        method: 'DELETE',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id })
    })
    .then(response => response.json())
    .then(data => ({ status: response.ok, data }))
    .then(({ status, data }) => {
        if (status) {
            showNotification(data.message, "deleteproductnotification");
        } else {
            showNotification(data.message, "deleteproductnotification");
            console.error("Error:", data);
        }
    })
}

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
            showNotification(data.message, "admin_notification");
        } else {
            showNotification(data.message, "admin_notification");
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
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.json())
    .then(data => {
        const companies = data.company;
        const select = document.getElementById('company_id');
        select.innerHTML = ""; // Clear existing options
        companies.forEach(company => {
            const option = document.createElement('option');
            option.value = company.id
            option.textContent = company.name;
            select.appendChild(option);
        });
    })
    .catch(error => {
        showNotification('Error: ' + error.message, "admin_notification");
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
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.json())
    .then(data => {
        const categories = data.category;
        const select = document.getElementById('category_id');
        select.innerHTML = ""; // Clear existing options
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            select.appendChild(option);
        });
    })
    .catch(error => {
        showNotification('Error: ' + error.message, "category_notification");
        console.error('Error:', error);
    });
}
// show notification
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