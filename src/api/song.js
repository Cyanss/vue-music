import {commonParams} from './config';
import axios from 'axios';
import {CID} from 'api/config';

export function getSongVK (mid, Guid) {
  const url = '/api/getSongVK';

  const data = Object.assign({}, commonParams, {
    songmid: mid,
    g_tk: 5381,
    hostUin: 0,
    format: 'json',
    notice: 0,
    platform: 'yqq',
    needNewCode: 0,
    cid: CID,
    filename: `C400${mid}.m4a`,
    guid: Guid
  });
  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data);
  });
}
export function getLyric(mid) {
  const url = '/api/getLyric';

  const data = Object.assign({}, commonParams, {
    songmid: mid,
    g_tk: 5381,
    platform: 'yqq',
    hostUin: 0,
    needNewCode: 0,
    pcachetime: +new Date(),
    format: 'json'
  });

  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data);
  });
}
