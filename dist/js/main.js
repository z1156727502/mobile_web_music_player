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
})(window.Zepto , window.player || (window.player = {})) //通过window.player暴露入口函数
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF1ZGlvQ29udHJvbC5qcyIsImdhdXNzQmx1ci5qcyIsImluZGV4LmpzIiwicmVuZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiOyhmdW5jdGlvbigkICxyb290KXtcclxuICAgIGZ1bmN0aW9uIGF1ZGlvQ29udHJvbCgpe1xyXG4gICAgICAgIHRoaXMuYXVkaW8gPSBuZXcgQXVkaW8oKTtcclxuICAgICAgICB0aGlzLnN0YXR1cyA9ICdwYXVzZSc7XHJcbiAgICB9XHJcbiAgICBhdWRpb0NvbnRyb2wucHJvdG90eXBlID0ge1xyXG4gICAgICAgIHBsYXkgOmZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHRoaXMuYXVkaW8ucGxheSgpO1xyXG4gICAgICAgICAgICB0aGlzLnN0YXR1cyA9ICdwbGF5JztcclxuICAgICAgICB9LFxyXG4gICAgICAgIHBhdXNlIDpmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICB0aGlzLmF1ZGlvLnBhdXNlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhdHVzID0gJ3BhdXNlJztcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIGxhc3QgOmZ1bmN0aW9uKCl7fSxcclxuICAgICAgICAvLyBuZXh0IDpmdW5jdGlvbigpe30sXHJcbiAgICAgICAgZ2V0QXVkaW8gOmZ1bmN0aW9uKHNyYyl7XHJcbiAgICAgICAgICAgIHRoaXMuYXVkaW8uc3JjID0gc3JjO1xyXG4gICAgICAgICAgICB0aGlzLmF1ZGlvLmxvYWRlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJvb3QuQXVkaW9Db250cm9sID0gYXVkaW9Db250cm9sO1xyXG59KSh3aW5kb3cuWmVwdG8gLCB3aW5kb3cucGxheWVyICB8fCAod2luZG93LnBsYXllciA9IHt9KSkiLCIvKiByZXF1aXJlczpcclxuemVwdG8ubWluLmpzXHJcbmJsdXJJbWcoaW1nICwgJGVsZSk7XHJcbiovXHJcbjsoZnVuY3Rpb24gKCQsIHJvb3QpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuICAgIFxyXG4gICAgZnVuY3Rpb24gZ2F1c3NCbHVyKGltZ0RhdGEpIHtcclxuICAgICAgICB2YXIgcGl4ZXMgPSBpbWdEYXRhLmRhdGE7XHJcbiAgICAgICAgdmFyIHdpZHRoID0gaW1nRGF0YS53aWR0aDtcclxuICAgICAgICB2YXIgaGVpZ2h0ID0gaW1nRGF0YS5oZWlnaHQ7XHJcbiAgICAgICAgdmFyIGdhdXNzTWF0cml4ID0gW10sXHJcbiAgICAgICAgICAgIGdhdXNzU3VtID0gMCxcclxuICAgICAgICAgICAgeCwgeSxcclxuICAgICAgICAgICAgciwgZywgYiwgYSxcclxuICAgICAgICAgICAgaSwgaiwgaywgbGVuO1xyXG5cclxuICAgICAgICB2YXIgcmFkaXVzID0gMTA7XHJcbiAgICAgICAgdmFyIHNpZ21hID0gNTtcclxuXHJcbiAgICAgICAgYSA9IDEgLyAoTWF0aC5zcXJ0KDIgKiBNYXRoLlBJKSAqIHNpZ21hKTtcclxuICAgICAgICBiID0gLTEgLyAoMiAqIHNpZ21hICogc2lnbWEpO1xyXG4gICAgICAgIC8v55Sf5oiQ6auY5pav55+p6Zi1XHJcbiAgICAgICAgZm9yIChpID0gMCwgeCA9IC1yYWRpdXM7IHggPD0gcmFkaXVzOyB4KyssIGkrKykge1xyXG4gICAgICAgICAgICBnID0gYSAqIE1hdGguZXhwKGIgKiB4ICogeCk7XHJcbiAgICAgICAgICAgIGdhdXNzTWF0cml4W2ldID0gZztcclxuICAgICAgICAgICAgZ2F1c3NTdW0gKz0gZztcclxuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8v5b2S5LiA5YyWLCDkv53or4Hpq5jmlq/nn6npmLXnmoTlgLzlnKhbMCwxXeS5i+mXtFxyXG4gICAgICAgIGZvciAoaSA9IDAsIGxlbiA9IGdhdXNzTWF0cml4Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIGdhdXNzTWF0cml4W2ldIC89IGdhdXNzU3VtO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL3gg5pa55ZCR5LiA57u06auY5pav6L+Q566XXHJcbiAgICAgICAgZm9yICh5ID0gMDsgeSA8IGhlaWdodDsgeSsrKSB7XHJcbiAgICAgICAgICAgIGZvciAoeCA9IDA7IHggPCB3aWR0aDsgeCsrKSB7XHJcbiAgICAgICAgICAgICAgICByID0gZyA9IGIgPSBhID0gMDtcclxuICAgICAgICAgICAgICAgIGdhdXNzU3VtID0gMDtcclxuICAgICAgICAgICAgICAgIGZvciAoaiA9IC1yYWRpdXM7IGogPD0gcmFkaXVzOyBqKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBrID0geCArIGo7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGsgPj0gMCAmJiBrIDwgd2lkdGgpIHsvL+ehruS/nSBrIOayoei2heWHuiB4IOeahOiMg+WbtFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3IsZyxiLGEg5Zub5Liq5LiA57uEXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGkgPSAoeSAqIHdpZHRoICsgaykgKiA0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByICs9IHBpeGVzW2ldICogZ2F1c3NNYXRyaXhbaiArIHJhZGl1c107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGcgKz0gcGl4ZXNbaSArIDFdICogZ2F1c3NNYXRyaXhbaiArIHJhZGl1c107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGIgKz0gcGl4ZXNbaSArIDJdICogZ2F1c3NNYXRyaXhbaiArIHJhZGl1c107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGEgKz0gcGl4ZXNbaSArIDNdICogZ2F1c3NNYXRyaXhbal07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhdXNzU3VtICs9IGdhdXNzTWF0cml4W2ogKyByYWRpdXNdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGkgPSAoeSAqIHdpZHRoICsgeCkgKiA0O1xyXG4gICAgICAgICAgICAgICAgLy8g6Zmk5LulIGdhdXNzU3VtIOaYr+S4uuS6hua2iOmZpOWkhOS6jui+uee8mOeahOWDj+e0oCwg6auY5pav6L+Q566X5LiN6Laz55qE6Zeu6aKYXHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhnYXVzc1N1bSlcclxuICAgICAgICAgICAgICAgIHBpeGVzW2ldID0gciAvIGdhdXNzU3VtO1xyXG4gICAgICAgICAgICAgICAgcGl4ZXNbaSArIDFdID0gZyAvIGdhdXNzU3VtO1xyXG4gICAgICAgICAgICAgICAgcGl4ZXNbaSArIDJdID0gYiAvIGdhdXNzU3VtO1xyXG4gICAgICAgICAgICAgICAgLy8gcGl4ZXNbaSArIDNdID0gYSA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy95IOaWueWQkeS4gOe7tOmrmOaWr+i/kOeul1xyXG4gICAgICAgIGZvciAoeCA9IDA7IHggPCB3aWR0aDsgeCsrKSB7XHJcbiAgICAgICAgICAgIGZvciAoeSA9IDA7IHkgPCBoZWlnaHQ7IHkrKykge1xyXG4gICAgICAgICAgICAgICAgciA9IGcgPSBiID0gYSA9IDA7XHJcbiAgICAgICAgICAgICAgICBnYXVzc1N1bSA9IDA7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGogPSAtcmFkaXVzOyBqIDw9IHJhZGl1czsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgayA9IHkgKyBqO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChrID49IDAgJiYgayA8IGhlaWdodCkgey8v56Gu5L+dIGsg5rKh6LaF5Ye6IHkg55qE6IyD5Zu0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGkgPSAoayAqIHdpZHRoICsgeCkgKiA0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByICs9IHBpeGVzW2ldICogZ2F1c3NNYXRyaXhbaiArIHJhZGl1c107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGcgKz0gcGl4ZXNbaSArIDFdICogZ2F1c3NNYXRyaXhbaiArIHJhZGl1c107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGIgKz0gcGl4ZXNbaSArIDJdICogZ2F1c3NNYXRyaXhbaiArIHJhZGl1c107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGEgKz0gcGl4ZXNbaSArIDNdICogZ2F1c3NNYXRyaXhbal07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhdXNzU3VtICs9IGdhdXNzTWF0cml4W2ogKyByYWRpdXNdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGkgPSAoeSAqIHdpZHRoICsgeCkgKiA0O1xyXG4gICAgICAgICAgICAgICAgcGl4ZXNbaV0gPSByIC8gZ2F1c3NTdW07XHJcbiAgICAgICAgICAgICAgICBwaXhlc1tpICsgMV0gPSBnIC8gZ2F1c3NTdW07XHJcbiAgICAgICAgICAgICAgICBwaXhlc1tpICsgMl0gPSBiIC8gZ2F1c3NTdW07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy9lbmRcclxuICAgICAgICByZXR1cm4gaW1nRGF0YTtcclxuICAgIH1cclxuXHJcbiAgICAvLyDmqKHns4rlm77niYdcclxuICAgIGZ1bmN0aW9uIGJsdXJJbWcoaW1nLCBlbGUpIHtcclxuXHJcbiAgICAgICAgdmFyIHcgPSBpbWcud2lkdGgsXHJcbiAgICAgICAgICAgIGggPSBpbWcuaGVpZ2h0LFxyXG4gICAgICAgICAgICBjYW52YXNXID0gNTAsXHJcbiAgICAgICAgICAgIGNhbnZhc0ggPSA1MDtcclxuXHJcbiAgICAgICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpLFxyXG4gICAgICAgICAgICBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuXHJcbiAgICAgICAgY2FudmFzLndpZHRoID0gY2FudmFzVztcclxuICAgICAgICBjYW52YXMuaGVpZ2h0ID0gY2FudmFzSDtcclxuXHJcbiAgICAgICAgY3R4LmRyYXdJbWFnZShpbWcsIDAsIDAsIHcsIGgsIDAsIDAsIGNhbnZhc1csIGNhbnZhc0gpO1xyXG5cclxuICAgICAgICB2YXIgcGl4ZWwgPSBjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIGNhbnZhc0gsIGNhbnZhc0gpO1xyXG5cclxuICAgICAgICBnYXVzc0JsdXIocGl4ZWwpO1xyXG5cclxuICAgICAgICBjdHgucHV0SW1hZ2VEYXRhKHBpeGVsLCAwLCAwKTtcclxuXHJcbiAgICAgICAgdmFyIGltYWdlRGF0YSA9IGNhbnZhcy50b0RhdGFVUkwoKTtcclxuXHJcbiAgICAgICAgZWxlLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJyArIGltYWdlRGF0YSArICcpJyk7XHJcbiAgICB9XHJcblxyXG4gICAgcm9vdC5ibHVySW1nID0gYmx1ckltZztcclxuXHJcbn0pKHdpbmRvdy5aZXB0bywgd2luZG93LnBsYXllciB8fCAod2luZG93LnBsYXllciA9IHt9KSk7XHJcblxyXG4iLCIvLyByZXF1aXJlXHJcbnZhciBpbmRleCA9IDA7XHJcbnZhciBzb25nTGlzdDtcclxudmFyIGF1ZGlvO1xyXG5mdW5jdGlvbiBiaW5kRXZlbnQoKSB7XHJcbiAgICAvLyAkKCcud3JhcHBlcicpLm9uKCdwbGF5Q2hhbmdlJyAsIGZ1bmN0aW9uKCl7XHJcbiAgICAvLyAgICAgYXVkaW8uZ2V0QXVkaW8oc29uZ0xpc3RbaW5kZXhdLmF1ZGlvKVxyXG4gICAgLy8gICAgIGlmIChhdWRpby5zdGF0dXMgPT0gJ3BsYXknKSB7XHJcbiAgICAvLyAgICAgICAgIGF1ZGlvLnBsYXkoKTtcclxuICAgIC8vICAgICB9XHJcbiAgICAvLyB9KVxyXG4gICAgJCgnLmNvbnRyb2wtYnRuJykub24oJ3RhcCcgLCAnLmxhc3QnICwgZnVuY3Rpb24oKXtcclxuICAgICAgICBpbmRleCA9IChpbmRleCArIDEgKyBzb25nTGlzdC5sZW5ndGgpICUgc29uZ0xpc3QubGVuZ3RoO1xyXG4gICAgICAgIHBsYXllci5yZW5kZXIoc29uZ0xpc3RbaW5kZXhdKTtcclxuICAgICAgICBhdWRpby5nZXRBdWRpbyhzb25nTGlzdFtpbmRleF0uYXVkaW8pO1xyXG4gICAgICAgIGF1ZGlvLnBsYXkoKTtcclxuICAgIH0pXHJcbiAgICAub24oJ3RhcCcgLCAnLm5leHQnICwgZnVuY3Rpb24oKXtcclxuICAgICAgICBpbmRleCA9IChpbmRleCAtIDEgKyBzb25nTGlzdC5sZW5ndGgpICUgc29uZ0xpc3QubGVuZ3RoO1xyXG4gICAgICAgIHBsYXllci5yZW5kZXIoc29uZ0xpc3RbaW5kZXhdKTtcclxuICAgICAgICBhdWRpby5nZXRBdWRpbyhzb25nTGlzdFtpbmRleF0uYXVkaW8pO1xyXG4gICAgICAgIGF1ZGlvLnBsYXkoKTtcclxuICAgIH0pXHJcbiAgICAub24oJ3RhcCcgLCAnLnBsYXktYnRuJyAsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgaWYgKGF1ZGlvLnN0YXR1cyA9PSAncGF1c2UnKSB7XHJcbiAgICAgICAgICAgIGF1ZGlvLnBsYXkoKTtcclxuICAgICAgICAgICAgJCgnLnBsYXktYnRuJykucmVtb3ZlQ2xhc3MoJ3BsYXknKS5hZGRDbGFzcygncGF1c2UnKVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGF1ZGlvLnBhdXNlKCk7XHJcbiAgICAgICAgICAgICQoJy5wbGF5LWJ0bicpLnJlbW92ZUNsYXNzKCdwYXVzZScpLmFkZENsYXNzKCdwbGF5JylcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcblxyXG4gICAgfSlcclxufVxyXG5mdW5jdGlvbiBnZXREYXRhKHVybCkge1xyXG4gICAgJC5hamF4KHtcclxuICAgICAgICB0eXBlOiAnR0VUJyxcclxuICAgICAgICB1cmw6IHVybCxcclxuICAgICAgICAvLyBkYXRhOiAnJyxcclxuICAgICAgICBzdWNjZXNzIDogb3V0RGF0YSxcclxuICAgICAgICBlcnJvciA6IG91dERhdGFcclxuICAgIH0pXHJcbn1cclxuZnVuY3Rpb24gb3V0RGF0YShkYXRhKXtcclxuICAgIHNvbmdMaXN0ID0gZGF0YTtcclxuICAgIHBsYXllci5yZW5kZXIoZGF0YVtpbmRleF0pO1xyXG4gICAgYmluZEV2ZW50KCk7XHJcbiAgICBhdWRpbyA9IG5ldyBwbGF5ZXIuQXVkaW9Db250cm9sKCk7XHJcbiAgICBhdWRpby5nZXRBdWRpbyhzb25nTGlzdFtpbmRleF0uYXVkaW8pO1xyXG4gICAgLy8gJCgnLndyYXBwZXInKS50cmlnZ2VyKCdwbGF5Q2hhbmdlJyk7XHJcbn1cclxuZ2V0RGF0YSgnLi4vc291cmNlL2RhdGEuanNvbicpO1xyXG4iLCIvL+a4suafk+eVjOmdolxyXG47KGZ1bmN0aW9uICgkLCByb290KSB7XHJcbiAgICBmdW5jdGlvbiByZW5kZXJJbmZvKGluZm8pIHtcclxuICAgICAgICB2YXIgaHRtbCA9ICc8aDIgY2xhc3M9XCJzb25nXCI+JyArIGluZm8uc29uZyArICc8L2gyPlxcXHJcbiAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3MgPSBcInNpbmdlclwiPicgKyBpbmZvLnNpbmdlciArICc8L3A+XFxcclxuICAgICAgICAgICAgICAgICAgICA8cCBjbGFzcyA9IFwiYWxidW1cIj4nICsgaW5mby5hbGJ1bSArICc8L3A+JztcclxuICAgICAgICAkKCcuaW5mbycpLmh0bWwoaHRtbCk7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcmVuZGVySW1nKGluZm8pe1xyXG4gICAgICAgIHZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcclxuICAgICAgICBpbWcuc3JjID0gaW5mbztcclxuICAgICAgICBpbWcub25sb2FkID0gZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgcm9vdC5ibHVySW1nKGltZyAsICQoJy53cmFwcGVyJykpO1xyXG4gICAgICAgICAgICAkKCcuc2luZ2VyLXBpYycpLmh0bWwoaW1nKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiByZW5kZXJJc0xpa2UoaW5mbyl7XHJcbiAgICAgICAgaWYgKGluZm8pIHtcclxuICAgICAgICAgICAgJCgnLmtlZXAnKS5yZW1vdmVDbGFzcygndW5saWtlJykuYWRkQ2xhc3MoJ2xpa2UnKVxyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAkKCcua2VlcCcpLnJlbW92ZUNsYXNzKCdsaWtlJykuYWRkQ2xhc3MoJ3VubGlrZScpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0KGRhdGEpIHtcclxuICAgICAgICByZW5kZXJJbmZvKGRhdGEpO1xyXG4gICAgICAgIHJlbmRlckltZyhkYXRhLmltYWdlKTtcclxuICAgICAgICByZW5kZXJJc0xpa2UoZGF0YS5pc0xpa2UpXHJcbiAgICB9XHJcbiAgICByb290LnJlbmRlciA9IGluaXQ7XHJcbn0pKHdpbmRvdy5aZXB0byAsIHdpbmRvdy5wbGF5ZXIgfHwgKHdpbmRvdy5wbGF5ZXIgPSB7fSkpIC8v6YCa6L+Hd2luZG93LnBsYXllcuaatOmcsuWFpeWPo+WHveaVsCJdfQ==
