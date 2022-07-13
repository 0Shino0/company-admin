<template>
<!--   <div>
    <template v-for="menu in userMenu">
      <el-submenu
        v-if="
          menu.children &&
          menu.children.length > 0 &&
          menu.children[0].menuType == 1
        "
        :key="menu._id"
        :index="menu.path"
      >
        <template #title>
          <i :class="menu.icon"></i>
          <span>{{ menu.menuName }}</span>
        </template>
        <tree-menu :userMenu="menu.children" />
      </el-submenu>
      <el-menu-item
        v-else-if="menu.menuType == 1"
        :index="menu.path"
        :key="menu._id"
        >{{ menu.menuName }}</el-menu-item
      >
    </template>
     </div> -->
     <div>
     <el-submenu index="1">
       <!-- <template #title> 等价于 <template v-slot:title> -->
       <template #title>
           <i class="el-icon-setting"></i>
           <span>系统管理</span>
       </template>
           <el-menu-item index="user">用户管理</el-menu-item>
           <el-menu-item index="1-2">菜单管理</el-menu-item>
           <el-menu-item index="1-3">角色管理</el-menu-item>
           <el-menu-item index="1-4">部门管理</el-menu-item>
     </el-submenu>
     <el-submenu index="2">
       <!-- <template #title> 等价于 <template v-slot:title> -->
       <template #title>
           <i class="el-icon-setting"></i>
           <span>审批管理</span>
       </template>
           <el-menu-item index="2-1">休假管理</el-menu-item>
           <el-menu-item index="2-2">待我审批</el-menu-item>
     </el-submenu>
     </div>
</template>


<script>
   export default {
     name:'TreeMenu',
     props:{
        //  userMenu:{
        //     type:Array,
        //     default(){
        //         return [];
        //     }
        //  }
     }
   }
</script>

<style lang="sass" scoped>
    
</style>