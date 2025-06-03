<template>
  <div class="home">
    <div class="header">
      <h1>视频脚本管理</h1>
      <div class="search-box">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索项目..."
          class="search-input"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
        </el-button>
      </div>
      <el-button type="primary" @click="showCreateDialog" class="primary">
        <el-icon><Plus /></el-icon>
        创建新脚本
      </el-button>
    </div>

    <div class="project-list">
      <div v-for="project in projects" :key="project.id" class="project-card">
        <div class="project-info">
          <h3 class="project-title" :title="project.title">{{ project.title }}</h3>
          <p class="description" :title="project.description">{{ project.description }}</p>
          <div class="meta">
            <span class="duration">时长: {{ project.duration }}</span>
            <span class="tags" :title="project.tags">标签: {{ project.tags }}</span>
          </div>
          <div class="time-info">
            <div class="time-item">创建时间: {{ formatDateTime(project.createTime) }}</div>
            <div class="time-item">更新时间: {{ formatDateTime(project.updateTime) }}</div>
          </div>
        </div>
        <div class="actions">
          <button @click="editProject(project.id)" class="edit">编辑</button>
          <button @click="deleteProject(project.id)" class="delete">删除</button>
        </div>
      </div>
    </div>

    <!-- 添加分页组件 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="30"
        :total="total"
        @current-change="handleCurrentChange"
        layout="prev, pager, next, jumper"
        background
      />
    </div>

    <!-- 创建脚本对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      title="创建新脚本" 
      width="50%" 
      class="creation-dialog"
      :show-close="true"
      :close-on-click-modal="false"
    >
      <el-form :model="scriptForm" label-width="120px" class="creation-form">
        <el-form-item label="视频标题">
          <el-input 
            v-model="scriptForm.title" 
            placeholder="请输入一个吸引人的标题"
            class="modern-input"
          >
            <template #prefix>
              <el-icon><Edit /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="视频描述">
          <el-input 
            type="textarea" 
            v-model="scriptForm.description" 
            placeholder="详细描述您的视频内容"
            :rows="4"
            resize="none"
            class="modern-textarea"
          />
        </el-form-item>
        
        <el-form-item label="视频时长">
          <el-time-picker
            v-model="scriptForm.duration"
            format="HH:mm:ss"
            placeholder="选择预计时长"
            :is-range="false"
            value-format="HH:mm:ss"
            class="modern-time-picker"
          >
            <template #prefix>
              <el-icon><Timer /></el-icon>
            </template>
          </el-time-picker>
        </el-form-item>
        
        <el-form-item label="视频标签">
          <el-input 
            v-model="scriptForm.tags" 
            placeholder="输入标签，用逗号分隔"
            class="modern-input"
          >
            <template #prefix>
              <el-icon><Collection /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" plain>取消</el-button>
          <el-button type="primary" @click="createScript">
            <el-icon class="button-icon"><Check /></el-icon>
            确认创建
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../api';
import { ElMessage } from 'element-plus';
import { Edit, Plus, Timer, Collection, Check, Search } from '@element-plus/icons-vue';

