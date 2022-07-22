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
    const permissionList = util.getTreeMenu(rootList, null, []);
    ctx.body = util.success(permissionList);
})


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