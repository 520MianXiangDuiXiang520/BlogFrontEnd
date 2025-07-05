<script setup>
import { ref, computed, onMounted, nextTick, watch, onUnmounted, shallowRef } from 'vue';
import instance from "@/utils/request";
// 移除静态导入，改为动态导入
// import { MdPreview, MdCatalog } from 'md-editor-v3';
// import 'md-editor-v3/lib/preview.css';
import { useDark } from '@vueuse/core';
import { useRoute } from 'vue-router'

const route = useRoute()

const dark = useDark();
const theme = computed(() => dark.value ? 'dark' : 'default');

const id = 'preview-only';
const text = ref(`# this is test page`);
const isLoaded = ref(false); // 标记是否加载完成
const isCatalogVisible = ref(true); // 目录是否可见
const isInitialized = ref(false); // 是否已初始化
const catalogRef = ref(null); // 目录容器引用
const currentHeading = ref(''); // 当前高亮的标题
const catalogHeight = ref('calc(100vh - 120px)'); // 目录高度

// 动态导入 md-editor-v3 组件
const MdPreview = shallowRef(null);
const MdCatalog = shallowRef(null);
const isEditorLoaded = ref(false);

// 加载编辑器
const loadEditor = async () => {
    try {
        const { MdPreview: Preview, MdCatalog: Catalog } = await import('md-editor-v3');
        await import('md-editor-v3/lib/preview.css');
        MdPreview.value = Preview;
        MdCatalog.value = Catalog;
        isEditorLoaded.value = true;
    } catch (error) {
        console.error('Failed to load md-editor-v3:', error);
    }
};

// 获取目录数据
const getCatalogData = () => {
    const headings = document.querySelectorAll('.md-editor-previewOnly h1, .md-editor-previewOnly h2, .md-editor-previewOnly h3, .md-editor-previewOnly h4, .md-editor-previewOnly h5, .md-editor-previewOnly h6');
    return Array.from(headings).map((heading, index) => {
        const level = parseInt(heading.tagName.charAt(1));
        const text = heading.textContent;
        const id = heading.id || `heading-${index}`;
        if (!heading.id) {
            heading.id = id;
        }
        return { level, text, id };
    });
};

// 切换目录显示状态
const toggleCatalog = () => {
    isCatalogVisible.value = !isCatalogVisible.value;
};

// 滚动到指定标题
const scrollToHeading = (id) => {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

// 监听滚动，更新当前高亮的标题和目录高度
const updateCurrentHeading = () => {
    const headings = document.querySelectorAll('.md-editor-previewOnly h1, .md-editor-previewOnly h2, .md-editor-previewOnly h3, .md-editor-previewOnly h4, .md-editor-previewOnly h5, .md-editor-previewOnly h6');
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    let current = '';
    headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect();
        if (rect.top <= 100) { // 距离顶部100px时认为是当前标题
            current = heading.id;
        }
    });
    
    if (current !== currentHeading.value) {
        currentHeading.value = current;
        // 自动滚动目录到当前标题
        nextTick(() => {
            const activeElement = document.querySelector(`.catalog-item.active`);
            if (activeElement && catalogRef.value) {
                // 计算滚动位置，让当前标题显示在目录中间
                const catalogList = catalogRef.value.querySelector('.catalog-list');
                const activeRect = activeElement.getBoundingClientRect();
                const catalogRect = catalogList.getBoundingClientRect();
                const catalogHeight = catalogRect.height;
                const activeTop = activeElement.offsetTop;
                const scrollTop = activeTop - (catalogHeight / 2) + (activeElement.offsetHeight / 2);
                
                catalogList.scrollTo({
                    top: Math.max(0, scrollTop),
                    behavior: 'smooth'
                });
            }
        });
    }
    
    // 动态调整目录高度
    updateCatalogHeight();
};

// 更新目录高度
const updateCatalogHeight = () => {
    const viewportHeight = window.innerHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const documentHeight = document.documentElement.scrollHeight;
    const footerHeight = 60; // footer高度
    const headerHeight = 60; // header高度
    
    // 如果页面内容不足以滚动到底部，目录高度为视口高度减去header
    if (documentHeight <= viewportHeight) {
        catalogHeight.value = `calc(100vh - ${headerHeight}px)`;
    } else {
        // 如果页面可以滚动，根据滚动位置动态调整
        const remainingScroll = documentHeight - viewportHeight - scrollTop;
        if (remainingScroll <= footerHeight) {
            // 接近底部时，为footer留出空间
            catalogHeight.value = `calc(100vh - ${headerHeight + footerHeight}px)`;
        } else {
            // 正常滚动时，只减去header高度
            catalogHeight.value = `calc(100vh - ${headerHeight}px)`;
        }
    }
};

function articleDetailReq() {
    var api = "/article/detail/"+route.params.id;
    var params = {}

    instance
        .get(api)
        .then((res) => {
            console.log(res);
            if (res["code"] === 200) {
                text.value = res["text"];
            } else {
                text.value = "Failed to load the article. Please try again.";
            }
        })
        .catch((err) => {
            console.log(err);
            text.value = "Error loading the article.";
        })
        .finally(() => {
            isLoaded.value = true; // 数据加载完成
            // 等待DOM更新后添加滚动监听
            nextTick(() => {
                window.addEventListener('scroll', updateCurrentHeading);
                updateCurrentHeading(); // 初始化当前标题和目录高度
                isInitialized.value = true; // 标记为已初始化
            });
        });
}

