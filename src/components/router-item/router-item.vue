<template>
  <div class="router">
    <router-link tag="div" class="router-item" to="/recommend">
      <span class="router-link">推荐</span>
    </router-link>
    <router-link tag="div" class="router-item" to="/singer">
      <span class="router-link">歌手</span>
    </router-link>
    <router-link tag="div" class="router-item" to="/rank">
      <span class="router-link">排行
      </span>
    </router-link>
    <router-link tag="div" class="router-item" to="/search">
      <span class="router-link">搜索</span>
    </router-link>
  </div>
</template>

<script type="text/ecmascript-6">
  export default{};
</script>

<style scoped lang="stylus" type="text/stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  .router
    display: flex
    height: 44px
    line-height: 44px
    font-size: $font-size-medium
    .router-item
      flex: 1
      text-align: center
      .router-link
        padding-bottom: 5px
        color: $color-text-l
      &.router-link-active
        .router-link
          color: $color-theme
          border-bottom: 2px solid $color-theme
</style>
