<?php
// -- PERTEMUAN 14: GET by kode_qr ------------------------------
if ($method === 'GET') {
    $id     = $_GET['id']      ?? null;
    $kodeQr = $_GET['kode_qr'] ?? null;   // <-- BARU: lookup by QR

    if ($id) {
        // ... ambil satu barang by id (tidak berubah) ...
    } elseif ($kodeQr) {
        // Smart Gateway: apakah kode QR sudah terdaftar?
        $stmt = $db->prepare("SELECT * FROM barang WHERE kode_qr = ? LIMIT 1");
        $stmt->execute([trim($kodeQr)]);
        $barang = $stmt->fetch();

        if ($barang) {
            jsonResponse('success', 'Barang ditemukan.', $barang);
        } else {
            jsonResponse('not_found', 'Belum ada di database.', null, 200);
        }
    } else {
        // ... ambil semua barang + pagination ...
        if ($search) {
            // P14: cari juga di kolom kode_qr
            $cond = " AND (nama_barang LIKE ? OR kode_qr LIKE ?)";
            $sqlCount .= $cond;
            $sql      .= $cond;
            $params[]  = "%$search%";
            $params[]  = "%$search%";  // <-- dua parameter untuk dua LIKE
        }
    }
}

// -- PERTEMUAN 14: POST - tangkap kode_qr, lat, lng ------------
if ($method === 'POST') {
    $kodeQr   = trim($_POST['kode_qr']  ?? '');
    $latitude  = trim($_POST['latitude'] ?? '');
    $longitude = trim($_POST['longitude']?? '');

    // ... (validasi nama_barang, harga, stok tetap ada) ...

    // INSERT dengan kolom baru
    $stmt = $db->prepare(
        "INSERT INTO barang (nama_barang, harga, stok, kategori, gambar,
         kode_qr, latitude, longitude) VALUES (?,?,?,?,?,?,?,?)"
    );
    $stmt->execute([$namaBarang,$harga,$stok,$kategori,$gambar,
                    $kodeQr,$latitude,$longitude]);
}
