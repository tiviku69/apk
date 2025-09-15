const atas = document.getElementById('atas');
atas.innerHTML = '<h1>tiviku</h1> <b>by tiviku</b> <input type="text" name="" id="cari" onkeyup="prosesMenu()" placeholder="cari..."> ';

const files = [ 'https://raw.githubusercontent.com/tiviku69/apk/main/cmpr.json','https://raw.githubusercontent.com/tiviku69/apk/main/captain.json','https://raw.githubusercontent.com/tiviku69/apk/main/avat.json','https://raw.githubusercontent.com/tiviku69/apk/main/ghost.json','https://raw.githubusercontent.com/tiviku69/apk/main/avatar.json','https://raw.githubusercontent.com/tiviku69/apk/main/squid.json','https://raw.githubusercontent.com/tiviku69/apk/main/journey.json','https://raw.githubusercontent.com/tiviku69/apk/main/one.json','https://raw.githubusercontent.com/tiviku69/apk/main/mp4.json' ];
files.forEach(file => {
    fetch(file)
        .then(response => response.json())
        .then(data => {
            let isFirstItem = true;
            data.forEach(item => {
                const container = document.getElementById('container');
                const img = document.createElement('img');
                img.id = 'imgv';
    
                img.src = item.logo;

                const pp = document.createElement('p');
                pp.className = 're';
                pp.innerText = item.ttl;

                const dur = document.createElement('p');
            
                dur.className = 'dur';
                dur.innerText = item.dur;

                const dv = document.createElement('div');
                dv.className = 'responsive-div';

                // Tambahkan kelas khusus untuk elemen pertama
                if (isFirstItem) {
                    dv.classList.add('initial-focus');
                    isFirstItem = false;
                }

                dv.onclick = () => playVideo(item.lnk, item.logo, item.ttl);

                dv.appendChild(img);
                dv.appendChild(pp);
                dv.appendChild(dur);
                container.appendChild(dv);
            });
        })
        .catch(error => console.error('Error loading JSON:', error));
});

function playVideo(videoFile, logoFile, textFile) {
    sessionStorage.setItem('videoLink', videoFile);
    sessionStorage.setItem('videoTitle', textFile);
    sessionStorage.setItem('logoFile', logoFile);
    window.location.href = 'ply.html';
}

function prosesMenu() {
    var input = document.getElementById("cari");
    var filter = input.value.toLowerCase();
    var li = document.querySelectorAll('.responsive-div');
    for (var i = 0; i < li.length; i++) {
        if (li[i].innerHTML.toLowerCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}

document.getElementById("cari").addEventListener("input", prosesMenu);