// require
var index = 0;
var songList;
var audio;
var flag = false; //true：进度条动画开启
var $ul = $('.list-content ul');
function changeMusic(f) { //1下一曲；-1上一曲；Dindex可以播放下Dindex首
    index = (index + f + songList.length) % songList.length;
    player.render(songList[index]);
    audio.getAudio(songList[index].audio);
    $('.play-btn').removeClass('play').addClass('pause');
    $ul.find('li.active').removeClass('active');
    $ul.find('li').eq(index).addClass('active');
    player.progress.renderEndTime(songList[index].duration);
    audio.play();
    if (!flag) { //若进度条动画未开启则开启动画
        flag = true;
        player.progress.updata();
    }
};

function bindEvent() {
    $('.control-btn').on('tap', '.last', function () {
        changeMusic(-1);
    })
    .on('tap', '.next', function () {
        changeMusic(1);
    })
    .on('tap', '.play-btn', function () {
        if (audio.status == 'pause') { //pause-play
            audio.play();
            $('.play-btn').removeClass('play').addClass('pause');
            if (!flag) {
                flag = true;
                player.progress.updata();
            }
        } else { //play-pause
            audio.pause();
            flag = false; //暂停同时停止进度条动画
            $('.play-btn').removeClass('pause').addClass('play');
        }
    })
    .on('tap' , '.list' , function(){
        $('.song-list').css('display' , 'block');
        $('.song-list-bg').css('display' , 'block');
    });
    $('.song-list-bg').on('tap' , function(){
        $('.song-list').css('display' , 'none');
        $('.song-list-bg').css('display' , 'none');
    });
    $ul.on('tap' , 'li' , function(e){
        var d = $(this).index() - index;
        changeMusic(d);
    }).on('awipeup ')/////列表滑动
}

function getData(url) {
    $.ajax({
        type: 'GET',
        url: url,
        // data: '',
        success: outData,
        error: function () {
            alert('网络错误，请刷新页面或检查网络连接。');
        }
    })
}

function outData(data) {
    songList = data;
    player.render(data[index]);
    player.renderList(data);
    $ul.find('li').eq(index).addClass('active');
    bindEvent();
    audio = new player.AudioManager();
    audio.getAudio(songList[index].audio);
    player.progress.renderEndTime(songList[index].duration);
}
getData('../source/data.json');