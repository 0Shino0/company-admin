const router = require('koa-router')()
const util = require('../utils/util')
const Menu = require('../models/menuSchema')

router.prefix('/menu')

// 菜单列表查询
router.get('/list', async (ctx) => {
    const { menuName, menuState } = ctx.request.query;
    const params = {};
    if (menuName) params.menuName = menuName;
    if (menuState) params.menuState = menuState;
    let rootList = await Menu.find(params) || [];
    const permissionList = getTreeMenu(rootList, null, []);
    ctx.body = util.success(permissionList);
})

// 递归拼接树形列表
function getTreeMenu(rootList, id, list) {
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
        getTreeMenu(rootList, item._id, item.children)
        // 当 children没有值时，舍去
        if (item.children.length == 0) {
            delete item.children;
        } else if (item.children.length > 0 && item.children[0].menuType == 2) {
            // 快速区分按钮和菜单，用于后期做菜单按钮权限控制
            item.action = item.children;
        }
    })
    return list;
}

// 菜单编辑、 删除、 新增功能
router.post('/operate', async (ctx) => {
    // 将_id 和 action单独排除， 
    const { _id, action, ...params } = ctx.request.body;
    let res, info;
    try {

        if (action == 'add') {
            // 添加
            // 创建以params为基础的表
            res = await Menu.create(params)
            info = '创建成功'
        }
        else if (action == 'edit') {
            //编辑 
            params.updateTime = new Date();
            res = await Menu.findByIdAndUpdate(_id, params);
            info = '编辑成功'
        }
        else {
            // 删除 
            res = await Menu.findByIdAndRemove(_id)
            // $all 这个操作符跟SQL 语法的in 类似，但不同的是, in 只需满足( )内的某一个值即可, 而$all 必须满足[ ]内的所有值
            // 删除 所有的 parentId === _id 的子数据
            await Menu.deleteMany({ parentId: { $all: [_id] } })
            info = '删除成功'
        }
        ctx.body = util.success('', info);
    } catch (error) {
        ctx.body = util.fail(error.stack);
    }
})

module.exports = router;