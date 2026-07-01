<?php
include "koneksi.php";

// Izinkan akses dari frontend & tentukan format respon sebagai JSON (mendukung method PUT)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Jika browser mengirimkan preflight request (OPTIONS), langsung setujui
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

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


// MENERIMA DATA JSON DARI JAVASCRIPT FETCH (Ditulis 1 kali saja)
$json_data = file_get_contents("php://input");
$data = json_decode($json_data, true);

// Validasi: semua field wajib ada
if (isset($data['id']) && isset($data['nama_barang']) && isset($data['harga'])) {

    // Amankan semua input dari SQL Injection
    $id    = mysqli_real_escape_string($koneksi, $data['id']);
    $nama  = mysqli_real_escape_string($koneksi, $data['nama_barang']);
    $harga = mysqli_real_escape_string($koneksi, $data['harga']);

    // Query UPDATE berdasarkan ID
    $query = "UPDATE barang SET nama_barang = '$nama', harga = '$harga' WHERE id = '$id'";

    if (mysqli_query($koneksi, $query)) {
        // Cek apakah ada baris yang benar-benar berubah
        if (mysqli_affected_rows($koneksi) > 0) {
            echo json_encode(["status" => "success", "pesan" => "Data barang berhasil diperbarui!"]);
        } else {
            echo json_encode(["status" => "success", "pesan" => "Tidak ada perubahan data."]);
        }
    } else {
        http_response_code(500); // Server Error jika query gagal
        echo json_encode(["status" => "error", "pesan" => "Gagal memperbarui data ke database: " . mysqli_error($koneksi)]);
    }

} else {
    http_response_code(400); // Bad Request jika data tidak lengkap
    echo json_encode(["status" => "error", "pesan" => "Data tidak lengkap! ID, nama_barang, dan harga wajib dikirim."]);
}
?>