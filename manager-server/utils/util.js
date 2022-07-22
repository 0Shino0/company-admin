/***
 * 通用工具函数
 */
const log4js = require('./log4j')
const jwt = require('jsonwebtoken');
const CODE = {
    SUCCESS: 200,
    PARAM_ERROR: 10001, // 参数错误
    USER_ACCOUNT_ERROR: 20001, // 账号或密码错误
    USER_LOGIN_ERROR: 30001, // 用户未登录
    BUSINESS_ERROR: 40001, // 业务请求失败
    AUTH_ERROR: 500001 // 认证失败或TOKEM过期
}

// exports
module.exports = {

    /**
     * 分页结构封装
     * @param {number} pageNum 
     * @param {number} pageSize
     * @returns 
     */
    pager({ pageNum = 1, pageSize = 10 }) {
        // 转 number类型
        pageNum *= 1;
        pageSize *= 1;
        const skipIndex = (pageNum - 1) * pageSize;
        return {
            page: {
                pageNum,
                pageSize
            },
            skipIndex
        }
    },
    success(data = '', msg = '', code = CODE.SUCCESS) {
        log4js.debug(data)
        return {
            code, data, msg
        }
    },
    fail(msg = '', code = CODE.BUSINESS_ERROR, data = '') {
        log4js.debug(msg);
        return {
            code, data, msg
        }
    },
    CODE,
    // 解密
    decoded(authorization) {
        if (authorization) {
            let token = authorization.split(' ')[1]
            return jwt.verify(token, 'imooc')
        }
        return ''
    },
    // 递归拼接树形列表
    getTreeMenu(rootList, id, list) {
        for (let i = 0; i < rootList.length; i++) {
            let item = rootList[i]
            // slice() 方法返回一个新的数组对象，这一对象是一个由 begin 和 end 决定的原数组的浅拷贝（包括 begin，不包括end）。原始数组不会被改变。
            // pop() 方法从数组中删除最后一个元素，并返回该元素的值。此方法会更改数组的长度。
            // 利用slice()切割原数组，防止pop改变原有数据，从而造成数据丢失
            if (String(item.parentId.slice().pop()) == String(id)) {
                list.push(item._doc)
            }
        }
        list.map(item => {
            // 给 父菜单添加一个 children属性用于存储 子菜单
            item.children = []
            // 递归调用
            this.getTreeMenu(rootList, item._id, item.children)
            // 当 children没有值时，舍去
            if (item.children.length == 0) {
                delete item.children;
            } else if (item.children.length > 0 && item.children[0].menuType == 2) {
                // 快速区分按钮和菜单，用于后期做菜单按钮权限控制
                item.action = item.children;
            }
        })
        return list;
    },
    // 处理时间格式  yyyy-mm-dd hh:mm:ss
    formateDate(date, rule) {
        let fmt = rule || 'yyyy-MM-dd hh:mm:ss'
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, date.getFullYear());
        }
        const o = {
            // 'y+': date.getFullYear(),
            'M+': date.getMonth() + 1,
            'd+': date.getDate(),
            'h+': date.getHours(),
            'm+': date.getMinutes(),
            's+': date.getSeconds()
        }
        for (let k in o) {
            if (new RegExp(`(${k})`).test(fmt)) {
                const val = o[k] + '';
                fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? val : ('00' + val).substr(val.length));
            }
        }
        return fmt;
    },
}