<template>
    <div>
        <div>这里是切换组件</div>
        <div>
            <router-link to="/linkNew/title">切换组件</router-link>
            <router-link to="/linkNew/img">切换图片组件</router-link>
            <div>
                <router-view></router-view>
            </div>
            <router-link to="/Cart">跳转到购物车组件</router-link>
            <button @click="jump">跳转到购物车页面</button>
        </div>
    </div>
</template>
<script>
export default {
    data(){
        return{
            msg:"this is a test"
        }
    },
    methods:{
        jump(){
            // this.$router.push("/Cart");
            this.$router.push({path:"/Cart?goodsId=123"});
        }
    }
}
</script>

