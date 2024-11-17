<script setup>
import { RouterLink, RouterView } from 'vue-router'
// import Home from './components/Home.vue'
import Menu from './components/Menu.vue'
import Footar from './components/Footer.vue'



</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-header class="header">

        <Menu />

      </el-header>
      <el-main class="main">
        <RouterView class="view" />
        <!-- <Home /> -->
      </el-main>
      <el-footer class="footer">
        <Footar />
      </el-footer>
    </el-container>
  </div>
</template>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  justify-content: space-between;
  align-items: center;
  padding-left: 0px;
  padding-right: 0px;
}

.menu {
  width: 100%;
}

.common-layout {
  display: flex;
  position: absolute;
  flex-direction: column;
  min-height: 100%;
  width: 100%;
}


.main {
  padding-top: 30px;
  /* width: 100%; */
  /* margin: 80px 140px 30px 140px; */
  /* background-color: blueviolet; */
  margin-top: 80px;
  margin-bottom: 30px;
  /* align-items: flex-end; */
  justify-content: center;
  display: flex;
}

.view {
  width: 80%;
}

.footer {
  /* position: fixed; */
  margin-top: auto;
  bottom: 0;
  /* width: 100%; */
  /* background-color: aqua; */
}
</style>
