<?php
$servername = "localhost";
$username = "089615";
$password = "Gouden007";
$dbname = "portfolioVin";

// Create connection
$conn = mysqli_connect($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}