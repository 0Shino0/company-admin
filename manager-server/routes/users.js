/**
 * 用户管理模块
 */
const router = require('koa-router')();
const User = require('./../models/userSchema');
const Menu = require('./../models/menuSchema');
const Counter = require('./../models/counterSchema')
const Role = require('./../models/roleSchema')
const util = require('./../utils/util');
const jwt = require('jsonwebtoken');
const md5 = require('md5');

// 前缀
router.prefix('/users')

// 用户登录
router.post('/login', async (ctx) => {

  try {
    // 解构 前端传入的数据
    const { userName, userPwd } = ctx.request.body;
    /**
     * 返回数据库指定字段 有三种方式
     * 1. 通过空格间隔 'userId userName userEmail state role deptId roleList'
     * 2. 通过json方式 { userId:1,_id:0} 1代表返回 0代表不返回
     * 3. 数据库查找  select('')
     */
    const res = await User.findOne({
      userName,
      userPwd
      // 指定返回
    }, 'userId userName userEmail state role deptId roleList')

    const data = res._doc;

    console.log('data=>', data);

    const token = jwt.sign({
      data,
    }, 'imooc', { expiresIn: '1h' })
    console.log('token=>', token);
    if (res) {
      data.token = token;
      // res.token = token;
      // 解构添加
      ctx.body = util.success(data);
    } else {
      ctx.body = util.fail("账号或密码不正确");
    }

  } catch (error) {
    ctx.body = util.fail(error.msg);
  }

})

// 查询列表
router.get('/list', async (ctx) => {
  const { userId, userName, state } = ctx.request.query;
  const { page, skipIndex } = util.pager(ctx.request.query)

  let params = {}
  if (userId) params.userId = userId;
  if (userName) params.userName = userName;
  if (state && state != '0') params.state = state;

  try {
    // 根据条件查询所有用户列表
    console.log(params);
    const query = User.find(params, { _id: 0, userPwd: 0 })
    console.log(query);
    const list = await query.skip(skipIndex).limit(page.pageSize);
    const total = await User.countDocuments(params);

    ctx.body = util.success({
      page: {
        ...page,
        total
      },
      list
    })
  } catch (error) {
    ctx.body = util.fail(`查询异常: ${error.stack}`)
  }

})

// 用户删除/ 和批量删除
router.post('/delete', async (ctx) => {
  const { userIds } = ctx.request.body;
  // mongoose 封装 更新mogodb的方法
  // User.updateMany({ $or: [{ userId: '10001' }, { state: 2 }] })
  const res = await User.updateMany({ userId: { $in: userIds } }, { state: 2 })
  if (res.nModified) {
    ctx.body = util.success(res, `共删除成功${res.nModified}条`);
    return;
  }
  ctx.body = util.fail('删除失败' + res.nModified);
})

router.post('/operate', async (ctx) => {
  console.log(ctx);
  const { userId, userName, userEmail, mobile, job, state, roleList, deptId, action } = ctx.request.body;
  if (action == 'add') {
    if (!userName || !userEmail || !deptId) {
      ctx.body = util.fail('参数错误', util.CODE.PARAM_ERROR)
      return;
    }
    // 这 $or运算符执行逻辑 OR上的操作 的数组 两个或更多 <expressions>并选择文件 满足 至少 其中一项 <expressions>. 这 $or具有以下语法： 
    const res = await User.findOne({ $or: [{ userName }, { userEmail }] }, '_id userName userEmail')
    if (res) {
      ctx.body = util.fail(`系统检测到有重复的用户，信息如下：${userName} - ${res.userEmail}`);
    } else {
      // 用来增加指定字段的数量 { $inc: { <field1>: <amount1>, <field2>: <amount2>, ... } }
      const doc = await Counter.findOneAndUpdate({ _id: 'userId' }, { $inc: { sequence_value: 1 } }, { new: true })
      // console.log('doc=>', doc);
      try {
        const user = new User({
          userId: doc.sequence_value,
          userName,
          userPwd: md5(123456),
          userEmail,
          role: 1,// 默认普通用户
          roleList,
          job,
          state,
          deptId,
          mobile
        })
        user.save();
        ctx.body = util.success('', '用户创建成功');
      } catch (error) {
        ctx.body = util.fail(error.stack, '用户创建失败');
      }
    }
  } else {
    if (!deptId) {
      ctx.body = util.fail('部门不能为空', util.CODE.PARAM_ERROR)
      return;
    }
    try {
      // 查找数据库
      const res = await User.findOneAndUpdate({ userId }, { mobile, job, state, roleList, deptId })
      ctx.body = util.success({}, '更新成功')
    } catch (error) {
      ctx.body = util.fail(error.stack, '更新失败')
    }

  }

})

// 获取全量所有用户
router.get('/all/list', async (ctx) => {
  try {
    const list = await User.find({}, "userId userName userEmail")
    ctx.body = util.success(list)
  } catch (error) {
    ctx.body = util.fail(error.stack)
  }
})

// 获取用户对应的权限菜单
router.get('/getPermissionList', async (ctx) => {
  let authorization = ctx.request.headers.authorization
  let { data } = util.decoded(authorization)
  let menuList = await getMenuList(data.role, data.roleList)
  // 深拷贝 menuList  JSON.parse(JSON.stringify(menuList))
  let actionList = getActionList(JSON.parse(JSON.stringify(menuList)))
  ctx.body = util.success({ menuList, actionList })
})

async function getMenuList(userRole, roleKeys) {
  let rootList = [];
  // 如果是管理员
  if (userRole == 0) {
    rootList = await Menu.find({}) || []
    console.log(rootList);
  }
  else {
    // 只要满足$in [] 里面的元素 都可以查询出来

    // 根据用户拥有的权限，获取权限列表
    // 现查找用户对应的角色有哪些
    let roleList = await Role.find({ _id: { $in: roleKeys } })
    let permissionList = []
    roleList.map(role => {
      let { checkedKeys, halfCheckedKeys } = role.permissionList
      permissionList = permissionList.concat([...checkedKeys, ...halfCheckedKeys])
    })
    // Set 对象允许你存储任何类型的唯一值，无论是原始值或者是对象引用。
    // 去重
    permissionList = [...new Set(permissionList)]
    // 从菜单表中查找获取 对应_id 的值
    rootList = await Menu.find({ _id: { $in: permissionList } })
    console.log(rootList);
  }
  return util.getTreeMenu(rootList, null, []);
}

function getActionList(list) {
  const actionList = []
  // deep算法
  const deep = (arr) => {
    while (arr.length) {
      // pop() 方法从数组中删除最后一个元素，并返回该元素的值。此方法会更改数组的长度。
      let item = arr.pop();
      if (item.action) {
        item.action.map(action => {
          actionList.push(action.menuCode)
        })
      }
      if (item.children && !item.action) {
        deep(item.children);
      }
    }
  };
  deep(list)
  return actionList;
}

module.exports = router;
