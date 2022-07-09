<template>
    <div class="basic-layout">
      <div class="nav-side"></div>
      <div class="content-right">
        <div class="nav-top">
          <div class="bread">妈咪包</div>
          <div class="user">用户</div>
        </div>

        <div class="wrapper">
            <div class="main-page">
              <router-view></router-view>
            </div>
        </div>
      </div>
    </div>
</template>

<script>
   export default {
     name:'home',
   }
</script>

<style lang="scss">
  .basic-layout{
    position:relative;

    .nav-side{
      position: fixed;
      width:200px;
      height: 100vh;
      background-color: #001529;
      color: #fff;
      overflow-y: auto;
      transition: width .5s;
    }

    .content-right {
      margin-left: 200px;

      .nav-top{
        height: 50px;
        line-height: 50px;
        display: flex;
        justify-content: space-between;
        border-bottom: 1px solid #ddd;
        padding: 0 20px;
      }
      .wrapper{
        background: #eef0f3;
        padding: 20px;
        // 计算属性  计算整个页面高度，宽高包含padding值因此不需要减去40px
        height: calc(100vh - 50px);
        // background-color: #fff;
        .main-page{
          background: #fff;
          height: 100%;
        }
      }
    }
  }
</style>