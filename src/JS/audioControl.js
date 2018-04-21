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