onMounted(async () => {
    // 先加载编辑器，再加载文章数据
    await loadEditor();
    articleDetailReq();
})

// 组件卸载时移除事件监听
onUnmounted(() => {
    window.removeEventListener('scroll', updateCurrentHeading);
});
</script>

<template>
    <!-- 数据未加载完成时显示加载提示 -->
    <div v-if="!isLoaded || !isEditorLoaded" class="loading-container">
        <div class="loading">Loading...</div>
    </div>
    <!-- 数据加载完成后显示内容 -->
    <div v-else class="detail-container">
        <!-- 文章内容区域 -->
        <div class="article-content" :class="{ 'catalog-expanded': isCatalogVisible && isInitialized }">
            <component :is="MdPreview" :editorId="id" :modelValue="text" :theme="theme" />
        </div>
        
        <!-- 目录区域 -->
        <div class="catalog-container" :class="{ 'catalog-collapsed': !isCatalogVisible && isInitialized }" :style="{ height: catalogHeight }">
            <!-- 目录切换按钮 -->
            <div class="catalog-toggle" @click="toggleCatalog">
                <span v-if="isCatalogVisible">‹</span>
                <span v-else>›</span>
            </div>
            
            <!-- 目录内容 -->
            <div v-show="isCatalogVisible || !isInitialized" class="catalog-content" ref="catalogRef">
                <div class="catalog-title">目录</div>
                <div class="catalog-list">
                    <div
                        v-for="item in getCatalogData()"
                        :key="item.id"
                        class="catalog-item"
                        :class="{
                            'active': currentHeading === item.id,
                            [`level-${item.level}`]: true
                        }"
                        @click="scrollToHeading(item.id)"
                    >
                        {{ item.text }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.detail-container {
    display: flex;
    position: relative;
    min-height: 100vh;
}

.article-content {
    flex: 1;
    padding: 20px;
    max-width: 100%;
    transition: max-width 0.3s ease;
}

.article-content.catalog-expanded {
    max-width: calc(100% - 300px);
}

.catalog-container {
    position: fixed;
    right: 0;
    top: 60px; /* 为顶部导航栏留出空间 */
    width: 280px;
    background-color: var(--bPageBgColor);
    z-index: 1000;
    transition: transform 0.3s ease, height 0.3s ease;
}

.catalog-collapsed {
    transform: translateX(280px);
}

.catalog-toggle {
    position: absolute;
    left: -40px;
    top: 50%;
    transform: translateY(-50%);
    width: 40px;
    height: 80px;
    background-color: var(--bPageBgColor);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 8px 0 0 8px;
    font-size: 20px;
    font-weight: bold;
    color: var(--bTextColor);
    z-index: 1001;
    transition: all 0.3s ease;
}

.catalog-toggle:hover {
    background-color: rgba(255, 255, 255, 0.1);
    transform: translateY(-50%) translateX(-2px);
}

.catalog-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.catalog-title {
    padding: 20px 20px 10px 20px;
    font-size: 16px;
    font-weight: bold;
    background-color: var(--bPageBgColor);
    color: var(--bTextColor);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.catalog-list {
    flex: 1;
    overflow-y: auto;
    padding: 10px 0;
}

.catalog-item {
    padding: 8px 20px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 14px;
    line-height: 1.4;
    color: var(--bTextColor);
}

.catalog-item:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

.catalog-item.active {
    color: #10b981;
    font-weight: 600;
}

/* 不同级别的标题缩进 */
.catalog-item.level-1 {
    padding-left: 20px;
    font-weight: bold;
}

.catalog-item.level-2 {
    padding-left: 30px;
}

.catalog-item.level-3 {
    padding-left: 40px;
    font-size: 13px;
}

.catalog-item.level-4 {
    padding-left: 50px;
    font-size: 12px;
}

.catalog-item.level-5 {
    padding-left: 60px;
    font-size: 12px;
}

.catalog-item.level-6 {
    padding-left: 70px;
    font-size: 12px;
}

.loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}

.loading {
    font-size: 18px;
    color: #666;
}

/* 暗色主题下的特殊样式 */
@media (prefers-color-scheme: dark) {
    .catalog-item.active {
        color: #34d399;
        font-weight: 600;
    }
}

/* 滚动条样式 */
.catalog-list::-webkit-scrollbar {
    width: 6px;
}

.catalog-list::-webkit-scrollbar-track {
    background: transparent;
}

.catalog-list::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 3px;
}

.catalog-list::-webkit-scrollbar-thumb:hover {
    background-color: #999;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .catalog-container {
        width: 250px;
        height: calc(100vh - 120px); /* 保持与桌面版一致的高度计算 */
    }
    
    .catalog-collapsed {
        transform: translateX(250px);
    }
    
    .article-content.catalog-expanded {
        max-width: calc(100% - 250px);
    }
}

/* 保留原有样式 */
.md-editor-previewOnly {
    background-color: var(--bPageBgColor);
}
</style>