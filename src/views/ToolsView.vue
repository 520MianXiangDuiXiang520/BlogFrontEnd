<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const openCollapse = ref(1)
const commonTools = [
  { id: 1, toolName: "时间日期转换", logo: "", href: "/date_tool" },
  { id: 2, toolName: "进制转换", logo: "" },
];

const encodeTools = [
  { id: 1, toolName: "编解码", logo: "", href: "" },
  { id: 2, toolName: "哈希", logo: "", href: "" },
  { id: 3, toolName: "DES 加解密", logo: "", href: "" },
];

const otherTools = [
  { id: 1, toolName: "国家简称查询", logo: "", href: "" },
  { id: 2, toolName: "zsh 主题生成", logo: "", href: "" }
];

const toolGroup = [
  { id: 1, groupName: "基础工具", components: commonTools },
  { id: 2, groupName: "编解码/加解密", components: encodeTools },
  // { id: 3, groupName: "加解密", components: commonTools },
  { id: 4, groupName: "其他", components: otherTools },
]

function goTool(herf) {
  router.push(herf)
}
</script>

<template>
  <main>
    <div>
      <el-collapse v-model="openCollapse"  class="tool-use-bgc">
        <el-collapse-item v-for="group in toolGroup" :key="group.id" :name="group.id" class="tool-group tool-use-bgc">
          <template #title class="tool-use-bgc">
            <h2>{{ group.groupName }}</h2>

          </template>
          <el-row :gutter="10">
            <el-col v-for="c in group.components" :xs="12" :sm="4" :md="4" :lg="4" :xl="4" class="tag-item"
              @click="goTool(c.href)">
              <el-card shadow="hover">{{ c.toolName }}</el-card>
            </el-col>
          </el-row>
        </el-collapse-item>

      </el-collapse>
    </div>
  </main>
</template>

<style>
.tool-use-bgc {
  background-color: var(--bPageBgColor) !important;
}

.tool-group {
  background-color: var(--bPageBgColor);
  color: var(--bTextColor);
  margin-bottom: 18px;
  border: 0;
}

.group-title {
  margin-bottom: 36px;
}

.el-divider__text {
  background-color: var(--bPageBgColor);
}

.el-collapse-item__header {
  background-color: var(--bPageBgColor);
}

.el-collapse-item__content {
  background-color: var(--bPageBgColor);
}
</style>