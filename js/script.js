console.log("javascript");
let currentSong=new Audio();
let songs;
let currfolder;


function convertSeconds(seconds) {
    // Ensure the input is a non-negative number
    if (seconds < 0 || isNaN(seconds)) {
        return '00:00';
    }
    seconds = Math.floor(seconds);

    // Calculate minutes and remaining seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    // Format minutes and seconds as strings with leading zeros if needed
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = remainingSeconds.toString().padStart(2, '0');

    // Return the formatted time string
    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getsongs(folder){
    currfolder = folder;
    let a = await fetch(`/${folder}/`)
let response = await a.text();
//console.log(response);
let div = document.createElement("div")
div.innerHTML = response;
let as = div.getElementsByTagName("a")
songs =[]
for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if(element.href.endsWith(".mp3")){
        songs.push(element.href.split(`/${folder}/`)[1]);
    
    }
}


//show all the songs in the playlist
let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
songUL.innerHTML="";
for(const song of songs){
    songUL.innerHTML = songUL.innerHTML +  ` <li>
                        <img class="invert" src="img/music.svg" alt="">
                        <div class="info">
                            <div>${song.replaceAll("%20"," ")}</div>
                            <div>Ramesh Chary</div>
                        </div>
                        <div class="playnow">
                            <span>
                                Play Now
                            </span>
                            <img  src="img/play.svg" alt="">
                        </div>
                    </li>`;
}


//attach an event listener to each song
Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e=>{
    e.addEventListener("click", element=>{

    playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
    updatePlayButton(e);
    });
});
return songs;

}



const playMusic = (track, pause = false) => {
    
    currentSong.src = `/${currfolder}/` + track;

    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg"; // Update the play button to pause
    } else {
        currentSong.pause();
        play.src = "img/play.svg"; // Update the play button to play
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
    updatePlayButtonForCurrentSong(track); // Update button for the currently playing song
};

const updatePlayButton = (clickedElement) => {
    // Reset all play buttons to "Play Now"
    const playButtons = document.querySelectorAll(".playnow img");
    playButtons.forEach(button => {
        button.src = "img/play.svg"; // Ensure all buttons show the play icon
        button.parentElement.querySelector("span").innerText = "Play Now"; // Update the text
    });

    // Set the clicked button to "Pause"
    const playNowButton = clickedElement.querySelector(".playnow img");
    playNowButton.src = "img/pause.svg";
    playNowButton.parentElement.querySelector("span").innerText = "Pause"; // Update the text
};

const updatePlayButtonForCurrentSong = (track) => {
    const currentTrackIndex = songs.indexOf(track);
    
    if (currentTrackIndex === -1) return;

    // Reset all play buttons to "Play Now"
    const playButtons = document.querySelectorAll(".playnow img");
    playButtons.forEach(button => {
        button.src = "img/play.svg"; // Ensure all buttons show the play icon
        button.parentElement.querySelector("span").innerText = "Play Now"; // Update the text
    });

    // Set the current track's button to "Pause"
    const currentPlayButton = playButtons[currentTrackIndex];
    currentPlayButton.src = "img/pause.svg";
    currentPlayButton.parentElement.querySelector("span").innerText = "Pause"; // Update the text
};

// Attach event listeners for song list items
Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
    e.addEventListener("click", () => {
        const track = e.querySelector(".info").firstElementChild.innerHTML.trim();
        
        // If the clicked song is already playing, toggle pause
        if (currentSong.src.includes(track)) {
            playMusic(track, currentSong.paused); // Toggle play/pause
        } else {
            playMusic(track); // Play the new track
        }
        updatePlayButton(e); // Update button for clicked song
    });
});




/////////////////////////
async function displayAlbums(){
    let a = await fetch(`/songs/`)
let response = await a.text();
// console.log(response);
let div = document.createElement("div")
div.innerHTML = response;
let anchors = div.getElementsByTagName("a")
let cardContainer = document.querySelector(".cardContainer")
let array = Array.from(anchors)
for (let index = 0; index < array.length; index++) {
    const e = array[index];
    
    if(e.href.includes("/songs/")){
        let folder = e.href.split("/").slice(-1)[0]
        // Get the metadata of the folder
        let a = await fetch(`/songs/${folder}/info.json`);
        let response = await a.json();
        // console.log(response)
        cardContainer.innerHTML =cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
                        <div class="play-button">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">

                                <path
                                    d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                                    stroke-width="1.5" />
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
    }
}

//load the playlist whenever card is clicked

Array.from(document.getElementsByClassName("card")).forEach(e=>{
    e.addEventListener("click", async item=>{
        songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)
        playMusic(songs[0]);
    })
})


}

async function main(){

    await getsongs("songs/cs")

    playMusic(songs[0], true)

//display all albums n the page

displayAlbums()



    //console.log(songs);
// show all the songs in the playlist


    //attach an event listener to play, next and previous
    play.addEventListener("click",()=>{
        if(currentSong.paused){
            currentSong.play();
            play.src="img/pause.svg"
        }
        else{
            currentSong.pause()
            play.src="img/play.svg"
        }
    })

    //listen for timeupdate event
    currentSong.addEventListener("timeupdate", ()=>{
        console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML=`${convertSeconds(currentSong.currentTime)} / ${
        convertSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = currentSong.currentTime/currentSong.duration*100 + "%";
        
        ////////////////////////
         // If the song ends, reset the play button for the next song
    if (currentSong.ended) {
        const currentTrackIndex = songs.indexOf(currentSong.src.split("/").pop());
        if (currentTrackIndex + 1 < songs.length) {
            playMusic(songs[currentTrackIndex + 1]); // Automatically play the next song
        } else {
            play.src = "img/play.svg"; // Reset play button if no more songs
        }
    }
    //////////////////////

    });

    //add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width)*100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration)* percent)/100;
    })

    //add an event listener for hamburger

    document.querySelector(".hamburger").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "0"
    })
    
    //add event listener for close
    document.querySelector(".close").addEventListener("click", ()=>{
        document.querySelector(".left").style.left ="-110%"
    })

    // add an event listener to previous and next

    previous.addEventListener("click", ()=>{
        console.log("previous clicked");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1) [0])
        if((index-1) >= 0){
            playMusic(songs[index-1]);
            /////////////
            updatePlayButtonForCurrentSong(songs[index -1]);
////////////////////
        }
        
    })
    next.addEventListener("click", ()=>{
        console.log("next clicked");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1) [0])
        if((index+1) < songs.length){
            playMusic(songs[index+1])
            ///////////
            updatePlayButtonForCurrentSong(songs[index + 1]); // Update button for next song
//////////////////
        }
    })

  // add an event to volume
  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e)=>{
    console.log("setting volume low", e.target.value,"/100");
    currentSong.volume = parseInt(e.target.value)/100;
    if(currentSong.volume >0){
        document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
    }else {
        document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("volume.svg", "mute.svg");
    }
})

// Add event listener to mute the volume
document.querySelector(".volume>img").addEventListener("click", e=>{
    
    if(e.target.src.includes("volume.svg")){
        e.target.src = e.target.src.replace("volume.svg", "mute.svg")
        currentSong.volume = 0;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    }
    else{
    e.target.src = e.target.src.replace("mute.svg", "volume.svg")
    currentSong.volume = .10;
    document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
    }

})


}
main()
