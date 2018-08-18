<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <p>parent:{{num}}</p>
    <Counter v-bind:num="num"></Counter>
  </div>
</template>

<script>
/*
  1、数组只能从父组件传到子组件
  2、如果要从子组件修改父组件的数据，只能使用this.$emit事件
 */
import Counter from "./Couter";
export default {
  name: 'HelloWorld',
  data () {
    return {
      num : 10,
      msg: 'Welcome to Your Vue.js App test it'
    }
  },
  components:{
    Counter
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
