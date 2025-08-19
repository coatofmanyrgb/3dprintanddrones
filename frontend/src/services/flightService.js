import api from './api';

// Flight service using the existing api instance
export const flightService = {
  // Get all flight videos
  getVideos: async (params = {}) => {
    return api.get('/flight-videos', { params });
  },

  // Get single video with analysis
  getVideo: async (id) => {
    return api.get(`/flight-videos/${id}`);
  },

  // Get flight analysis
  getAnalysis: async (videoId) => {
    return api.get(`/flight-videos/${videoId}/analysis`);
  },

  // Upload new flight video
  uploadVideo: async (formData) => {
    return api.post('/flight-videos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        // You can use this to show upload progress
        console.log('Upload progress:', percentCompleted);
      },
    });
  },

  // Update video details
  updateVideo: async (id, data) => {
    return api.put(`/flight-videos/${id}`, data);
  },

  // Delete video
  deleteVideo: async (id) => {
    return api.delete(`/flight-videos/${id}`);
  },

  // Add annotation to video
  addAnnotation: async (videoId, annotation) => {
    return api.post(`/flight-videos/${videoId}/annotate`, annotation);
  },

  // Compare multiple flights
  compareFlights: async (videoIds) => {
    return api.post('/flight-videos/compare-analysis', { video_ids: videoIds });
  },

  // Analyze uploaded video
  analyzeVideo: async (videoId) => {
    return api.post(`/flight-videos/${videoId}/analyze`);
  },

  // Store telemetry data point
  storeTelemetryPoint: async (videoId, data) => {
    return api.post(`/flight-videos/${videoId}/telemetry`, data);
  },

  // Get flight path GeoJSON
  getFlightPath: async (videoId) => {
    return api.get(`/flight-videos/${videoId}/path`);
  },

  // Like/unlike video
  toggleLike: async (videoId) => {
    return api.post(`/flight-videos/${videoId}/like`);
  },

  // Add comment
  addComment: async (videoId, comment) => {
    return api.post(`/flight-videos/${videoId}/comments`, { comment });
  },

  // Get comments
  getComments: async (videoId, page = 1) => {
    return api.get(`/flight-videos/${videoId}/comments`, { params: { page } });
  },

  // Get user's flight stats
  getUserStats: async (userId) => {
    return api.get(`/users/${userId}/flight-stats`);
  },

  // Get featured/trending videos
  getFeaturedVideos: async () => {
    return api.get('/flight-videos/featured');
  },

  // Search videos
  searchVideos: async (query) => {
    return api.get('/flight-videos/search', { params: { q: query } });
  },

  // Get video by tag
  getVideosByTag: async (tag) => {
    return api.get('/flight-videos/tag', { params: { tag } });
  },

  // Download telemetry data
  downloadTelemetry: async (videoId, format = 'csv') => {
    return api.get(`/flight-videos/${videoId}/telemetry/download`, {
      params: { format },
      responseType: 'blob',
    });
  },

  // Get real-time telemetry stream (for WebSocket)
  getTelemetryStreamUrl: (videoId) => {
    const wsUrl = process.env.REACT_APP_API_URL?.replace('http', 'ws') || 'ws://localhost:8000/api';
    return `${wsUrl}/flight-videos/${videoId}/telemetry/stream`;
  },

  // Batch operations
  batchDelete: async (videoIds) => {
    return api.post('/flight-videos/batch-delete', { video_ids: videoIds });
  },

  // Export flight data
  exportFlightData: async (videoId, options = {}) => {
    return api.post(`/flight-videos/${videoId}/export`, options, {
      responseType: 'blob',
    });
  },
};