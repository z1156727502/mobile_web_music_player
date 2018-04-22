// require
var index = 0;
var songList;
var audio;
function changeMusic(f){//1下一曲；-1上一曲；0可以实现加载播放当前曲目
    index = (index + f + songList.length) % songList.length;
    player.render(songList[index]);
    audio.getAudio(songList[index].audio);
    $('.play-btn').removeClass('play').addClass('pause');
    player.progress.renderEndTime(songList[index].duration);
    audio.play();
    player.progress.playingPro();//////////更新进度条
};
function bindEvent() {
    $('.control-btn').on('tap' , '.last' , function(){
        changeMusic(1);
    })
    .on('tap' , '.next' , function(){
        changeMusic(-1);
    })
    .on('tap' , '.play-btn' , function(){
        if (audio.status == 'pause') {
            audio.play();
            $('.play-btn').removeClass('play').addClass('pause');
        } else {
            audio.pause();
            $('.play-btn').removeClass('pause').addClass('play');
        }
    })
}
function getData(url) {
    $.ajax({
        type: 'GET',
        url: url,
        // data: '',
        success : outData,
        error : function () {
            alert('网络错误，请刷新页面或检查网络连接。');
        }
    })
}
function outData(data){
    songList = data;
    player.render(data[index]);
    bindEvent();
    audio = new player.AudioControl();
    audio.getAudio(songList[index].audio);
    player.progress.renderEndTime(songList[index].duration);
}
getData('../source/data.json');
