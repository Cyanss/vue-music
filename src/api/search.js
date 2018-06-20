/**
 * Created by Cyan on 2018/6/11.
 */
import jsonp from 'common/js/jsonp';
import {commonParams, options} from './config';
export function getHotKey() {
  const url = 'https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg';
  const data = Object.assign({}, commonParams, {
    platform: 'h5',
    needNewCode: 1
  });

  return jsonp(url, data, options);
}

export function search(query, page, zhida, perpage) {
  const url = 'https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp';

  const data = Object.assign({}, commonParams, {
    w: query,
    platform: 'h5',
    zhidaqu: 1,
    catZhida: zhida ? 1 : 0,
    perpage: perpage,
    t: 0,
    flag: 1,
    ie: 'utf-8',
    sem: 1,
    aggr: 0,
    n: perpage,
    p: page,
    remoteplace: 'txt.mqq.all',
    uid: 0,
    needNewCode: 1
  });

  return jsonp(url, data, options);
}
