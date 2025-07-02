<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Clock, 
  Switch, 
  DocumentCopy, 
  Lock, 
  Tools, 
  More,
  ArrowRight,
  Sort
} from '@element-plus/icons-vue'

const router = useRouter()

const openCollapse = ref([1, 2, 4]) // 默认展开所有分组
const commonTools = [
  { id: 1, toolName: "时间日期转换", logo: Clock, href: "/date_tool", desc: "时间戳转换、时区转换" },
  { id: 2, toolName: "进制转换", logo: Switch, href: "/hex_tool", desc: "二进制、八进制、十六进制转换" },
];

const encodeTools = [
  { id: 1, toolName: "Base64编解码", logo: DocumentCopy, href: "/base64_tool", desc: "Base64编码解码工具" },
  { id: 2, toolName: "哈希计算", logo: Lock, href: "/hash_tool", desc: "MD5、SHA1、SHA256等哈希算法" },
  // { id: 3, toolName: "DES 加解密", logo: "", href: "" },
];

const otherTools = [
  { id: 1, toolName: "字符串工具", logo: Sort, href: "/string_tool", desc: "字符串去重和排序功能" },
  // { id: 2, toolName: "国家简称查询", logo: "", href: "" },
  // { id: 3, toolName: "zsh 主题生成", logo: "", href: "" }
];

const toolGroup = [
  { id: 1, groupName: "基础工具", components: commonTools, icon: Tools },
  { id: 2, groupName: "编解码/加解密", components: encodeTools, icon: Lock },
  // { id: 3, groupName: "加解密", components: commonTools },
  { id: 4, groupName: "其他工具", components: otherTools, icon: More },
]

function goTool(href) {
  router.push(href)
}
</script>

<template>
  <main class="tools-container">
    <div class="tools-header">
      <h1 class="page-title">
        <el-icon class="title-icon"><Tools /></el-icon>
        实用工具集
      </h1>
      <p class="page-subtitle">为您提供各种实用的在线工具</p>
    </div>

    <div class="tools-content">
      <el-collapse v-model="openCollapse" class="tool-collapse">
        <el-collapse-item 
          v-for="group in toolGroup" 
          :key="group.id" 
          :name="group.id" 
          class="tool-group"
        >
          <template #title>
            <div class="group-header">
              <el-icon class="group-icon" v-if="group.icon">
                <component :is="group.icon" />
              </el-icon>
              <h2 class="group-title">{{ group.groupName }}</h2>
              <span class="tool-count">({{ group.components.length }})</span>
            </div>
          </template>
          
          <div class="tools-grid">
            <div 
              v-for="tool in group.components" 
              :key="tool.id" 
              class="tool-card"
              @click="goTool(tool.href)"
            >
              <div class="tool-card-content">
                <div class="tool-icon-wrapper">
                  <el-icon class="tool-icon" v-if="tool.logo">
                    <component :is="tool.logo" />
                  </el-icon>
                </div>
                <div class="tool-info">
                  <h3 class="tool-name">{{ tool.toolName }}</h3>
                  <p class="tool-desc">{{ tool.desc }}</p>
                </div>
                <el-icon class="tool-arrow">
                  <ArrowRight />
                </el-icon>
              </div>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </main>
</template>

<style scoped>
.tools-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.tools-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--titleColor);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.title-icon {
  font-size: 2rem;
  color: var(--titleColor);
}

.page-subtitle {
  font-size: 1.1rem;
  color: var(--bTextColor);
  opacity: 0.8;
  margin: 0;
}

.tools-content {
  background-color: var(--bPageBgColor);
}

.tool-collapse {
  background-color: var(--bPageBgColor);
  border: none;
}

.tool-group {
  background-color: var(--bPageBgColor);
  margin-bottom: 24px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.group-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.group-icon {
  font-size: 1.2rem;
  color: var(--titleColor);
}

.group-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--bTextColor);
  margin: 0;
}

.tool-count {
  font-size: 0.9rem;
  color: var(--bTextColor);
  opacity: 0.6;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  padding: 20px 0;
}

.tool-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.tool-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: var(--titleColor);
}

.tool-card-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.tool-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--titleColor), rgba(123, 93, 43, 0.8));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tool-icon {
  font-size: 1.5rem;
  color: white;
}

.tool-info {
  flex: 1;
  min-width: 0;
}

.tool-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--bTextColor);
  margin: 0 0 4px 0;
  line-height: 1.4;
}

.tool-desc {
  font-size: 0.9rem;
  color: var(--bTextColor);
  opacity: 0.7;
  margin: 0;
  line-height: 1.4;
}

.tool-arrow {
  font-size: 1.2rem;
  color: var(--bTextColor);
  opacity: 0.5;
  transition: all 0.3s ease;
}

.tool-card:hover .tool-arrow {
  opacity: 1;
  transform: translateX(4px);
}

/* Element Plus 组件样式覆盖 */
:deep(.el-collapse-item__header) {
  background-color: var(--bPageBgColor) !important;
  border: none !important;
  padding: 20px 24px !important;
  font-size: 1.1rem;
  font-weight: 600;
}

