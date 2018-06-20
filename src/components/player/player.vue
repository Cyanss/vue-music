<template>
  <div class="player" v-show="playList.length > 0">
    <transition name="normal"
                @enter="enter"
                @after-enter="afterEnter"
                @leave="leave"
                @after-leave="afterLeave"
    >
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img :src="currentSong.image" width="100%" height="100%"/>
        </div>
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <div class="middle"
             @touchstart.prevent="middleTouchStart"
             @touchmove.prevent="middleTouchMove"
             @touchend="middleTouchEnd"
        >
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" ref="cds">
                <img :src="currentSong.image" ref="image" class="image"/>
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{playingLyric}}</div>
            </div>
          </div>
          <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p ref="lyricLine" class="text" v-for="(line, index) in currentLyric.lines" :class="{'current': currentLineNum === index}" :key="index">{{line.txt}}</p>
              </div>
            </div>
          </scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{'active':currentShow === 'cd'}"></span>
            <span class="dot" :class="{'active':currentShow === 'lyric'}"></span>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l">{{format(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar :percent="percent" @percentChange="onProgressBarChange"></progress-bar>
            </div>
            <span class="time time-l">{{format(currentSong.duration)}}</span>
          </div>
          <div class="operators">
            <div class="icon i-left" @click="changeMode">
              <i :class="iconMode"></i>
            </div>
            <div class="icon i-left" :class="disableCls">
              <i class="icon-prev" @click="prev"></i>
            </div>
            <div class="icon i-center" :class="disableCls">
              <i :class="playIcon" @click="togglePlaying"></i>
            </div>
            <div class="icon i-right" :class="disableCls">
              <i class="icon-next" @click="next"></i>
            </div>
            <div class="icon i-right">
              <i class="icon" @click="toggleFavorite(currentSong)" :class="getFavoriteIcon(currentSong)"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <div class="wrapper_mini"  ref="wrapperMini">
            <img ref="imageMini" :src="currentSong.image" width="40" height="40"/>
          </div>
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <progress-circle :radius="radius" :percent="percent">
            <i :class="miniIcon" class="icon-mini" @click.stop ="togglePlaying"></i>
          </progress-circle>
        </div>
        <div class="control" @click.stop="showPlaylist">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <playlist ref="playlist"></playlist>
    <audio src="../static/audio/mute.mp3"
           ref="audio"
           @play="ready"
           @error="error"
           @timeupdate="updateTime"
           autoplay="autoplay"
           @ended="end"
    ></audio>
  </div>
</template>

