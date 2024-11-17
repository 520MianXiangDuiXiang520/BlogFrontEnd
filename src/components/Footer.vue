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
    <div class="footer">
        <el-row style="border-bottom-color: var(--menuBorderColor)">
            <el-col :span="8">
                <el-row>
                    <el-col :span="8">
                        <el-link :underline="false" href="https://github.com/520MianXiangDuiXiang520"
                            type="info">GitHub</el-link>
                    </el-col>
                    <el-col :span="8">
                        <el-link :underline="false" href="https://blog.csdn.net/zjbyough" type="info">CSDN</el-link>
                    </el-col>
                    <el-col :span="8">
                        <el-link :underline="false" href="mailto:15364968962@163.com" type="info">Email</el-link>
                    </el-col>
                </el-row>
            </el-col>
            <el-col :span="8">
                <el-row>
                    <el-col :span="24"><el-link :underline="false"
                            href="https://beian.miit.gov.cn/">陇ICP备20000438号-1</el-link></el-col>
                    <el-col :underline="false" :span="24"><el-link type="info">© 2019-{{ year }} JuneBao
                        </el-link></el-col>

                </el-row>
            </el-col>
            <el-col :span="8">
                <el-row>
                    <el-col :underline="false" :span="12"> <el-link href="" type="info">SiteMap</el-link></el-col>

                    <el-col v-if="!logined" :underline="false" :span="12"><el-link @click="openAdminLoginDialog()"
                            type="info">AdminLogin</el-link></el-col>
                    <el-row v-else>
                        <el-col :underline="false" :span="24"><el-link @click="doAdminLogoutReq()"
                                type="info">Logout</el-link></el-col>
                        <el-col :underline="false" :span="24"><el-link @click="goNewArticle()"
                                type="info">NewArticle</el-link></el-col>
                    </el-row>

                </el-row>
            </el-col>
        </el-row>
    </div>

    <el-dialog v-model="adminLoginDialogVisible" title="AdminLogin" width="500">
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
.el-row {
    text-align: center;
}

.footer {
    border-top-color: #1573d1;
}
</style>