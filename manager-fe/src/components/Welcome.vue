<template>
    <div>
      <h1>Welcome - {{msg}}</h1>
      <router-link to="/login">去登录</router-link>
    </div>
</template>

<script>
   export default {
     name:'welcome',
     props:['msg']
   }


</script>

<style lang="less" scoped>
    
</style>