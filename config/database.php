<?php
/**
 * Umair Bills - Database Configuration
 * Hostinger Shared Hosting Ready
 */

define('DB_HOST', 'localhost');
define('DB_USER', 'u123456789_umair');
define('DB_PASS', 'YourStrongPassword123!');
define('DB_NAME', 'u123456789_umairbills');

try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch (PDOException $e) {
    die("Database Connection Error: " . $e->getMessage());
}
?>
