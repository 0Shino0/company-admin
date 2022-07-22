const router = require('koa-router')()
const util = require('./../utils/util')
const Dept = require('./../models/deptSchema')

router.prefix('/dept')

// 部门树形列表
router.get('/list', async (ctx) => {
    let { deptName } = ctx.request.query;
    let params = {}
    if (deptName) params.deptName = deptName;
    let rootList = await Dept.find(params)
    if (deptName) {
        ctx.body = util.success(rootList)
    } else {
        let tressList = getTreeDept(rootList, null, [])
        ctx.body = util.success(tressList)
    }
})

// 递归拼接树形列表
function getTreeDept(rootList, id, list) {
    // 第一次遍历获取一级菜单
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
        getTreeDept(rootList, item._id, item.children)
        // 当 children没有值时，舍去
        if (item.children.length == 0) {
            delete item.children;
        }
    })
    return list;
}

// 部门操作：创建、编辑、删除
router.post('/operate', async (ctx) => {
    const { _id, action, ...params } = ctx.request.body;
    let res, info;
    try {
        if (action == 'create') {
            res = Dept.create(params)
            info = '创建成功'
        } else if (action == 'edit') {
            params.updateTime = new Date()
            res = await Dept.findByIdAndUpdate(_id, params)
            info = '编辑成功'
        } else if (action == 'delete') {
            res = await Dept.findByIdAndRemove(_id)
            await Dept.deleteMany({ parentId: { $all: [_id] } })
            info = "删除成功"
        }
        ctx.body = util.success('', info)
    } catch (error) {
        ctx.body = util.fail(error.stack)
    }
})

module.exports = router 