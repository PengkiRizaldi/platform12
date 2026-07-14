<?php
include "koneksi.php";

// 1. Tangkap variabel dari URL (Query String)
$cari = isset($_GET['cari']) ? mysqli_real_escape_string($koneksi, $_GET['cari']) : '';
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;

// 2. Tentukan jumlah data per halaman
$limit = 5; 
$offset = ($page - 1) * $limit; // Rumus Offset

// 3. Cari Total Seluruh Data (Untuk Pagination Frontend)
$query_total = "SELECT id FROM barang WHERE nama_barang LIKE '%$cari%'";
$result_total = mysqli_query($koneksi, $query_total);
$total_data = mysqli_num_rows($result_total);
$total_halaman = ceil($total_data / $limit); // Pembulatan ke atas

// 4. Ambil Data Spesifik Sesuai Limit dan Pencarian
$query = "SELECT * FROM barang WHERE nama_barang LIKE '%$cari%' ORDER BY id DESC LIMIT $limit OFFSET $offset";
$hasil = mysqli_query($koneksi, $query);

$data_barang = [];
while ($row = mysqli_fetch_assoc($hasil)) {
    $data_barang[] = $row;
}

// 5. Kembalikan JSON beserta Metadata Halaman
echo json_encode([
    "status" => "success",
    "data" => $data_barang,
    "total_halaman" => $total_halaman,
    "halaman_saat_ini" => $page,
    "total_data" => $total_data
]);
?>
