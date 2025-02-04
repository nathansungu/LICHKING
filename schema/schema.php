<?php
//import dotenv
use Dotenv\Dotenv;

require_once __DIR__ ."/../vendor/autoload.php";
$dotenv = Dotenv::createImmutable(__DIR__ .'/..');
$dotenv->load();

$servername = $_ENV['DB_SERVERNAME'];
$username = $_ENV['DB_USERNAME'];
$password = $_ENV['DB_PASSWORD'];
$dbname = $_ENV['DB_NAME'];

// Create connection
$conn = new mysqli($servername, $username, $password); 

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Create the database if it doesn't exist
$sql = "CREATE DATABASE IF NOT EXISTS $dbname";
if ($conn->query($sql) === TRUE) {
    echo "Database created or exists already.";
} else {
    die("Error creating database: " . $conn->error);
}
//select database
$conn->select_db(database: $dbname);
//tables
//customers
$Customer ="CREATE TABLE Customers
(id INT(6)UNSIGNED AUTO_INCREMENT PRIMARY KEY,
first_name VARCHAR(30) NOT NULL,
second_name VARCHAR(30) NOT NULL,
phone_no VARCHAR(14) NOT NULL,
password VARCHAR(50) NOT NULL,
email VARCHAR(50) NOT NULL,
reg_date TIMESTAMP DEFAULT CURRENT_TIME ON UPDATE CURRENT_TIMESTAMP";
//admin
$admin = "CREATE TABLE Admin_user
(id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
first_name VARCHAR(30) NOT NULL,
second_name VARCHAR(30) NOT NULL,
phone_no VARCHAR(30) NOT NULL,
email VARCHAR(50) NOT NULL,
password VARCHAR(50),
reg_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)";
//products
$Products = "CREATE TABLE Products(
id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(20) NOT NULL,
company_id INT(6) NOT NULL,
category_id INT(6) NOT NULL,
publish_year YEAR,
price FLOAT(10) NOT NULL,
stock INT(100) NOT NULL,
reg_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)";
//Company
$Company = "CREATE TABLE Authors(
id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(20) NOT NULL,
location VARCHAR(20) NULL,
phone_no VARCHAR(14) NULL,
email VARCHAR(50) NULL)";
//order items
$Order_items = "CREATE TABLE Order_items(
id INT(6) UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
order_id INT (6),
product_id INT(6),
price FLOAT(10),
quantity INT(100))";
 //orders   
$Orders = "CREATE TABLE Orders (
id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
customer_id INT(6) NOT NULL,
total_amount FLOAT(6) NOT NULL,
status VARCHAR(20) NOT NULL,
delivery_status VARCHAR(20)
)";
//category
$Category = "CREATE TABLE Category(
id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(20) NOT NULL,
description VARCHAR(255) NULL,
reg_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)";

// Execute queries
$conn->query($Customers);
$conn->query($admin);
$conn->query($Products);
$conn->query($Company);
$conn->query($Order_items);
$conn->query($Orders);
$conn->query($Category);

$conn->close();

?>