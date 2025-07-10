const files = [ 'jsn1.json','jsn1.json','jsn1.json' ]; // Array file JSON

files.forEach(file => {
               fetch(file)
                   .then(response => response.json())
                   .then(data => {
                       data.forEach(item => {

const container = document.getElementById('container');

const button = document.createElement('button');
button.className = 'film';
button.onclick = () => playVideo(item.link);

function playVideo(videoFile) {
            window.location.href = `g1.html?video=${videoFile}`;
        }

const span = document.createElement('span');
span.innerText = item.buttonText;
           
const img = document.createElement('img');
img.id = 'imgv';
img.src = item.img;

button.appendChild(span);

container.appendChild(button);
                           button.appendChild(img);
                                                   
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
