const files = [ 'captain.json','cmpr.json' ]; // Array file JSON

files.forEach(file => {
               fetch(file)
                   .then(response => response.json())
                   .then(data => {
                       data.forEach(item => {

const container = document.getElementById('container');

const dv = document.createElement('div');
dv.setAttribute("tabindex", "1");
dv.className = 'film';
dv.title = item.ttl;
dv.onclick = () => playVideo(item.lnk);

function playVideo(videoFile) {
            window.location.href = `ply.html?video=${videoFile}`;
        }

const sp = document.createElement('p');
sp.className = 'sp';
sp.innerText = item.ttl;
           
const img = document.createElement('img');
img.setAttribute("tabindex", "-1");
img.id = 'imgv';
img.src = item.logo;
img.alt = item.ttl;

dv.appendChild(img);

dv.appendChild(sp);

container.appendChild(dv);
                                  
                       });
                   })
                   
                   .catch(error => console.error('Error loading JSON:', error));
           });

function prosesMenu() {
    var input = document.getElementById("cari");
    var filter = input.value.toLowerCase();
    var li = document.querySelectorAll('.film');

    for (var i = 0; i < li.length; i++) {
        // Menggunakan innerHTML dari button
        if (li[i].innerHTML.toLowerCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}

// Tambahkan event listener untuk memanggil prosesMenu saat input berubah
document.getElementById("cari").addEventListener("input", prosesMenu);
