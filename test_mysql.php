<?php
try {
    $pdo = new PDO('mysql:host=localhost', 'root', '');
    echo "CONNECTED OK\n";
    $stmt = $pdo->query("SELECT user, host, plugin, authentication_string FROM mysql.user WHERE user='root'");
    while($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo json_encode($r) . "\n";
    }
    
    // Check auth plugin
    echo "\nAltering root to mysql_native_password...\n";
    $pdo->exec("ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY ''");
    $pdo->exec("FLUSH PRIVILEGES");
    echo "Done! Root now uses mysql_native_password with empty password.\n";
} catch(Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
