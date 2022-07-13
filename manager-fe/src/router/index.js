import { createRouter, createWebHashHistory} from 'vue-router'
import Home from '@/components/Home.vue'


const routes = [
    {
        name: 'home',
        path:'/',
        meta:{
            title:'首页'
        },
        component:Home,
        redirect:'/welcome',
        children:[
            {
            name: 'welcome',
            path:'/welcome',
            meta:{
                title:'欢迎页'
            },
            component:()=>import('@/views/Welcome.vue')
            },
            {
            name: 'user',
            path:'/user',
            meta:{
                title:'用户管理'
            },
            component:()=>import('@/views/User.vue'),
            children:[
                {
                    name: 'info',
                    path:'/info',
                    meta:{
                        title:'信息统计'
                    },
                    component:()=>import('@/views/Welcome.vue'),
                },
            ]
            },
        ]
    },
    {
        name: 'login',
        path:'/login',
        meta:{
            title:'登录'
        },
        // 路由懒加载
        component: ()=>import('@/views/Login.vue')
    }
]

const router = createRouter({
    history:createWebHashHistory(),
    routes
})

export default router;