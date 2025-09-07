window.onload = function() {
    const videoFile = sessionStorage.getItem('videoFile') || videoUrl;
    const logoFile = sessionStorage.getItem('logoFile');
    const textFile = sessionStorage.getItem('textFile');

    if (videoFile) {
        var playerInstance = jwplayer("player").setup({
            file: videoFile,
            width: "100%",
            height: "100%",
            controls: true,
            sharing: false,
            displaytitle: true,
            displaydescription: true,
            title: textFile || "Default Title", // Use textFile if available
            description: "Kamu Sedang Nonton", // Optional: Use textFile here if needed
            skin: {
                name: "netflix"
            },
            logo: {
                file: "https://filmovie.github.io/tiviku/gambar/tiviku.png",
            },
            captions: {
                color: "#FFF",
                fontSize: 14,
                backgroundOpacity: 0,
                edgeStyle: "raised"
            }
        });

        playerInstance.play();
    }
};