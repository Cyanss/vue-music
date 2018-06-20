/**
 * Created by Cyan on 2018/5/15.
 */
import jsonp from 'common/js/jsonp';
import {commonParams, options} from 'api/config';
import axios from 'axios';

export function getRecommend () {
  const url = 'https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg';
  const data = Object.assign({}, commonParams, {
    platform: 'h5',
    uin: 0,
    needNewCode: 1
  });
  return jsonp(url, data, options);
}

export function getDiscList () {
  const url = '/api/getDiscList';

  const data = Object.assign({}, commonParams, {
    picmid: 1,
    platform: 'yqq',
    loginUin: 0,
    hostUin: 0,
    sin: 0,
    ein: 29,
    sortId: 5,
    needNewCode: 0,
    categoryId: 10000000,
    rnd: Math.random(),
    format: 'json'
  });
  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data);
  });
}

export function getSongList(disstid) {
  const url = '/api/getSongList';
  const data = Object.assign({}, commonParams, {
    uin: 0,
    disstid: disstid,
    needNewCode: 0,
    type: 1,
    json: 1,
    utf8: 1,
    onlysong: 0,
    platform: 'yqq',
    hostUin: 0,
    format: 'json',
    g_tk: 5381
  });
  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data);
  });
}
