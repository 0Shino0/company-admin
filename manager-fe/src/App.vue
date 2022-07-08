
<template>
  <div>
    <router-view></router-view>
  </div>
</template>

<script>

  export default {
    name:'app',
    mounted(){
      // this.$storage.setItem('userInfo',{age:30,name:'yy'})
      // console.log('user=>',this.$storage.getItem("userInfo"));
      // this.$storage.clearItem("useri")
      // this.$storage.clearAll();
    }
  }
</script>

<style>

</style>
