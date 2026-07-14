<?php
include "koneksi.php";

// Izinkan akses dari frontend & tentukan format respon sebagai JSON
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// =================== BAGIAN PENGUNCI API (SUDAH DIPERBAIKI) ===================
// Mengambil token secara aman menggunakan $_SERVER (kompatibel untuk semua hosting)
$token_dikirim = '';

if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $token_dikirim = $_SERVER['HTTP_AUTHORIZATION'];
} elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
    $token_dikirim = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
} elseif (function_exists('apache_request_headers')) {
    $headers = apache_request_headers();
    $token_dikirim = isset($headers['Authorization']) ? $headers['Authorization'] : '';
}

// Cek apakah token dikirim, dan apakah token tersebut ada di tabel users
$cek_token = mysqli_query($koneksi, "SELECT * FROM users WHERE token='$token_dikirim'");

if (!$cek_token || mysqli_num_rows($cek_token) === 0 || $token_dikirim === '') {
    // JIKA TOKEN PALSU / KOSONG, HENTIKAN PROGRAM
    http_response_code(401); // Kirim status 401 Unauthorized ke frontend
    die(json_encode(["status" => "error", "pesan" => "Akses Ditolak! Token Invalid atau Kosong."]));
}
// ==============================================================================


// MENERIMA DATA JSON DARI JAVASCRIPT FETCH (Hanya perlu ditulis 1 kali)
$json_data = file_get_contents("php://input");
$data = json_decode($json_data, true);

// Validasi keberadaan parameter ID
if (isset($data['id'])) {
    
    // Amankan parameter ID dari SQL Injection
    $id_barang = mysqli_real_escape_string($koneksi, $data['id']);

    // Query untuk menghapus berdasarkan ID
    $query = "DELETE FROM barang WHERE id = '$id_barang'";
    
    if (mysqli_query($koneksi, $query)) {
        echo json_encode(["status" => "success", "pesan" => "Data barang terhapus!"]);
    } else {
        http_response_code(500); // Server Error jika query gagal
        echo json_encode(["status" => "error", "pesan" => "Gagal menghapus data dari database: " . mysqli_error($koneksi)]);
    }

} else {
    http_response_code(400); // Bad Request jika ID tidak dikirim
    echo json_encode(["status" => "error", "pesan" => "ID Barang wajib dikirim!"]);
}
?>
