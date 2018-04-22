(function($ , root){
    function transTime(time) {
        var min = time / 60;//////////待取整
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