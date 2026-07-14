import axios from "axios";

//const BASE_URL = 'https://api.squeezefeed.com';

//const BASE_URL = 'https://api.squeezefeed.com';
//const BASE_URL = "https://api.squeezefeed.com";

const BASE_URL = "https://api.squeezefeed.com";

const api = axios.create({
  baseURL: BASE_URL,
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  // Skip auth header for login/register
  const publicRoutes = ["/api/auth/login", "/api/auth/register"];

  const isPublic = publicRoutes.some((route) => config.url?.includes(route));

  if (token && !isPublic) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Auth
export const login = (email, password) =>
  api.post("/api/auth/login", { email, password });

export const register = (fullName, userName, email, password) =>
  api.post("/api/auth/register", { fullName, userName, email, password });

// Content
export const getFeed = (authUserId, page = 0, size = 20) =>
  api.get(
    `/api/content/feed?authUserId=${authUserId}&page=${page}&size=${size}`,
  );
export const getTrending = () => api.get("/api/content/trending");
export const getArticleById = (id) => api.get(`/api/content/${id}`);
export const getByCategory = (category) =>
  api.get(`/api/content/category/${category}`);
export const incrementShare = (id) => api.post(`/api/content/${id}/share`);

// Meme Feed
export const getMemes = () => api.get("/api/content/memes");

// Upload Meme Image
export const uploadMemeImage = (formData) =>
  api.post("/api/media/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

// Create Meme Post
export const createMemePost = (payload) =>
  api.post("/api/content/memes", payload);

// Update Meme
export const updateMeme = (memeId, payload) =>
  api.put(`/api/content/memes/${memeId}`, payload);

// Delete Meme
export const deleteMeme = (memeId) =>
  api.delete(`/api/content/memes/${memeId}`);

// Save Article
export const saveArticle = (authUserId, contentId) =>
  api.post(`/api/users/save/${authUserId}/${contentId}`);

// Unsave Article
export const unsaveArticle = (authUserId, contentId) =>
  api.delete(`/api/users/save/${authUserId}/${contentId}`);

// Get Saved Articles
export const getSavedArticles = (authUserId) =>
  api.get(`/api/users/saved/${authUserId}`);

// Track profile view
export const trackProfileView = (profileOwnerId, viewerUserId) =>
  api.post(`/api/users/track/profile-view/${profileOwnerId}/${viewerUserId}`);

// Track profile like
export const trackProfileLike = (authUserId) =>
  api.post(`/api/users/track/profile-like/${authUserId}`);

// Comments
export const getComments = (contentId) =>
  api.get(`/api/content/comments/${contentId}`);

export const createComment = (payload) =>
  api.post(`/api/content/comments`, payload);

export const likePublicProfile = (profileOwnerId, likerUserId) =>
  api.post(`/api/users/profile-like/${profileOwnerId}/${likerUserId}`);

export const updateLocation = (payload) =>
  api.post("/api/users/location", payload);

export const googleLogin = (credential) =>
  api.post("/api/auth/google", {
    credential,
  });




export const getAllFeedback = (status) =>
  api.get(`/api/users/feedback${status ? `?status=${status}` : ""}`);

export const resolveFeedback = (id) =>
  api.patch(`/api/users/feedback/${id}/resolve`);


export default api;

