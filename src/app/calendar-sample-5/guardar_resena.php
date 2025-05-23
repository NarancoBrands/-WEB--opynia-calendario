<?php
$servername = "localhost";
$username = "root";  // El usuario de tu base de datos (por defecto es root)
$password = "";  // La contraseña de tu base de datos (por defecto está vacía en XAMPP)
$dbname = "opynia";  // El nombre de tu base de datos

// Crear conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar la conexión
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}

// Obtener los datos del formulario
$nombre = $_POST['nombre'];
$hora = $_POST['hora'];
$telefono = $_POST['telefono'];

// Preparar la consulta SQL con sentencias preparadas para evitar SQL Injection
$stmt = $conn->prepare("INSERT INTO resenas2 (nombre, hora, telefono) VALUES (?, ?, ?)");

// Verificar si la preparación de la consulta fue exitosa
if ($stmt === false) {
    die("Error al preparar la consulta: " . $conn->error);
}

// Vincular los parámetros a la consulta preparada
$stmt->bind_param("sss", $nombre, $hora, $telefono);  // 'sss' indica que todos son cadenas (string)

// Ejecutar la consulta
if ($stmt->execute()) {
    echo "Nuevo registro creado exitosamente";
} else {
    echo "Error al ejecutar la consulta: " . $stmt->error;
}

// Cerrar la declaración y la conexión
$stmt->close();
$conn->close();
?>
