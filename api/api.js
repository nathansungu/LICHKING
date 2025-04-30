//import models file
const Sequelize = require('sequelize');
const path = require('path');
const bcrypt = require("bcrypt");
const{message} =require("statuses");
//import the session configfiles
const sessionconfig = require("../session.config.js/sessionconfig")
const express = require("express");
const app = express();
//use cors
const cors = require('cors');
app.use(cors({
    origin: 'http://127.0.0.1:5500',
    credentials: true    
}));
app.use(sessionconfig);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//initialize port number
const port = process.env.PORT || 3000;
//set the port usage

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});


// Models are already imported above
//import models
const {Customer,Admin, Products, Company,Orders, Order_items, Category } =require("../models/models");
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { create } = require('domain');

//customer registration
app.post("/register/customer", async (req, res) => {
    try {
        const { first_name, second_name, email,phone_no, password, confirmPassword} = req.body;
        if (!first_name || !second_name || !email || !phone_no|| !password || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Password don't match" });            
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newCustomer = await Customer.create({
            first_name: Sequelize.literal(`'${first_name.replace(/'/g, "''")}'`),
            second_name: Sequelize.literal(`'${second_name.replace(/'/g, "''")}'`),
            email: Sequelize.literal(`'${email.replace(/'/g, "''")}'`),
            phone_no: Sequelize.literal(`'${phone_no.replace(/'/g, "''")}'`),
            password: hashedPassword
        });

        res.status(201).json({
            message: "User registered successfully",
            customer: { id: newCustomer.id, name: newCustomer.first_name, email: newCustomer.email },
        });
    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            let field = error.errors[0]?.path;
            if (field == "phone_no") {
                field =" phone Number "       
            };
            res.status(400).json({ message: `A record with this ${field} already exists` });
        } else {
            res.status(400).json({ message:  "An error occurred" });
        }
    }
});


//login
app.post("/login", async (req, res) => {
    try {
        const { email} = req.body;
        //make passord a string
        const password = String(req.body.password);
        if (!email || !password) {
            return res.status(401).json({ message: "All fields are required " });
        }

        // Check for customer first
        let user = await Customer.findOne({ where: { email } });
        let admin = await Admin.findOne({ where: { email } });
        if (user) {
            const checkpassword = await bcrypt.compare(password, user.password);
            
            // If password matches, set session and return user info
            if (!checkpassword) {
                return res.status(401).json({ message: "Invalid email or password" });
            } else {
                req.session.user = {
                    id: user.id,
                    name: user.first_name,
                    email: user.email , 
                    phone_no: user.phone_no, 
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                    role: "customer"     
                };
                req.session.save(err => {
                    if (err) {
                        console.error('Session save error:', err);
                        return res.status(500).json({ message: "Could not save session." });
                    }
                });
                //console.log("Session data:", req.session.user);
                console.log(req.session);

                return res.status(201).json({
                    message: "Login successful",
                    role: "customer",
                    user: { id: user.id, name: user.first_name, email: user.email, role: "customer" },
                });
            } 
        } else if (admin) {
            // If not customer, check for admin
            const adminpassword = await bcrypt.compare(password, admin.password);
            if (adminpassword) {
                req.session.user = {
                    id: admin.id,
                    name: admin.first_name,
                    email: admin.email,
                    role: "admin",
                };
                // Save session
                req.session.save(err => {
                    if (err) {
                        console.error('Session save error:', err);
                        return res.status(500).json({ message: "Could not save session." });
                    }
                });
                return res.status(201).json({
                    message: "Login successful",
                    role: "admin",
                    user: { id: admin.id, name: admin.first_name, email: admin.email, role: "admin" },
                });
            } else {
                return res.status(401).json({ message: "Invalid email or password" });
            }
        }
    } catch (error) {
        console.error(error);
        return res.status(400).json({ message: "Error logging in. Contact customer care." });
    }
});
app.get('/debug-session', (req, res) => {
    console.log('Session:', req.session);
    res.json(req.session);
});

