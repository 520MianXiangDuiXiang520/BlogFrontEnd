<script setup>
import { ref, onMounted } from 'vue'
import instance from "@/utils/request";
import { useRouter } from 'vue-router'

const router = useRouter()
const allTags = ref([])
const loading = ref(false)

// 获取标签列表
async function fetchTagsList() {
    loading.value = true
    try {
        const response = await instance.get("/tag/list")
        if (response.code === 200) {
            allTags.value = response.tags || []
        }
    } catch (error) {
        console.error('获取标签列表失败:', error)
    } finally {
        loading.value = false
    }
}

// 获取标签显示名称
function getTagDisplayName(name) {
    return name || "未命名"
}

// 跳转到首页并筛选标签
function navigateToHome(tagName) {
    router.push(`/?tag=${encodeURIComponent(tagName)}`)
}

onMounted(() => {
    fetchTagsList()
})
</script>

<template>
    <div class="tags-container">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
            <div class="loading">Loading...</div>
        </div>
        
        <!-- 标签列表 -->
        <div v-else class="tags-list">
            <div 
                v-for="tag in allTags" 
                :key="tag.name"
                class="tag-item"
                @click="navigateToHome(tag.name)"
            >
                <span class="tag-icon">#</span>
                <span class="tag-name">{{ getTagDisplayName(tag.name) }}</span>
                <span v-if="tag.count" class="tag-count">({{ tag.count }})</span>
            </div>
        </div>
        
        <!-- 空状态 -->
        <div v-if="!loading && allTags.length === 0" class="empty-state">
            <span>暂无标签</span>
        </div>
    </div>
</template>

<style scoped>
.tags-container {
    padding: 30px 20px;
}

.loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
}

.loading {
    font-size: 18px;
    color: #666;
}

.tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 30px;
}

.tag-item {
    cursor: pointer;
    transition: color 0.2s ease;
    color: var(--titleColor);
}

.tag-item:hover {
    color: #409eff;
}

.tag-item {
    display: flex;
    align-items: center;
    gap: 6px;
}

.tag-icon {
    font-size: 16px;
    color: #409eff;
    font-weight: bold;
}

.tag-name {
    font-size: 17px;
    font-weight: 500;
}

.tag-count {
    font-size: 14px;
    color: #666;
    margin-left: 4px;
}

.empty-state {
    text-align: center;
    padding: 60px 0;
    color: #666;
    font-size: 16px;
}
</style>