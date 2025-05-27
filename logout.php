<?php
session_start();
session_unset();
session_destroy();
header("Location: index.html"); // Return to homepage after logout
exit();
?>