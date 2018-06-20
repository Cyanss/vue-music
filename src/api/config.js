/**
 * Created by Cyan on 2018/5/15.
 */
export const commonParams = {
  g_tk: 5381,
  inCharset: 'utf-8',
  outCharset: 'utf-8',
  notice: 0,
  format: 'jsonp'
};

export const options = {
  param: 'jsonpCallback'
};

export function getGuid() {
    let t = (new Date()).getUTCMilliseconds();
    let GUID = Math.round(2147483647 * Math.random()) * t % 1e10;
    // console.log(GUID);
    return GUID;
}
export const ERR_OK = 0;

export const CID = 205361747;