// profile path
app.get("/customer/profile", async (req, res) => {
         
    if (!req.session.user) {
        return res.status(401).json({ message: "Unauthorized. login" });
    }
    res.status(200).json({
        message: "Hello, " + req.session.user.name,
        user: req.session.user,
    });
});
//push customer profile page    
app.get("/customer", async (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/customer_profile.html'));
})
//logout path
app.get("/logout", (req, res)=> {
    req.session.destroy();
    res.status(200).json({ message: "Logged out successfully" });
});


//forgot password
// Generate a password reset token
app.post('/password reset', async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        // Check if the user is a customer
        let user = await Customer.findOne({ where: { email } });
        if (!user) {
            // Check if the user is an admin
            user = await Admin.findOne({ where: { email } });
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
        }

        // Generate a reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpires = Date.now() + 30 * 60 * 1000; // 30 minutes from now

        // Save the reset token and expiration to the user
        user.resetToken = resetToken;
        user.resetTokenExpires = resetTokenExpires;
        await user.save();

        // Send the reset token via email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'your-email@gmail.com',
                pass: 'your-email-password'
            }
        });

        const mailOptions = {
            from: 'your-email@gmail.com',
            to: email,
            subject: 'Password Reset',
            text: `You requested a password reset. Click the link to reset your password: http://example.com/reset-password?token=${resetToken}`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "Password reset link sent to your email" });
    } catch (error) {
        next(error);
    }
});

// Reset password using the token
app.post('/reset-password', async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({ message: "Token and new password are required" });
        }

        // Find the user by reset token and check if the token is still valid
        let user = await Customer.findOne({ where: { resetToken: token, resetTokenExpires: { [Sequelize.Op.gt]: Date.now() } } });
        if (!user) {
            user = await Admin.findOne({ where: { resetToken: token, resetTokenExpires: { [Sequelize.Op.gt]: Date.now() } } });
            if (!user) {
                return res.status(400).json({ message: "Invalid or expired token" });
            }
        }

        // Update the user's password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetToken = null;
        user.resetTokenExpires = null;
        await user.save();

        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        next(error);
    }
});


//add a product
app.post("/product/add", async (req, res, next)=>{
    try {
        const{name, image, company_id, category_id, price, stock,description}=req.body;
        if (!name|| !image|| !company_id || !category_id|| !price|| !stock|| !description) {
            return res.status(400).json({message: "provide all the details"})
        }
        const checksimillarproduct = await Products.findOne({where: {name}});   
        if (checksimillarproduct) {
            return res.status(400).json({message: "Product already exists"})
            
        }else{
            const newProduct = await Products.create({ name, company_id, category_id, price,stock,description});
            res.status(201).json({
            message: "Product added successfully",
            product: newProduct
        });
        }
        
    } catch (error) {
        next(error);
    }
});

//Get all products
app.get("/product", async (req, res, next) => {
    try {
        const products = await Products.findAll({
            attributes: ['name','image', 'price', 'stock', 'description'],
            include: [
            {
                model: Company,
                attributes: ['name'],
            },
            {
                model: Category,
                attributes: ['name'],
            }
            ]
        });
        if(!products) {
            return res.status(404).json({message: 'No products found'});
        }
        return res.status(201).json({message: products});
    } catch (error) {
        next(error);
    }
});

