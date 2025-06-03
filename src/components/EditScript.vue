<!-- video-script-creator/src/components/EditScript.vue -->
<template>
  <div class="app-container">
    <div class="content-container">
      <h1 class="main-title content-title">编辑视频脚本</h1>
      
      <div class="dashboard">
        <!-- 视频信息卡片 -->
        <div class="info-section">
          <el-card class="info-card" :body-style="{ padding: '0' }">
            <div class="info-header">
              <span class="card-title">视频信息</span>
              <el-button 
                type="primary" 
                @click="openProjectList" 
                class="list-button"
              >
                <el-icon class="button-icon"><Collection /></el-icon>
                打开脚本管理
              </el-button>
            </div>
            
            <div class="info-content">
              <el-descriptions :column="1" border>
                <el-descriptions-item label="标题" label-class-name="label-style" class="desc-item">
                  <el-input v-model="scriptForm.title" placeholder="请输入标题" />
                </el-descriptions-item>
                <el-descriptions-item label="描述" label-class-name="label-style" class="desc-item">
                  <el-input type="textarea" v-model="scriptForm.description" placeholder="请输入描述" :rows="3" />
                </el-descriptions-item>
                <el-descriptions-item label="时长" label-class-name="label-style" class="desc-item">
                  <el-time-picker
                    v-model="scriptForm.duration"
                    format="HH:mm:ss"
                    placeholder="选择预计时长"
                    :is-range="false"
                    value-format="HH:mm:ss"
                    class="modern-time-picker"
                  />
                </el-descriptions-item>
                <el-descriptions-item label="标签" label-class-name="label-style" class="desc-item">
                  <el-input v-model="scriptForm.tags" placeholder="输入标签，用逗号分隔" />
                </el-descriptions-item>
                <el-descriptions-item label="创建时间" label-class-name="label-style" class="desc-item">
                  <div class="time-info">{{ formatDateTime(scriptForm.create_time) }}</div>
                </el-descriptions-item>
                <el-descriptions-item label="更新时间" label-class-name="label-style" class="desc-item">
                  <div class="time-info">{{ formatDateTime(scriptForm.update_time) }}</div>
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </el-card>
        </div>
        
        <!-- 导出和保存按钮 -->
        <div class="action-buttons-container">
          <el-button 
            type="success" 
            @click="exportDialogue" 
            class="action-button"
          >
            导出台词
          </el-button>
          <el-button type="success" @click="exportMarkdown" class="action-button">
            <el-icon class="button-icon"><Download /></el-icon>
            导出视频脚本
          </el-button>
          <el-button type="primary" @click="saveScript" class="action-button">
            <el-icon class="button-icon"><Check /></el-icon>
            保存脚本
          </el-button>
        </div>

        <!-- 分镜表格 -->
        <div class="shot-table">
          <div class="table-header">
            <h2 class="table-title">分镜脚本</h2>
            <el-button 
              type="danger" 
              @click="handleBatchDelete" 
              :disabled="multipleSelection.length === 0"
            >
              批量删除
            </el-button>
          </div>
          
          <div class="table-container">
            <el-table 
              :data="shots" 
              border 
              style="width: 100%" 
              :cell-style="{ textAlign: 'center' }"
              :header-cell-style="{ 
                textAlign: 'center',
                background: '#f8fafc',
                color: '#475569',
                fontWeight: '600'
              }"
              class="modern-table"
              @selection-change="handleSelectionChange"
            >
              <el-table-column 
                type="selection" 
                width="40" 
                align="center"
                :selectable="() => true"
                :cell-style="{ padding: '12px 0' }"
              />
              
              <el-table-column prop="shot_id" label="编号" width="80" align="center" />
              
              <el-table-column label="画面" min-width="250">
                <template #default="scope">
                  <div class="nested-table-container">
                    <div class="nested-table-header">
                      <div class="batch-delete-container">
                        <el-button 
                          type="danger" 
                          size="small"
                          @click="handleBatchDeleteScenes(scope.row)"
                          :disabled="selectedScenes.length === 0"
                        >
                          批量删除画面
                        </el-button>
                      </div>
                    </div>
                    <el-table 
                      :data="scope.row.scenes" 
                      border 
                      class="nested-table"
                      @selection-change="handleSceneSelectionChange"
                      :cell-style="{ textAlign: 'center' }"
                    >
                      <el-table-column 
                        type="selection" 
                        width="40" 
                        align="center"
                      />
                      <el-table-column 
                        label="画面细节" 
                        align="center"
                        header-align="center"
                      >
                        <template #default="sceneScope">
                          <el-input 
                            type="textarea" 
                            v-model="sceneScope.row.content" 
                            autosize
                            class="modern-textarea content-textarea"
                            placeholder="描述画面细节..."
                          />
                        </template>
                      </el-table-column>
                    </el-table>
                    <el-button 
                      type="primary" 
                      link 
                      @click="addScene(scope.row)"
                      class="add-detail-button"
                    >
                      <el-icon><Plus /></el-icon>
                      添加画面
                    </el-button>
                  </div>
                </template>
              </el-table-column>
              
              <el-table-column label="台词" min-width="250">
                <template #default="scope">
                  <el-input 
                    type="textarea" 
                    v-model="scope.row.dialogue" 
                    autosize 
                    class="modern-textarea"
                    placeholder="输入台词内容..."
                  />
                </template>
              </el-table-column>
              
              <el-table-column label="描述" min-width="250">
                <template #default="scope">
                  <el-input 
                    type="textarea" 
                    v-model="scope.row.description" 
                    autosize 
                    class="modern-textarea"
                    placeholder="添加场景描述..."
                  />
                </template>
              </el-table-column>
              
              <el-table-column label="素材来源" min-width="250">
                <template #default="scope">
                  <div class="nested-table-container">
                    <div class="nested-table-header">
                      <div class="batch-delete-container">
                        <el-button 
                          type="danger" 
                          size="small"
                          @click="handleBatchDeleteMaterials(scope.row)"
                          :disabled="selectedMaterials.length === 0"
                        >
                          批量删除素材
                        </el-button>
                      </div>
                    </div>
                    <el-table 
                      :data="scope.row.materials" 
                      border 
                      class="nested-table"
                      @selection-change="handleMaterialSelectionChange"
                      :cell-style="{ textAlign: 'center' }"
                    >
                      <el-table-column 
                        type="selection" 
                        width="40" 
                        align="center"
                      />
                      <el-table-column 
                        label="素材网址"
                        align="center"
                        header-align="center"
                      >
                        <template #default="materialScope">
                          <el-input 
                            type="textarea" 
                            v-model="materialScope.row.content" 
                            autosize
                            class="modern-textarea content-textarea"
                            placeholder="输入素材链接..."
                          />
                        </template>
                      </el-table-column>
                    </el-table>
                    <el-button 
                      type="primary" 
                      link 
                      @click="addMaterial(scope.row)"
                      class="add-detail-button"
                    >
                      <el-icon><Plus /></el-icon>
                      添加素材
                    </el-button>
                  </div>
                </template>
              </el-table-column>
              
              <el-table-column label="备注" min-width="180">
                <template #default="scope">
                  <el-input 
                    type="textarea" 
                    v-model="scope.row.notes" 
                    autosize 
                    class="modern-textarea"
                    placeholder="添加备注..."
                  />
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 添加分镜按钮容器 -->
          <div class="add-shot-container">
            <el-button type="primary" @click="addShot" class="add-shot-button">
              <el-icon class="button-icon"><Plus /></el-icon>
              添加分镜
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, VideoPlay, Timer, Collection, Check, Download, Plus } from '@element-plus/icons-vue'
import { api } from '../api'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const scriptForm = reactive({
  title: '',
  description: '',
  duration: '',
  tags: '',
  create_time: '',
  update_time: ''
})

