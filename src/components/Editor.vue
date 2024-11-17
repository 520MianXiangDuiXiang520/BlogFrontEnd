<script setup>
import { ref, computed, reactive, onMounted, unref } from 'vue';
import { MdEditor } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
import { useDark } from '@vueuse/core';
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from "element-plus";
import instance from "@/utils/request";
import { checkAuth } from "@/utils/auth"

const buttonRef = ref()
const popoverRef = ref()
const route = useRoute();
const router = useRouter()
const dark = useDark();
const theme = computed(() => dark.value ? 'dark' : 'default');
const text = ref(`# hello JuneBao`);
const articleId = route.params.id;
const editorModeNew = articleId == 0;
const drawer = ref(false);
const drawerTitle = editorModeNew ? "New Article" : "Update Article";
const allTags = ref([]);
const selectTags = ref([]);
const newTagName = ref('')
const form = reactive({
    title: '',
    tags: [],
    abstract: '',
    text: ''
})

const onClickOutside = () => {
    unref(popoverRef).popperRef?.delayHide?.();
    tagsListReq();
}

const save = () => {
    if (!checkAuth()) { return }
    form.title = getTitleFromMD();
    form.text = text.value;
    drawer.value = true;
}

function getTitleFromMD() {
    const regex = /^# (.*)/;
    const markdownText = text.value;
    const match = markdownText.match(regex);
    return match ? match[1] : null;
}

function newArticleReq() {
    if (!checkAuth()) { return }
    var api = "/article/new";
    if (!editorModeNew) {
        api = "/article/update/" + articleId;
    }
    instance.post(api, form).then((res) => {
        console.log(res)
        if (res["code"] == 200) {
            ElMessage.success("success!!!");
            router.push('/');
            drawer.value = false;
        }
    }).catch((err) => {
        console.log(err)
    })
}

function articleDetailReq() {
    if (editorModeNew) { return }
    var api = "/article/detail/" + articleId;
    instance.get(api, {}).then((res) => {
        console.log(res)
        if (res["code"] == 200) {
            text.value = res["text"]
        }
    }).catch((err) => {
        console.log(err)
    })
}

function tagsListReq() {
    var api = "/tag/list";
    instance.get(api, {}).then((res) => {
        console.log(res)
        if (res["code"] == 200) {
            allTags.value = res["tags"]
        }
    }).catch((err) => {
        console.log(err)
    })
}

function newTagReq() {
    if (newTagName == "") {
        ElMessage.error("please input tag name");
        return;
    }

    let fail = false;
    if (Array.isArray(allTags.value)) { 
        allTags.value.forEach(x => {
            if (x.name == newTagName) {
                ElMessage.error("tag name be used!");
                fail = true;
            }
        });
    }
    if (fail) {
        return
    }
    const param = {
        "name": newTagName.value,
    }
    var api = "/tag/new";
    instance.post(api,  param).then((res) => {
        console.log(res)
        if (res["code"] == 200) {
            tagsListReq();
        }
    }).catch((err) => {
        console.log(err)
    })
}

function unChoiseTag(tag) {
    selectTags.value.splice(selectTags.value.indexOf(tag), 1)
}

function choiseTag(tag) {
    if (tagCannotBeSetlect(tag)) {
        return
    }
    selectTags.value.push(tag);
    form.tags.push(tag.id)
}

function tagCannotBeSetlect(tag) {
    return selectTags.value.indexOf(tag) >= 0;
}

onMounted(() => {
    if (!checkAuth()) { return }
    articleDetailReq();
})

</script>

<template>
    <MdEditor v-model="text" :theme="theme" @onSave="save" />

    <!-- 提交表单 -->
    <el-drawer v-model="drawer" :title="drawerTitle" direction="rtl">
        <div class="demo-drawer__content">
            <el-form :model="form" label-position="top">
                <el-form-item label="Title" :label-width="formLabelWidth">
                    <el-input v-model="form.title" autocomplete="off" />
                </el-form-item>

                <!-- 标签 -->
                <el-form-item label="Title" :label-width="formLabelWidth">
                    <el-tag v-for="tag in selectTags" closable :disable-transitions="false" @close="unChoiseTag(tag)">
                        {{ tag.name }}
                    </el-tag>
                    <el-button ref="buttonRef" class="button-new-tag" size="small" @click="onClickOutside">
                        Add Tag
                    </el-button>

                    <el-popover ref="popoverRef" :virtual-ref="buttonRef" trigger="click" title="Choise or create tag"
                        :width="400" virtual-triggering>

                        <!-- 全部标签 -->
                        <el-button v-for="tag in allTags" type="primary" size="small" class="tag-inter"
                            @click="choiseTag(tag)" :disabled="tagCannotBeSetlect(tag)">{{ tag.name
                            }}</el-button>

                        <el-row>
                            <el-col :span="19"><el-input v-model="newTagName" style="width: 100%"
                                    placeholder="Please input" clearable /></el-col>
                            <el-col :span="5"><el-button type="primary" size="small" class="btn-tag-new"
                                    @click="newTagReq">New
                                    Tag</el-button></el-col>
                        </el-row>
                    </el-popover>
                </el-form-item>


                <el-form-item label="Abstract" :label-width="formLabelWidth">
                    <el-input v-model="form.abstract" :rows="8" type="textarea" placeholder="Please input" />
                </el-form-item>

            </el-form>
            <div class="demo-drawer__footer">
                <el-button @click="drawer.value = false">Cancel</el-button>
                <el-button type="primary" @click="newArticleReq()">
                    Submit
                </el-button>
            </div>
        </div>
    </el-drawer>

</template>

<style>
.submit-bt {
    position: absolute;
    right: 50px;
    top: 120px;
}

.el-button+.el-button {
    margin-left: 7px;
}

.tag-inter {
    margin-bottom: 10px;
    margin-left: 7px;
}

.btn-tag-new {
    margin-left: 7px;
}
</style>