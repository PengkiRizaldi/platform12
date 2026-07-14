<?php
include "config.php";
require_once "middleware.php";

$user = validateToken();
$db = getDB();

// Murni mengambil SEMUA data barang, diurutkan berdasarkan abjad (A-Z)
$query = "SELECT * FROM barang ORDER BY nama_barang ASC";
$stmt = $db->query($query);

$data_laporan = [];
$total_aset = 0; 

while ($row = $stmt->fetch()) {
    $data_laporan[] = $row;
    $total_aset += (int)$row['harga'] * (int)$row['stok'];
}

echo json_encode([
    "status" => "success",
    "data" => $data_laporan,
    "total_aset_rupiah" => $total_aset,
    "total_item" => count($data_laporan)
]);
?>