<script type="text/ecmascript-6">
  import {mapGetters, mapActions, mapMutations} from 'vuex';
  import animations from 'create-keyframe-animation';
  import {prefixStyle, Matrix} from 'common/js/dom';
  import {getSongVK} from 'api/song';
  import {ERR_OK, getGuid} from 'api/config';
  import ProgressBar from 'base/progress-bar/progress-bar';
  import ProgressCircle from 'base/progress-circle/progress-circle';
  import Lyric from 'lyric-parser';
  import {playMode} from 'common/js/config';
  import Scroll from 'base/scroll/scroll';
  import Playlist from 'components/playlist/playlist';
  import {playerMixin} from 'common/js/mixin';

  const transform = prefixStyle('transform');
  const transitionDuration = prefixStyle('transitionDuration');
  export default{
    mixins: [playerMixin],
    data() {
      return {
        songUrl: '',
        songReady: false,
        currentTime: 0,
        radius: 32,
        isPlaying: false,
        currentLyric: null,
        currentLineNum: 0,
        currentShow: 'cd',
        playingLyric: '',
        isFirst: true
      };
    },
    computed: {
      playIcon() {
        return this.playing ? 'icon-pause' : 'icon-play';
      },
      miniIcon() {
        return this.playing ? 'icon-pause-mini' : 'icon-play-mini';
      },
      disableCls() {
        return this.songReady ? '' : 'disable';
      },
      percent() {
        return this.currentTime / this.currentSong.duration;
      },
      ...mapGetters([
        'fullScreen',
        'playing',
        'currentIndex'
      ])
    },
    created() {
      this.touch = {};
    },
    watch: {
      currentSong(newSong, oldSong) {
        if (!newSong) {
          return;
        }
        if (newSong.id === oldSong.id) {
          return;
        }
        this._getCurrentSongVK();
      },
      songUrl() {
        if (this.currentLyric) {
          this.currentLyric.stop();
        }
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          if (this.songUrl) {
            this.$refs.audio.play();
            this.isPlaying = !this.$refs.audio.paused;
            this.getLyric();
            if (!this.isPlaying) {
              this.songReady = true;
              this.setPlayingState(false);
            }
          }
        }, 1000);
      },
      fullScreen() {
        this.playing ? this._play() : this._pause();
      },
      playing(newPlaying) {
        const audio = this.$refs.audio;
        this.$nextTick(() => {
          newPlaying ? this._play() : this._pause();
          if (this.songUrl) {
            newPlaying ? audio.play() : audio.pause();
          }
        });
      },
      currentLyric(newLyric) {
        if (newLyric) {
          this.currentLineNum = 0;
        }
      }
    },
    methods: {
      updateTime(event) {
        this.currentTime = event.target.currentTime;
      },
      error() {
        this.songReady = true;
      },
      ready() {
        this.songReady = true;
        this.savePlayHistory(this.currentSong);
      },
      prev() {
        if (!this.songReady) {
          return;
        }
        if (this.playList.length === 1) {
          this.loop();
        } else {
          this.$refs.image.classList.remove('play');
          let index = this.currentIndex - 1;
          if (index === -1) {
            index = this.playList.length - 1;
          }
          this.setCurrentIndex(index);
          if (!this.playing) {
            this.togglePlaying();
          }
        }
        this.songReady = false;
      },
      next() {
        if (!this.songReady) {
          return;
        }
        if (this.playList.length === 1) {
          this.loop();
        } else {
          let index = this.currentIndex + 1;
          if (index === this.playList.length) {
            index = 0;
          }
          this.setCurrentIndex(index);
          if (!this.playing) {
            this.togglePlaying();
          }
        }
        this.songReady = false;
      },
      end() {
        if (this.modes === playMode.loop) {
          this.loop();
        } else {
          this.next();
        }
      },
      loop() {
        this.$refs.audio.currentTime = 0;
        this.$refs.audio.play();
        if (this.currentLyric) {
          this.currentLyric.seek(0);
        }
      },
      back() {
        this.setFullScreen(false);
      },
      open() {
        this.setFullScreen(true);
      },
      enter(el, done) {
        const {x, y, scale} = this._getPosAndScale();

        let animation = {
          0: {
            transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
          },
          60: {
            transform: `translate3d(0,0,0) scale(1.1)`
          },
          100: {
            transform: `translate3d(0,0,0) scale(1)`
          }
        };

        animations.registerAnimation({
          name: 'move',
          animation,
          presets: {
            duration: 400,
            easing: 'linear'
          }
        });

        animations.runAnimation(this.$refs.cdWrapper, 'move', done);
      },
      afterEnter() {
        animations.unregisterAnimation('move');
        this.$refs.cdWrapper.style.animaion = '';
      },
      leave(el, done) {
        this.$refs.cdWrapper.style.transition = 'all 0.4s';
        const {x, y, scale} = this._getPosAndScale();
        this.$refs.cdWrapper.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`;
        this.$refs.cdWrapper.addEventListener('transitionend', done);
      },
      afterLeave() {
        this.$refs.cdWrapper.style.transition = '';
        this.$refs.cdWrapper.style[transform] = '';
      },
      togglePlaying() {
        if (!this.songReady) {
          return;
        }
        if (!this.isPlaying) {
          this.$refs.audio.play();
          this.isPlaying = true;
          this.setPlayingState(true);
          if (this.currentLyric) {
            this.currentLyric.togglePlay();
          }
        } else {
          if (this.currentLyric) {
            this.currentLyric.togglePlay();
          }
          this.setPlayingState(!this.playing);
        }
      },
      format(interval) {
        interval = interval | 0;
        const minute = interval / 60 | 0;
        const second = this._pad(interval % 60);
        return `${minute}:${second}`;
      },
      onProgressBarChange(percent) {
        const currentTime = this.currentSong.duration * percent;
        this.$refs.audio.currentTime = currentTime;
        if (!this.playing) {
          this.togglePlaying();
        }
        if (this.currentLyric) {
          this.currentLyric.seek(currentTime * 1000);
        }
      },
      showPlaylist() {
        this.$refs.playlist.show();
      },
      getLyric() {
        this.currentSong.getLyric().then((lyric) => {
          if (this.currentSong.lyric !== lyric) {
            return;
          }
          this.currentLyric = new Lyric(lyric, this.handleLyric);
          if (this.playing) {
            this.currentLyric.play();
          }
        }).catch(() => {
          this.currentLyric = null;
          this.playingLyric = '';
          this.currentLineNum = 0;
        });
      },
      middleTouchStart(event) {
        this.touch.initiated = true;
        const touch = event.touches[0];
        this.touch.startX = touch.pageX;
        this.touch.startY = touch.pageY;
      },
      middleTouchMove(event) {
        if (!this.touch.initiated) {
          return;
        }
        const touch = event.touches[0];
        const deltaX = touch.pageX - this.touch.startX;
        const deltaY = touch.pageY - this.touch.startY;
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          return;
        }
        const left = this.currentShow === 'cd' ? 0 : -window.innerWidth;
        const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX));
        this.touch.percent = Math.abs(offsetWidth / window.innerWidth);
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`;
        this.$refs.lyricList.$el.style[transitionDuration] = 0;
        this.$refs.middleL.style.opacity = 1 - this.touch.percent;
        this.$refs.middleL.style[transitionDuration] = 0;
      },
      middleTouchEnd() {
        let offsetWidth;
        let opacity;
        if (this.currentShow === 'cd') {
          if (this.touch.percent > 0.1) {
            offsetWidth = -window.innerWidth;
            opacity = 0;
            this.currentShow = 'lyric';
          } else {
            offsetWidth = 0;
            opacity = 1;
          }
        } else {
          if (this.touch.percent < 0.9) {
            offsetWidth = 0;
            this.currentShow = 'cd';
            opacity = 1;
          } else {
            offsetWidth = -window.innerWidth;
            opacity = 0;
          }
        }
        const time = 300;
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`;
        this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`;
        this.$refs.middleL.style.opacity = opacity;
        this.$refs.middleL.style[transitionDuration] = 0;
      },
      handleLyric({lineNum, txt}) {
        this.currentLineNum = lineNum;
        if (lineNum > 5) {
          let lineEl = this.$refs.lyricLine[lineNum - 5];
          this.$refs.lyricList.scrollToElement(lineEl, 1000);
        } else {
          this.$refs.lyricList.scrollTo(0, 0, 1000);
        }
        this.playingLyric = txt;
      },
      _pad(num, n = 2) {
        let len = num.toString().length;
        while (len < n) {
          num = '0' + num;
          len++;
        }
        return num;
      },
      _getCurrentSongVK() {
        if (this.currentSong) {
          let guid = getGuid();
          getSongVK(this.currentSong.mid, guid).then((res) => {
            if (res.code === ERR_OK) {
              this.itemSong = res.data.items[0];
              if (this.itemSong.vkey) {
                this.songUrl = `http://dl.stream.qqmusic.qq.com/${this.itemSong.filename}?vkey=${this.itemSong.vkey}&guid=${guid}&fromtag=38`;
                this.$refs.audio.src = this.songUrl;
                this.songReady = true;
              }
            }
          });
        }
      },
      _play() {
        if (this.fullScreen) {
          this.$refs.image.classList.add('play');
        } else {
          this.$refs.imageMini.classList.add('play');
        }
      },
      _pause() {
        if (this.fullScreen) {
          this._getTransform(this.$refs.image, this.$refs.cds);
        } else {
          this._getTransform(this.$refs.imageMini, this.$refs.wrapperMini);
        }
      },
      _getTransform(imageEl, wrapperEl) {
        let wrapper, image;
        let tempTransform;
        let imageTransform = getComputedStyle(imageEl).transform;
        let wrapperTransform = getComputedStyle(wrapperEl).transform;
        if (this.isFirst) {
          tempTransform = wrapperTransform;
          this.isFirst = false;
        } else {
          tempTransform = '';
          wrapper = new Matrix(wrapperTransform);
          image = new Matrix(imageTransform);
        }
        wrapperEl.style.transform = wrapperTransform === 'none' || tempTransform.length > 5
          ? imageTransform : wrapper.superposeMatrix(image).toMatrixString();
        imageEl.classList.remove('play');
      },
      _getPosAndScale() {
        const targetWidth = 40;
        const paddingLeft = 40;
        const paddingBottom = 30;
        const paddingTop = 80;
        const width = window.innerWidth * 0.8;
        const scale = targetWidth / width;
        const x = -(window.innerWidth / 2 - paddingLeft);
        const y = window.innerHeight - paddingTop - width / 2 - paddingBottom;

        return {x, y, scale};
      },
      ...mapMutations({
        setFullScreen: 'SET_FULL_SCREEN'
      }),
      ...mapActions([
        'savePlayHistory'
      ])
    },
    components: {
      ProgressBar,
      ProgressCircle,
      Scroll,
      Playlist
    }
  };
