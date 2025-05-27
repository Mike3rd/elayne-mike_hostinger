<?php
session_start();
$valid_username = 'admin';
$valid_password = 'mypassword'; // CHANGE THIS

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($_POST['username'] === $valid_username && $_POST['password'] === $valid_password) {
        $_SESSION['logged_in'] = true;
        header("Location: index.html");
        exit();
    } else {
        echo "<p>Invalid credentials. <a href='index.php'>Try again</a>.</p>";
    }
} else {
    header("Location: index.php");
    exit();
}
?>