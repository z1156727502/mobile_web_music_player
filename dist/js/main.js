;(function($ ,root){
    function audioManager(){
        this.audio = new Audio();
        this.status = 'pause';
    }
    audioManager.prototype = {
        play :function(){
            this.audio.play();
            this.status = 'play';
        },
        pause :function(){
            this.audio.pause();
            this.status = 'pause';
        },
        curTime : function(cur){
            if (cur) {
                this.audio.currentTime = cur;
                return cur;
            }
            return this.audio.currentTime;
        },
        getAudio :function(src){
            this.audio.src = src;
            this.audio.loade;
        }
    }
    root.AudioManager = audioManager;
})(window.Zepto , window.player  || (window.player = {}))
/* requires:
zepto.min.js
blurImg(img , $ele);
*/
;(function ($, root) {
    'use strict';
    
    function gaussBlur(imgData) {
        var pixes = imgData.data;
        var width = imgData.width;
        var height = imgData.height;
        var gaussMatrix = [],
            gaussSum = 0,
            x, y,
            r, g, b, a,
            i, j, k, len;

        var radius = 10;
        var sigma = 5;

        a = 1 / (Math.sqrt(2 * Math.PI) * sigma);
        b = -1 / (2 * sigma * sigma);
        //生成高斯矩阵
        for (i = 0, x = -radius; x <= radius; x++, i++) {
            g = a * Math.exp(b * x * x);
            gaussMatrix[i] = g;
            gaussSum += g;

        }
        //归一化, 保证高斯矩阵的值在[0,1]之间
        for (i = 0, len = gaussMatrix.length; i < len; i++) {
            gaussMatrix[i] /= gaussSum;
        }
        //x 方向一维高斯运算
        for (y = 0; y < height; y++) {
            for (x = 0; x < width; x++) {
                r = g = b = a = 0;
                gaussSum = 0;
                for (j = -radius; j <= radius; j++) {
                    k = x + j;
                    if (k >= 0 && k < width) {//确保 k 没超出 x 的范围
                        //r,g,b,a 四个一组
                        i = (y * width + k) * 4;
                        r += pixes[i] * gaussMatrix[j + radius];
                        g += pixes[i + 1] * gaussMatrix[j + radius];
                        b += pixes[i + 2] * gaussMatrix[j + radius];
                        // a += pixes[i + 3] * gaussMatrix[j];
                        gaussSum += gaussMatrix[j + radius];
                    }
                }
                i = (y * width + x) * 4;
                // 除以 gaussSum 是为了消除处于边缘的像素, 高斯运算不足的问题
                // console.log(gaussSum)
                pixes[i] = r / gaussSum;
                pixes[i + 1] = g / gaussSum;
                pixes[i + 2] = b / gaussSum;
                // pixes[i + 3] = a ;
            }
        }
        //y 方向一维高斯运算
        for (x = 0; x < width; x++) {
            for (y = 0; y < height; y++) {
                r = g = b = a = 0;
                gaussSum = 0;
                for (j = -radius; j <= radius; j++) {
                    k = y + j;
                    if (k >= 0 && k < height) {//确保 k 没超出 y 的范围
                        i = (k * width + x) * 4;
                        r += pixes[i] * gaussMatrix[j + radius];
                        g += pixes[i + 1] * gaussMatrix[j + radius];
                        b += pixes[i + 2] * gaussMatrix[j + radius];
                        // a += pixes[i + 3] * gaussMatrix[j];
                        gaussSum += gaussMatrix[j + radius];
                    }
                }
                i = (y * width + x) * 4;
                pixes[i] = r / gaussSum;
                pixes[i + 1] = g / gaussSum;
                pixes[i + 2] = b / gaussSum;
            }
        }
        //end
        return imgData;
    }

    // 模糊图片
    function blurImg(img, ele) {

        var w = img.width,
            h = img.height,
            canvasW = 50,
            canvasH = 50;

        var canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d');

        canvas.width = canvasW;
        canvas.height = canvasH;

        ctx.drawImage(img, 0, 0, w, h, 0, 0, canvasW, canvasH);

        var pixel = ctx.getImageData(0, 0, canvasH, canvasH);

        gaussBlur(pixel);

        ctx.putImageData(pixel, 0, 0);

        var imageData = canvas.toDataURL();

        ele.css('background-image', 'url(' + imageData + ')');
    }

    root.blurImg = blurImg;

})(window.Zepto, window.player || (window.player = {}));


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
//这里控制播放列表
(function($ , root){
    var surationTime;
    var $now = $('.now-time').eq(0);
    var $top = $('.pro-top').eq(0);
    var $btn = $('.pro-btn').eq(0);
    var l = $('.pro-bottom').width();
    var $d = $(document);
    var movePro;
    function transTime(time) {
        var min = 0 | time / 60;
        var sec = 0 | time % 60;
        min = min < 10 ? '0' + min : min;
        sec = sec < 10 ? '0' + sec : sec;
        return  min + ':' + sec;
    }
    function renderEndTime(info){
        durationTime = info;
        $('.end-time').html(transTime(durationTime));
    }
    function renderPro(curTime){
        var percent = curTime/durationTime;
        percent = percent >= 1 ? 1 : percent;
        $now.html(transTime(curTime));
        $top.css('transform' , 'translate(' + ((percent - 1) * 100) +'% , -50%)' );
        $btn.css('transform' , 'translate(' + ((l - 8) * percent ) + 'px, -50%)');
        return curTime;
    }
    function updata(){
        audio.audio.ended == true ? changeMusic(1) : undefined;//一曲播放完毕开始下一曲
        var a = requestAnimationFrame(function(){
            renderPro(audio.curTime());
            if (flag) {
                updata();
            }else{
                cancelAnimationFrame(a)
            }   
        })
    }
    function dragPro(){
        $btn.on('touchstart' , function(e){
            var x1 = e.touches[0].clientX;
            var left = $btn.position().left;
            var percent;
            var playing = false;
            if (audio.status == 'play') {
                playing = true;
                audio.pause();
                flag = false;
            }
            $d.on('touchmove' , function movePro(e){
                var x2 = e.touches[0].clientX;
                var dx = x2 - x1;
                percent = (left + dx) / l;
                percent = percent > 1 ? 1 : percent;
                percent = percent < 0 ? 0 : percent;
                renderPro(percent * durationTime);
            }).one('touchend' , function(e){
                audio.curTime(percent * durationTime);
                if (playing) {
                    flag = true;
                    player.progress.updata();
                    audio.play();
                }
                $d.off('touchmove' , movePro);
            })
        })
    }
    dragPro();
    
    root.progress = {
        renderEndTime : renderEndTime,
        updata : updata
    }
})(window.Zepto , window.player || (window.player = {}))
//渲染界面
;(function ($, root) {
    function renderInfo(info) {
        var html = '<h2 class="song">' + info.song + '</h2>\
                    <p class = "singer">' + info.singer + '</p>\
                    <p class = "album">' + info.album + '</p>';
        $('.info').html(html);
        
    }

    function renderImg(info){
        var img = new Image();
        img.src = info;
        img.onload = function(){
            root.blurImg(img , $('.wrapper'));
            $('.singer-pic').html(img);
        }
    }
    function renderIsLike(info){
        if (info) {
            $('.keep').removeClass('unlike').addClass('like')
        }else{
            $('.keep').removeClass('like').addClass('unlike')
        }
    }
    function renderSongList(data){
        var $songL = $('.song-list');
        var d = data;
        $songL.find('.top .len').html('(' + d.length + '首)');
        d.forEach(function(ele , index) {
            $songL.find('.list-content ul').append('\
            <li><span class="song">' +ele.song + ' </span> <span class="singer"> - ' + ele.singer + '</span></li>\
            ');
        });
       
    }


    function init(data) {
        renderInfo(data);
        renderImg(data.image);
        renderIsLike(data.isLike)
    }
    root.render = init;
    root.renderList = renderSongList;
})(window.Zepto , window.player || (window.player = {}))
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF1ZGlvTWFuYWdlci5qcyIsImdhdXNzQmx1ci5qcyIsImluZGV4LmpzIiwibGlzdC5qcyIsInByb2dyZXNzLmpzIiwicmVuZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlFQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIjsoZnVuY3Rpb24oJCAscm9vdCl7XHJcbiAgICBmdW5jdGlvbiBhdWRpb01hbmFnZXIoKXtcclxuICAgICAgICB0aGlzLmF1ZGlvID0gbmV3IEF1ZGlvKCk7XHJcbiAgICAgICAgdGhpcy5zdGF0dXMgPSAncGF1c2UnO1xyXG4gICAgfVxyXG4gICAgYXVkaW9NYW5hZ2VyLnByb3RvdHlwZSA9IHtcclxuICAgICAgICBwbGF5IDpmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICB0aGlzLmF1ZGlvLnBsYXkoKTtcclxuICAgICAgICAgICAgdGhpcy5zdGF0dXMgPSAncGxheSc7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBwYXVzZSA6ZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdGhpcy5hdWRpby5wYXVzZSgpO1xyXG4gICAgICAgICAgICB0aGlzLnN0YXR1cyA9ICdwYXVzZSc7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjdXJUaW1lIDogZnVuY3Rpb24oY3VyKXtcclxuICAgICAgICAgICAgaWYgKGN1cikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hdWRpby5jdXJyZW50VGltZSA9IGN1cjtcclxuICAgICAgICAgICAgICAgIHJldHVybiBjdXI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXVkaW8uY3VycmVudFRpbWU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRBdWRpbyA6ZnVuY3Rpb24oc3JjKXtcclxuICAgICAgICAgICAgdGhpcy5hdWRpby5zcmMgPSBzcmM7XHJcbiAgICAgICAgICAgIHRoaXMuYXVkaW8ubG9hZGU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcm9vdC5BdWRpb01hbmFnZXIgPSBhdWRpb01hbmFnZXI7XHJcbn0pKHdpbmRvdy5aZXB0byAsIHdpbmRvdy5wbGF5ZXIgIHx8ICh3aW5kb3cucGxheWVyID0ge30pKSIsIi8qIHJlcXVpcmVzOlxyXG56ZXB0by5taW4uanNcclxuYmx1ckltZyhpbWcgLCAkZWxlKTtcclxuKi9cclxuOyhmdW5jdGlvbiAoJCwgcm9vdCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgXHJcbiAgICBmdW5jdGlvbiBnYXVzc0JsdXIoaW1nRGF0YSkge1xyXG4gICAgICAgIHZhciBwaXhlcyA9IGltZ0RhdGEuZGF0YTtcclxuICAgICAgICB2YXIgd2lkdGggPSBpbWdEYXRhLndpZHRoO1xyXG4gICAgICAgIHZhciBoZWlnaHQgPSBpbWdEYXRhLmhlaWdodDtcclxuICAgICAgICB2YXIgZ2F1c3NNYXRyaXggPSBbXSxcclxuICAgICAgICAgICAgZ2F1c3NTdW0gPSAwLFxyXG4gICAgICAgICAgICB4LCB5LFxyXG4gICAgICAgICAgICByLCBnLCBiLCBhLFxyXG4gICAgICAgICAgICBpLCBqLCBrLCBsZW47XHJcblxyXG4gICAgICAgIHZhciByYWRpdXMgPSAxMDtcclxuICAgICAgICB2YXIgc2lnbWEgPSA1O1xyXG5cclxuICAgICAgICBhID0gMSAvIChNYXRoLnNxcnQoMiAqIE1hdGguUEkpICogc2lnbWEpO1xyXG4gICAgICAgIGIgPSAtMSAvICgyICogc2lnbWEgKiBzaWdtYSk7XHJcbiAgICAgICAgLy/nlJ/miJDpq5jmlq/nn6npmLVcclxuICAgICAgICBmb3IgKGkgPSAwLCB4ID0gLXJhZGl1czsgeCA8PSByYWRpdXM7IHgrKywgaSsrKSB7XHJcbiAgICAgICAgICAgIGcgPSBhICogTWF0aC5leHAoYiAqIHggKiB4KTtcclxuICAgICAgICAgICAgZ2F1c3NNYXRyaXhbaV0gPSBnO1xyXG4gICAgICAgICAgICBnYXVzc1N1bSArPSBnO1xyXG5cclxuICAgICAgICB9XHJcbiAgICAgICAgLy/lvZLkuIDljJYsIOS/neivgemrmOaWr+efqemYteeahOWAvOWcqFswLDFd5LmL6Ze0XHJcbiAgICAgICAgZm9yIChpID0gMCwgbGVuID0gZ2F1c3NNYXRyaXgubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgICAgZ2F1c3NNYXRyaXhbaV0gLz0gZ2F1c3NTdW07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8veCDmlrnlkJHkuIDnu7Tpq5jmlq/ov5DnrpdcclxuICAgICAgICBmb3IgKHkgPSAwOyB5IDwgaGVpZ2h0OyB5KyspIHtcclxuICAgICAgICAgICAgZm9yICh4ID0gMDsgeCA8IHdpZHRoOyB4KyspIHtcclxuICAgICAgICAgICAgICAgIHIgPSBnID0gYiA9IGEgPSAwO1xyXG4gICAgICAgICAgICAgICAgZ2F1c3NTdW0gPSAwO1xyXG4gICAgICAgICAgICAgICAgZm9yIChqID0gLXJhZGl1czsgaiA8PSByYWRpdXM7IGorKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGsgPSB4ICsgajtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoayA+PSAwICYmIGsgPCB3aWR0aCkgey8v56Gu5L+dIGsg5rKh6LaF5Ye6IHgg55qE6IyD5Zu0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vcixnLGIsYSDlm5vkuKrkuIDnu4RcclxuICAgICAgICAgICAgICAgICAgICAgICAgaSA9ICh5ICogd2lkdGggKyBrKSAqIDQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHIgKz0gcGl4ZXNbaV0gKiBnYXVzc01hdHJpeFtqICsgcmFkaXVzXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZyArPSBwaXhlc1tpICsgMV0gKiBnYXVzc01hdHJpeFtqICsgcmFkaXVzXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYiArPSBwaXhlc1tpICsgMl0gKiBnYXVzc01hdHJpeFtqICsgcmFkaXVzXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYSArPSBwaXhlc1tpICsgM10gKiBnYXVzc01hdHJpeFtqXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ2F1c3NTdW0gKz0gZ2F1c3NNYXRyaXhbaiArIHJhZGl1c107XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaSA9ICh5ICogd2lkdGggKyB4KSAqIDQ7XHJcbiAgICAgICAgICAgICAgICAvLyDpmaTku6UgZ2F1c3NTdW0g5piv5Li65LqG5raI6Zmk5aSE5LqO6L6557yY55qE5YOP57SgLCDpq5jmlq/ov5DnrpfkuI3otrPnmoTpl67pophcclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGdhdXNzU3VtKVxyXG4gICAgICAgICAgICAgICAgcGl4ZXNbaV0gPSByIC8gZ2F1c3NTdW07XHJcbiAgICAgICAgICAgICAgICBwaXhlc1tpICsgMV0gPSBnIC8gZ2F1c3NTdW07XHJcbiAgICAgICAgICAgICAgICBwaXhlc1tpICsgMl0gPSBiIC8gZ2F1c3NTdW07XHJcbiAgICAgICAgICAgICAgICAvLyBwaXhlc1tpICsgM10gPSBhIDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvL3kg5pa55ZCR5LiA57u06auY5pav6L+Q566XXHJcbiAgICAgICAgZm9yICh4ID0gMDsgeCA8IHdpZHRoOyB4KyspIHtcclxuICAgICAgICAgICAgZm9yICh5ID0gMDsgeSA8IGhlaWdodDsgeSsrKSB7XHJcbiAgICAgICAgICAgICAgICByID0gZyA9IGIgPSBhID0gMDtcclxuICAgICAgICAgICAgICAgIGdhdXNzU3VtID0gMDtcclxuICAgICAgICAgICAgICAgIGZvciAoaiA9IC1yYWRpdXM7IGogPD0gcmFkaXVzOyBqKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBrID0geSArIGo7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGsgPj0gMCAmJiBrIDwgaGVpZ2h0KSB7Ly/noa7kv50gayDmsqHotoXlh7ogeSDnmoTojIPlm7RcclxuICAgICAgICAgICAgICAgICAgICAgICAgaSA9IChrICogd2lkdGggKyB4KSAqIDQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHIgKz0gcGl4ZXNbaV0gKiBnYXVzc01hdHJpeFtqICsgcmFkaXVzXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZyArPSBwaXhlc1tpICsgMV0gKiBnYXVzc01hdHJpeFtqICsgcmFkaXVzXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYiArPSBwaXhlc1tpICsgMl0gKiBnYXVzc01hdHJpeFtqICsgcmFkaXVzXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYSArPSBwaXhlc1tpICsgM10gKiBnYXVzc01hdHJpeFtqXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ2F1c3NTdW0gKz0gZ2F1c3NNYXRyaXhbaiArIHJhZGl1c107XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaSA9ICh5ICogd2lkdGggKyB4KSAqIDQ7XHJcbiAgICAgICAgICAgICAgICBwaXhlc1tpXSA9IHIgLyBnYXVzc1N1bTtcclxuICAgICAgICAgICAgICAgIHBpeGVzW2kgKyAxXSA9IGcgLyBnYXVzc1N1bTtcclxuICAgICAgICAgICAgICAgIHBpeGVzW2kgKyAyXSA9IGIgLyBnYXVzc1N1bTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvL2VuZFxyXG4gICAgICAgIHJldHVybiBpbWdEYXRhO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIOaooeeziuWbvueJh1xyXG4gICAgZnVuY3Rpb24gYmx1ckltZyhpbWcsIGVsZSkge1xyXG5cclxuICAgICAgICB2YXIgdyA9IGltZy53aWR0aCxcclxuICAgICAgICAgICAgaCA9IGltZy5oZWlnaHQsXHJcbiAgICAgICAgICAgIGNhbnZhc1cgPSA1MCxcclxuICAgICAgICAgICAgY2FudmFzSCA9IDUwO1xyXG5cclxuICAgICAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyksXHJcbiAgICAgICAgICAgIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG5cclxuICAgICAgICBjYW52YXMud2lkdGggPSBjYW52YXNXO1xyXG4gICAgICAgIGNhbnZhcy5oZWlnaHQgPSBjYW52YXNIO1xyXG5cclxuICAgICAgICBjdHguZHJhd0ltYWdlKGltZywgMCwgMCwgdywgaCwgMCwgMCwgY2FudmFzVywgY2FudmFzSCk7XHJcblxyXG4gICAgICAgIHZhciBwaXhlbCA9IGN0eC5nZXRJbWFnZURhdGEoMCwgMCwgY2FudmFzSCwgY2FudmFzSCk7XHJcblxyXG4gICAgICAgIGdhdXNzQmx1cihwaXhlbCk7XHJcblxyXG4gICAgICAgIGN0eC5wdXRJbWFnZURhdGEocGl4ZWwsIDAsIDApO1xyXG5cclxuICAgICAgICB2YXIgaW1hZ2VEYXRhID0gY2FudmFzLnRvRGF0YVVSTCgpO1xyXG5cclxuICAgICAgICBlbGUuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnICsgaW1hZ2VEYXRhICsgJyknKTtcclxuICAgIH1cclxuXHJcbiAgICByb290LmJsdXJJbWcgPSBibHVySW1nO1xyXG5cclxufSkod2luZG93LlplcHRvLCB3aW5kb3cucGxheWVyIHx8ICh3aW5kb3cucGxheWVyID0ge30pKTtcclxuXHJcbiIsIi8vIHJlcXVpcmVcclxudmFyIGluZGV4ID0gMDtcclxudmFyIHNvbmdMaXN0O1xyXG52YXIgYXVkaW87XHJcbnZhciBmbGFnID0gZmFsc2U7IC8vdHJ1Ze+8mui/m+W6puadoeWKqOeUu+W8gOWQr1xyXG52YXIgJHVsID0gJCgnLmxpc3QtY29udGVudCB1bCcpO1xyXG5mdW5jdGlvbiBjaGFuZ2VNdXNpYyhmKSB7IC8vMeS4i+S4gOabsu+8my0x5LiK5LiA5puy77ybRGluZGV45Y+v5Lul5pKt5pS+5LiLRGluZGV46aaWXHJcbiAgICBpbmRleCA9IChpbmRleCArIGYgKyBzb25nTGlzdC5sZW5ndGgpICUgc29uZ0xpc3QubGVuZ3RoO1xyXG4gICAgcGxheWVyLnJlbmRlcihzb25nTGlzdFtpbmRleF0pO1xyXG4gICAgYXVkaW8uZ2V0QXVkaW8oc29uZ0xpc3RbaW5kZXhdLmF1ZGlvKTtcclxuICAgICQoJy5wbGF5LWJ0bicpLnJlbW92ZUNsYXNzKCdwbGF5JykuYWRkQ2xhc3MoJ3BhdXNlJyk7XHJcbiAgICAkdWwuZmluZCgnbGkuYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgJHVsLmZpbmQoJ2xpJykuZXEoaW5kZXgpLmFkZENsYXNzKCdhY3RpdmUnKTtcclxuICAgIHBsYXllci5wcm9ncmVzcy5yZW5kZXJFbmRUaW1lKHNvbmdMaXN0W2luZGV4XS5kdXJhdGlvbik7XHJcbiAgICBhdWRpby5wbGF5KCk7XHJcbiAgICBpZiAoIWZsYWcpIHsgLy/oi6Xov5vluqbmnaHliqjnlLvmnKrlvIDlkK/liJnlvIDlkK/liqjnlLtcclxuICAgICAgICBmbGFnID0gdHJ1ZTtcclxuICAgICAgICBwbGF5ZXIucHJvZ3Jlc3MudXBkYXRhKCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5mdW5jdGlvbiBiaW5kRXZlbnQoKSB7XHJcbiAgICAkKCcuY29udHJvbC1idG4nKS5vbigndGFwJywgJy5sYXN0JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGNoYW5nZU11c2ljKC0xKTtcclxuICAgIH0pXHJcbiAgICAub24oJ3RhcCcsICcubmV4dCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBjaGFuZ2VNdXNpYygxKTtcclxuICAgIH0pXHJcbiAgICAub24oJ3RhcCcsICcucGxheS1idG4nLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKGF1ZGlvLnN0YXR1cyA9PSAncGF1c2UnKSB7IC8vcGF1c2UtcGxheVxyXG4gICAgICAgICAgICBhdWRpby5wbGF5KCk7XHJcbiAgICAgICAgICAgICQoJy5wbGF5LWJ0bicpLnJlbW92ZUNsYXNzKCdwbGF5JykuYWRkQ2xhc3MoJ3BhdXNlJyk7XHJcbiAgICAgICAgICAgIGlmICghZmxhZykge1xyXG4gICAgICAgICAgICAgICAgZmxhZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIucHJvZ3Jlc3MudXBkYXRhKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgeyAvL3BsYXktcGF1c2VcclxuICAgICAgICAgICAgYXVkaW8ucGF1c2UoKTtcclxuICAgICAgICAgICAgZmxhZyA9IGZhbHNlOyAvL+aaguWBnOWQjOaXtuWBnOatoui/m+W6puadoeWKqOeUu1xyXG4gICAgICAgICAgICAkKCcucGxheS1idG4nKS5yZW1vdmVDbGFzcygncGF1c2UnKS5hZGRDbGFzcygncGxheScpO1xyXG4gICAgICAgIH1cclxuICAgIH0pXHJcbiAgICAub24oJ3RhcCcgLCAnLmxpc3QnICwgZnVuY3Rpb24oKXtcclxuICAgICAgICAkKCcuc29uZy1saXN0JykuY3NzKCdkaXNwbGF5JyAsICdibG9jaycpO1xyXG4gICAgICAgICQoJy5zb25nLWxpc3QtYmcnKS5jc3MoJ2Rpc3BsYXknICwgJ2Jsb2NrJyk7XHJcbiAgICB9KTtcclxuICAgICQoJy5zb25nLWxpc3QtYmcnKS5vbigndGFwJyAsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgJCgnLnNvbmctbGlzdCcpLmNzcygnZGlzcGxheScgLCAnbm9uZScpO1xyXG4gICAgICAgICQoJy5zb25nLWxpc3QtYmcnKS5jc3MoJ2Rpc3BsYXknICwgJ25vbmUnKTtcclxuICAgIH0pO1xyXG4gICAgJHVsLm9uKCd0YXAnICwgJ2xpJyAsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIHZhciBkID0gJCh0aGlzKS5pbmRleCgpIC0gaW5kZXg7XHJcbiAgICAgICAgY2hhbmdlTXVzaWMoZCk7XHJcbiAgICB9KS5vbignYXdpcGV1cCAnKS8vLy8v5YiX6KGo5ruR5YqoXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldERhdGEodXJsKSB7XHJcbiAgICAkLmFqYXgoe1xyXG4gICAgICAgIHR5cGU6ICdHRVQnLFxyXG4gICAgICAgIHVybDogdXJsLFxyXG4gICAgICAgIC8vIGRhdGE6ICcnLFxyXG4gICAgICAgIHN1Y2Nlc3M6IG91dERhdGEsXHJcbiAgICAgICAgZXJyb3I6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgYWxlcnQoJ+e9kee7nOmUmeivr++8jOivt+WIt+aWsOmhtemdouaIluajgOafpee9kee7nOi/nuaOpeOAgicpO1xyXG4gICAgICAgIH1cclxuICAgIH0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIG91dERhdGEoZGF0YSkge1xyXG4gICAgc29uZ0xpc3QgPSBkYXRhO1xyXG4gICAgcGxheWVyLnJlbmRlcihkYXRhW2luZGV4XSk7XHJcbiAgICBwbGF5ZXIucmVuZGVyTGlzdChkYXRhKTtcclxuICAgICR1bC5maW5kKCdsaScpLmVxKGluZGV4KS5hZGRDbGFzcygnYWN0aXZlJyk7XHJcbiAgICBiaW5kRXZlbnQoKTtcclxuICAgIGF1ZGlvID0gbmV3IHBsYXllci5BdWRpb01hbmFnZXIoKTtcclxuICAgIGF1ZGlvLmdldEF1ZGlvKHNvbmdMaXN0W2luZGV4XS5hdWRpbyk7XHJcbiAgICBwbGF5ZXIucHJvZ3Jlc3MucmVuZGVyRW5kVGltZShzb25nTGlzdFtpbmRleF0uZHVyYXRpb24pO1xyXG59XHJcbmdldERhdGEoJy4uL3NvdXJjZS9kYXRhLmpzb24nKTsiLCIvL+i/memHjOaOp+WItuaSreaUvuWIl+ihqCIsIihmdW5jdGlvbigkICwgcm9vdCl7XHJcbiAgICB2YXIgc3VyYXRpb25UaW1lO1xyXG4gICAgdmFyICRub3cgPSAkKCcubm93LXRpbWUnKS5lcSgwKTtcclxuICAgIHZhciAkdG9wID0gJCgnLnByby10b3AnKS5lcSgwKTtcclxuICAgIHZhciAkYnRuID0gJCgnLnByby1idG4nKS5lcSgwKTtcclxuICAgIHZhciBsID0gJCgnLnByby1ib3R0b20nKS53aWR0aCgpO1xyXG4gICAgdmFyICRkID0gJChkb2N1bWVudCk7XHJcbiAgICB2YXIgbW92ZVBybztcclxuICAgIGZ1bmN0aW9uIHRyYW5zVGltZSh0aW1lKSB7XHJcbiAgICAgICAgdmFyIG1pbiA9IDAgfCB0aW1lIC8gNjA7XHJcbiAgICAgICAgdmFyIHNlYyA9IDAgfCB0aW1lICUgNjA7XHJcbiAgICAgICAgbWluID0gbWluIDwgMTAgPyAnMCcgKyBtaW4gOiBtaW47XHJcbiAgICAgICAgc2VjID0gc2VjIDwgMTAgPyAnMCcgKyBzZWMgOiBzZWM7XHJcbiAgICAgICAgcmV0dXJuICBtaW4gKyAnOicgKyBzZWM7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiByZW5kZXJFbmRUaW1lKGluZm8pe1xyXG4gICAgICAgIGR1cmF0aW9uVGltZSA9IGluZm87XHJcbiAgICAgICAgJCgnLmVuZC10aW1lJykuaHRtbCh0cmFuc1RpbWUoZHVyYXRpb25UaW1lKSk7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiByZW5kZXJQcm8oY3VyVGltZSl7XHJcbiAgICAgICAgdmFyIHBlcmNlbnQgPSBjdXJUaW1lL2R1cmF0aW9uVGltZTtcclxuICAgICAgICBwZXJjZW50ID0gcGVyY2VudCA+PSAxID8gMSA6IHBlcmNlbnQ7XHJcbiAgICAgICAgJG5vdy5odG1sKHRyYW5zVGltZShjdXJUaW1lKSk7XHJcbiAgICAgICAgJHRvcC5jc3MoJ3RyYW5zZm9ybScgLCAndHJhbnNsYXRlKCcgKyAoKHBlcmNlbnQgLSAxKSAqIDEwMCkgKyclICwgLTUwJSknICk7XHJcbiAgICAgICAgJGJ0bi5jc3MoJ3RyYW5zZm9ybScgLCAndHJhbnNsYXRlKCcgKyAoKGwgLSA4KSAqIHBlcmNlbnQgKSArICdweCwgLTUwJSknKTtcclxuICAgICAgICByZXR1cm4gY3VyVGltZTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIHVwZGF0YSgpe1xyXG4gICAgICAgIGF1ZGlvLmF1ZGlvLmVuZGVkID09IHRydWUgPyBjaGFuZ2VNdXNpYygxKSA6IHVuZGVmaW5lZDsvL+S4gOabsuaSreaUvuWujOavleW8gOWni+S4i+S4gOabslxyXG4gICAgICAgIHZhciBhID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHJlbmRlclBybyhhdWRpby5jdXJUaW1lKCkpO1xyXG4gICAgICAgICAgICBpZiAoZmxhZykge1xyXG4gICAgICAgICAgICAgICAgdXBkYXRhKCk7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUoYSlcclxuICAgICAgICAgICAgfSAgIFxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBkcmFnUHJvKCl7XHJcbiAgICAgICAgJGJ0bi5vbigndG91Y2hzdGFydCcgLCBmdW5jdGlvbihlKXtcclxuICAgICAgICAgICAgdmFyIHgxID0gZS50b3VjaGVzWzBdLmNsaWVudFg7XHJcbiAgICAgICAgICAgIHZhciBsZWZ0ID0gJGJ0bi5wb3NpdGlvbigpLmxlZnQ7XHJcbiAgICAgICAgICAgIHZhciBwZXJjZW50O1xyXG4gICAgICAgICAgICB2YXIgcGxheWluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICBpZiAoYXVkaW8uc3RhdHVzID09ICdwbGF5Jykge1xyXG4gICAgICAgICAgICAgICAgcGxheWluZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBhdWRpby5wYXVzZSgpO1xyXG4gICAgICAgICAgICAgICAgZmxhZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICRkLm9uKCd0b3VjaG1vdmUnICwgZnVuY3Rpb24gbW92ZVBybyhlKXtcclxuICAgICAgICAgICAgICAgIHZhciB4MiA9IGUudG91Y2hlc1swXS5jbGllbnRYO1xyXG4gICAgICAgICAgICAgICAgdmFyIGR4ID0geDIgLSB4MTtcclxuICAgICAgICAgICAgICAgIHBlcmNlbnQgPSAobGVmdCArIGR4KSAvIGw7XHJcbiAgICAgICAgICAgICAgICBwZXJjZW50ID0gcGVyY2VudCA+IDEgPyAxIDogcGVyY2VudDtcclxuICAgICAgICAgICAgICAgIHBlcmNlbnQgPSBwZXJjZW50IDwgMCA/IDAgOiBwZXJjZW50O1xyXG4gICAgICAgICAgICAgICAgcmVuZGVyUHJvKHBlcmNlbnQgKiBkdXJhdGlvblRpbWUpO1xyXG4gICAgICAgICAgICB9KS5vbmUoJ3RvdWNoZW5kJyAsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgICAgICAgICAgYXVkaW8uY3VyVGltZShwZXJjZW50ICogZHVyYXRpb25UaW1lKTtcclxuICAgICAgICAgICAgICAgIGlmIChwbGF5aW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmxhZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyLnByb2dyZXNzLnVwZGF0YSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGF1ZGlvLnBsYXkoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICRkLm9mZigndG91Y2htb3ZlJyAsIG1vdmVQcm8pO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcbiAgICBkcmFnUHJvKCk7XHJcbiAgICBcclxuICAgIHJvb3QucHJvZ3Jlc3MgPSB7XHJcbiAgICAgICAgcmVuZGVyRW5kVGltZSA6IHJlbmRlckVuZFRpbWUsXHJcbiAgICAgICAgdXBkYXRhIDogdXBkYXRhXHJcbiAgICB9XHJcbn0pKHdpbmRvdy5aZXB0byAsIHdpbmRvdy5wbGF5ZXIgfHwgKHdpbmRvdy5wbGF5ZXIgPSB7fSkpIiwiLy/muLLmn5PnlYzpnaJcclxuOyhmdW5jdGlvbiAoJCwgcm9vdCkge1xyXG4gICAgZnVuY3Rpb24gcmVuZGVySW5mbyhpbmZvKSB7XHJcbiAgICAgICAgdmFyIGh0bWwgPSAnPGgyIGNsYXNzPVwic29uZ1wiPicgKyBpbmZvLnNvbmcgKyAnPC9oMj5cXFxyXG4gICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzID0gXCJzaW5nZXJcIj4nICsgaW5mby5zaW5nZXIgKyAnPC9wPlxcXHJcbiAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3MgPSBcImFsYnVtXCI+JyArIGluZm8uYWxidW0gKyAnPC9wPic7XHJcbiAgICAgICAgJCgnLmluZm8nKS5odG1sKGh0bWwpO1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHJlbmRlckltZyhpbmZvKXtcclxuICAgICAgICB2YXIgaW1nID0gbmV3IEltYWdlKCk7XHJcbiAgICAgICAgaW1nLnNyYyA9IGluZm87XHJcbiAgICAgICAgaW1nLm9ubG9hZCA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHJvb3QuYmx1ckltZyhpbWcgLCAkKCcud3JhcHBlcicpKTtcclxuICAgICAgICAgICAgJCgnLnNpbmdlci1waWMnKS5odG1sKGltZyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gcmVuZGVySXNMaWtlKGluZm8pe1xyXG4gICAgICAgIGlmIChpbmZvKSB7XHJcbiAgICAgICAgICAgICQoJy5rZWVwJykucmVtb3ZlQ2xhc3MoJ3VubGlrZScpLmFkZENsYXNzKCdsaWtlJylcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgJCgnLmtlZXAnKS5yZW1vdmVDbGFzcygnbGlrZScpLmFkZENsYXNzKCd1bmxpa2UnKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIHJlbmRlclNvbmdMaXN0KGRhdGEpe1xyXG4gICAgICAgIHZhciAkc29uZ0wgPSAkKCcuc29uZy1saXN0Jyk7XHJcbiAgICAgICAgdmFyIGQgPSBkYXRhO1xyXG4gICAgICAgICRzb25nTC5maW5kKCcudG9wIC5sZW4nKS5odG1sKCcoJyArIGQubGVuZ3RoICsgJ+mmliknKTtcclxuICAgICAgICBkLmZvckVhY2goZnVuY3Rpb24oZWxlICwgaW5kZXgpIHtcclxuICAgICAgICAgICAgJHNvbmdMLmZpbmQoJy5saXN0LWNvbnRlbnQgdWwnKS5hcHBlbmQoJ1xcXHJcbiAgICAgICAgICAgIDxsaT48c3BhbiBjbGFzcz1cInNvbmdcIj4nICtlbGUuc29uZyArICcgPC9zcGFuPiA8c3BhbiBjbGFzcz1cInNpbmdlclwiPiAtICcgKyBlbGUuc2luZ2VyICsgJzwvc3Bhbj48L2xpPlxcXHJcbiAgICAgICAgICAgICcpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgXHJcbiAgICB9XHJcblxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXQoZGF0YSkge1xyXG4gICAgICAgIHJlbmRlckluZm8oZGF0YSk7XHJcbiAgICAgICAgcmVuZGVySW1nKGRhdGEuaW1hZ2UpO1xyXG4gICAgICAgIHJlbmRlcklzTGlrZShkYXRhLmlzTGlrZSlcclxuICAgIH1cclxuICAgIHJvb3QucmVuZGVyID0gaW5pdDtcclxuICAgIHJvb3QucmVuZGVyTGlzdCA9IHJlbmRlclNvbmdMaXN0O1xyXG59KSh3aW5kb3cuWmVwdG8gLCB3aW5kb3cucGxheWVyIHx8ICh3aW5kb3cucGxheWVyID0ge30pKSJdfQ==
