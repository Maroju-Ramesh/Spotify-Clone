console.log("javascript");
let currentSong = new Audio();
let songs = [];
let currfolder;

function convertSeconds(seconds) {
    if (seconds < 0 || isNaN(seconds)) {
        return '00:00';
    }
    seconds = Math.floor(seconds);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

async function getsongs(folder) {
    currfolder = folder;
    const fetchUrl = `/${folder}/`;
    console.log(`Fetching songs from: ${fetchUrl}`);
    let response = await fetch(fetchUrl);

     // Check for a successful response
    if (!response.ok) {
        console.error(`Failed to fetch songs: ${response.statusText}`);
        return [];
    }

    let data = await response.json();
    
    songs = data.songs; // Assuming songs is an array in songs.json

    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songUL.innerHTML = ""; // Clear the song list before adding new songs
    for (const song of songs) {
        songUL.innerHTML += `
            <li>
                <img class="invert" src="img/music.svg" alt="">
                <div class="info">
                    <div>${song.replaceAll("%20", " ")}</div>
                    <div>Ramesh Chary</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img src="img/play.svg" alt="">
                </div>
            </li>`;
    }

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            const track = e.querySelector(".info").firstElementChild.innerHTML.trim();
            playMusic(track);
            updatePlayButton(e);
        });
    });
}

const playMusic = (track, pause = false) => {
    if (!songs.includes(track)) {
        console.error(`Track not found: ${track}`);
        return;
    }
    currentSong.src = `/${currfolder}/${track}`;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    } else {
        currentSong.pause();
        play.src = "img/play.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
    updatePlayButtonForCurrentSong(track);
};

const updatePlayButton = (clickedElement) => {
    const playButtons = document.querySelectorAll(".playnow img");
    playButtons.forEach(button => {
        button.src = "img/play.svg";
        button.parentElement.querySelector("span").innerText = "Play Now";
    });
    const playNowButton = clickedElement.querySelector(".playnow img");
    playNowButton.src = "img/pause.svg";
    playNowButton.parentElement.querySelector("span").innerText = "Pause";
};

const updatePlayButtonForCurrentSong = (track) => {
    const currentTrackIndex = songs.indexOf(track);
    if (currentTrackIndex === -1) return;

    const playButtons = document.querySelectorAll(".playnow img");
    playButtons.forEach(button => {
        button.src = "img/play.svg";
        button.parentElement.querySelector("span").innerText = "Play Now";
    });

    const currentPlayButton = playButtons[currentTrackIndex];
    currentPlayButton.src = "img/pause.svg";
    currentPlayButton.parentElement.querySelector("span").innerText = "Pause";
};

async function displayAlbums() {
    try {
        // Fetch the songs directory to list all albums
        const response = await fetch(`/songs/`);
        const text = await response.text();

        // Create a temporary DOM element to parse the HTML response
        const div = document.createElement("div");
        div.innerHTML = text;

        // Get all anchor tags within the directory
        const anchors = div.getElementsByTagName("a");
        const cardContainer = document.querySelector(".cardContainer");

        // Loop through the anchors to find album folders
        Array.from(anchors).forEach(async (anchor) => {
            const folderName = anchor.href.split("/").pop();

            if (anchor.href.includes("/songs/")) {
                // Attempt to fetch the info.json for the folder
                try {
                    const infoResponse = await fetch(`/songs/${folderName}/info.json`);
                    const info = await infoResponse.json();
                    
                    // Add the album info to the card container
                    cardContainer.innerHTML += `
                        <div data-folder="${folderName}" class="card">
                            <div class="play-button">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                    <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" stroke-width="1.5" />
                                </svg>
                            </div>
                            <img src="/songs/${folderName}/cover.jpg" alt="">
                            <h2>${info.title}</h2>
                            <p>${info.description}</p>
                        </div>`;
                } catch (err) {
                    console.error(`Failed to fetch info for folder ${folderName}:`, err);
                }
            }
        });
    } catch (error) {
        console.error("Failed to fetch albums: ", error);
    }

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            await getsongs(item.currentTarget.dataset.folder);
            playMusic(songs[0]); // Automatically play the first song in the selected album
        });
    });
}

async function main() {
    await getSongs("songs/ncs")
    playMusic(songs[0], true)
    await displayAlbums();

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${convertSeconds(currentSong.currentTime)} / ${convertSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration * 100) + "%";

        if (currentSong.ended) {
            const currentTrackIndex = songs.indexOf(currentSong.src.split("/").pop());
            if (currentTrackIndex + 1 < songs.length) {
                playMusic(songs[currentTrackIndex + 1]);
            } else {
                play.src = "img/play.svg";
            }
        }
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%";
    });

    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    });

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    });

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });

    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = 0.10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    });
}

main();
