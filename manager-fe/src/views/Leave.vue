<template>
  <div class="user-manage">
    <div class="query-form">
      <el-form :inline="true" ref="form" :model="queryForm">
        <el-form-item label="审批状态" prop="applyState">
          <el-select v-model="queryForm.applyState">
            <el-option value="" label="全部"></el-option>
            <el-option :value="1" label="待审批"></el-option>
            <el-option :value="2" label="审批中"></el-option>
            <el-option :value="3" label="审批拒绝"></el-option>
            <el-option :value="4" label="审批通过"></el-option>
            <el-option :value="5" label="作废"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="getApplyList" type="primary">查询</el-button>
          <el-button @click="handleReset('form')">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="base-table">
      <div class="action">
        <el-button type="primary" @click="handleApply">申请休假</el-button>
      </div>

      <el-table :data="applyList">
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
            <el-button size="mini" @click="handleDetail(scope.row)"
              >查看</el-button
            >
            <!-- 显示包含 1,2 审批和待审批都可作废 -->
            <el-button
              type="danger"
              size="mini"
              @click="handleDelete(scope.row._id)"
              v-if="[1, 2].includes(scope.row.applyState)"
              >作废</el-button
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
    <el-dialog title="申请休假" v-model="showModal" width="70%">
      <el-form
        ref="dialogForm"
        :rules="rules"
        :model="leaveForm"
        label-width="120px"
      >
        <el-form-item label="休假类型" prop="applyType" required>
          <el-select v-model="leaveForm.applyType" :value="1">
            <!-- <el-option label="所有" :value="0"></el-option> -->
            <el-option label="事假" :value="1"></el-option>
            <el-option label="调休" :value="2"></el-option>
            <el-option label="年假" :value="3"></el-option> </el-select
          >:
        </el-form-item>
        <el-form-item label="休假" required>
          <el-row>
            <el-col :span="8">
              <el-form-item prop="startTime" required>
                <el-date-picker
                  v-model="leaveForm.startTime"
                  type="date"
                  placeholder="选择开始日期"
                  @change="(val) => handleDateChange('startTime', val)"
                />
              </el-form-item>
            </el-col>
            <el-col :span="1">-</el-col>
            <el-col :span="8">
              <el-form-item prop="endTime" required>
                <el-date-picker
                  v-model="leaveForm.endTime"
                  type="date"
                  placeholder="选择结束日期"
                  @change="(val) => handleDateChange('endTime', val)"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="休假时长" required>{{
          leaveForm.leaveTime
        }}</el-form-item>
        <el-form-item label="休假原因" prop="reasons" required>
          <el-input
            type="textarea"
            :row="3"
            placeholder="请输入休假原因"
            v-model="leaveForm.reasons"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handelClose">取 消</el-button>
          <el-button type="primary" @click="handelSubmit">确 定</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- destroy-on-close 清空缓存 -->
    <el-dialog
      title="申请休假详情"
      width="50%"
      v-model="showDetailModal"
      destroy-on-close
    >
      <el-steps
        align-center
        :active="detail.applyState > 2 ? 3 : detail.applyState"
      >
        <el-step title="待审批" />
        <el-step title="审批中" />
        <el-step title="审批通过/审批拒绝" />
      </el-steps>
      <!--  label-suffix	表单域标签的后缀 -->
      <el-form label-width="120px" label-suffix=":">
        <el-form-item label="休假类型">
          <div>{{ detail.applyTypeName }}</div>
        </el-form-item>
        <el-form-item label="休假时间">
          <div>{{ detail.time }}</div>
        </el-form-item>
        <el-form-item label="休假时间">
          <div>{{ detail.leaveTime }}</div>
        </el-form-item>
        <el-form-item label="休假原因">
          <div>{{ detail.reasons }}</div>
        </el-form-item>
        <el-form-item label="审批状态">
          <div>{{ detail.applyStateName }}</div>
        </el-form-item>
        <el-form-item label="审批人">
          <div>{{ detail.curAuditUserName }}</div>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { getCurrentInstance, onMounted, reactive, ref, toRaw } from "vue";
