// require
var index = 0;
var songList;
var audio;
function bindEvent() {
    // $('.wrapper').on('playChange' , function(){
    //     audio.getAudio(songList[index].audio)
    //     if (audio.status == 'play') {
    //         audio.play();
    //     }
    // })
    $('.control-btn').on('tap' , '.last' , function(){
        index = (index + 1 + songList.length) % songList.length;
        player.render(songList[index]);
        audio.getAudio(songList[index].audio);
        audio.play();
    })
    .on('tap' , '.next' , function(){
        index = (index - 1 + songList.length) % songList.length;
        player.render(songList[index]);
        audio.getAudio(songList[index].audio);
        audio.play();
    })
    .on('tap' , '.play-btn' , function(){
        if (audio.status == 'pause') {
            audio.play();
            $('.play-btn').removeClass('play').addClass('pause')
        } else {
            audio.pause();
            $('.play-btn').removeClass('pause').addClass('play')
        }
        

    })
}
function getData(url) {
    $.ajax({
        type: 'GET',
        url: url,
        // data: '',
        success : outData,
        error : outData
    })
}
function outData(data){
    songList = data;
    player.render(data[index]);
    bindEvent();
    audio = new player.AudioControl();
    audio.getAudio(songList[index].audio);
    // $('.wrapper').trigger('playChange');
}
getData('../source/data.json');
