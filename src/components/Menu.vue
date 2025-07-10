<script setup>
import { useDark } from '@vueuse/core'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storage } from '@/utils/storage'
import { loadIcons } from '@/utils/icons'

const router = useRouter()
const isDark = useDark()

// 图标组件
const Sunny = ref(null)
const Moon = ref(null)

// 加载图标
onMounted(async () => {
  const icons = await loadIcons(['Sunny', 'Moon'])
  Sunny.value = icons.Sunny
  Moon.value = icons.Moon
})

function goHome() {
    router.push('/');
    router.afterEach((to, from, failure) => {
        if (to.path == '/' && from.path == '/') {
            window.location.reload();
        }
    })
    storage.remove('cur_page');
    storage.remove('page_size');
}

</script>

<template>
    <el-menu mode="horizontal" :ellipsis="false" class="menu" style=" border-bottom-color: var(--menuBorderColor)">
        <el-menu-item index="1">
            <img v-if="isDark" style="width: 40px" src="@/assets/sun-logo.png" alt="JuneBlog logo" @click="goHome()" />
            <img v-else style="width: 40px" src="@/assets/dark-logo.png" alt="JuneBlog logo" @click="goHome()" />
        </el-menu-item>
        <el-menu-item index="2">
            <RouterLink to="/tag">Tags</RouterLink>
        </el-menu-item>
        <el-menu-item index="3">
            <RouterLink to="/tools">Tools</RouterLink>
        </el-menu-item>
        <el-menu-item index="4">
            <RouterLink to="/about">About</RouterLink>
        </el-menu-item>

        <!-- <el-menu-item index="4"> -->

        <div class="el-menu-item">
            <el-switch v-model="isDark" :active-icon="Moon" :inactive-icon="Sunny" v-if="Moon && Sunny">
            </el-switch>

            <!-- <button @click="toggleDark()">
                <i inline-block align-middle i="dark:carbon-moon carbon-sun" />

                <span class="ml-2">{{ isDark ? 'Dark' : 'Light' }}</span>
            </button> -->
        </div>

        <!-- </el-menu-item> -->

    </el-menu>

</template>

<script lang="ts" setup>

</script>

<style>
.el-menu--horizontal>.el-menu-item:nth-child(1) {
    margin-right: auto;
}

.menu {
    background-color: rgba(25, 25, 25, 0);
    /* backdrop-filter: blur(7px);  */
    /* background: transparent;  */
    /* border: 1px solid var(--el-border-color-light); */

    background-image: radial-gradient(transparent 1px, var(--bPageBgColor) 1px);
    background-size: 4px 4px;
    backdrop-filter: saturate(50%) blur(7px);
}

a {
    text-decoration: none;
}
</style>