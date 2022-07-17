const mongoose = require('mongoose');
const roleSchema = mongoose.Schema({
    roleName: String,
    remark: String,
    permissionList: {
        checkedKeys: [],
        halfCheckedKeys: []
    },
    updateTime: {
        type: Date,
        default: Date.now()
    },//创建时间
    createTime: {
        type: Date,
        default: Date.now()
    },//创建时间
})
// 表与表之间的类型对应，才可连接

module.exports = mongoose.model("role", roleSchema, "roles")