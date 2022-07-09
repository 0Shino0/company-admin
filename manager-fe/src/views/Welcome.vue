<template>
    <div class="welcome">
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

<style lang="scss">
    // .welcome{

    // }
</style>