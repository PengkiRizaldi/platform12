// =========================================
// Autentikasi & Token (Guard di awal file)
// =========================================
const myToken = localStorage.getItem('token_toko');
if (!myToken) {
    alert('Anda harus login terlebih dahulu!');
    window.location.href = 'login.html';
}

// 1. Deklarasi State Global
let halamanSaatIni = 1;
let totalHalamanGlobal = 1;
let keywordPencarian = "";

// =========================================
// State & Elemen DOM
// =========================================
const formTambah = document.getElementById('form-tambah');
const inputId = document.getElementById('input-id');
const inputNama = document.getElementById('input-nama');
const inputHarga = document.getElementById('input-harga');
const inputGambar = document.getElementById('input-gambar');
const judulForm = document.getElementById('judul-form');
const btnSubmit = document.getElementById('btn-submit');
const btnBatal = document.getElementById('btn-batal');
const tabelBarang = document.getElementById('tabel-barang');

// =========================================
// Fungsi Mengambil Data Barang
// =========================================
// 2. Modifikasi Fungsi Fetch Utama
async function ambilDataBarang() {
    try {
        // Rangkai URL dinamis menggunakan Template Literal (Backtick)
        // Jika ada Token, selipkan di Header!
        const urlAPI = `http://localhost/Platform/api-toko/get_barang.php?cari=${keywordPencarian}&page=${halamanSaatIni}`;
        
        const response = await fetch(urlAPI, {
            headers: {
                'Authorization': myToken || ''
            }
        });
        
        if (!response.ok) {
            const responseText = await response.text();
            console.error('Server Error:', response.status, responseText);
            return;
        }

        const hasil = await response.json();

        let barisHTML = '';
        
        if (hasil.data && hasil.data.length > 0) {
            hasil.data.forEach(barang => {
                let urlGambar = barang.gambar 
                    ? `http://localhost/Platform/api-toko/uploads/${barang.gambar}` 
                    : `https://via.placeholder.com/50?text=No+Img`;
                // Escape tanda kutip satu demi keamanan pemanggilan parameter JS inline
                const namaEscaped = barang.nama_barang.replace(/'/g, "\\'");
                barisHTML += `
                    <tr class="border-b text-center p-2 hover:bg-gray-50">
                        <td class="py-2">
                            <img src="http://localhost/Platform/api-toko/uploads/${barang.gambar}" 
                                class="w-12 h-12 object-cover rounded mx-auto border" 
                                alt="${barang.nama_barang}">
                        </td>
                        <td class="py-2">${barang.nama_barang}</td>
                        <td class="py-2">Rp ${Number(barang.harga).toLocaleString('id-ID')}</td>
                        <td class="py-3">
                            <div class="flex gap-2 justify-center">
                                <button onclick="editBarang(${barang.id}, '${namaEscaped}', ${barang.harga})"
                                    title="Edit barang ini"
                                    class="inline-flex items-center gap-1.5 bg-sky-50 hover:bg-sky-500 text-sky-600 hover:text-white border border-sky-300 hover:border-sky-500 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-px active:scale-95">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                    </svg>
                                    Edit
                                </button>
                                <button onclick="hapusBarang(${barang.id})"
                                    title="Hapus barang ini"
                                    class="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-300 hover:border-rose-500 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-px active:scale-95">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                        <polyline points="3 6 5 6 21 6"/>
                                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                        <path d="M10 11v6M14 11v6"/>
                                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                                    </svg>
                                    Hapus
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });
        } else {
            barisHTML = `<tr><td colspan="4" class="text-center py-4 text-gray-500">Data tidak ditemukan</td></tr>`;
        }

        document.getElementById('tabel-barang').innerHTML = barisHTML;

        // 3. Update Informasi Navigasi UI
        totalHalamanGlobal = hasil.total_halaman;
        document.getElementById('info-halaman').innerHTML = `Halaman ${hasil.halaman_saat_ini} dari ${hasil.total_halaman} (Total: ${hasil.total_data} Data)`;

        // Atur Kapan Tombol Prev/Next Boleh Diklik
        document.getElementById('btn-prev').disabled = (halamanSaatIni === 1);
        document.getElementById('btn-next').disabled = (halamanSaatIni >= totalHalamanGlobal || totalHalamanGlobal === 0);

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// 4. Fungsi yang dipanggil saat ngetik di input pencarian
function jalankanPencarian() {
    keywordPencarian = document.getElementById('input-cari').value;
    halamanSaatIni = 1; // Kembalikan ke halaman 1 jika mencari data baru
    ambilDataBarang();
}

// 5. Fungsi yang dipanggil saat klik tombol Mundur/Lanjut
function gantiHalaman(arah) {
    // arah bernilai -1 (mundur) atau 1 (lanjut)
    halamanSaatIni = halamanSaatIni + arah;
    ambilDataBarang();
}

// =========================================
// Event Listener Form Submit (Tambah / Edit)
// =========================================
formTambah.addEventListener('submit', async function(event) {
    event.preventDefault(); 
    
    const idBarang = inputId.value;
    const isEditMode = idBarang !== '';
    
    const namaBarang = inputNama.value;
    const hargaBarang = inputHarga.value;
    const fileGambar = inputGambar.files[0];

    let response;
    
    try {
        if (isEditMode) {
            // Mode EDIT: Kirim data JSON menggunakan PUT
            response = await fetch('http://localhost/Platform/api-toko/edit_barang.php', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': myToken
                },
                body: JSON.stringify({
                    id: idBarang,
                    nama_barang: namaBarang,
                    harga: hargaBarang
                })
            });
        } else {
            // Mode TAMBAH: Kirim FormData menggunakan POST untuk mendukung upload file gambar
            const dataKirim = new FormData();
            dataKirim.append('nama_barang', namaBarang);
            dataKirim.append('harga', hargaBarang);
            if (fileGambar) {
                dataKirim.append('gambar', fileGambar);
            }

            response = await fetch('http://localhost/Platform/api-toko/tambah_barang.php', {
                method: 'POST',
                headers: {
                    'Authorization': myToken
                },
                body: dataKirim
            });
        }

        if (!response.ok) {
            const responseText = await response.text();
            console.error('Server Error:', response.status, responseText);
            alert(`Error ${response.status}: Cek browser console untuk detail error.`);
            return;
        }

        const hasil = await response.json();

        if (hasil.status === 'success') {
            batalEdit();
            alert('Sukses: ' + hasil.pesan);
            ambilDataBarang(); 
            renderDashboard();
        } else {
            alert('Gagal: ' + hasil.pesan);
        }

    } catch (error) {
        console.error('Terjadi kesalahan koneksi:', error);
        alert('Gagal: ' + error.message + '\n\nPastikan koneksi database dan server XAMPP menyala.');
    }
});

// =========================================
// Fungsi Hapus Data
// =========================================
async function hapusBarang(id_target) {
    const yakin = confirm("Peringatan!\nApakah Anda yakin ingin menghapus barang dengan ID " + id_target + "?");
    
    if (yakin) {
        try {
            const response = await fetch('http://localhost/Platform/api-toko/hapus_barang.php', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': myToken
                },
                body: JSON.stringify({ id: id_target })
            });

            if (!response.ok) {
                const responseText = await response.text();
                console.error('Server Error:', response.status, responseText);
                alert(`Error ${response.status}: Cek browser console untuk detail error.`);
                return;
            }

            const hasil = await response.json();

            if (hasil.status === 'success') {
                ambilDataBarang(); 
                renderDashboard();
            } else {
                alert('Gagal: ' + hasil.pesan);
            }
        } catch (error) {
            console.error('Terjadi kesalahan:', error);
            alert('Gagal: ' + error.message);
        }
    }
}

// =========================================
// Fungsi Edit & Batal
// =========================================
function editBarang(id, nama, harga) {
    inputId.value = id;
    inputNama.value = nama;
    inputHarga.value = harga;

    judulForm.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-sky-500">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        Edit Barang <span class="ml-1 text-sm font-normal text-sky-600">(ID: ${id})</span>
    `;

    btnSubmit.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
        </svg>
        Update
    `;
    btnSubmit.className = 'inline-flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 active:scale-95 text-white font-bold py-2 px-6 rounded-lg transition-all duration-200 hover:shadow-lg h-[42px]';

    btnBatal.classList.remove('hidden');
    formTambah.scrollIntoView({ behavior: 'smooth', block: 'center' });
    inputNama.focus();
}

function batalEdit() {
    inputId.value = '';
    formTambah.reset();

    judulForm.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-amber-500">
            <path d="M5 12h14"/><path d="M12 5v14"/>
        </svg>
        Tambah Barang Baru
    `;

    btnSubmit.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
        </svg>
        Simpan
    `;
    btnSubmit.className = 'inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold py-2 px-6 rounded-lg transition-all duration-200 hover:shadow-lg h-[42px]';

    btnBatal.classList.add('hidden');
}

// =========================================
// Fungsi Logout
// =========================================
function logout() {
    localStorage.removeItem('token_toko');
    window.location.href = 'login.html';
}

// =========================================
// Fungsi Dashboard / Grafik (Chart.js)
// =========================================
async function renderDashboard() {
    try {
        // Ambil data JSON dari backend dengan Headers Authorization
        const response = await fetch('http://localhost/Platform/api-toko/statistik.php', {
            headers: {
                'Authorization': myToken || ''
            }
        });
        const json = await response.json();

        if (json.status === 'success') {
            const ctx = document.getElementById('myChart');

            // --- BUG FIX: GHOSTING EFFECT ---
            // Jika kanvas sudah pernah digambar, kita harus menghancurkannya dulu.
            // Jika tidak, grafik lama dan baru akan bertumpuk, menyebabkan kedipan 
            // aneh (glitch) saat Anda menggeser mouse di atas grafik.
            let chartStatus = Chart.getChart("myChart");
            if (chartStatus != undefined) {
                chartStatus.destroy();
            }

            // Mulai melukis grafik baru
            new Chart(ctx, {
                type: 'bar', // Tipe grafik batang
                data: {
                    labels: json.chart_data.labels, // Data Sumbu X (Array Nama)
                    datasets: [{
                        label: 'Harga Barang (Rp)',
                        data: json.chart_data.values, // Data Sumbu Y (Array Harga)
                        // Kustomisasi Warna
                        backgroundColor: [
                            'rgba(234, 88, 12, 0.6)',  // Orange utama
                            'rgba(59, 130, 246, 0.6)', // Biru
                            'rgba(16, 185, 129, 0.6)', // Hijau
                            'rgba(236, 72, 153, 0.6)', // Pink
                            'rgba(139, 92, 246, 0.6)'  // Ungu
                        ],
                        borderColor: 'rgba(234, 88, 12, 1)',
                        borderWidth: 1,
                        borderRadius: 6 // Ujung batang dibuat agak membulat
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false, // Wajib false agar mengikuti tinggi container
                    scales: {
                        y: { 
                            beginAtZero: true // Sumbu Y wajib dimulai dari 0 agar proporsional
                        } 
                    }
                }
            });
        }
    } catch (error) {
        console.error('Gagal memuat grafik:', error);
    }
}

// =========================================
// Inisialisasi Aplikasi & Service Worker
// =========================================
ambilDataBarang();
renderDashboard();

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('Service Worker Berhasil Didaftarkan!', registration.scope);
            })
            .catch(err => {
                console.error('Service Worker Gagal:', err);
            });
    });
}