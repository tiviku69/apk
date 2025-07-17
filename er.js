const files = [ 'captain.json','cmpr.json' ]; // Array file JSON

files.forEach(file => {
               fetch(file)
                   .then(response => response.json())
                   .then(data => {
                       data.forEach(item => {

const container = document.getElementById('container');
                          
const img = document.createElement('img');
img.id = 'imgv';
img.src = item.logo;

const pp = document.createElement('p');
pp.className = 're';
pp.innerText = item.ttl;

const dv = document.createElement('div');
dv.className = 'responsive-div';
dv.onclick = () => playVideo(item.link);

function playVideo(videoFile) {
            window.location.href = `ply.html?video=${videoFile}`;
        }

dv.appendChild(img);

dv.appendChild(pp);

container.appendChild(dv);
                                                   
                       });
                   })
                   
                   .catch(error => console.error('Error loading JSON:', error));
           });

function prosesMenu() {
    var input = document.getElementById("cari");
    var filter = input.value.toLowerCase();
    var li = document.querySelectorAll('.responsive-div');

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
