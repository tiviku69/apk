// Fungsi untuk memperbarui status online/offline
function updateOnlineStatus() {
    const offlineMessage = document.getElementById('offlineMessage');
    const mainContent = document.querySelector('.main-content');
    const sidebar = document.querySelector('.sidebar');

    if (navigator.onLine) {
        offlineMessage.style.display = 'none';
        mainContent.style.display = 'block';
        sidebar.style.display = 'block';
    } else {
        offlineMessage.style.display = 'block';
        mainContent.style.display = 'none';
        sidebar.style.display = 'none';
    }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus(); // Set status awal

// Data dummy untuk "Continue watching" karena tidak ada di JSON yang diberikan
const continueWatchingData = [
    {
        lnk: "video1.mp4",
        logo: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hq720.jpg", // Contoh thumbnail
        ttl: "Never Gonna Give You Up",
        dur: "3:32",
        channelLogo: "https://yt3.ggpht.com/ytc/AGIKg_gO3W4_1_E7B1L_2-Z2-3A_4-W-5_P-6_R-7_S-8_T-9_U-0=s176-c-k-c0x00ffffff-no-rj-mo", // Contoh logo channel
        channelName: "Rick Astley",
        views: "1.5M views",
        uploadTime: "1 year ago"
    },
    {
        lnk: "video2.mp4",
        logo: "https://i.ytimg.com/vi/q_k2tKk9S-A/hq720.jpg", // Contoh thumbnail
        ttl: "How to Cook the Perfect Steak",
        dur: "8:15",
        channelLogo: "https://yt3.ggpht.com/ytc/AGIKg_gO3W4_1_E7B1L_2-Z2-3A_4-W-5_P-6_R-7_S-8_T-9_U-0=s176-c-k-c0x00ffffff-no-rj-mo", // Contoh logo channel
        channelName: "Gordon Ramsay",
        views: "5M views",
        uploadTime: "3 months ago"
    },
     {
        lnk: "video2.mp4",
        logo: "https://i.ytimg.com/vi/J_wG8NnI8sM/hq720.jpg", // Contoh thumbnail
        ttl: "Relaxing Jazz Music for Work",
        dur: "2:00:00",
        channelLogo: "https://yt3.ggpht.com/ytc/AGIKg_gO3W4_1_E7B1L_2-Z2-3A_4-W-5_P-6_R-7_S-8_T-9_U-0=s176-c-k-c0x00ffffff-no-rj-mo", // Contoh logo channel
        channelName: "Jazz Vibes",
        views: "10M views",
        uploadTime: "1 month ago"
    },
    {
        lnk: "video2.mp4",
        logo: "https://i.ytimg.com/vi/M7lc1uxjaeY/hq720.jpg", // Contoh thumbnail
        ttl: "Sunset Beach Drone Footage 4K",
        dur: "12:45",
        channelLogo: "https://yt3.ggpht.com/ytc/AGIKg_gO3W4_1_E7B1L_2-Z2-3A_4-W-5_P-6_R-7_S-8_T-9_U-0=s176-c-k-c0x00ffffff-no-rj-mo", // Contoh logo channel
        channelName: "Travel & Explore",
        views: "2.3M views",
        uploadTime: "2 weeks ago"
    }
];

const files = [
    'https://raw.githubusercontent.com/tiviku69/apk/main/cmpr.json',
    'https://raw.githubusercontent.com/tiviku69/apk/main/captain.json',
    'https://raw.githubusercontent.com/tiviku69/apk/main/avat.json',
    'https://raw.githubusercontent.com/tiviku69/apk/main/ghost.json',
    'https://raw.githubusercontent.com/tiviku69/apk/main/avatar.json',
    'https://raw.githubusercontent.com/tiviku69/apk/main/squid.json',
    'https://raw.githubusercontent.com/tiviku69/apk/main/journey.json',
    'https://raw.githubusercontent.com/tiviku69/apk/main/one.json',
    'https://raw.githubusercontent.com/tiviku69/apk/main/mp4.json'
];

// Fungsi untuk membuat item video
function createVideoItem(item, containerId) {
    const container = document.getElementById(containerId);
    const videoItem = document.createElement('div');
    videoItem.className = 'video-item';
    videoItem.onclick = () => playVideo(item.lnk, item.logo, item.ttl, item.channelLogo, item.channelName, item.views, item.uploadTime);

    // Thumbnail
    const thumbnail = document.createElement('img');
    thumbnail.className = 'video-thumbnail';
    thumbnail.src = item.logo;
    videoItem.appendChild(thumbnail);

    // Durasi
    if (item.dur) {
        const duration = document.createElement('span');
        duration.className = 'video-duration';
        duration.innerText = item.dur;
        videoItem.appendChild(duration);
    }

    // Detail video
    const videoDetails = document.createElement('div');
    videoDetails.className = 'video-details';

    // Channel Logo
    if (item.channelLogo) {
        const channelLogo = document.createElement('img');
        channelLogo.className = 'channel-logo';
        channelLogo.src = item.channelLogo;
        videoDetails.appendChild(channelLogo);
    } else {
        // Fallback jika tidak ada channelLogo, bisa berupa placeholder atau inisial
        const defaultChannelLogo = document.createElement('div');
        defaultChannelLogo.className = 'channel-logo';
        defaultChannelLogo.style.backgroundColor = '#ccc'; // Placeholder abu-abu
        defaultChannelLogo.innerText = item.channelName ? item.channelName[0].toUpperCase() : ''; // Inisial
        defaultChannelLogo.style.display = 'flex';
        defaultChannelLogo.style.justifyContent = 'center';
        defaultChannelLogo.style.alignItems = 'center';
        defaultChannelLogo.style.color = '#333';
        defaultChannelLogo.style.fontWeight = 'bold';
        videoDetails.appendChild(defaultChannelLogo);
    }


    const videoInfo = document.createElement('div');
    videoInfo.className = 'video-info';

    // Title
    const title = document.createElement('div');
    title.className = 'video-title';
    title.innerText = item.ttl;
    videoInfo.appendChild(title);

    // Channel Name
    if (item.channelName) {
        const channelName = document.createElement('div');
        channelName.className = 'channel-name';
        channelName.innerText = item.channelName;
        videoInfo.appendChild(channelName);
    }

    // Views and Upload Time (Statistik)
    if (item.views || item.uploadTime) {
        const videoStats = document.createElement('div');
        videoStats.className = 'video-stats';
        let statsText = '';
        if (item.views) statsText += item.views;
        if (item.views && item.uploadTime) statsText += ' • ';
        if (item.uploadTime) statsText += item.uploadTime;
        videoStats.innerText = statsText;
        videoInfo.appendChild(videoStats);
    }

    videoDetails.appendChild(videoInfo);
    videoItem.appendChild(videoDetails);
    container.appendChild(videoItem);
}

// Muat video dari file JSON
files.forEach(file => {
    fetch(file)
        .then(response => response.json())
        .then(data => {
            data.forEach(item => {
                // Tambahkan data channelLogo, channelName, views, uploadTime jika tidak ada di JSON
                // Ini hanya contoh, idealnya data ini harus ada di JSON
                if (!item.channelLogo) item.channelLogo = 'https://yt3.ggpht.com/ytc/AGIKg_gO3W4_1_E7B1L_2-Z2-3A_4-W-5_P-6_R-7_S-8_T-9_U-0=s176-c-k-c0x00ffffff-no-rj-mo'; // Placeholder
                if (!item.channelName) item.channelName = 'Nama Channel';
                if (!item.views) item.views = Math.floor(Math.random() * 100) + 'K views'; // Random views
                if (!item.uploadTime) item.uploadTime = Math.floor(Math.random() * 12) + 1 + ' months ago'; // Random upload time

                createVideoItem(item, 'container');
            });
        })
        .catch(error => console.error('Error loading JSON:', error));
});

// Muat video "Continue Watching"
continueWatchingData.forEach(item => {
    createVideoItem(item, 'continueWatchingContainer');
});

function playVideo(videoFile, logoFile, textFile, channelLogo, channelName, views, uploadTime) {
    sessionStorage.setItem('videoLink', videoFile);
    sessionStorage.setItem('videoTitle', textFile);
    sessionStorage.setItem('logoFile', logoFile);
    sessionStorage.setItem('channelLogo', channelLogo);
    sessionStorage.setItem('channelName', channelName);
    sessionStorage.setItem('views', views);
    sessionStorage.setItem('uploadTime', uploadTime);
    window.location.href = 'ply.html'; // Anda perlu membuat ply.html untuk memutar video
}

// Fungsi pencarian (masih ada, tapi tidak terlihat secara UI langsung)
function prosesMenu() {
    var input = document.getElementById("cari"); // Cari input ini jika Anda tambahkan lagi di HTML
    if (!input) return; // Keluar jika input tidak ditemukan

    var filter = input.value.toLowerCase();
    var li = document.querySelectorAll('.video-item'); // Mengubah dari .responsive-div ke .video-item
    for (var i = 0; i < li.length; i++) {
        if (li[i].innerText.toLowerCase().indexOf(filter) > -1) { // Mencari di seluruh teks item video
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}

// Tidak ada elemen 'cari' di HTML baru, jadi event listener ini mungkin tidak perlu.
// document.getElementById("cari").addEventListener("input", prosesMenu);