const shots = ref([])

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

// 在组件挂载时加载脚本数据
onMounted(async () => {
  const scriptId = route.params.id
  if (scriptId) {
    try {
      const scriptData = await api.getProject(scriptId)
      // 填充表单数据
      scriptForm.title = scriptData.title
      scriptForm.description = scriptData.description
      scriptForm.duration = scriptData.duration
      scriptForm.tags = scriptData.tags
      scriptForm.create_time = scriptData.createTime
      scriptForm.update_time = scriptData.updateTime
      
      // 转换shots数据格式
      shots.value = scriptData.shots.map((shot, index) => ({
        id: shot.id,
        shot_id: index + 1,
        scenes: shot.scenes.map(content => ({ content })),
        dialogue: shot.dialogue,
        description: shot.description,
        materials: shot.materials.map(content => ({ content })),
        notes: shot.notes
      }))
    } catch (error) {
      console.error('加载脚本数据失败:', error)
      ElMessage.error('加载脚本数据失败')
      router.push('/')
    }
  }
})

const addShot = () => {
  shots.value.push({
    id: shots.value.length + 1,
    shot_id: shots.value.length + 1,
    scenes: [{ content: '' }],
    dialogue: '',
    description: '',
    materials: [{ content: '' }],
    notes: ''
  })
}

