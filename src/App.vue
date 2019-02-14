<template>
  <div id="app">
    <m-header></m-header >
    <router-item></router-item>
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
    <player></player>
  </div>
</template>
<script type="text/ecmascript-6">
  import MHeader from 'components/m-header/m-header';
  import RouterItem from 'components/router-item/router-item';
  import Player from 'components/player/player';
  import ScreenFull from 'screenfull';

  export default {
    data() {
      return {
        isFullscreen: false
      };
    },
    methods: {
      /**
       * 全屏事件
       */
      screenfull() {
        console.log('screenFull');
        if (!ScreenFull.enabled) {
          this.$message({
            message: 'Your browser does not work',
            type: 'warning'
          });
          return false;
        }
        ScreenFull.toggle();
         this.isFullscreen = !this.isFullscreen;
      },
      /**
       * 是否全屏并按键ESC键的方法
       */
      checkFull() {
        var isFull = document.fullscreenEnabled || window.fullScreen || document.webkitIsFullScreen || document.msFullscreenEnabled;
        // to fix : false || undefined == undefined
        if (isFull === undefined) {
          isFull = false;
        }
        return isFull;
      }
    },
    mounted() {
      if (this.isFullscreen) {
       this.screenfull();
      }
      window.onresize = () => {
        // 全屏下监控是否按键了ESC
        if (!this.checkFull()) {
          // 全屏下按键esc后要执行的动作
          this.isFullscreen = false;
        }
      };
    },
    components: {
      MHeader,
      RouterItem,
      Player
    }
  }
  ;
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "common/stylus/variable.styl"

  #app
    color $color-theme
</style>