:deep(.el-collapse-item__content) {
  background-color: var(--bPageBgColor) !important;
  border: none !important;
  padding: 0 24px 24px 24px !important;
}

:deep(.el-collapse-item__wrap) {
  border: none !important;
}

:deep(.el-collapse) {
  border: none !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tools-container {
    padding: 16px;
  }
  
  .page-title {
    font-size: 2rem;
    margin-bottom: 16px;
    gap: 8px;
  }
  
  .title-icon {
    font-size: 1.6rem;
  }
  
  .page-subtitle {
    font-size: 1rem;
    margin-bottom: 24px;
  }
  
  .tool-group {
    margin-bottom: 16px;
  }
  
  .group-header {
    gap: 8px;
    padding: 6px 0;
  }
  
  .group-icon {
    font-size: 1rem;
  }
  
  .group-title {
    font-size: 1.1rem;
  }
  
  .tool-count {
    font-size: 0.8rem;
  }
  
  .tools-grid {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 16px 0;
  }
  
  .tool-card {
    padding: 16px;
  }
  
  .tool-card-content {
    gap: 12px;
  }
  
  .tool-icon-wrapper {
    width: 40px;
    height: 40px;
  }
  
  .tool-icon {
    font-size: 1.2rem;
  }
  
  .tool-name {
    font-size: 1rem;
  }
  
  .tool-desc {
    font-size: 0.85rem;
  }
  
  .tool-arrow {
    font-size: 1rem;
  }
  
  /* Element Plus 组件样式覆盖 */
  :deep(.el-collapse-item__header) {
    padding: 16px 20px !important;
    font-size: 1rem;
  }
  
  :deep(.el-collapse-item__content) {
    padding: 0 20px 20px 20px !important;
  }
}

@media (max-width: 480px) {
  .tools-container {
    padding: 12px;
  }
  
  .page-title {
    font-size: 1.8rem;
    flex-direction: column;
    gap: 6px;
  }
  
  .title-icon {
    font-size: 1.4rem;
  }
  
  .page-subtitle {
    font-size: 0.9rem;
    margin-bottom: 20px;
  }
  
  .tool-group {
    margin-bottom: 12px;
  }
  
  .group-header {
    gap: 6px;
    padding: 4px 0;
  }
  
  .group-icon {
    font-size: 0.9rem;
  }
  
  .group-title {
    font-size: 1rem;
  }
  
  .tool-count {
    font-size: 0.75rem;
  }
  
  .tools-grid {
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 12px 0;
  }
  
  .tool-card {
    padding: 12px;
  }
  
  .tool-card-content {
    gap: 8px;
  }
  
  .tool-icon-wrapper {
    width: 36px;
    height: 36px;
  }
  
  .tool-icon {
    font-size: 1rem;
  }
  
  .tool-name {
    font-size: 0.9rem;
  }
  
  .tool-desc {
    font-size: 0.8rem;
  }
  
  .tool-arrow {
    font-size: 0.9rem;
  }
  
  /* Element Plus 组件样式覆盖 */
  :deep(.el-collapse-item__header) {
    padding: 12px 16px !important;
    font-size: 0.9rem;
  }
  
  :deep(.el-collapse-item__content) {
    padding: 0 16px 16px 16px !important;
  }
}

@media (max-width: 360px) {
  .tools-container {
    padding: 8px;
  }
  
  .page-title {
    font-size: 1.6rem;
  }
  
  .title-icon {
    font-size: 1.2rem;
  }
  
  .page-subtitle {
    font-size: 0.85rem;
    margin-bottom: 16px;
  }
  
  .tool-group {
    margin-bottom: 8px;
  }
  
  .group-header {
    gap: 4px;
    padding: 2px 0;
  }
  
  .group-icon {
    font-size: 0.8rem;
  }
  
  .group-title {
    font-size: 0.9rem;
  }
  
  .tool-count {
    font-size: 0.7rem;
  }
  
  .tools-grid {
    gap: 6px;
    padding: 8px 0;
  }
  
  .tool-card {
    padding: 8px;
  }
  
  .tool-card-content {
    gap: 6px;
  }
  
  .tool-icon-wrapper {
    width: 32px;
    height: 32px;
  }
  
  .tool-icon {
    font-size: 0.9rem;
  }
  
  .tool-name {
    font-size: 0.85rem;
  }
  
  .tool-desc {
    font-size: 0.75rem;
  }
  
  .tool-arrow {
    font-size: 0.8rem;
  }
  
  /* Element Plus 组件样式覆盖 */
  :deep(.el-collapse-item__header) {
    padding: 8px 12px !important;
    font-size: 0.85rem;
  }
  
  :deep(.el-collapse-item__content) {
    padding: 0 12px 12px 12px !important;
  }
}

/* 深色模式适配 */
html.dark .tool-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
  border-color: rgba(255, 255, 255, 0.1);
}

html.dark .tool-card:hover {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04));
  border-color: var(--titleColor);
}
</style>