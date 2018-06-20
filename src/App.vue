<template>
  <div id="app">
    <m-header></m-header>
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
export default {
  components: {
    MHeader,
    RouterItem,
    Player
  }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "common/stylus/variable.styl"

  #app
    color $color-theme
</style>