import utils from "../utils/utils";
export default {
  name: "leave",
  setup() {
    //   获取Composition API 上下文对象
    const { ctx } = getCurrentInstance();
    // 获取全局对象
    const { $api, $message } =
      getCurrentInstance().appContext.config.globalProperties;
    const queryForm = reactive({
      applyState: 1,
    });
    const pager = reactive({
      pageNum: 1,
      pageSize: 10,
      total: 0,
    });
    //
    const columns = reactive([
      {
        label: "单号",
        prop: "orderNo",
      },
      {
        label: "休假时间",
        prop: "leaveTime",
        formatter(row) {
          return (
            utils.formateDate(new Date(row.startTime), "yyyy-MM-dd") +
            "到" +
            utils.formateDate(new Date(row.endTime), "yyyy-MM-dd")
          );
        },
      },
      {
        label: "休假时长",
        prop: "leaveTime",
      },
      {
        // formatter 属性，它用于格式化指定列的值， 接受一个 Function, 会传入两个参数：row 和 column， 可以根据自己的需求进行处理。
        label: "休假类型",
        prop: "applyType",
        formatter(row, column, value) {
          return {
            1: "事假",
            2: "调休",
            3: "年假",
          }[value];
        },
      },
      {
        label: "休假原因",
        prop: "reasons",
      },
      {
        label: "申请时间",
        prop: "createTime",
        formatter(row, column, value) {
          return utils.formateDate(new Date(value));
        },
      },
      {
        label: "审批人",
        prop: "auditUsers",
      },
      {
        label: "当前审批人",
        prop: "curAuditUserName",
      },
      {
        label: "审批状态",
        prop: "applyState",
        formatter(row, column, value) {
          return {
            1: "待审批",
            2: "审批中",
            3: "审批拒绝",
            4: "审批通过",
            5: "作废",
          }[value];
        },
      },
    ]);
    // 申请列表
    const applyList = ref([]);
    // 操作行为
    const action = ref("create");
    // 创建休假弹框表单
    const leaveForm = reactive({
      applyType: 1,
      startTime: "",
      endTime: "",
      leaveTime: "0天",
      reasons: "",
    });
    const showModal = ref(false);
    const showDetailModal = ref(false);
    let detail = ref({});
    // 表单校验
    const rules = reactive({
      startTime: [
        {
          type: "date",
          required: true,
          message: "请输入开始日期",
          trigger: "change",
        },
      ],
      endTime: [
        {
          type: "date",
          required: true,
          message: "请输入结束日期",
          trigger: "change",
        },
      ],
      reasons: [
        {
          required: true,
          message: "请输入休假原因",
          trigger: ["change", "blur"],
        },
      ],
    });
    onMounted(() => {
      getApplyList();
    });
    // 获取申请 数据 加载申请列表
    const getApplyList = async () => {
      let params = { ...queryForm, ...pager };
      let { list, page } = await $api.getLeaveList(params);
      applyList.value = list;
      pager.total = page.total;
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
    // 点击申请休假-展示弹窗
    const handleApply = (action) => {
      showModal.value = true;
      action.value = "create";
    };
    // 获取休假时长
    const handleDateChange = (key, val) => {
      let { startTime, endTime } = leaveForm;
      // 如果有一个为空 则不计算
      if (!startTime || !endTime) return;
      if (startTime > endTime) {
        $message.error("开始日期不能晚于结束日期");
        leaveForm.leaveTime = "0天";
        setTimeout(() => {
          /* 
          data[key]适用于动态取key、key为特殊字符。
          data[key]访问的是data数组的下标为key的值（对象是可以以数组形式来访问的）。
          data[key]这里的key必须是字面量。
          */
          leaveForm[key] = "";
        });
      } else {
        leaveForm.leaveTime =
          (endTime - startTime) / (24 * 60 * 60 * 1000) + "天";
      }
    };
    // 弹窗关闭
    const handelClose = () => {
      showModal.value = false;
      handleReset("dialogForm");
    };
    // 提交 休假表单
    const handelSubmit = () => {
      ctx.$refs.dialogForm.validate(async (valid) => {
        if (valid) {
          try {
            let params = { ...leaveForm, action: action.value };
            let res = await $api.leaveOperate(params);
            $message.success("创建成功");
            handelClose();
            getApplyList();
          } catch (error) {}
        }
      });
    };
    // 作废
    const handleDetail = (row) => {
      showDetailModal.value = true;
      let data = { ...row };
      data.applyTypeName = {
        1: "事假",
        2: "调休",
        3: "年假",
      }[data.applyType];

      data.time =
        utils.formateDate(new Date(data.startTime), "yyyy-MM-dd") +
        "到" +
        utils.formateDate(new Date(data.endTime), "yyyy-MM-dd");

      data.applyStateName = {
        1: "待审批",
        2: "审批中",
        3: "审批拒绝",
        4: "审批通过",
        5: "作废",
      }[data.applyState];
      detail.value = data;
      showDetailModal.value = true;
      // getApplyList();
    };
    const handleDelete = async (_id) => {
      try {
        let params = { _id, action: "delete" };
        let res = await $api.leaveOperate(params);
        $message.success("删除成功");
        getApplyList();
      } catch (error) {}
    };
    return {
      pager,
      queryForm,
      columns,
      applyList,
      leaveForm,
      showModal,
      showDetailModal,
      detail,
      action,
      rules,
      getApplyList,
      handleReset,
      handleCurrentChange,
      handleApply,
      handelClose,
      handelSubmit,
      handleDateChange,
      handleDetail,
      handleDelete,
    };
  },
};
</script>

<style lang="scss">
</style>