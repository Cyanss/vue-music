/**
 * Created by Cyan on 2018/5/15.
 */
export function addClass (el, className) {
  if (hasClass(el, className)) {
    return;
  }
  let newClass = el.className.split(' ');
  newClass.push(className);
  el.className = newClass.join(' ');
}

export function hasClass (el, className) {
  let reg = new RegExp('(^|\\s)' + className + '(\\s|$)');
  return reg.test(el.classNmae);
}

export function getData (el, name, val) {
  const prefix = 'data-';
  name = prefix + name;
  if (val) {
    return el.setAttribute(name, val);
  } else {
    return el.getAttribute(name);
  }
}

let elementStyle = document.createElement('div').style;

let vendor = (() => {
  let transformNames = {
    webkit: 'webkitTransform',
    Moz: 'MozTransform',
    O: 'OTransform',
    ms: 'msTransform',
    standard: 'transform'
  };

  for (let key in transformNames) {
    if (elementStyle[transformNames[key]] !== undefined) {
      return key;
    }
  }
  return false;
})();

export function prefixStyle (style) {
  if (vendor === false) {
    return false;
  }

  if (vendor === 'standard') {
    return style;
  }
  return vendor + style.charAt(0).toUpperCase() + style.substring(1);
}

export class Matrix {
  constructor(matrix) {
    if (matrix) {
      let val = this._prefixMatrix(matrix);
      this._a = Number(val[0]);
      this._b = Number(val[1]);
      this._c = Number(val[2]);
      this._d = Number(val[3]);
      this._e = Number(val[4]);
      this._f = Number(val[5]);
    } else {
      this._a = 0;
      this._b = 0;
      this._c = 0;
      this._d = 0;
      this._e = 0;
      this._f = 0;
    }
  }

  /**
   * 矩阵字符串解析
   * @param matrix
   * @returns {Array}
   * @private
   */
  _prefixMatrix(matrix) {
    if (typeof matrix === 'string') {
      let str = matrix.substring(7, matrix.length - 1);
      return str.split(',');
    }
  }

  /**
   * 矩阵叠加方法
   * @param matrix 叠加的矩阵
   * @returns {Matrix} Matrix对象
   */
  superposeMatrix(matrix) {
    let tempMatrix = new Matrix();
    tempMatrix.a = this.a * matrix.a + this.b * matrix.c;
    tempMatrix.b = this.a * matrix.b + this.b * matrix.d;
    tempMatrix.c = this.c * matrix.a + this.d * matrix.c;
    tempMatrix.d = this.c * matrix.b + this.d * matrix.d;
    tempMatrix.e = this.e * matrix.a + this.f * matrix.c + matrix.e;
    tempMatrix.f = this.e * matrix.b + this.f * matrix.d + matrix.f;
    return tempMatrix;
  }

  /**
   * toString方法
   * @returns {string}
   */
  toMatrixString() {
    return `matrix(${this.a}, ${this.b}, ${this.c}, ${this.d}, ${this.e}, ${this.f})`;
  }

  /**
   * 旋转
   * @param angle 旋转角度
   * @returns {Matrix} Matrix对象
   */
  rotateMatrix(angle) {
    if (angle >= -360 && angle <= 360) {
      let cosVal = Math.cos(angle * Math.PI / 180).toFixed(6);
      let sinVal = Math.sin(angle * Math.PI / 180).toFixed(6);
      let tempMatrix = new Matrix();
      tempMatrix.a = cosVal;
      tempMatrix.b = sinVal;
      tempMatrix.c = -sinVal;
      tempMatrix.d = cosVal;
      tempMatrix.e = 0;
      tempMatrix.f = 0;
      return this.superposeMatrix(tempMatrix);
    } else {
      throw new Error('this angle is illegal, it should be between -360 and 360');
    }
  }

  /**
   * 平移
   * @param x X轴平移距离
   * @param y Y轴平移距离
   * @returns {Matrix} Matrix对象
   */
  translationMatrix(x = 0, y = 0) {
    this.e += x;
    this.f += y;
    return this;
  }

  /**
   * 缩放
   * @param ratio 比例值
   * @returns {Matrix} Matrix对象
   */
  scaleMatrix(ratio) {
    if (ratio > 0) {
      this.a = ratio * this.a;
      this.d = ratio * this.d;
      return this;
    } else {
      throw new Error('this ratio is illegal, it should be greater than 0');
    }
  }

  /**
   * 拉伸
   * @param angleX X轴拉伸角度
   * @param angleY Y轴拉伸角度
   * @returns {*} Matrix对象
   */
  skewMatrix(angleX = 0, angleY = 0) {
    if (angleX >= 0 && angleX < 90 && angleY >= 0 && angleY < 90) {
      let tanValX = Math.tan(angleX * Math.PI / 180).toFixed(6);
      let tanValY = Math.tan(angleY * Math.PI / 180).toFixed(6);
      let tempMatrix = new Matrix();
      tempMatrix.a = 1;
      tempMatrix.b = tanValY;
      tempMatrix.c = tanValX;
      tempMatrix.d = 1;
      tempMatrix.e = 0;
      tempMatrix.f = 0;
      return this.superposeMatrix(tempMatrix);
    } else {
      throw new Error('this ratio is illegal, it should be between 0 and 90');
    }
  }

  /**
   * 镜像
   * @param angle 镜像轴角度
   * @returns {Matrix} Matrix对象
   */
  image(angle) {
      let k = Math.tan(-1 * angle * Math.PI / 180);
      let ux = 1 / Math.sqrt(1 + k * k);
      let uy = k / Math.sqrt(1 + k * k);
      if (k > 1000000) {
        ux = 0;
        uy = 1;
      } else if (k < -1000000) {
        ux = 0;
        uy = -1;
      }
      let tempMatrix = new Matrix();
      tempMatrix.a = (2 * ux * ux - 1).toFixed(6);
      tempMatrix.b = (2 * ux * uy).toFixed(6);
      tempMatrix.c = (2 * ux * uy).toFixed(6);
      tempMatrix.d = (2 * uy * uy - 1).toFixed(6);
      tempMatrix.e = 0;
      tempMatrix.f = 0;
      return this.superposeMatrix(tempMatrix);
  }
  get a () {
    return this._a;
  }

  set a (value) {
    this._a = value;
  }

  get b () {
    return this._b;
  }

  set b (value) {
    this._b = value;
  }

  get c () {
    return this._c;
  }

  set c (value) {
    this._c = value;
  }

  get d () {
    return this._d;
  }

  set d (value) {
    this._d = value;
  }

  get e () {
    return this._e;
  }

  set e (value) {
    this._e = value;
  }

  get f () {
    return this._f;
  }

  set f (value) {
    this._f = value;
  }
}
