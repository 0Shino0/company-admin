/**
 * 用户管理模块
 */
const router = require('koa-router')();
const User = require('./../models/userSchema');
const Counter = require('./../models/counterSchema')
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

module.exports = router;
