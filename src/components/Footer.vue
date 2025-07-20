<script setup>
import { ref, onMounted, computed } from 'vue'
import instance from "@/utils/request";
import { useCookies } from "vue3-cookies";
import { ElMessage } from "element-plus";
import { useRouter } from 'vue-router'

const router = useRouter()
const { cookies } = useCookies();

const year = ref(0);
const logined = ref(false);
const adminLoginDialogVisible = ref(false);
const adminLoginReq = ref({
    username: "",
    password: "",
})

function getYear() {
    var date = new Date();
    year.value = date.getFullYear();
}

function openAdminLoginDialog() {
    adminLoginDialogVisible.value = true;
}

function closeAdminLoginDialog() {
    adminLoginDialogVisible.value = false;
}

function doAdminLoginReq() {
    var api = "/auth/login";
    var params = {
        "username": adminLoginReq.value.username,
        "password": adminLoginReq.value.password,
    }

    instance.post(api, params).then((res) => {
        console.log(res)
        if (res["code"] == 200) {
            ElMessage.success("login success!!!");
            checkLogined();
        }
    }).catch((err) => {
        console.log(err)
    })
    adminLoginDialogVisible.value = false;
}

function doAdminLogoutReq() {
    var api = "/auth/logout";
    var params = {}

    instance.post(api, params).then((res) => {
        console.log(res)
        if (res["code"] == 200) {
            cookies.remove('SESSION_ID');
            checkLogined();
            ElMessage.success("logout success!!!")
        }
    }).catch((err) => {
        console.log(err)
    })
}

function checkLogined() {
    let session = cookies.get("SESSION_ID");
    logined.value = (session && session != "");
    console.log(session);
}

function goNewArticle() {
    router.push("/editor/0")
}

onMounted(() => {
    getYear();
    checkLogined();
})

</script>

<template>
    <footer class="footer">
        <div class="footer-content">
            <!-- 左侧：外部链接 -->
            <div class="footer-section">
                <div class="external-links">
                    <el-link :underline="false" href="https://github.com/520MianXiangDuiXiang520" type="info" size="small">
                        GitHub
                    </el-link>
                    <el-divider direction="vertical" />
                    <el-link :underline="false" href="https://blog.csdn.net/zjbyough" type="info" size="small">
                        CSDN
                    </el-link>
                    <el-divider direction="vertical" />
                    <el-link :underline="false" href="mailto:15364968962@163.com" type="info" size="small">
                        Email
                    </el-link>
                </div>
            </div>

            <!-- 中间：版权信息和备案号 -->
            <div class="footer-section">
                <div class="copyright">
                    <el-text size="small" type="info">© 2019-{{ year }} JuneBao</el-text>
                </div>
                <div class="beian">
                    <el-link :underline="false" href="https://beian.miit.gov.cn/" type="info" size="small">
                        陇ICP备20000438号-1
                    </el-link>
                </div>
            </div>

            <!-- 右侧：管理功能 -->
            <div class="footer-section">
                <div class="admin-links">
                    <el-link :underline="false" href="" type="info" size="small">SiteMap</el-link>
                    
                    <template v-if="!logined">
                        <el-divider direction="vertical" />
                        <el-link :underline="false" @click="openAdminLoginDialog()" type="info" size="small">
                            AdminLogin
                        </el-link>
                    </template>
                    
                    <template v-else>
                        <el-divider direction="vertical" />
                        <el-link :underline="false" @click="doAdminLogoutReq()" type="info" size="small">
                            Logout
                        </el-link>
                        <el-divider direction="vertical" />
                        <el-link :underline="false" @click="goNewArticle()" type="info" size="small">
                            NewArticle
                        </el-link>
                    </template>
                </div>
            </div>
        </div>
    </footer>

    <!-- 管理员登录对话框 -->
    <el-dialog v-model="adminLoginDialogVisible" title="AdminLogin" width="400" :close-on-click-modal="false">
        <el-form>
            <el-form-item label="UserName">
                <el-input v-model="adminLoginReq.username" autocomplete="off" />
            </el-form-item>
            <el-form-item label="Password">
                <el-input v-model="adminLoginReq.password" type="password" placeholder="Please input password"
                    show-password autocomplete="off" />
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="closeAdminLoginDialog()">Cancel</el-button>
                <el-button type="primary" @click="doAdminLoginReq()">
                    Login
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<style scoped>
.footer {
    margin-top: 60px;
    padding: 20px 0;
    border-top: 1px solid var(--el-border-color-lighter);
    background-color: var(--el-bg-color);
}

.footer-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
}

.footer-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

.copyright {
    text-align: center;
}

.beian {
    text-align: center;
}

.external-links {
    display: flex;
    align-items: center;
    gap: 8px;
}

.admin-links {
    display: flex;
    align-items: center;
    gap: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .footer-content {
        flex-direction: column;
        gap: 16px;
    }
    
    .footer-section {
        width: 100%;
    }
    
    .external-links,
    .admin-links {
        justify-content: center;
    }
}

/* 链接悬停效果 */
.el-link:hover {
    opacity: 0.8;
    transition: opacity 0.2s ease;
}

/* 分割线样式 */
.el-divider--vertical {
    height: 14px;
    margin: 0 4px;
}
</style>