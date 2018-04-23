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
function changeMusic(f) { //1下一曲；-1上一曲；0可以实现加载播放当前曲目
    index = (index + f + songList.length) % songList.length;
    player.render(songList[index]);
    audio.getAudio(songList[index].audio);
    $('.play-btn').removeClass('play').addClass('pause');
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


    function init(data) {
        renderInfo(data);
        renderImg(data.image);
        renderIsLike(data.isLike)
    }
    root.render = init;
})(window.Zepto , window.player || (window.player = {}))
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF1ZGlvTWFuYWdlci5qcyIsImdhdXNzQmx1ci5qcyIsImluZGV4LmpzIiwibGlzdC5qcyIsInByb2dyZXNzLmpzIiwicmVuZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0RBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiOyhmdW5jdGlvbigkICxyb290KXtcclxuICAgIGZ1bmN0aW9uIGF1ZGlvTWFuYWdlcigpe1xyXG4gICAgICAgIHRoaXMuYXVkaW8gPSBuZXcgQXVkaW8oKTtcclxuICAgICAgICB0aGlzLnN0YXR1cyA9ICdwYXVzZSc7XHJcbiAgICB9XHJcbiAgICBhdWRpb01hbmFnZXIucHJvdG90eXBlID0ge1xyXG4gICAgICAgIHBsYXkgOmZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHRoaXMuYXVkaW8ucGxheSgpO1xyXG4gICAgICAgICAgICB0aGlzLnN0YXR1cyA9ICdwbGF5JztcclxuICAgICAgICB9LFxyXG4gICAgICAgIHBhdXNlIDpmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICB0aGlzLmF1ZGlvLnBhdXNlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhdHVzID0gJ3BhdXNlJztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGN1clRpbWUgOiBmdW5jdGlvbihjdXIpe1xyXG4gICAgICAgICAgICBpZiAoY3VyKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmF1ZGlvLmN1cnJlbnRUaW1lID0gY3VyO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGN1cjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hdWRpby5jdXJyZW50VGltZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldEF1ZGlvIDpmdW5jdGlvbihzcmMpe1xyXG4gICAgICAgICAgICB0aGlzLmF1ZGlvLnNyYyA9IHNyYztcclxuICAgICAgICAgICAgdGhpcy5hdWRpby5sb2FkZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByb290LkF1ZGlvTWFuYWdlciA9IGF1ZGlvTWFuYWdlcjtcclxufSkod2luZG93LlplcHRvICwgd2luZG93LnBsYXllciAgfHwgKHdpbmRvdy5wbGF5ZXIgPSB7fSkpIiwiLyogcmVxdWlyZXM6XHJcbnplcHRvLm1pbi5qc1xyXG5ibHVySW1nKGltZyAsICRlbGUpO1xyXG4qL1xyXG47KGZ1bmN0aW9uICgkLCByb290KSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcbiAgICBcclxuICAgIGZ1bmN0aW9uIGdhdXNzQmx1cihpbWdEYXRhKSB7XHJcbiAgICAgICAgdmFyIHBpeGVzID0gaW1nRGF0YS5kYXRhO1xyXG4gICAgICAgIHZhciB3aWR0aCA9IGltZ0RhdGEud2lkdGg7XHJcbiAgICAgICAgdmFyIGhlaWdodCA9IGltZ0RhdGEuaGVpZ2h0O1xyXG4gICAgICAgIHZhciBnYXVzc01hdHJpeCA9IFtdLFxyXG4gICAgICAgICAgICBnYXVzc1N1bSA9IDAsXHJcbiAgICAgICAgICAgIHgsIHksXHJcbiAgICAgICAgICAgIHIsIGcsIGIsIGEsXHJcbiAgICAgICAgICAgIGksIGosIGssIGxlbjtcclxuXHJcbiAgICAgICAgdmFyIHJhZGl1cyA9IDEwO1xyXG4gICAgICAgIHZhciBzaWdtYSA9IDU7XHJcblxyXG4gICAgICAgIGEgPSAxIC8gKE1hdGguc3FydCgyICogTWF0aC5QSSkgKiBzaWdtYSk7XHJcbiAgICAgICAgYiA9IC0xIC8gKDIgKiBzaWdtYSAqIHNpZ21hKTtcclxuICAgICAgICAvL+eUn+aIkOmrmOaWr+efqemYtVxyXG4gICAgICAgIGZvciAoaSA9IDAsIHggPSAtcmFkaXVzOyB4IDw9IHJhZGl1czsgeCsrLCBpKyspIHtcclxuICAgICAgICAgICAgZyA9IGEgKiBNYXRoLmV4cChiICogeCAqIHgpO1xyXG4gICAgICAgICAgICBnYXVzc01hdHJpeFtpXSA9IGc7XHJcbiAgICAgICAgICAgIGdhdXNzU3VtICs9IGc7XHJcblxyXG4gICAgICAgIH1cclxuICAgICAgICAvL+W9kuS4gOWMliwg5L+d6K+B6auY5pav55+p6Zi155qE5YC85ZyoWzAsMV3kuYvpl7RcclxuICAgICAgICBmb3IgKGkgPSAwLCBsZW4gPSBnYXVzc01hdHJpeC5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICBnYXVzc01hdHJpeFtpXSAvPSBnYXVzc1N1bTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy94IOaWueWQkeS4gOe7tOmrmOaWr+i/kOeul1xyXG4gICAgICAgIGZvciAoeSA9IDA7IHkgPCBoZWlnaHQ7IHkrKykge1xyXG4gICAgICAgICAgICBmb3IgKHggPSAwOyB4IDwgd2lkdGg7IHgrKykge1xyXG4gICAgICAgICAgICAgICAgciA9IGcgPSBiID0gYSA9IDA7XHJcbiAgICAgICAgICAgICAgICBnYXVzc1N1bSA9IDA7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGogPSAtcmFkaXVzOyBqIDw9IHJhZGl1czsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgayA9IHggKyBqO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChrID49IDAgJiYgayA8IHdpZHRoKSB7Ly/noa7kv50gayDmsqHotoXlh7ogeCDnmoTojIPlm7RcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9yLGcsYixhIOWbm+S4quS4gOe7hFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpID0gKHkgKiB3aWR0aCArIGspICogNDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgciArPSBwaXhlc1tpXSAqIGdhdXNzTWF0cml4W2ogKyByYWRpdXNdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBnICs9IHBpeGVzW2kgKyAxXSAqIGdhdXNzTWF0cml4W2ogKyByYWRpdXNdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBiICs9IHBpeGVzW2kgKyAyXSAqIGdhdXNzTWF0cml4W2ogKyByYWRpdXNdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBhICs9IHBpeGVzW2kgKyAzXSAqIGdhdXNzTWF0cml4W2pdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBnYXVzc1N1bSArPSBnYXVzc01hdHJpeFtqICsgcmFkaXVzXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpID0gKHkgKiB3aWR0aCArIHgpICogNDtcclxuICAgICAgICAgICAgICAgIC8vIOmZpOS7pSBnYXVzc1N1bSDmmK/kuLrkuobmtojpmaTlpITkuo7ovrnnvJjnmoTlg4/ntKAsIOmrmOaWr+i/kOeul+S4jei2s+eahOmXrumimFxyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coZ2F1c3NTdW0pXHJcbiAgICAgICAgICAgICAgICBwaXhlc1tpXSA9IHIgLyBnYXVzc1N1bTtcclxuICAgICAgICAgICAgICAgIHBpeGVzW2kgKyAxXSA9IGcgLyBnYXVzc1N1bTtcclxuICAgICAgICAgICAgICAgIHBpeGVzW2kgKyAyXSA9IGIgLyBnYXVzc1N1bTtcclxuICAgICAgICAgICAgICAgIC8vIHBpeGVzW2kgKyAzXSA9IGEgO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8veSDmlrnlkJHkuIDnu7Tpq5jmlq/ov5DnrpdcclxuICAgICAgICBmb3IgKHggPSAwOyB4IDwgd2lkdGg7IHgrKykge1xyXG4gICAgICAgICAgICBmb3IgKHkgPSAwOyB5IDwgaGVpZ2h0OyB5KyspIHtcclxuICAgICAgICAgICAgICAgIHIgPSBnID0gYiA9IGEgPSAwO1xyXG4gICAgICAgICAgICAgICAgZ2F1c3NTdW0gPSAwO1xyXG4gICAgICAgICAgICAgICAgZm9yIChqID0gLXJhZGl1czsgaiA8PSByYWRpdXM7IGorKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGsgPSB5ICsgajtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoayA+PSAwICYmIGsgPCBoZWlnaHQpIHsvL+ehruS/nSBrIOayoei2heWHuiB5IOeahOiMg+WbtFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpID0gKGsgKiB3aWR0aCArIHgpICogNDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgciArPSBwaXhlc1tpXSAqIGdhdXNzTWF0cml4W2ogKyByYWRpdXNdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBnICs9IHBpeGVzW2kgKyAxXSAqIGdhdXNzTWF0cml4W2ogKyByYWRpdXNdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBiICs9IHBpeGVzW2kgKyAyXSAqIGdhdXNzTWF0cml4W2ogKyByYWRpdXNdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBhICs9IHBpeGVzW2kgKyAzXSAqIGdhdXNzTWF0cml4W2pdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBnYXVzc1N1bSArPSBnYXVzc01hdHJpeFtqICsgcmFkaXVzXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpID0gKHkgKiB3aWR0aCArIHgpICogNDtcclxuICAgICAgICAgICAgICAgIHBpeGVzW2ldID0gciAvIGdhdXNzU3VtO1xyXG4gICAgICAgICAgICAgICAgcGl4ZXNbaSArIDFdID0gZyAvIGdhdXNzU3VtO1xyXG4gICAgICAgICAgICAgICAgcGl4ZXNbaSArIDJdID0gYiAvIGdhdXNzU3VtO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vZW5kXHJcbiAgICAgICAgcmV0dXJuIGltZ0RhdGE7XHJcbiAgICB9XHJcblxyXG4gICAgLy8g5qih57OK5Zu+54mHXHJcbiAgICBmdW5jdGlvbiBibHVySW1nKGltZywgZWxlKSB7XHJcblxyXG4gICAgICAgIHZhciB3ID0gaW1nLndpZHRoLFxyXG4gICAgICAgICAgICBoID0gaW1nLmhlaWdodCxcclxuICAgICAgICAgICAgY2FudmFzVyA9IDUwLFxyXG4gICAgICAgICAgICBjYW52YXNIID0gNTA7XHJcblxyXG4gICAgICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKSxcclxuICAgICAgICAgICAgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcblxyXG4gICAgICAgIGNhbnZhcy53aWR0aCA9IGNhbnZhc1c7XHJcbiAgICAgICAgY2FudmFzLmhlaWdodCA9IGNhbnZhc0g7XHJcblxyXG4gICAgICAgIGN0eC5kcmF3SW1hZ2UoaW1nLCAwLCAwLCB3LCBoLCAwLCAwLCBjYW52YXNXLCBjYW52YXNIKTtcclxuXHJcbiAgICAgICAgdmFyIHBpeGVsID0gY3R4LmdldEltYWdlRGF0YSgwLCAwLCBjYW52YXNILCBjYW52YXNIKTtcclxuXHJcbiAgICAgICAgZ2F1c3NCbHVyKHBpeGVsKTtcclxuXHJcbiAgICAgICAgY3R4LnB1dEltYWdlRGF0YShwaXhlbCwgMCwgMCk7XHJcblxyXG4gICAgICAgIHZhciBpbWFnZURhdGEgPSBjYW52YXMudG9EYXRhVVJMKCk7XHJcblxyXG4gICAgICAgIGVsZS5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcgKyBpbWFnZURhdGEgKyAnKScpO1xyXG4gICAgfVxyXG5cclxuICAgIHJvb3QuYmx1ckltZyA9IGJsdXJJbWc7XHJcblxyXG59KSh3aW5kb3cuWmVwdG8sIHdpbmRvdy5wbGF5ZXIgfHwgKHdpbmRvdy5wbGF5ZXIgPSB7fSkpO1xyXG5cclxuIiwiLy8gcmVxdWlyZVxyXG52YXIgaW5kZXggPSAwO1xyXG52YXIgc29uZ0xpc3Q7XHJcbnZhciBhdWRpbztcclxudmFyIGZsYWcgPSBmYWxzZTsgLy90cnVl77ya6L+b5bqm5p2h5Yqo55S75byA5ZCvXHJcbmZ1bmN0aW9uIGNoYW5nZU11c2ljKGYpIHsgLy8x5LiL5LiA5puy77ybLTHkuIrkuIDmm7LvvJsw5Y+v5Lul5a6e546w5Yqg6L295pKt5pS+5b2T5YmN5puy55uuXHJcbiAgICBpbmRleCA9IChpbmRleCArIGYgKyBzb25nTGlzdC5sZW5ndGgpICUgc29uZ0xpc3QubGVuZ3RoO1xyXG4gICAgcGxheWVyLnJlbmRlcihzb25nTGlzdFtpbmRleF0pO1xyXG4gICAgYXVkaW8uZ2V0QXVkaW8oc29uZ0xpc3RbaW5kZXhdLmF1ZGlvKTtcclxuICAgICQoJy5wbGF5LWJ0bicpLnJlbW92ZUNsYXNzKCdwbGF5JykuYWRkQ2xhc3MoJ3BhdXNlJyk7XHJcbiAgICBwbGF5ZXIucHJvZ3Jlc3MucmVuZGVyRW5kVGltZShzb25nTGlzdFtpbmRleF0uZHVyYXRpb24pO1xyXG4gICAgYXVkaW8ucGxheSgpO1xyXG4gICAgaWYgKCFmbGFnKSB7IC8v6Iul6L+b5bqm5p2h5Yqo55S75pyq5byA5ZCv5YiZ5byA5ZCv5Yqo55S7XHJcbiAgICAgICAgZmxhZyA9IHRydWU7XHJcbiAgICAgICAgcGxheWVyLnByb2dyZXNzLnVwZGF0YSgpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZnVuY3Rpb24gYmluZEV2ZW50KCkge1xyXG4gICAgJCgnLmNvbnRyb2wtYnRuJykub24oJ3RhcCcsICcubGFzdCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBjaGFuZ2VNdXNpYygtMSk7XHJcbiAgICB9KVxyXG4gICAgLm9uKCd0YXAnLCAnLm5leHQnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgY2hhbmdlTXVzaWMoMSk7XHJcbiAgICB9KVxyXG4gICAgLm9uKCd0YXAnLCAnLnBsYXktYnRuJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmIChhdWRpby5zdGF0dXMgPT0gJ3BhdXNlJykgeyAvL3BhdXNlLXBsYXlcclxuICAgICAgICAgICAgYXVkaW8ucGxheSgpO1xyXG4gICAgICAgICAgICAkKCcucGxheS1idG4nKS5yZW1vdmVDbGFzcygncGxheScpLmFkZENsYXNzKCdwYXVzZScpO1xyXG4gICAgICAgICAgICBpZiAoIWZsYWcpIHtcclxuICAgICAgICAgICAgICAgIGZsYWcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgcGxheWVyLnByb2dyZXNzLnVwZGF0YSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHsgLy9wbGF5LXBhdXNlXHJcbiAgICAgICAgICAgIGF1ZGlvLnBhdXNlKCk7XHJcbiAgICAgICAgICAgIGZsYWcgPSBmYWxzZTsgLy/mmoLlgZzlkIzml7blgZzmraLov5vluqbmnaHliqjnlLtcclxuICAgICAgICAgICAgJCgnLnBsYXktYnRuJykucmVtb3ZlQ2xhc3MoJ3BhdXNlJykuYWRkQ2xhc3MoJ3BsYXknKTtcclxuICAgICAgICB9XHJcbiAgICB9KVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXREYXRhKHVybCkge1xyXG4gICAgJC5hamF4KHtcclxuICAgICAgICB0eXBlOiAnR0VUJyxcclxuICAgICAgICB1cmw6IHVybCxcclxuICAgICAgICAvLyBkYXRhOiAnJyxcclxuICAgICAgICBzdWNjZXNzOiBvdXREYXRhLFxyXG4gICAgICAgIGVycm9yOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGFsZXJ0KCfnvZHnu5zplJnor6/vvIzor7fliLfmlrDpobXpnaLmiJbmo4Dmn6XnvZHnu5zov57mjqXjgIInKTtcclxuICAgICAgICB9XHJcbiAgICB9KVxyXG59XHJcblxyXG5mdW5jdGlvbiBvdXREYXRhKGRhdGEpIHtcclxuICAgIHNvbmdMaXN0ID0gZGF0YTtcclxuICAgIHBsYXllci5yZW5kZXIoZGF0YVtpbmRleF0pO1xyXG4gICAgYmluZEV2ZW50KCk7XHJcbiAgICBhdWRpbyA9IG5ldyBwbGF5ZXIuQXVkaW9NYW5hZ2VyKCk7XHJcbiAgICBhdWRpby5nZXRBdWRpbyhzb25nTGlzdFtpbmRleF0uYXVkaW8pO1xyXG4gICAgcGxheWVyLnByb2dyZXNzLnJlbmRlckVuZFRpbWUoc29uZ0xpc3RbaW5kZXhdLmR1cmF0aW9uKTtcclxufVxyXG5nZXREYXRhKCcuLi9zb3VyY2UvZGF0YS5qc29uJyk7IiwiLy/ov5nph4zmjqfliLbmkq3mlL7liJfooagiLCIoZnVuY3Rpb24oJCAsIHJvb3Qpe1xyXG4gICAgdmFyIHN1cmF0aW9uVGltZTtcclxuICAgIHZhciAkbm93ID0gJCgnLm5vdy10aW1lJykuZXEoMCk7XHJcbiAgICB2YXIgJHRvcCA9ICQoJy5wcm8tdG9wJykuZXEoMCk7XHJcbiAgICB2YXIgJGJ0biA9ICQoJy5wcm8tYnRuJykuZXEoMCk7XHJcbiAgICB2YXIgbCA9ICQoJy5wcm8tYm90dG9tJykud2lkdGgoKTtcclxuICAgIHZhciAkZCA9ICQoZG9jdW1lbnQpO1xyXG4gICAgdmFyIG1vdmVQcm87XHJcbiAgICBmdW5jdGlvbiB0cmFuc1RpbWUodGltZSkge1xyXG4gICAgICAgIHZhciBtaW4gPSAwIHwgdGltZSAvIDYwO1xyXG4gICAgICAgIHZhciBzZWMgPSAwIHwgdGltZSAlIDYwO1xyXG4gICAgICAgIG1pbiA9IG1pbiA8IDEwID8gJzAnICsgbWluIDogbWluO1xyXG4gICAgICAgIHNlYyA9IHNlYyA8IDEwID8gJzAnICsgc2VjIDogc2VjO1xyXG4gICAgICAgIHJldHVybiAgbWluICsgJzonICsgc2VjO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gcmVuZGVyRW5kVGltZShpbmZvKXtcclxuICAgICAgICBkdXJhdGlvblRpbWUgPSBpbmZvO1xyXG4gICAgICAgICQoJy5lbmQtdGltZScpLmh0bWwodHJhbnNUaW1lKGR1cmF0aW9uVGltZSkpO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gcmVuZGVyUHJvKGN1clRpbWUpe1xyXG4gICAgICAgIHZhciBwZXJjZW50ID0gY3VyVGltZS9kdXJhdGlvblRpbWU7XHJcbiAgICAgICAgcGVyY2VudCA9IHBlcmNlbnQgPj0gMSA/IDEgOiBwZXJjZW50O1xyXG4gICAgICAgICRub3cuaHRtbCh0cmFuc1RpbWUoY3VyVGltZSkpO1xyXG4gICAgICAgICR0b3AuY3NzKCd0cmFuc2Zvcm0nICwgJ3RyYW5zbGF0ZSgnICsgKChwZXJjZW50IC0gMSkgKiAxMDApICsnJSAsIC01MCUpJyApO1xyXG4gICAgICAgICRidG4uY3NzKCd0cmFuc2Zvcm0nICwgJ3RyYW5zbGF0ZSgnICsgKChsIC0gOCkgKiBwZXJjZW50ICkgKyAncHgsIC01MCUpJyk7XHJcbiAgICAgICAgcmV0dXJuIGN1clRpbWU7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiB1cGRhdGEoKXtcclxuICAgICAgICBhdWRpby5hdWRpby5lbmRlZCA9PSB0cnVlID8gY2hhbmdlTXVzaWMoMSkgOiB1bmRlZmluZWQ7Ly/kuIDmm7Lmkq3mlL7lrozmr5XlvIDlp4vkuIvkuIDmm7JcclxuICAgICAgICB2YXIgYSA9IHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICByZW5kZXJQcm8oYXVkaW8uY3VyVGltZSgpKTtcclxuICAgICAgICAgICAgaWYgKGZsYWcpIHtcclxuICAgICAgICAgICAgICAgIHVwZGF0YSgpO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKGEpXHJcbiAgICAgICAgICAgIH0gICBcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gZHJhZ1Bybygpe1xyXG4gICAgICAgICRidG4ub24oJ3RvdWNoc3RhcnQnICwgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgICAgIHZhciB4MSA9IGUudG91Y2hlc1swXS5jbGllbnRYO1xyXG4gICAgICAgICAgICB2YXIgbGVmdCA9ICRidG4ucG9zaXRpb24oKS5sZWZ0O1xyXG4gICAgICAgICAgICB2YXIgcGVyY2VudDtcclxuICAgICAgICAgICAgdmFyIHBsYXlpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgaWYgKGF1ZGlvLnN0YXR1cyA9PSAncGxheScpIHtcclxuICAgICAgICAgICAgICAgIHBsYXlpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgYXVkaW8ucGF1c2UoKTtcclxuICAgICAgICAgICAgICAgIGZsYWcgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAkZC5vbigndG91Y2htb3ZlJyAsIGZ1bmN0aW9uIG1vdmVQcm8oZSl7XHJcbiAgICAgICAgICAgICAgICB2YXIgeDIgPSBlLnRvdWNoZXNbMF0uY2xpZW50WDtcclxuICAgICAgICAgICAgICAgIHZhciBkeCA9IHgyIC0geDE7XHJcbiAgICAgICAgICAgICAgICBwZXJjZW50ID0gKGxlZnQgKyBkeCkgLyBsO1xyXG4gICAgICAgICAgICAgICAgcGVyY2VudCA9IHBlcmNlbnQgPiAxID8gMSA6IHBlcmNlbnQ7XHJcbiAgICAgICAgICAgICAgICBwZXJjZW50ID0gcGVyY2VudCA8IDAgPyAwIDogcGVyY2VudDtcclxuICAgICAgICAgICAgICAgIHJlbmRlclBybyhwZXJjZW50ICogZHVyYXRpb25UaW1lKTtcclxuICAgICAgICAgICAgfSkub25lKCd0b3VjaGVuZCcgLCBmdW5jdGlvbihlKXtcclxuICAgICAgICAgICAgICAgIGF1ZGlvLmN1clRpbWUocGVyY2VudCAqIGR1cmF0aW9uVGltZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAocGxheWluZykge1xyXG4gICAgICAgICAgICAgICAgICAgIGZsYWcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHBsYXllci5wcm9ncmVzcy51cGRhdGEoKTtcclxuICAgICAgICAgICAgICAgICAgICBhdWRpby5wbGF5KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAkZC5vZmYoJ3RvdWNobW92ZScgLCBtb3ZlUHJvKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG4gICAgZHJhZ1BybygpO1xyXG4gICAgXHJcbiAgICByb290LnByb2dyZXNzID0ge1xyXG4gICAgICAgIHJlbmRlckVuZFRpbWUgOiByZW5kZXJFbmRUaW1lLFxyXG4gICAgICAgIHVwZGF0YSA6IHVwZGF0YVxyXG4gICAgfVxyXG59KSh3aW5kb3cuWmVwdG8gLCB3aW5kb3cucGxheWVyIHx8ICh3aW5kb3cucGxheWVyID0ge30pKSIsIi8v5riy5p+T55WM6Z2iXHJcbjsoZnVuY3Rpb24gKCQsIHJvb3QpIHtcclxuICAgIGZ1bmN0aW9uIHJlbmRlckluZm8oaW5mbykge1xyXG4gICAgICAgIHZhciBodG1sID0gJzxoMiBjbGFzcz1cInNvbmdcIj4nICsgaW5mby5zb25nICsgJzwvaDI+XFxcclxuICAgICAgICAgICAgICAgICAgICA8cCBjbGFzcyA9IFwic2luZ2VyXCI+JyArIGluZm8uc2luZ2VyICsgJzwvcD5cXFxyXG4gICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzID0gXCJhbGJ1bVwiPicgKyBpbmZvLmFsYnVtICsgJzwvcD4nO1xyXG4gICAgICAgICQoJy5pbmZvJykuaHRtbChodG1sKTtcclxuICAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiByZW5kZXJJbWcoaW5mbyl7XHJcbiAgICAgICAgdmFyIGltZyA9IG5ldyBJbWFnZSgpO1xyXG4gICAgICAgIGltZy5zcmMgPSBpbmZvO1xyXG4gICAgICAgIGltZy5vbmxvYWQgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICByb290LmJsdXJJbWcoaW1nICwgJCgnLndyYXBwZXInKSk7XHJcbiAgICAgICAgICAgICQoJy5zaW5nZXItcGljJykuaHRtbChpbWcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIHJlbmRlcklzTGlrZShpbmZvKXtcclxuICAgICAgICBpZiAoaW5mbykge1xyXG4gICAgICAgICAgICAkKCcua2VlcCcpLnJlbW92ZUNsYXNzKCd1bmxpa2UnKS5hZGRDbGFzcygnbGlrZScpXHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICQoJy5rZWVwJykucmVtb3ZlQ2xhc3MoJ2xpa2UnKS5hZGRDbGFzcygndW5saWtlJylcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXQoZGF0YSkge1xyXG4gICAgICAgIHJlbmRlckluZm8oZGF0YSk7XHJcbiAgICAgICAgcmVuZGVySW1nKGRhdGEuaW1hZ2UpO1xyXG4gICAgICAgIHJlbmRlcklzTGlrZShkYXRhLmlzTGlrZSlcclxuICAgIH1cclxuICAgIHJvb3QucmVuZGVyID0gaW5pdDtcclxufSkod2luZG93LlplcHRvICwgd2luZG93LnBsYXllciB8fCAod2luZG93LnBsYXllciA9IHt9KSkiXX0=