</script>

<style scoped lang="stylus" type="text/stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position fixed
      left 0
      right 0
      top 0
      bottom 0
      z-index 150
      background $color-background
      .background
        position absolute
        left 0
        top 0
        width 100%
        height 100%
        z-index -1
        opacity 0.6
        filter blur(20px)
      .top
        position relative
        margin-bottom 25px
        .back
          position absolute
          top 0
          left 6px
          z-index 50
          .icon-back
            display block
            padding 9px
            font-size $font-size-large-x
            color $color-theme
            transform rotate(-90deg)
        .title
          width 70%
          margin 0 auto
          line-height 40px
          text-align center
          no-wrap()
          font-size $font-size-large
          color $color-text
        .subtitle
          line-height 20px
          text-align center
          font-size $font-size-medium
          color $color-text
      .middle
        position fixed
        width 100%
        top 80px
        bottom 170px
        white-space nowrap
        font-size 0
        .middle-l
          display inline-block
          vertical-align top
          position relative
          width 100%
          height 0
          padding-top 80%
          .cd-wrapper
            position absolute
            left 10%
            top 0
            width 80%
            height 100%
            .cd
              width 100%
              height 100%
              box-sizing border-box
              border 10px solid rgba(255, 255, 255, 0.1)
              border-radius 50%
              &.play
                animation rotate 30s linear infinite
              &.pause
                animation-play-state paused
              .image
                position relative
                left 0
                top 0
                width 100%
                height 100%
                border-radius 50%
                &.play
                  animation rotate 20s linear infinite

          .playing-lyric-wrapper
            width 80%
            margin 30px auto 0 auto
            overflow hidden
            text-align center
            .playing-lyric
              height 20px
              line-height 20px
              font-size $font-size-medium
              color $color-text-l
        .middle-r
          display inline-block
          vertical-align top
          width 100%
          height 100%
          overflow hidden
          .lyric-wrapper
            width 80%
            margin 0 auto
            overflow hidden
            text-align center
            .text
              line-height 32px
              color $color-text-l
              font-size $font-size-medium
              &.current
                color $color-text
      .bottom
        position absolute
        bottom 50px
        width 100%
        .dot-wrapper
          text-align center
          font-size 0
          .dot
            display inline-block
            vertical-align middle
            margin 0 4px
            width 8px
            height 8px
            border-radius 50%
            background $color-text-l
            &.active
              width 20px
              border-radius 5px
              background $color-text-ll
        .progress-wrapper
          display flex
          align-items center
          width 80%
          margin 0 auto
          padding 10px 0
          .time
            color $color-text
            font-size $font-size-small
            flex 0 0 30px
            line-height 30px
            width 30px
            &.time-l
              text-align left
            &.time-r
              text-align right
          .progress-bar-wrapper
            flex 1
        .operators
          display flex
          align-items center
          .icon
            flex 1
            color $color-theme
            &.disable
              color $color-theme-d
            i
              font-size 30px
          .i-left
            text-align right
          .i-center
            padding 0 20px
            text-align center
            i
              font-size 40px
          .i-right
            text-align left
          .icon-favorite
            color $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition all 0.4s
        .top, .bottom
          transition all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity 0
        .top
          transform translate3d(0, -100px, 0)
        .bottom
          transform translate3d(0, 100px, 0)
    .mini-player
      display flex
      align-items center
      position fixed
      left 0
      bottom 0
      z-index 180
      width 100%
      height 60px
      background $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity 0
      .icon
        flex 0 0 40px
        width 40px
        padding 0 10px 0 20px
        .wrapper_mini
          position relative
          display block
          width 40px
          height 40px
          img
            position relative
            top 0
            left 0
            bottom 0
            right 0
            border-radius 50%
            &.play
              animation rotate 10s linear infinite
            &.pause
              -webkit-animation: none !important;
              animation-play-state paused
      .text
        display flex
        flex-direction column
        justify-content center
        flex 1
        line-height 20px
        overflow hidden
        .name
          margin-bottom 2px
          no-wrap()
          font-size $font-size-medium
          color $color-text
        .desc
          no-wrap()
          font-size $font-size-small
          color $color-text-d
      .control
        flex 0 0 30px
        width 30px
        padding 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size 30px
          color $color-theme-d
        .icon-mini
          font-size 32px
          position absolute
          left 0
          top 0

  @keyframes rotate
    0%
      transform rotate(0)
    100%
      transform rotate(360deg)
</style>