const addScene = (row) => {
  row.scenes.push({ content: '' })
}

const addMaterial = (row) => {
  row.materials.push({ content: '' })
}

// 添加多选相关的状态
const multipleSelection = ref([])
const selectedScenes = ref([])
const selectedMaterials = ref([])

// 处理选择变化
const handleSelectionChange = (val) => {
  multipleSelection.value = val
}

const handleSceneSelectionChange = (val) => {
  selectedScenes.value = val
}

const handleMaterialSelectionChange = (val) => {
  selectedMaterials.value = val
}

// 更新分镜编号
const updateShotIds = () => {
  shots.value = shots.value.map((shot, index) => ({
    ...shot,
    id: index + 1,
    shot_id: index + 1
  }));
};

// 批量删除方法
const handleBatchDelete = async () => {
  if (multipleSelection.value.length === 0) {
    ElMessage.warning('请先选择要删除的分镜');
    return;
  }

  try {
    await ElMessageBox.confirm(
      '确定要删除选中的分镜吗？此操作不可恢复',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    // 获取要删除的分镜ID
    const selectedIds = multipleSelection.value.map(item => item.id);
    
    // 过滤掉选中的分镜
    shots.value = shots.value.filter(shot => !selectedIds.includes(shot.id));
    
    // 更新剩余分镜的编号
    updateShotIds();
    
    // 清空选择
    multipleSelection.value = [];
    ElMessage.success('删除成功');
  } catch (error) {
    // 用户点击取消
    if (error === 'cancel') {
      ElMessage({
        type: 'info',
        message: '已取消删除'
      })
    }
  }
};

// 批量删除画面
const handleBatchDeleteScenes = async (row) => {
  if (selectedScenes.value.length === 0) {
    ElMessage.warning('请先选择要删除的画面')
    return
  }

  try {
    await ElMessageBox.confirm(
      '确定要删除选中的画面吗？此操作不可恢复',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    const selectedContents = selectedScenes.value.map(item => item.content)
    row.scenes = row.scenes.filter(scene => !selectedContents.includes(scene.content))
    selectedScenes.value = []
    ElMessage.success('删除成功')
  } catch (error) {
    if (error === 'cancel') {
      ElMessage({
        type: 'info',
        message: '已取消删除'
      })
    }
  }
}

// 批量删除素材
const handleBatchDeleteMaterials = async (row) => {
  if (selectedMaterials.value.length === 0) {
    ElMessage.warning('请先选择要删除的素材')
    return
  }

  try {
    await ElMessageBox.confirm(
      '确定要删除选中的素材来源吗？此操作不可恢复',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    const selectedContents = selectedMaterials.value.map(item => item.content)
    row.materials = row.materials.filter(material => !selectedContents.includes(material.content))
    selectedMaterials.value = []
    ElMessage.success('删除成功')
  } catch (error) {
    if (error === 'cancel') {
      ElMessage({
        type: 'info',
        message: '已取消删除'
      })
    }
  }
}

// 保存脚本方法
const saveScript = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要保存当前的修改吗？',
      '保存确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
      }
    )

    const formattedShots = shots.value.map(shot => ({
      id: shot.id,
      scenes: shot.scenes.map(scene => scene.content),
      dialogue: shot.dialogue,
      description: shot.description,
      materials: shot.materials.map(material => material.content),
      notes: shot.notes
    }));

    const scriptData = {
      id: route.params.id,
      title: scriptForm.title,
      description: scriptForm.description,
      duration: scriptForm.duration,
      tags: scriptForm.tags,
      shots: formattedShots
    };
    await api.saveScript(scriptData);
    ElMessage.success('保存成功');
  } catch (error) {
    if (error === 'cancel') {
      ElMessage({
        type: 'info',
        message: '已取消保存'
      })
    } else {
      console.error('保存失败:', error);
      ElMessage.error('保存失败，请重试');
    }
  }
};

