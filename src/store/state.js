/**
 * Created by Cyan on 2018/5/18.
 * VUEX 状态管理
 */
import {playMode} from 'common/js/config';
import {loadSearch, loadPlay, loadFavorite} from 'common/js/cache';
const state = {
  singer: {},
  playing: false,
  fullScreen: false,
  playList: [],
  sequenceList: [],
  modes: playMode.sequence,
  currentIndex: -1,
  disc: {},
  topList: {},
  searchHistory: loadSearch(),
  playHistory: loadPlay(),
  favoriteList: loadFavorite()
};
export default state;
