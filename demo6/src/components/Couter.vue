<template>
    <div>
        <button @click="increment">+</button>
        <button v-on:click="decrement">-</button>
        <p><span>{{num}}</span></p>
    </div>
</template>
<script>
export default {
    data(){
        return {
            num : 0
        }
    },
    methods:{
        increment(){
            this.num++;
        },
        decrement(){
            if(this.num > 0)this.num--;
        }
    }
}
</script>