// 格式化时间的函数
const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '';
  const date = new Date(dateTimeStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export default {
  name: 'Home',
  components: {
    Edit,
    Plus,
    Timer,
    Collection,
    Check,
    Search
  },
  setup() {
    const router = useRouter();
    const projects = ref([]);
    const dialogVisible = ref(false);
    const currentPage = ref(1);
    const pageSize = 30;
    const total = ref(0);
    const searchKeyword = ref('');
    const isSearching = ref(false);
    
    const scriptForm = reactive({
      title: '',
      description: '',
      duration: '',
      tags: ''
    });

    const loadProjects = async () => {
      try {
        // 获取总数和数据
        if (isSearching.value && searchKeyword.value) {
          const response = await api.searchProjects(searchKeyword.value);
          projects.value = response;
          total.value = response.length;
        } else {
          const countResponse = await api.getProjectCount();
          total.value = countResponse;
          const response = await api.getProjectsByPage(currentPage.value - 1, pageSize);
          projects.value = response;
        }
      } catch (error) {
        console.error('加载项目列表失败:', error);
        ElMessage.error('加载项目列表失败');
      }
    };

    const handleSearch = async () => {
      if (!searchKeyword.value.trim()) {
        isSearching.value = false;
        currentPage.value = 1;
        await loadProjects();
        return;
      }

      try {
        isSearching.value = true;
        currentPage.value = 1;
        await loadProjects();
      } catch (error) {
        console.error('搜索失败:', error);
        ElMessage.error('搜索失败，请重试');
      }
    };

    // 处理页码改变
    const handleCurrentChange = async (page) => {
      currentPage.value = page;
      await loadProjects();
    };

    const showCreateDialog = () => {
      dialogVisible.value = true;
      // 重置表单
      scriptForm.title = '';
      scriptForm.description = '';
      scriptForm.duration = '';
      scriptForm.tags = '';
    };

    const createScript = async () => {
      if (!scriptForm.title || !scriptForm.description) {
        ElMessage.warning('请至少填写标题和描述');
        return;
      }

      try {
        await api.createProject(scriptForm);
        ElMessage.success('创建成功');
        dialogVisible.value = false;
        await loadProjects(); // 重新加载项目列表
      } catch (error) {
        console.error('创建失败:', error);
        ElMessage.error('创建失败，请重试');
      }
    };

    const editProject = (id) => {
      router.push(`/edit/${id}`);
    };

    const deleteProject = async (id) => {
      if (!confirm('确定要删除这个项目吗？')) {
        return;
      }

      try {
        await api.deleteProject(id);
        ElMessage.success('删除成功');
        await loadProjects(); // 重新加载项目列表
      } catch (error) {
        console.error('删除项目失败:', error);
        ElMessage.error('删除项目失败');
      }
    };

    onMounted(() => {
      loadProjects();
    });

    return {
      projects,
      dialogVisible,
      scriptForm,
      showCreateDialog,
      createScript,
      editProject,
      deleteProject,
      formatDateTime,
      currentPage,
      total,
      handleCurrentChange,
      searchKeyword,
      handleSearch
    };
  }
};
</script>

<style scoped>
.home {
  padding: 20px;
  width: 100%;
  margin: 0 auto;
  overflow: visible;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header {
  width: 100%;
  max-width: 1600px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding: 0 20px;
  gap: 20px;
}

.header h1 {
  white-space: nowrap;
}

.search-box {
  flex: 1;
  max-width: 400px;
  display: flex;
  gap: 10px;
}

.search-input {
  width: 100%;
}

.project-list {
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
  padding: 20px;
  width: 100%;
  max-width: 1600px;
  justify-content: center;
}

.project-card {
  flex: 0 0 266px;
  max-width: 266px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  min-height: 154px;
  overflow: hidden;
}

.project-info {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  overflow: hidden;
  text-align: center;
}

.project-title {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 1em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  max-width: 236px;
  margin: 0 auto;
}

.description {
  color: #666;
  margin-bottom: 10px;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.9em;
  width: 100%;
  max-width: 236px;
  margin: 0 auto;
}

.meta {
  font-size: 0.85em;
  color: #888;
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: auto;
  width: 100%;
  max-width: 236px;
  margin: 0 auto;
  text-align: center;
}

.duration, .tags {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  text-align: center;
}

.time-info {
  margin: 10px auto 0;
  padding: 8px;
  background-color: rgba(255, 0, 0, 0.1);
  border-radius: 4px;
  font-size: 0.85em;
  color: #666;
  width: 100%;
  max-width: 236px;
  text-align: center;
}

.time-item {
  margin: 2px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 15px;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

button.primary {
  background: #4CAF50;
  color: white;
}

button.edit {
  background: #2196F3;
  color: white;
}

button.delete {
  background: #f44336;
  color: white;
}

button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.creation-dialog {
  border-radius: 8px;
}

.creation-form {
  padding: 20px;
}

.modern-input,
.modern-textarea,
.modern-time-picker {
  width: 100%;
}

.duration-picker {
  width: 100%;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #eee;
}

.button-icon {
  margin-right: 8px;
}

:deep(.el-time-picker) {
  width: 100%;
}

:deep(.el-input__wrapper) {
  width: 100%;
}

.pagination-container {
  width: 100%;
  max-width: 1600px;
  display: flex;
  justify-content: center;
  margin-top: 30px;
  padding: 20px 0;
}

:deep(.el-pagination) {
  --el-pagination-hover-color: #409EFF;
}

:deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
  background-color: #409EFF;
}

/* 响应式布局调整 */
@media screen and (max-width: 1600px) {
  .header, .project-list, .pagination-container {
    max-width: 1200px;
  }
}

@media screen and (max-width: 1200px) {
  .header, .project-list, .pagination-container {
    max-width: 900px;
  }
}

@media screen and (max-width: 900px) {
  .header, .project-list, .pagination-container {
    max-width: 600px;
  }
}

@media screen and (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 15px;
  }
  
  .search-box {
    max-width: 100%;
  }
}

@media screen and (max-width: 600px) {
  .project-card {
    flex: 0 0 100%;
  }
  
  .project-list {
    gap: 30px;
  }
  
  .header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
}
</style> 