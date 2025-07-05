let meta = document.createElement("meta");
meta.name ="viewport";
meta.content ="width=device-width,initial-scale=1.0, user-scalable=1";
document.head.appendChild(meta);

var hasil = document.getElementById("marquee");

hasil.innerHTML = "<p><b>film akan bertambah otomatis</b></p>";

function prosesMenu(){

	var input = document.getElementById("cari");

	var filter = input.value.toLowerCase();

	var li = document.querySelectorAll(".film")

	console.log(li)

	for(var i = 0; i<li.length; i++){

	var ahref = document.querySelectorAll("a")[i];

if(ahref.innerHTML.toLowerCase().indexOf(filter) > -1){

			li[i].style.display = "";

		}else{

			li[i].style.display = "none"; } } }
