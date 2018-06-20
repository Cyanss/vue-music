/**
 * Created by Cyan on 2018/5/31.
 */
import {playMode} from 'common/js/config';
import {shuffle} from 'common/js/util';
import {mapGetters, mapActions, mapMutations} from 'vuex';
export const playlistMixin = {
  computed: {
    ...mapGetters([
      'sequenceList',
      'currentSong',
      'playList',
      'modes'
    ])
  },
  mounted() {
    this.handlePlaylist(this.playList);
  },
  activated() {
    this.handlePlaylist(this.playList);
  },
  watch: {
    playList(newVal) {
      this.handlePlaylist(newVal);
    }

  },
  methods: {
    handlePlaylist() {
      throw new Error('component must implement handlePlaylist method');
    }
  }
};

export const playerMixin = {
  computed: {
    iconMode() {
      return this.modes === playMode.sequence ? 'icon-sequence' : this.modes === playMode.loop ? 'icon-loop' : 'icon-random';
    },
    ...mapGetters([
      'sequenceList',
      'currentSong',
      'playList',
      'modes',
      'favoriteList'
    ])
  },
  methods: {
    getFavoriteIcon(song) {
      if (this.isFavorite(song)) {
        return 'icon-favorite';
      }
      return 'icon-not-favorite';
    },
    toggleFavorite(song) {
      if (this.isFavorite(song)) {
        this.deleteFavoriteList(song);
      } else {
        this.saveFavoriteList(song);
      }
    },
    isFavorite(song) {
      const index = this.favoriteList.findIndex((item) => {
        return song.id === item.id;
      });
      return index > -1;
    },
    changeMode() {
      const mode = (this.modes + 1) % 3;
      this.setPlayModes(mode);
      let list = null;
      if (mode === playMode.random) {
        list = shuffle(this.sequenceList);
      } else {
        list = this.sequenceList;
      }
      if (list) {
        this.resetCurrentIndex(list);
        this.setPlayList(list);
      }
    },
    resetCurrentIndex(list) {
      let index = list.findIndex((item) => {
        return item.id === this.currentSong.id;
      });
      this.setCurrentIndex(index);
    },
    ...mapMutations({
      setPlayingState: 'SET_PLAYING_STATE',
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setPlayModes: 'SET_PLAY_MODES',
      setPlayList: 'SET_PLAYLIST'
    }),
    ...mapActions([
      'saveFavoriteList',
      'deleteFavoriteList'
    ])
  }
};

export const searchMixin = {
  data() {
    return {
      query: '',
      refreshDelay: 100
    };
  },
  computed: {
    ...mapGetters([
      'searchHistory'
    ])
  },
  methods: {
    saveSearch() {
      this.saveSearchHistory(this.query);
    },
    blurInput() {
      this.$refs.searchBox.blur();
    },
    addQuery(query) {
      this.$refs.searchBox.setQuery(query);
    },
    onQueryChange(query) {
      this.query = query;
    },
    ...mapActions([
      'saveSearchHistory',
      'deleteSearchHistory'
    ])
  }
};
