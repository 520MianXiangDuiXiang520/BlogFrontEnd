import { ElMessage } from "element-plus";

/**
 * 去掉对象中的空字符串、空数组、空对象
 * @param {Object} obj 传入的对象数据 eg: {a:1,b:''}
 * @returns {Object} egBck: {a:1}
 */
export function removeEmptyInObj(obj) {
    let newObj = {};
    if (typeof obj === "string") {
      obj = JSON.parse(obj);
    }
    if (obj instanceof Array) {
      newObj = [];
    }
    if (obj instanceof Object) {
      for (let attr in obj) {
        if (obj.hasOwnProperty(attr) && obj[attr] !== "" && obj[attr] !== null && obj[attr] !== undefined) {
          if (obj[attr] instanceof Object) {
            if (JSON.stringify(obj[attr]) === "{}" || JSON.stringify(obj[attr]) === "[]") {
              continue;
            }
            newObj[attr] = removeEmptyInObj(obj[attr]);
          } else if (
            typeof obj[attr] === "string" &&
            ((obj[attr].indexOf("{") > -1 && obj[attr].indexOf("}") > -1) ||
              (obj[attr].indexOf("[") > -1 && obj[attr].indexOf("]") > -1))
          ) {
            try {
              let attrObj = JSON.parse(obj[attr]);
              if (attrObj instanceof Object) {
                newObj[attr] = removeEmptyInObj(attrObj);
              }
            } catch (e) {
              newObj[attr] = obj[attr];
            }
          } else {
            newObj[attr] = obj[attr];
          }
        }
      }
    }
    return newObj;
  }