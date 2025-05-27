<?php
session_start();
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    header("Location: login.php");
    exit();
}
?>
<!DOCTYPE html>
<html>
<head>
  <title>Protected Page</title>
</head>
<body>
  <a href="index.html"><img src="logo.png" alt="Logo"></a> <!-- Link to home instead -->
  <h1>Welcome!</h1>
  <p>This page is protected by a PHP password login.</p>
  <a href="logout.php">Log Out</a>
</body>
</html>