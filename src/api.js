import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

export const api = {
  // 创建新的视频项目
  createProject: async (projectData) => {
    const response = await axios.post(`${API_URL}/projects/create`, projectData);
    return response.data;
  },

  // 创建分镜
  createShot: async (shotData) => {
    const response = await axios.post(`${API_URL}/shots`, shotData);
    return response.data;
  },

  // 获取项目列表
  getProjects: async () => {
    const response = await axios.get(`${API_URL}/projects`);
    return response.data;
  },

  // 获取项目总数
  getProjectCount: async () => {
    const response = await axios.get(`${API_URL}/projects/count`);
    return response.data;
  },

  // 搜索项目
  searchProjects: async (keyword) => {
    const response = await axios.get(`${API_URL}/projects/search/${keyword}`);
    return response.data;
  },

  // 分页获取项目列表
  getProjectsByPage: async (page, size) => {
    const response = await axios.get(`${API_URL}/projectsByPage/${page}/${size}`);
    return response.data;
  },

  // 获取项目详情
  getProject: async (projectId) => {
    const response = await axios.get(`${API_URL}/projects/${projectId}`);
    return response.data;
  },

  // 保存脚本（创建新脚本）
  saveScript: async (scriptData) => {
    if (scriptData.id) {
      // 如果有ID，说明是更新操作
      const response = await axios.post(`${API_URL}/projects/update/${scriptData.id}`, scriptData);
      return response.data;
    } else {
      // 如果没有ID，说明是创建操作
      const response = await axios.post(`${API_URL}/projects/create`, scriptData);
      return response.data;
    }
  },

  // 删除项目
  deleteProject: async (projectId) => {
    const response = await axios.delete(`${API_URL}/projects/${projectId}`);
    return response.data;
  }
}; 