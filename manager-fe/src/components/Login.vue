<template>
    <div>
        <h1>Login</h1>
        <Welcome msg="123"></Welcome>
        <el-button  @click="goHome">回首页</el-button>
        <!-- <router-link to="/welcome">返回</router-link> -->
    </div>
</template>

<script>
// script setup是 Vue3 的一个新语法糖，相比于普通的语法，简化了组合式API必须return的写法，拥有更好的运行时性能。
import Welcome from './Welcome.vue'
import {useRouter} from 'vue-router'
   export default {
     name:'login',
     components:{
       Welcome
     },
     methods: {
       goHome(){
         this.$router.push('/welcome')
       }
     },
   }
</script>

<style scoped>
    
</style>