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