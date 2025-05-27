<?php
session_start();
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    header("Location: index.php");
    exit();
}
?>
<!DOCTYPE html>
<html>
<head>
  <title>Protected Page</title>
</head>
<body>
  <h1>Welcome!</h1>
  <p>This page is protected by a PHP password login.</p>
  <a href="logout.php">Log Out</a>
</body>
</html>