// 打开脚本管理页面
const openProjectList = () => {
  window.open('/', '_blank');
};

// 导出台词
const exportDialogue = () => {
  const dialogues = shots.value.map(shot => shot.dialogue).filter(dialogue => dialogue);
  const blob = new Blob([dialogues.join('\n')], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${scriptForm.title}.txt`;
  link.click();
};

// 导出为Markdown
const exportMarkdown = () => {
  let markdown = `# ${scriptForm.title}\n\n`
  markdown += `## 视频信息\n`
  markdown += `- 描述：${scriptForm.description}\n`
  markdown += `- 时长：${scriptForm.duration}\n`
  markdown += `- 标签：${scriptForm.tags}\n\n`
  markdown += `## 分镜表\n\n`
  
  shots.value.forEach(shot => {
    markdown += `### 分镜 ${shot.id}\n`
    markdown += `#### 画面\n`
    shot.scenes.forEach(scene => {
      markdown += `- ${scene.content}\n`
    })
    markdown += `\n#### 台词\n${shot.dialogue}\n`
    markdown += `\n#### 描述\n${shot.description}\n`
    markdown += `\n#### 素材来源\n`
    shot.materials.forEach(material => {
      markdown += `- ${material.content}\n`
    })
    markdown += `\n#### 备注\n${shot.notes}\n\n`
  })

  const blob = new Blob([markdown], { type: 'text/markdown' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${scriptForm.title}_视频脚本.md`
  link.click()
}
</script>




<style scoped>
.app-container {
  min-height: 100vh;
  width: 100%;
  margin: 0;
  padding: 0;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.content-container {
  width: 100%;
  max-width: 1800px;
  padding: 40px 20px;
  box-sizing: border-box;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.content-title {
  text-align: left;
  margin-bottom: 0;
  color: #1e293b;
  font-size: 2em;
}

.list-button {
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.button-icon {
  margin: 0;
}

.dashboard {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 24px;
  width: 100%;
  box-sizing: border-box;
}

.info-section {
  position: relative;
  margin-bottom: 30px;
}

.info-header {
  position: relative;
  padding: 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-card {
  margin-bottom: 30px;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 1.25rem;
  color: #1e293b;
  font-weight: 600;
}

.info-content {
  padding: 20px;
}

.label-style {
  background-color: #f8fafc !important;
  color: #475569 !important;
  font-weight: 500 !important;
}

.desc-item {
  padding: 16px !important;
}

.action-buttons-container {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin: 20px 0;
}

.action-button {
  font-weight: 500;
}

.shot-table {
  margin-top: 30px;
  width: 100%;
}

.table-container {
  width: 100%;
  overflow-x: auto;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.table-title {
  font-size: 1.25rem;
  color: #1e293b;
  font-weight: 600;
  margin: 0;
}

.add-shot-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-top: none;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}

.nested-table-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nested-table-header {
  display: flex;
  justify-content: center;
  padding: 4px 0;
}

.batch-delete-container {
  display: flex;
  justify-content: center;
  width: 100%;
}

.add-detail-button {
  margin-top: 8px;
  color: #3b82f6;
  font-size: 0.9em;
}

.button-icon {
  margin-right: 8px;
}

/* 优化滚动条样式 */
.table-container::-webkit-scrollbar {
  height: 8px;
}

.table-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 响应式布局调整 */
@media screen and (max-width: 1400px) {
  .content-container {
    padding: 20px 10px;
  }
  
  .dashboard {
    padding: 16px;
  }
}

@media screen and (min-width: 1920px) {
  .content-container {
    max-width: 1800px;
  }
}

@media screen and (min-width: 2560px) {
  .content-container {
    max-width: 2000px;
  }
}

.modern-textarea {
  width: 100%;
}

.content-textarea {
  word-break: break-all;
  white-space: normal;
}

:deep(.el-textarea__inner) {
  resize: none !important;
  white-space: pre-wrap !important;
  word-break: break-all !important;
  line-height: 1.5;
  padding: 8px 12px;
}

:deep(.el-textarea) {
  width: 100%;
}

:deep(.el-table .cell) {
  white-space: normal !important;
  word-break: break-all !important;
  line-height: 1.5;
}

/* 确保表格内容完整显示 */
:deep(.el-table__body-wrapper) {
  overflow-x: hidden !important;
}

/* 优化垂直间距 */
.nested-table .el-table__row {
  margin: 4px 0;
}

/* 调整文本域的外观 */
:deep(.el-textarea__inner:focus) {
  box-shadow: none;
}

:deep(.el-input__wrapper) {
  box-shadow: none !important;
  padding: 0;
}

/* 确保表格单元格高度自适应 */
:deep(.el-table__cell) {
  height: auto !important;
}

.time-info {
  color: #666;
  font-size: 0.9em;
  padding: 8px;
  background-color: rgba(255, 0, 0, 0.1);
  border-radius: 4px;
  user-select: none;
}

/* 主表格勾选列样式 */
:deep(.el-table__cell.el-table__cell--selection) {
  text-align: center !important;
  padding: 12px 0 !important;
}

:deep(.el-table__cell.el-table__cell--selection .cell) {
  padding: 0 !important;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 嵌套表格勾选列样式 */
:deep(.nested-table .el-table__cell.el-table__cell--selection) {
  padding: 0 !important;
}

:deep(.nested-table .el-table__cell.el-table__cell--selection .cell) {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 8px 0 !important;
}

:deep(.el-checkbox) {
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modern-table {
  width: 100%;
}

:deep(.el-table__cell.el-table__cell--selection) {
  text-align: center !important;
  padding: 12px 0 !important;
}

:deep(.el-table__cell.el-table__cell--selection .cell) {
  padding: 0 !important;
  display: flex;
  justify-content: center;
  align-items: center;
}

:deep(.el-checkbox) {
  margin: 0;
}

.nested-table {
  width: 100%;
}

:deep(.nested-table .el-table__cell.el-table__cell--selection) {
  text-align: center !important;
  padding: 12px 0 !important;
}

:deep(.nested-table .el-table__cell.el-table__cell--selection .cell) {
  padding: 0 !important;
  display: flex;
  justify-content: center;
  align-items: center;
}

:deep(.nested-table .el-checkbox) {
  margin: 0;
}
</style> 