document.addEventListener('keydown', function(event) {
    const outputDiv = document.getElementById('output');
    outputDiv.innerHTML = `Kode Tombol: ${event.code} (Key: ${event.key})`;
});