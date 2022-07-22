<template>
  <div class="dept-manage">
    <div class="query-form">
      <el-form ref="queryFrom" :inline="true" :model="queryFrom">
        <el-form-item label="部门名称" prop="deptName">
          <el-input
            v-model="queryFrom.deptName"
            placeholder="请输入部门名称"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button @click="getDeptList" type="primary">查询</el-button>
          <el-button @click="handleReset('queryFrom')">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="base-table">
      <div class="action">
        <el-button type="primary" @click="handleOpen">创建</el-button>
      </div>
      <el-table
        :data="deptList"
        row-key="_id"
        :tree-props="{ children: 'children' }"
        stripe
      >
        <el-table-column v-for="item in columns" :key="item.prop" v-bind="item">
        </el-table-column>
        <el-table-column label="操作" size="mini" width="180">
          <!-- 插糟 -->
          <template #default="scope">
            <el-button size="mini" @click="handleEdit(scope.row)"
              >编辑</el-button
            >
            <el-button
              size="mini"
              type="danger"
              @click="handleDel(scope.row_id)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog
      :title="action === 'create' ? '创建部门' : '编辑部门'"
      v-model="showModal"
    >
      <el-form
        ref="dialogForm"
        :model="deptForm"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="上级部门" prop="parentId">
          <el-cascader
            placeholder="请选择上级部门"
            v-model="deptForm.parentId"
            :props="{ checkStrictly: true, value: '_id', label: 'deptName' }"
            clearable
            :options="deptList"
            :show-all-levels="true"
          >
          </el-cascader>
        </el-form-item>
        <el-form-item label="部门名称" prop="deptName">
          <el-input
            v-model="deptForm.deptName"
            placeholder="请输入部门名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="负责人" prop="user">
          <el-select
            v-model="deptForm.user"
            placehoder="请选择部门负责人"
            @change="handelUser"
          >
            <el-option
              v-for="item in userList"
              :key="item.userId"
              :label="item.userName"
              :value="`${item.userId}/${item.userName}/${item.userEmail}`"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="负责人邮箱"
          prop="userEmail
        "
        >
          <el-input
            v-model="deptForm.userEmail"
            placeholder="请输入负责人邮箱"
            disabled
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span>
          <el-button @click="handleClose">取 消</el-button>
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "dept",
  data() {
    return {
      queryFrom: {
        deptName: "",
      },
      columns: [
        {
          label: "部门名称",
          prop: "deptName",
        },
        {
          label: "负责人",
          prop: "userName",
        },
        {
          label: "更新时间",
          prop: "updateTime",
        },
        {
          label: "创建时间",
          prop: "createTime",
        },
      ],
      deptList: [],
      pager: {
        pageNum: 1,
        pageSize: 10,
      },
      action: "",
      showModal: false,
      deptForm: {
        parentId: [null],
      },
      userList: [],
      rules: {
        parentId: [
          {
            required: true,
            message: "请选择上级部门",
            trigger: "blur",
          },
        ],
        deptName: [
          {
            required: true,
            message: "请选择部门名称",
            trigger: "blur",
          },
        ],
        user: [
          {
            required: true,
            message: "请选择负责人",
            trigger: "blur",
          },
        ],
      },
    };
  },
  mounted() {
    this.getDeptList();
    this.getAllUserList();
  },
  methods: {
    async getDeptList() {
      console.log(this.queryFrom);
      let list = await this.$api.getDeptList(this.queryFrom);
      this.deptList = list;
    },
    async getAllUserList() {
      this.userList = await this.$api.getAllUserList();
    },
    handelUser(val) {
      // 新语法  解构
      console.log("val", val);
      const [userId, userName, userEmail] = val.split("/");
      //   Object.assign() 方法将所有可枚举（Object.propertyIsEnumerable() 返回 true）和
      //   自有（Object.hasOwnProperty() 返回 true）属性从一个或多个源对象复制到目标对象，返回修改后的对象。
      Object.assign(this.deptForm, { userId, userName, userEmail });
    },
    // 表单重置
    handleReset(form) {
      this.$refs[form].resetFields();
    },
    handleOpen() {
      this.action = "create";
      this.showModal = true;
    },
    handleEdit(row) {
      this.action = "edit";
      this.showModal = true;
      this.$nextTick(() => {
        Object.assign(this.deptForm, row, {
          user: `${row.userId}/${row.userName}/${row.userEmail}`,
        });
      });
    },
    async handleDel(_id) {
      this.action = "delete";
      await this.$api.deptOperate({ _id, action: this.action });
      this.$message.success("删除成功");
      this.getDeptList();
    },
    handleClose() {
      this.showModal = false;
      this.handleReset("dialogForm");
    },
    handleSubmit() {
      this.$refs.dialogForm.validate(async (valid) => {
        if (valid) {
          let params = { ...this.deptForm, action: this.action };
          delete params.user;
          await this.$api.deptOperate(params);
          this.$message.success("操作成功");
          this.handleClose();
          this.getDeptList();
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
</style>