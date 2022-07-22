const router = require('koa-router')()
const util = require('../utils/util')
const Leave = require('../models/leaveSchema')
const Dept = require('../models/deptSchema')
const jwt = require('jsonwebtoken');
const md5 = require('md5');

router.prefix('/leave')

// 查询申请列表
router.get('/list', async (ctx) => {
  // 获取用户状态 以此过滤
  const { applyState, type } = ctx.request.query;
  // 获取分页对象
  const { page, skipIndex } = util.pager(ctx.request.query);
  // 获取token
  let authorization = ctx.request.headers.authorization;
  // 解密数据
  let { data } = util.decoded(authorization)
  console.log(data);
  try {
    let params = {};
    if (type == 'approve') {
      // 当前登录是审批人 只显示自己的休假申请

      // 显示当前审核人为 当前登录用户 的所有待审批
      if (applyState == 1 || applyState == 2) {
        params.curAuditUserName = data.userName
        params.$or = [{ applyState: 1 }, { applyState: 2 }];
      } else if (applyState > 2) {
        // 所有审批人中 包含 当前登录用户
        params = { "auditFlows.userId": data.userId, applyState }
      } else {
        // 查询所有
        params = { "auditFlows.userId": data.userId }
        if (applyState) params.applyState = applyState;

      }
    } else {
      // 当前登录不是审批人 只显示自己的休假申请
      params = {
        "applyUser.userId": data.userId
      }
    }

    const query = Leave.find(params)

    const list = await query.skip(skipIndex).limit(page.pageSize)
    // countDocuments 计算匹配的文档数 filter在数据库集合中。 
    const total = await Leave.countDocuments(params)
    ctx.body = util.success({
      page: {
        ...page,
        total
      },
      list
    })
  } catch (error) {
    ctx.body = util.fail(`查询失败:${error.stack}`)
  }
})

// 添加 作废
router.post("/operate", async (ctx) => {
  const { _id, action, ...params } = ctx.request.body;
  // 获取token
  let authorization = ctx.request.headers.authorization;
  // 解密数据
  let { data } = util.decoded(authorization)

  if (action == "create") {
    // 插入orderNo 申请单号
    let orderNo = "XJ";
    // 示例 XJ20220525
    orderNo += util.formateDate(new Date(), "yyyyMMdd");
    const total = await Leave.countDocuments()
    params.orderNo = orderNo + total

    // 获取用户上级部门负责人信息
    // 获取负责人id
    let id = data.deptId.pop() // 多职位会造成数据错误

    // 查找负责人
    // 多职位会造成数据错误
    let dept = await Dept.findById(id);
    // 获取人事部门和财务部门负责人信息
    let userList = await Dept.find({
      deptName: { $in: ['人事部门', '财务部门'] }
    });

    let auditUsers = dept.userName;

    let auditFlows = [
      { userId: dept.userId, userName: dept.userName, userEmail: dept.userEmail }
    ]
    userList.map(item => {
      auditFlows.push({
        userId: item.userId, userName: item.userName, userEmail: item.userEmail
      });
      auditUsers += ',' + item.userName
    })

    params.auditUsers = auditUsers;
    params.curAuditUserName = dept.userName;
    params.auditFlows = auditFlows;
    params.auditLogs = []
    params.applyUser = {
      userId: data.userId,
      userName: data.userName,
      userEmail: data.userEmail
    }

    let res = await Leave.create(params)
    ctx.body = util.success("", "创建成功")
  } else {
    // 根据 id 修改状态
    let res = await Leave.findByIdAndUpdate(_id, { applyState: 5 })
    ctx.body = util.success('', "操作成功")
  }

})

router.post("/approve", async (ctx) => {
  const { action, remark, _id } = ctx.request.body;
  let authorization = ctx.request.headers.authorization;
  let { data } = util.decoded(authorization)
  let params = {};
  try {
    // 
    let doc = await Leave.findById(_id);
    let auditLogs = doc.auditLogs || [];
    if (action == "refuse") {
      params.applyState = 3;
    } else {
      // 审核通过
      if (doc.auditFlows.length == doc.auditLogs.length) {
        ctx.body = util.success('当前申请已处理，请勿重复提交')
        return;
      } else if (doc.auditFlows.length == doc.auditLogs.length + 1) {
        // 优先处理审批通过
        // 审批通过
        params.applyState = 4;
      } else if (doc.auditFlows.length > doc.auditLogs.length) {
        // 审批中
        params.applyState = 2;
        // 获取 下一个审批人
        console.log(doc.auditLogs.length + 1);
        console.log(doc.auditFlows.length);
        params.curAuditUserName = doc.auditFlows[doc.auditLogs.length + 1].userName
      }
    }

    auditLogs.push({
      userId: data.userId,
      userName: data.userName,
      createTime: new Date(),
      remark,
      action: action == 'refuse' ? "审批拒绝" : "审核通过"
    })
    params.auditLogs = auditLogs;
    let res = await Leave.findByIdAndUpdate(_id, params);
    ctx.body = util.success("", "处理成功")
  } catch (error) {
    ctx.body = util.fail(`查询异常:${error.message}`)
  }


})

router.get("/count", async (ctx) => {
  let authorization = ctx.request.headers.authorization;
  let { data } = util.decoded(authorization)
  try {
    let params = {}
    params.curAuditUserName = data.userName
    params.$or = [{ applyState: 1 }, { applyState: 2 }];
    const total = await Leave.countDocuments(params)
    ctx.body = util.success(total)
  } catch (error) {
    ctx.body = util.fail(`查询异常：${error.message}`)
  }
})
module.exports = router;