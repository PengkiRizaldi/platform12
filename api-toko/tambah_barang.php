<?php
// Mengaktifkan laporan eror agar jika ada masalah lain, erornya langsung muncul (tidak blank 500)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

include "koneksi.php";

// Pastikan koneksi database tidak gagal sebelum lanjut query
if (!$koneksi) {
    die(json_encode(["status" => "error", "pesan" => "Koneksi database ke server gagal!"]));
}

// =================== BAGIAN PENGUNCI API (SUDAH DIPERBAIKI) ===================
// Cara aman mengambil token Authorization di server hosting (FastCGI/FPM)
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

// Validasi jika query gagal atau token kosong
if(!$cek_token || mysqli_num_rows($cek_token) === 0 || $token_dikirim === '') {
    // JIKA TOKEN PALSU / KOSONG, HENTIKAN PROGRAM DISINI! (die)
    die(json_encode(["status" => "error", "pesan" => "Akses Ditolak! Token Invalid."]));
}
// ==============================================================================

// Jika lolos pengecekan di atas, baris di bawah ini baru akan dieksekusi
$json_data = file_get_contents("php://input");
$data = json_decode($json_data, true);

$nama = '';
$harga = '';

// Mendapatkan data dari FormData ($_POST) atau dari JSON ($data)
if (isset($_POST['nama_barang']) && isset($_POST['harga'])) {
    $nama = mysqli_real_escape_string($koneksi, $_POST['nama_barang']);
    $harga = mysqli_real_escape_string($koneksi, $_POST['harga']);
} elseif (isset($data['nama_barang']) && isset($data['harga'])) {
    $nama = mysqli_real_escape_string($koneksi, $data['nama_barang']);
    $harga = mysqli_real_escape_string($koneksi, $data['harga']);
}

// Validasi jika data tidak kosong
if($nama !== '' && $harga !== '') {
    $nama_file_baru = ""; // Default kosong jika tidak ada gambar

    // Cek Apakah ada file gambar yang diupload
    if(isset($_FILES['gambar']) && $_FILES['gambar']['error'] === 0) {
        $file_tmp = $_FILES['gambar']['tmp_name'];
        
        // Tambahkan fungsi time() agar nama file unik dan tidak tertimpa
        $nama_file_baru = time() . "_" . $_FILES['gambar']['name']; 
        
        // Pastikan folder uploads ada
        if (!file_exists("uploads")) {
            mkdir("uploads", 0777, true);
        }
        
        // Pindahkan file dari temporary ke folder uploads/
        move_uploaded_file($file_tmp, "uploads/" . $nama_file_baru);
    }

    // Masukkan ke Database
    $query = "INSERT INTO barang (nama_barang, harga, gambar) VALUES ('$nama', '$harga', '$nama_file_baru')";

    if(mysqli_query($koneksi, $query)) {
        echo json_encode(["status" => "success", "pesan" => "Barang & Gambar disimpan!"]);
    } else {
        echo json_encode(["status" => "error", "pesan" => "Gagal simpan ke DB: " . mysqli_error($koneksi)]);
    }
} else {
    echo json_encode(["status" => "error", "pesan" => "Data tidak lengkap! Nama barang dan harga wajib diisi."]);
}
?>