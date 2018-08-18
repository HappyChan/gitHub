<template>
    <div>
        <div>这里是购物车页面</div>
        <div>购物车Id是{{$route.query.goodsId}}</div>
    </div>

</template>
<script>
export default {
    data(){
        return{
            msg: "hello this is cart vue"
        }
    }
}
</script>

