<template>
  <div class="user-manage">
    <div class="query-form">
      <el-form :inline="true" ref="form" :model="user">
        <el-form-item label="用户ID" prop="userId">
          <el-input v-model="user.userId" placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item label="用户名称" prop="userName">
          <el-input
            v-model="user.userName"
            placeholder="请输入用户名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="state">
          <el-select v-model="user.state" placeholder="">
            <el-option :value="0" label="所有"></el-option>
            <el-option :value="1" label="在职"></el-option>
            <el-option :value="2" label="离职"></el-option>
            <el-option :value="3" label="试用期"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="handleQuery" type="primary">查询</el-button>
          <el-button @click="handleReset('form')">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="base-table">
      <div class="action">
        <el-button type="primary" @click="handleCreate">新增</el-button>
        <el-button type="danger" @click="handlePatchDel">批量删除</el-button>
      </div>

      <el-table :data="userList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column
          v-for="item in columns"
          :key="item.prop"
          :prop="item.prop"
          :label="item.label"
          :width="item.width"
          :formatter="item.formatter"
        >
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button @click="handlEdit(scope.row)" size="mini"
              >编辑</el-button
            >
            <el-button type="danger" size="mini" @click="handleDel(scope.row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="pagination"
        background
        layout="prev, pager, next, jumper"
        :page-size="pager.pageSize"
        :total="pager.total"
        @current-change="handleCurrentChange"
      />
    </div>
    <el-dialog title="用户新增" v-model="showModal">
      <el-form
        ref="dialogForm"
        :model="userForm"
        label-width="100px"
        :rules="rules"
      >
        <el-form-item label="用户名" prop="userName">
          <el-input
            v-model="userForm.userName"
            :disabled="action === 'edit'"
            placeholder="请输入用户名称"
          />
        </el-form-item>
        <el-form-item label="邮箱" prop="userEmail">
          <el-input
            v-model="userForm.userEmail"
            :disabled="action === 'edit'"
            placeholder="请输入邮箱"
          >
            <!-- 定义插槽 处理邮箱后缀-->
            <template #append>@imooc.com</template>
          </el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="userForm.mobile" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="岗位" prop="job">
          <el-input v-model="userForm.job" placeholder="请输入岗位" />
        </el-form-item>
        <el-form-item label="状态" prop="state">
          <el-select v-model="userForm.state">
            <el-option :value="1" label="在职"></el-option>
            <el-option :value="2" label="离职"></el-option>
            <el-option :value="3" label="试用期"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="系统角色" prop="roleList">
          <el-select
            v-model="userForm.roleList"
            placeholder="请选择用户系统角色"
            multiple
            style="width: 100%"
          >
            <el-option
              v-for="role in roleList"
              :key="role._id"
              :label="role.roleName"
              :value="role._id"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="部门" prop="deptId">
          <el-cascader
            v-model="userForm.deptId"
            placeholder="请选择所属部门"
            :options="deptList"
            :props="{ checkStrictly: true, value: '_id', label: 'deptName' }"
            clearable
            style="width: 100%"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取 消</el-button>
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { getCurrentInstance, onMounted, reactive, ref, toRaw } from "vue";
import utils from "./../utils/utils";
export default {
  name: "user",
  setup() {
    //   获取Composition API 上下文对象
    const { ctx } = getCurrentInstance();
    // 获取全局对象
    const { $api, $message } =
      getCurrentInstance().appContext.config.globalProperties;
    // 初始化分页对象
    const pager = reactive({
      pageNum: 1,
      pageSize: 10,
    });
    // 初始化用户表单对象
    const user = reactive({
      state: 1,
    });
    //定义动态表格-格式
    const columns = reactive([
      {
        label: "用户ID",
        prop: "userId",
      },
      {
        label: "用户名",
        prop: "userName",
      },
      {
        label: "用户邮箱",
        prop: "userEmail",
      },
      {
        // formatter 属性，它用于格式化指定列的值， 接受一个 Function, 会传入两个参数：row 和 column， 可以根据自己的需求进行处理。
        label: "用户角色",
        prop: "role",
        formatter(row, column, value) {
          return {
            0: "管理员",
            1: "普通用户",
          }[value];
        },
      },
      {
        label: "用户状态",
        prop: "state",
        formatter(row, column, value) {
          return {
            1: "在职",
            2: "离职",
            3: "试用期",
          }[value];
        },
      },
      {
        label: "注册时间",
        prop: "createTime",
        width: 230,
        formatter(row, column, value) {
          return utils.formateDate(new Date(value));
        },
      },
      {
        label: "最后登录时间",
        prop: "lastLoginTime",
        width: 230,
        formatter: (row, column, value) => {
          return utils.formateDate(new Date(value));
        },
      },
    ]);
    // 初始化用户列表数据
    const userList = ref([]);
    // 选中用户列表对象
    const checkedUserIds = ref([]);
    // 弹窗显示对象
    const showModal = ref(false);
    // 新增用户Form对象
    const userForm = reactive({});
    // 定义表单校验规则
    const rules = reactive({
      userName: [
        {
          required: true,
          message: "请输入用户名称",
          trigger: "blur",
        },
      ],
      userEmail: [
        {
          required: true,
          message: "请输入用户邮箱",
          trigger: "blur",
        },
      ],
      mobile: [
        {
          // 正则表达式
          pattern:
            /^(0|86|17951)?(13[0-9]|15[012356789]|166|17[3678]|18[0-9]|14[57])[0-9]{8}$/,
          message: "请输入正确的手机号格式",
          trigger: "blur",
        },
      ],
      deptId: [
        {
          required: true,
          message: "请输入用户职位",
          trigger: "blur",
        },
      ],
    });
    // 所有角色列表
    const deptList = ref([]);
    // 所有部门列表
    const roleList = ref([]);
    // 定用户操作行为  默认 为add
    const action = ref("add");
    // 初始化接口调用
    onMounted(async () => {
      await getUserList();
      await getDeptList();
      await getRoleAllList();
    });
    // 获取用户列表
    const getUserList = async () => {
      let params = { ...user, ...pager };
      console.log(params);
      try {
        const { list, page } = await $api.getUserList(params);
        userList.value = list;
        pager.total = page.total;
      } catch (error) {}
    };
    // 查询事件，获取用户列表
    const handleQuery = () => {
      getUserList();
    };
    // 重置查询表单
    const handleReset = (form) => {
      ctx.$refs[form].resetFields();
    };
    // 分页事件处理
    const handleCurrentChange = (current) => {
      pager.pageNum = current;
      getUserList();
    };
    // 用户单个删除事件
    const handleDel = async (row) => {
      await $api.userDel({
        userIds: [row.userId],
      });
      // console.log(ctx);
      $message.success("删除成功");
      getUserList();
    };
    // 批量删除
    const handlePatchDel = async () => {
      if (checkedUserIds.value.length == 0) {
        $message.error("请选择要删除的用户");
        return;
      }
      const res = await $api.userDel({
        userIds: checkedUserIds.value,
      });
      if (res.nModified > 0) {
        // console.log(ctx);
        $message.success("删除成功");
        getUserList();
      } else {
        $message.success("修改失败");
      }
    };
    // 表格多选
    const handleSelectionChange = (list) => {
      console.log(">", list);
      let arr = [];
      list.map((item) => {
        arr.push(item.userId);
      });
      checkedUserIds.value = arr;
    };
    // 用户新增
    const handleCreate = () => {
      action.value = "add";
      showModal.value = true;
    };
    // 获取用户列表
    const getDeptList = async () => {
      let list = await $api.getDeptList();
      deptList.value = list;
    };
    // 获取用户列表
    const getRoleAllList = async () => {
      let list = await $api.getRoleAllList();
      roleList.value = list;
    };
    // 用户弹窗关闭
    const handleClose = (from) => {
      // 弹窗消失
      showModal.value = false;
      // 清空内容
      handleReset("dialogForm");
    };
    const handleSubmit = () => {
      ctx.$refs.dialogForm.validate(async (valid) => {
        if (valid) {
          // toRaw 将响应式对象 转化为普通对象
          let params = toRaw(userForm);
          // console.log(params);
          console.log(action.value);
          params.userEmail += "@immoc.com";
          params.action = action.value;
          // console.log(params);
          let res = await $api.userSubmit(params);

          showModal.value = false;
          $message.success("用户创建成功");
          handleReset("dialogForm");
          // 刷新页面
          getUserList();
        }
      });
    };
    // 用户编辑
    const handlEdit = (row) => {
      action.value = "edit";
      showModal.value = true;
      // Object.assign() 方法将所有可枚举（Object.propertyIsEnumerable() 返回 true）和自有（Object.hasOwnProperty() 返回 true）属性从一个或多个源对象复制到目标对象，返回修改后的对象。
      /**
       * Object.assign(target, ...sources)
          参数
          target
          目标对象，接收源对象属性的对象，也是修改后的返回值。
          sources
          源对象，包含将被合并的属性。

          浅拷贝
       */
      ctx.$nextTick(() => {
        // 当DOM渲染完成是调用, 此时初始状态为空
        Object.assign(userForm, row);
      });
    };
    return {
      user,
      userList,
      columns,
      pager,
      checkedUserIds,
      userForm,
      showModal,
      rules,
      deptList,
      roleList,
      action,
      getUserList,
      handleQuery,
      handleReset,
      handleCurrentChange,
      handleDel,
      handlePatchDel,
      handleSelectionChange,
      handleCreate,
      getDeptList,
      getRoleAllList,
      handleClose,
      handleSubmit,
      handlEdit,
    };
  },
};
</script>

<style lang="scss">
</style>