const atas = document.getElementById('atas');
const container = document.getElementById('container');

// 1. Kosongkan container (tempat konten video)
container.innerHTML = '';

// 2. Isi elemen 'atas' dengan pesan baru yang memiliki style centering
atas.innerHTML = `
    <div style="
        position: fixed; 
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh; /* Pastikan tinggi menutupi viewport */
        display: flex;
        justify-content: center; /* Horizontal center */
        align-items: center;    /* Vertical center */
        text-align: center;
        background-color: black; /* Pastikan latar belakang tetap hitam */
    ">
        <h1 style="color: yellowgreen; margin: 0; padding: 0;">Gabung dan download tiviku terbaru di ( https://facebook.com/groups/826118633719874/ ) </h1>
    </div>
`;

// --- Bagian di bawah ini adalah fungsi yang tidak lagi digunakan, namun dipertahankan agar tidak error jika ada kode lain yang memanggilnya ---

// Daftar file JSON (dikosongkan agar tidak ada proses fetch)
const files = [];

let filesProcessed = 0;
const totalFiles = files.length;

// Hapus logika fetching dan pembuatan elemen konten video (Dihapus/dikosongkan)
/*
files.forEach(file => {
    // ... Logika fetch dan pembuatan div dihapus
});
*/

function playVideo(videoFile, logoFile, textFile) {
    // Logika playVideo masih dipertahankan
    sessionStorage.setItem('videoLink', videoFile);
    sessionStorage.setItem('videoTitle', textFile);
    sessionStorage.setItem('logoFile', logoFile);
    window.location.href = 'ply.html';
}

function prosesMenu() {
    // Fungsi pencarian tidak lagi relevan
    console.log("Fungsi prosesMenu tidak aktif karena konten utama telah dihapus.");
}

// Hapus event listener untuk pencarian (karena elemen pencarian sudah tidak ada)
// document.getElementById("cari") tidak ada lagi setelah atas.innerHTML diganti

// Pastikan untuk mengabaikan atau menghapus logika highlight yang mungkin terjadi
// Jika Anda ingin memastikan tidak ada error:
if (totalFiles === 0) {
    console.log("Konten berhasil dikosongkan.");
}