///update a product
app.put("/product/update", async(req,res) =>{
    const{name, company_id,category_id, price,stock}=req.body
    try {
        const searchProduct = await Books.findOne({where: {name}});
        if (!searchProduct) {
            return res.status(400).send("Invalid product");
        }
        searchProduct.name = title;
        searchProduct.company_id=company_id;
        searchProduct.category_id=category_id;
        searchProduct.price = price;
        searchProduct.stock =stock;

        await searchProduct.save();
        return res.status(200).send("product updated successfully");
    } catch (error) {
        console.error("Error updating product:", error);
        return res.status(500).send("Cannot update product at the moment");
    }
});
// delete product path
app.delete("/product/delete", async(req, res) =>{
    const{ name}=req.body;
    try {
        if (!name) {
            return res.status(400).json({message: "Enter the product name"})        
        }
        const getproduct = await Products.findOne({where: {name}});
        if (!getproduct) {
            return res.status(400).send("Invalid product")        
        }
        await Products.destroy({ where: { name } });
            return res.status(200).json({message: "product deleted"});        
    } catch (error) {
        return res.status(500).json({message: "Error occurred while deleting the product"});
    }
    
});
//add books to cart
app.post('/product/addtocart', async(req, res)=>{
    const { customer_id, product_id, quantity } = req.body;
    try {
        //check if book id exists
        const product = await Products.findByPk(product_id);
        if (!product){
            return res.status(400).json({ message: "Invalid product" });
        }
        //find or create a pending order for the user
        let order = await Orders.findOne({ where: { customer_id: customer_id, status: 'pending' } });
        if (order) {
            //check items table for the same item update the quantity
            let sameproduct = await Order_items.findOne({ where: { product_id: product_id, id: order.id } });
            if (sameproduct) {
            sameproduct.quantity += quantity;
            await sameproduct.save();
            } else{
                // create a new order item if the book is not in the cart
                await Order_items.create({ OrderId: order.id, product_id, quantity, price: product.price});
            }
        } else {
            //create a new pending order if none exist
            //
            order = await Orders.create({ customer_id: customer_id, total_amount: 0, status: 'pending', delivery_status: 'pending' });
            await Order_items.create({OrderId: order.id, product_id, quantity, price: product.price });
        }
       
        // Recalculate the total amount by multiplying the quantity with the price
        const itemsquantity = await Order_items.findOne({where: { order_id: order.id}});
        
        const total_amount = itemsquantity.quantity *product.price;
        order.total_amount = total_amount;
        await order.save();

        res.status(200).json({ message: 'Product added to cart', order });
    } catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong');
    }
});
//view cart items
app.get('/cart', async (req, res) => {
    const {customer_id}=req.body;
    if (!customer_id) {
        return res.status(400).json({ message: 'Valid customer ID is required' });
    }
    try {
        const order = await Orders.findAll({
            where: { customer_id, status: 'pending' },
            attributes: ['id', 'total_amount', 'status'],
            include: [
            {
                model: Order_items,
                attributes: ['id', 'order_id','price', 'quantity'],
                include: [
                {
                    model: Products,
                    attributes: ['id', 'name'],
                    include: [
                    {
                        model: Company,
                        attributes: ['id', 'name'],
                    },
                    ],
                },
                ],
            },
            ],
        });

        if (!order) return res.status(404).json({ message: 'No items in the cart' });

        res.status(200).json({ order });
    } catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong');
    }
});
//make order path
// Place the order (complete the order)
app.post('/placeorder', async (req, res) => {
    const {customer_id} = req.body;
  
    try {
      // Find the pending order for the user
    const order = await Orders.findOne({
      where: {
        customer_id: customer_id,
        status: 'pending'
      },
      include: [
        {
        model: Order_items,
        include: [
          {
            model: Products,
            attributes: ['id', 'name', 'price', 'stock'],
            include: [
            {
              model: Company,
              attributes: ['id', 'name'],
            },
            ],
          },
        ],
        },
      ],
    });
  
      if (!order) return res.status(404).send('No items in your cart. Add to cart to order');
  
      // Change order status to completed
      order.status = 'completed';
      await order.save();
  
      // reduce product stock quantities
      for (const item of order.Order_items) {
        const stock = await Products.findByPk(item.product_id);
        if (stock) {
          stock.stock -= item.quantity;
          await stock.save();
        }
      }
  
      res.status(200).json({ message: 'Order placed successfully', order });
    } catch (error) {
      console.error(error);
      res.status(500).send('Something went wrong');
    }
  });
  
//cancel an order
//1. by admin
app.post('/admin/cancel-order', async (req, res) => {
    const { order_id } = req.body;
        
    try {
        const order = await Orders.findByPk(order_id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.status = 'cancelled';
        await order.save();

        res.status(200).json({ message: 'Order cancelled successfully', order });
    } catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong');
    }
});

