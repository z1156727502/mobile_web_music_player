;(function($ ,root){
    function audioControl(){
        this.audio = new Audio();
        this.status = 'pause';
    }
    audioControl.prototype = {
        play :function(){
            this.audio.play();
            this.status = 'play';
        },
        pause :function(){
            this.audio.pause();
            this.status = 'pause';
        },
        // last :function(){},
        // next :function(){},
        getAudio :function(src){
            this.audio.src = src;
            this.audio.loade;
        }
    }
    root.AudioControl = audioControl;
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

(function($ , root){
    function transTime(time) {
        var min = 0 | time / 60;//////////待取整
        var sec = time % 60;
        min < 10 ? '0' + min : min;
        sec < 10 ? '0' + sec : sec;
        return  min + ':' + sec;
    }
    function renderEndTime(durationTime){
        $('.end-time').html(transTime(durationTime));
    }
    function playingPro(curTime){/////////传值方案确认
        $('.now-time').html(transTime(curTime));
        $('.pro-top').css('transform' , 'translate(' + (percent - 1) +' , -50%)' );
        $('pro-btn').css('transform' , 'translate(' + percent + ', -50%)');

    }
    root.progress = {
        renderEndTime : renderEndTime,
        playingPro : playingPro
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF1ZGlvQ29udHJvbC5qcyIsImdhdXNzQmx1ci5qcyIsImluZGV4LmpzIiwicHJvZ3Jlc3MuanMiLCJyZW5kZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyI7KGZ1bmN0aW9uKCQgLHJvb3Qpe1xyXG4gICAgZnVuY3Rpb24gYXVkaW9Db250cm9sKCl7XHJcbiAgICAgICAgdGhpcy5hdWRpbyA9IG5ldyBBdWRpbygpO1xyXG4gICAgICAgIHRoaXMuc3RhdHVzID0gJ3BhdXNlJztcclxuICAgIH1cclxuICAgIGF1ZGlvQ29udHJvbC5wcm90b3R5cGUgPSB7XHJcbiAgICAgICAgcGxheSA6ZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdGhpcy5hdWRpby5wbGF5KCk7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhdHVzID0gJ3BsYXknO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcGF1c2UgOmZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHRoaXMuYXVkaW8ucGF1c2UoKTtcclxuICAgICAgICAgICAgdGhpcy5zdGF0dXMgPSAncGF1c2UnO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8gbGFzdCA6ZnVuY3Rpb24oKXt9LFxyXG4gICAgICAgIC8vIG5leHQgOmZ1bmN0aW9uKCl7fSxcclxuICAgICAgICBnZXRBdWRpbyA6ZnVuY3Rpb24oc3JjKXtcclxuICAgICAgICAgICAgdGhpcy5hdWRpby5zcmMgPSBzcmM7XHJcbiAgICAgICAgICAgIHRoaXMuYXVkaW8ubG9hZGU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcm9vdC5BdWRpb0NvbnRyb2wgPSBhdWRpb0NvbnRyb2w7XHJcbn0pKHdpbmRvdy5aZXB0byAsIHdpbmRvdy5wbGF5ZXIgIHx8ICh3aW5kb3cucGxheWVyID0ge30pKSIsIi8qIHJlcXVpcmVzOlxyXG56ZXB0by5taW4uanNcclxuYmx1ckltZyhpbWcgLCAkZWxlKTtcclxuKi9cclxuOyhmdW5jdGlvbiAoJCwgcm9vdCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgXHJcbiAgICBmdW5jdGlvbiBnYXVzc0JsdXIoaW1nRGF0YSkge1xyXG4gICAgICAgIHZhciBwaXhlcyA9IGltZ0RhdGEuZGF0YTtcclxuICAgICAgICB2YXIgd2lkdGggPSBpbWdEYXRhLndpZHRoO1xyXG4gICAgICAgIHZhciBoZWlnaHQgPSBpbWdEYXRhLmhlaWdodDtcclxuICAgICAgICB2YXIgZ2F1c3NNYXRyaXggPSBbXSxcclxuICAgICAgICAgICAgZ2F1c3NTdW0gPSAwLFxyXG4gICAgICAgICAgICB4LCB5LFxyXG4gICAgICAgICAgICByLCBnLCBiLCBhLFxyXG4gICAgICAgICAgICBpLCBqLCBrLCBsZW47XHJcblxyXG4gICAgICAgIHZhciByYWRpdXMgPSAxMDtcclxuICAgICAgICB2YXIgc2lnbWEgPSA1O1xyXG5cclxuICAgICAgICBhID0gMSAvIChNYXRoLnNxcnQoMiAqIE1hdGguUEkpICogc2lnbWEpO1xyXG4gICAgICAgIGIgPSAtMSAvICgyICogc2lnbWEgKiBzaWdtYSk7XHJcbiAgICAgICAgLy/nlJ/miJDpq5jmlq/nn6npmLVcclxuICAgICAgICBmb3IgKGkgPSAwLCB4ID0gLXJhZGl1czsgeCA8PSByYWRpdXM7IHgrKywgaSsrKSB7XHJcbiAgICAgICAgICAgIGcgPSBhICogTWF0aC5leHAoYiAqIHggKiB4KTtcclxuICAgICAgICAgICAgZ2F1c3NNYXRyaXhbaV0gPSBnO1xyXG4gICAgICAgICAgICBnYXVzc1N1bSArPSBnO1xyXG5cclxuICAgICAgICB9XHJcbiAgICAgICAgLy/lvZLkuIDljJYsIOS/neivgemrmOaWr+efqemYteeahOWAvOWcqFswLDFd5LmL6Ze0XHJcbiAgICAgICAgZm9yIChpID0gMCwgbGVuID0gZ2F1c3NNYXRyaXgubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgICAgZ2F1c3NNYXRyaXhbaV0gLz0gZ2F1c3NTdW07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8veCDmlrnlkJHkuIDnu7Tpq5jmlq/ov5DnrpdcclxuICAgICAgICBmb3IgKHkgPSAwOyB5IDwgaGVpZ2h0OyB5KyspIHtcclxuICAgICAgICAgICAgZm9yICh4ID0gMDsgeCA8IHdpZHRoOyB4KyspIHtcclxuICAgICAgICAgICAgICAgIHIgPSBnID0gYiA9IGEgPSAwO1xyXG4gICAgICAgICAgICAgICAgZ2F1c3NTdW0gPSAwO1xyXG4gICAgICAgICAgICAgICAgZm9yIChqID0gLXJhZGl1czsgaiA8PSByYWRpdXM7IGorKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGsgPSB4ICsgajtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoayA+PSAwICYmIGsgPCB3aWR0aCkgey8v56Gu5L+dIGsg5rKh6LaF5Ye6IHgg55qE6IyD5Zu0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vcixnLGIsYSDlm5vkuKrkuIDnu4RcclxuICAgICAgICAgICAgICAgICAgICAgICAgaSA9ICh5ICogd2lkdGggKyBrKSAqIDQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHIgKz0gcGl4ZXNbaV0gKiBnYXVzc01hdHJpeFtqICsgcmFkaXVzXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZyArPSBwaXhlc1tpICsgMV0gKiBnYXVzc01hdHJpeFtqICsgcmFkaXVzXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYiArPSBwaXhlc1tpICsgMl0gKiBnYXVzc01hdHJpeFtqICsgcmFkaXVzXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYSArPSBwaXhlc1tpICsgM10gKiBnYXVzc01hdHJpeFtqXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ2F1c3NTdW0gKz0gZ2F1c3NNYXRyaXhbaiArIHJhZGl1c107XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaSA9ICh5ICogd2lkdGggKyB4KSAqIDQ7XHJcbiAgICAgICAgICAgICAgICAvLyDpmaTku6UgZ2F1c3NTdW0g5piv5Li65LqG5raI6Zmk5aSE5LqO6L6557yY55qE5YOP57SgLCDpq5jmlq/ov5DnrpfkuI3otrPnmoTpl67pophcclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGdhdXNzU3VtKVxyXG4gICAgICAgICAgICAgICAgcGl4ZXNbaV0gPSByIC8gZ2F1c3NTdW07XHJcbiAgICAgICAgICAgICAgICBwaXhlc1tpICsgMV0gPSBnIC8gZ2F1c3NTdW07XHJcbiAgICAgICAgICAgICAgICBwaXhlc1tpICsgMl0gPSBiIC8gZ2F1c3NTdW07XHJcbiAgICAgICAgICAgICAgICAvLyBwaXhlc1tpICsgM10gPSBhIDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvL3kg5pa55ZCR5LiA57u06auY5pav6L+Q566XXHJcbiAgICAgICAgZm9yICh4ID0gMDsgeCA8IHdpZHRoOyB4KyspIHtcclxuICAgICAgICAgICAgZm9yICh5ID0gMDsgeSA8IGhlaWdodDsgeSsrKSB7XHJcbiAgICAgICAgICAgICAgICByID0gZyA9IGIgPSBhID0gMDtcclxuICAgICAgICAgICAgICAgIGdhdXNzU3VtID0gMDtcclxuICAgICAgICAgICAgICAgIGZvciAoaiA9IC1yYWRpdXM7IGogPD0gcmFkaXVzOyBqKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBrID0geSArIGo7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGsgPj0gMCAmJiBrIDwgaGVpZ2h0KSB7Ly/noa7kv50gayDmsqHotoXlh7ogeSDnmoTojIPlm7RcclxuICAgICAgICAgICAgICAgICAgICAgICAgaSA9IChrICogd2lkdGggKyB4KSAqIDQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHIgKz0gcGl4ZXNbaV0gKiBnYXVzc01hdHJpeFtqICsgcmFkaXVzXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZyArPSBwaXhlc1tpICsgMV0gKiBnYXVzc01hdHJpeFtqICsgcmFkaXVzXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYiArPSBwaXhlc1tpICsgMl0gKiBnYXVzc01hdHJpeFtqICsgcmFkaXVzXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYSArPSBwaXhlc1tpICsgM10gKiBnYXVzc01hdHJpeFtqXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ2F1c3NTdW0gKz0gZ2F1c3NNYXRyaXhbaiArIHJhZGl1c107XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaSA9ICh5ICogd2lkdGggKyB4KSAqIDQ7XHJcbiAgICAgICAgICAgICAgICBwaXhlc1tpXSA9IHIgLyBnYXVzc1N1bTtcclxuICAgICAgICAgICAgICAgIHBpeGVzW2kgKyAxXSA9IGcgLyBnYXVzc1N1bTtcclxuICAgICAgICAgICAgICAgIHBpeGVzW2kgKyAyXSA9IGIgLyBnYXVzc1N1bTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvL2VuZFxyXG4gICAgICAgIHJldHVybiBpbWdEYXRhO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIOaooeeziuWbvueJh1xyXG4gICAgZnVuY3Rpb24gYmx1ckltZyhpbWcsIGVsZSkge1xyXG5cclxuICAgICAgICB2YXIgdyA9IGltZy53aWR0aCxcclxuICAgICAgICAgICAgaCA9IGltZy5oZWlnaHQsXHJcbiAgICAgICAgICAgIGNhbnZhc1cgPSA1MCxcclxuICAgICAgICAgICAgY2FudmFzSCA9IDUwO1xyXG5cclxuICAgICAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyksXHJcbiAgICAgICAgICAgIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG5cclxuICAgICAgICBjYW52YXMud2lkdGggPSBjYW52YXNXO1xyXG4gICAgICAgIGNhbnZhcy5oZWlnaHQgPSBjYW52YXNIO1xyXG5cclxuICAgICAgICBjdHguZHJhd0ltYWdlKGltZywgMCwgMCwgdywgaCwgMCwgMCwgY2FudmFzVywgY2FudmFzSCk7XHJcblxyXG4gICAgICAgIHZhciBwaXhlbCA9IGN0eC5nZXRJbWFnZURhdGEoMCwgMCwgY2FudmFzSCwgY2FudmFzSCk7XHJcblxyXG4gICAgICAgIGdhdXNzQmx1cihwaXhlbCk7XHJcblxyXG4gICAgICAgIGN0eC5wdXRJbWFnZURhdGEocGl4ZWwsIDAsIDApO1xyXG5cclxuICAgICAgICB2YXIgaW1hZ2VEYXRhID0gY2FudmFzLnRvRGF0YVVSTCgpO1xyXG5cclxuICAgICAgICBlbGUuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnICsgaW1hZ2VEYXRhICsgJyknKTtcclxuICAgIH1cclxuXHJcbiAgICByb290LmJsdXJJbWcgPSBibHVySW1nO1xyXG5cclxufSkod2luZG93LlplcHRvLCB3aW5kb3cucGxheWVyIHx8ICh3aW5kb3cucGxheWVyID0ge30pKTtcclxuXHJcbiIsIi8vIHJlcXVpcmVcclxudmFyIGluZGV4ID0gMDtcclxudmFyIHNvbmdMaXN0O1xyXG52YXIgYXVkaW87XHJcbmZ1bmN0aW9uIGNoYW5nZU11c2ljKGYpey8vMeS4i+S4gOabsu+8my0x5LiK5LiA5puy77ybMOWPr+S7peWunueOsOWKoOi9veaSreaUvuW9k+WJjeabsuebrlxyXG4gICAgaW5kZXggPSAoaW5kZXggKyBmICsgc29uZ0xpc3QubGVuZ3RoKSAlIHNvbmdMaXN0Lmxlbmd0aDtcclxuICAgIHBsYXllci5yZW5kZXIoc29uZ0xpc3RbaW5kZXhdKTtcclxuICAgIGF1ZGlvLmdldEF1ZGlvKHNvbmdMaXN0W2luZGV4XS5hdWRpbyk7XHJcbiAgICAkKCcucGxheS1idG4nKS5yZW1vdmVDbGFzcygncGxheScpLmFkZENsYXNzKCdwYXVzZScpO1xyXG4gICAgcGxheWVyLnByb2dyZXNzLnJlbmRlckVuZFRpbWUoc29uZ0xpc3RbaW5kZXhdLmR1cmF0aW9uKTtcclxuICAgIGF1ZGlvLnBsYXkoKTtcclxuICAgIHBsYXllci5wcm9ncmVzcy5wbGF5aW5nUHJvKCk7Ly8vLy8vLy8vL+abtOaWsOi/m+W6puadoVxyXG59O1xyXG5mdW5jdGlvbiBiaW5kRXZlbnQoKSB7XHJcbiAgICAkKCcuY29udHJvbC1idG4nKS5vbigndGFwJyAsICcubGFzdCcgLCBmdW5jdGlvbigpe1xyXG4gICAgICAgIGNoYW5nZU11c2ljKDEpO1xyXG4gICAgfSlcclxuICAgIC5vbigndGFwJyAsICcubmV4dCcgLCBmdW5jdGlvbigpe1xyXG4gICAgICAgIGNoYW5nZU11c2ljKC0xKTtcclxuICAgIH0pXHJcbiAgICAub24oJ3RhcCcgLCAnLnBsYXktYnRuJyAsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgaWYgKGF1ZGlvLnN0YXR1cyA9PSAncGF1c2UnKSB7XHJcbiAgICAgICAgICAgIGF1ZGlvLnBsYXkoKTtcclxuICAgICAgICAgICAgJCgnLnBsYXktYnRuJykucmVtb3ZlQ2xhc3MoJ3BsYXknKS5hZGRDbGFzcygncGF1c2UnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBhdWRpby5wYXVzZSgpO1xyXG4gICAgICAgICAgICAkKCcucGxheS1idG4nKS5yZW1vdmVDbGFzcygncGF1c2UnKS5hZGRDbGFzcygncGxheScpO1xyXG4gICAgICAgIH1cclxuICAgIH0pXHJcbn1cclxuZnVuY3Rpb24gZ2V0RGF0YSh1cmwpIHtcclxuICAgICQuYWpheCh7XHJcbiAgICAgICAgdHlwZTogJ0dFVCcsXHJcbiAgICAgICAgdXJsOiB1cmwsXHJcbiAgICAgICAgLy8gZGF0YTogJycsXHJcbiAgICAgICAgc3VjY2VzcyA6IG91dERhdGEsXHJcbiAgICAgICAgZXJyb3IgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGFsZXJ0KCfnvZHnu5zplJnor6/vvIzor7fliLfmlrDpobXpnaLmiJbmo4Dmn6XnvZHnu5zov57mjqXjgIInKTtcclxuICAgICAgICB9XHJcbiAgICB9KVxyXG59XHJcbmZ1bmN0aW9uIG91dERhdGEoZGF0YSl7XHJcbiAgICBzb25nTGlzdCA9IGRhdGE7XHJcbiAgICBwbGF5ZXIucmVuZGVyKGRhdGFbaW5kZXhdKTtcclxuICAgIGJpbmRFdmVudCgpO1xyXG4gICAgYXVkaW8gPSBuZXcgcGxheWVyLkF1ZGlvQ29udHJvbCgpO1xyXG4gICAgYXVkaW8uZ2V0QXVkaW8oc29uZ0xpc3RbaW5kZXhdLmF1ZGlvKTtcclxuICAgIHBsYXllci5wcm9ncmVzcy5yZW5kZXJFbmRUaW1lKHNvbmdMaXN0W2luZGV4XS5kdXJhdGlvbik7XHJcbn1cclxuZ2V0RGF0YSgnLi4vc291cmNlL2RhdGEuanNvbicpO1xyXG4iLCIoZnVuY3Rpb24oJCAsIHJvb3Qpe1xyXG4gICAgZnVuY3Rpb24gdHJhbnNUaW1lKHRpbWUpIHtcclxuICAgICAgICB2YXIgbWluID0gMCB8IHRpbWUgLyA2MDsvLy8vLy8vLy8v5b6F5Y+W5pW0XHJcbiAgICAgICAgdmFyIHNlYyA9IHRpbWUgJSA2MDtcclxuICAgICAgICBtaW4gPCAxMCA/ICcwJyArIG1pbiA6IG1pbjtcclxuICAgICAgICBzZWMgPCAxMCA/ICcwJyArIHNlYyA6IHNlYztcclxuICAgICAgICByZXR1cm4gIG1pbiArICc6JyArIHNlYztcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIHJlbmRlckVuZFRpbWUoZHVyYXRpb25UaW1lKXtcclxuICAgICAgICAkKCcuZW5kLXRpbWUnKS5odG1sKHRyYW5zVGltZShkdXJhdGlvblRpbWUpKTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIHBsYXlpbmdQcm8oY3VyVGltZSl7Ly8vLy8vLy8v5Lyg5YC85pa55qGI56Gu6K6kXHJcbiAgICAgICAgJCgnLm5vdy10aW1lJykuaHRtbCh0cmFuc1RpbWUoY3VyVGltZSkpO1xyXG4gICAgICAgICQoJy5wcm8tdG9wJykuY3NzKCd0cmFuc2Zvcm0nICwgJ3RyYW5zbGF0ZSgnICsgKHBlcmNlbnQgLSAxKSArJyAsIC01MCUpJyApO1xyXG4gICAgICAgICQoJ3Byby1idG4nKS5jc3MoJ3RyYW5zZm9ybScgLCAndHJhbnNsYXRlKCcgKyBwZXJjZW50ICsgJywgLTUwJSknKTtcclxuXHJcbiAgICB9XHJcbiAgICByb290LnByb2dyZXNzID0ge1xyXG4gICAgICAgIHJlbmRlckVuZFRpbWUgOiByZW5kZXJFbmRUaW1lLFxyXG4gICAgICAgIHBsYXlpbmdQcm8gOiBwbGF5aW5nUHJvXHJcbiAgICB9XHJcbn0pKHdpbmRvdy5aZXB0byAsIHdpbmRvdy5wbGF5ZXIgfHwgKHdpbmRvdy5wbGF5ZXIgPSB7fSkpIiwiLy/muLLmn5PnlYzpnaJcclxuOyhmdW5jdGlvbiAoJCwgcm9vdCkge1xyXG4gICAgZnVuY3Rpb24gcmVuZGVySW5mbyhpbmZvKSB7XHJcbiAgICAgICAgdmFyIGh0bWwgPSAnPGgyIGNsYXNzPVwic29uZ1wiPicgKyBpbmZvLnNvbmcgKyAnPC9oMj5cXFxyXG4gICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzID0gXCJzaW5nZXJcIj4nICsgaW5mby5zaW5nZXIgKyAnPC9wPlxcXHJcbiAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3MgPSBcImFsYnVtXCI+JyArIGluZm8uYWxidW0gKyAnPC9wPic7XHJcbiAgICAgICAgJCgnLmluZm8nKS5odG1sKGh0bWwpO1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHJlbmRlckltZyhpbmZvKXtcclxuICAgICAgICB2YXIgaW1nID0gbmV3IEltYWdlKCk7XHJcbiAgICAgICAgaW1nLnNyYyA9IGluZm87XHJcbiAgICAgICAgaW1nLm9ubG9hZCA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHJvb3QuYmx1ckltZyhpbWcgLCAkKCcud3JhcHBlcicpKTtcclxuICAgICAgICAgICAgJCgnLnNpbmdlci1waWMnKS5odG1sKGltZyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gcmVuZGVySXNMaWtlKGluZm8pe1xyXG4gICAgICAgIGlmIChpbmZvKSB7XHJcbiAgICAgICAgICAgICQoJy5rZWVwJykucmVtb3ZlQ2xhc3MoJ3VubGlrZScpLmFkZENsYXNzKCdsaWtlJylcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgJCgnLmtlZXAnKS5yZW1vdmVDbGFzcygnbGlrZScpLmFkZENsYXNzKCd1bmxpa2UnKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdChkYXRhKSB7XHJcbiAgICAgICAgcmVuZGVySW5mbyhkYXRhKTtcclxuICAgICAgICByZW5kZXJJbWcoZGF0YS5pbWFnZSk7XHJcbiAgICAgICAgcmVuZGVySXNMaWtlKGRhdGEuaXNMaWtlKVxyXG4gICAgfVxyXG4gICAgcm9vdC5yZW5kZXIgPSBpbml0O1xyXG59KSh3aW5kb3cuWmVwdG8gLCB3aW5kb3cucGxheWVyIHx8ICh3aW5kb3cucGxheWVyID0ge30pKSJdfQ==
