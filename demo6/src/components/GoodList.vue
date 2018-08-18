<template>
    <div>
        这里是商品列表路由
        <div>商品Id{{$route.params.goodsId}}</div>  
        <div>用户名{{$route.params.userName}}</div>
        <router-link to="title">标题组件</router-link>
        <router-link to="img">图片组件</router-link>
        <div>
            <router-view></router-view>
        </div>
    </div>
</template>
/*只能使用一个根节点*/
<script>
    export default{
        data(){
            return {
                msg : "this is GoodList"
            }
        }
    }
</script>