//2. by customer
app.post('/customer/cancel-order', async (req, res) => {
    const { orderid, customer_id } = req.body;
    if (!orderid || !customer_id) {
        return res.status(400).json({ message: 'Order ID and customer ID are required' });
    }

    try {
        const order = await Orders.findOne({ where: { id: orderid, customer_id: customer_id } });
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.status = 'cancelled';
        await order.save();

        res.status(200).json({ message: 'Order cancelled successfully', order });
    } catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong');
    }
});
//update delivery status by id
app.put('/order/update_delivery_status', async (req, res) => {
    const { orderid, delivery_status } = req.body;
    if (!orderid || !delivery_status) {
        return res.status(400).json({ message: 'Order ID and delivery status are required' });
    }

    try {
        const order = await Orders.findByPk(orderid);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.delivery_status = delivery_status;
        await order.save();

        res.status(200).json({ message: 'Delivery status updated successfully', order });
    } catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong');
    }
});

//check delivery status
app.get('/order/delivery_status', async (req, res) => {
    const {orderid , customer_id } = req.body;

    try {
        const order = await Orders.findOne({ where: { id: orderid, customer_id: customer_id } });
        if (!order) return res.status(404).json({ message: 'Order not found' });

        res.status(200).json({ 
            message: 'Order status retrieved successfully', 
            status: order.delivery_status 
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong');
    }
});
//path to create new admin
//
//
app.post('/admin/register', async (req, res, next) => {
    try {
        const { first_name, second_name, email,phone_no, password } = req.body;
        if (!first_name || !second_name || !email || !phone_no || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = await Admin.create({
            first_name: Sequelize.literal(`'${first_name.replace(/'/g, "''")}'`),
            second_name: Sequelize.literal(`'${second_name.replace(/'/g, "''")}'`),
            email: Sequelize.literal(`'${email.replace(/'/g, "''")}'`),
            phone_no: Sequelize.literal(`'${phone_no.replace(/'/g, "''")}'`),
            password: hashedPassword
        });

        res.status(201).json({
            message: "Admin registered successfully",
            admin: { id: newAdmin.id, name: newAdmin.first_name, email: newAdmin.email },
        });
    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            res.status(400).json({ message: "Email already exists" });
        } else {
            next(error);
        }
    }
});
// view all admins
app.get('/admins', async ( req,res) => {
    try {
        const admins = await Admin.findAll();
        if (!admins) return res.status(404).json({ message: 'No admins found' });

        res.status(200).json({ admins });
    } catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong');
    }
});
// path to add company
app.post('/company/add', async (req, res) => {
    const { name , location , phone_no, email } = req.body;

    try {
        if (!name ) {
            return res.status(400).json({ message: 'Name is required' });
                      
        }
         //check if the author already exists
         const company = await Company.findOne({ where: { name } });
            if (company) {
                return res.status(400).json({ message: 'Company already exists' });
                
            };
            const newcompany= await Company.create({  name , location , phone_no, email  });
                res.status(201).json({ message: 'company added successfully', Company: newcompany })
    } catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong');
    }
});
//get all company
app.get('/company', async (req, res) => {
    try {
        const company = await Company.findAll();
        if (!company) return res.status(404).json({ message: 'No company found' });

        res.status(200).json({ company });
    } catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong');
    }
});
//add category
app.post('/category/add', async (req, res) =>{
    const{name, description}=req.body;
    if (!name) {
        return res.send(400).json({message: "Enter category name"})
        
    }
    try {
        const checkduplicate = await Category.findOne({where: {name}});
        if (checkduplicate) {
            return res.status(400).json({message: "Category already exists"})
        }else{
            const newCategory = await Category.create({name, description});
            res.status(201).json({message: "Category added successfully", category: newCategory});
        }

    } catch (error) {
        res.status(500).send('Something went wrong');
        
    }
})
//get all categories
app.get('/category', async (req, res) =>{
    try {
        const category = await Category.findAll();
        if (!category) return res.status(404).json({message: 'No category found'});

        res.status(200).json({category});
    } catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong');
    }
});

