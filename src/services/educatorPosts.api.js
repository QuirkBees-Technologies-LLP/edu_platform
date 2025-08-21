import axios from './axiosConfig';

// Base URL for educator posts API from environment variable
const EDUCATOR_POSTS_API = `${import.meta.env.VITE_API_BASE_URL || ''}/educator/post`;

// Helper function to get auth token
const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// Helper function to get headers with auth token
const getAuthHeaders = (contentType = 'application/json') => {
    const token = getAuthToken();
    const headers = {};
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (contentType === 'multipart/form-data') {
        headers['Content-Type'] = 'multipart/form-data';
    } else {
        headers['Content-Type'] = contentType;
    }
    
    return headers;
};

// Get all educator posts with pagination
export const getEducatorPosts = async (params = {}) => {
    const { page = 1, limit = 10, ...otherParams } = params;
    const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...otherParams
    });
    
    return axios.get(`${EDUCATOR_POSTS_API}?${queryParams}`, {
        headers: getAuthHeaders()
    });
};

// Get educator post by ID
export const getEducatorPostById = async (id) => {
    return axios.get(`${EDUCATOR_POSTS_API}/${id}`, {
        headers: getAuthHeaders()
    });
};

// Create new educator post
export const createEducatorPost = async (postData) => {
    const formData = new FormData();
    
    // Add text content
    if (postData.content) {
        formData.append('content', postData.content);
    }
    
    // Add visibility setting (matches backend field)
    if (postData.visibility) {
        formData.append('visibility', postData.visibility);
    }
    
    // Add category (matches backend field)
    if (postData.category) {
        formData.append('category', postData.category);
    }
    
    // Add images array
    if (postData.images && postData.images.length > 0) {
        postData.images.forEach((image, index) => {
            formData.append('images', image);
        });
    }
    
    // Add videos array
    if (postData.videos && postData.videos.length > 0) {
        postData.videos.forEach((video, index) => {
            formData.append('videos', video);
        });
    }
    
    // Add documents array
    if (postData.documents && postData.documents.length > 0) {
        postData.documents.forEach((document, index) => {
            formData.append('documents', document);
        });
    }
    
    return axios.post(EDUCATOR_POSTS_API, formData, {
        headers: getAuthHeaders('multipart/form-data'),
    });
};

// Update educator post
export const updateEducatorPost = async (id, postData) => {
    const formData = new FormData();
    
    // Add text content
    if (postData.content !== undefined) {
        formData.append('content', postData.content);
    }
    
    // Add visibility setting (matches backend field)
    if (postData.visibility) {
        formData.append('visibility', postData.visibility);
    }
    
    // Add category (matches backend field)
    if (postData.category) {
        formData.append('category', postData.category);
    }
    
    // Add images array
    if (postData.images && postData.images.length > 0) {
        postData.images.forEach((image, index) => {
            formData.append('images', image);
        });
    }
    
    // Add videos array
    if (postData.videos && postData.videos.length > 0) {
        postData.videos.forEach((video, index) => {
            formData.append('videos', video);
        });
    }
    
    // Add documents array
    if (postData.documents && postData.documents.length > 0) {
        postData.documents.forEach((document, index) => {
            formData.append('documents', document);
        });
    }
    
    // Add flags to remove existing media if needed
    if (postData.removeImages) {
        formData.append('removeImages', 'true');
    }
    if (postData.removeVideos) {
        formData.append('removeVideos', 'true');
    }
    if (postData.removeDocuments) {
        formData.append('removeDocuments', 'true');
    }
    
    return axios.put(`${EDUCATOR_POSTS_API}/${id}`, formData, {
        headers: getAuthHeaders('multipart/form-data'),
    });
};

// Delete educator post
export const deleteEducatorPost = async (id) => {
    return axios.delete(`${EDUCATOR_POSTS_API}/${id}`, {
        headers: getAuthHeaders()
    });
};

// Like educator post
export const likeEducatorPost = async (id) => {
    return axios.post(`${EDUCATOR_POSTS_API}/${id}/like`, {}, {
        headers: getAuthHeaders()
    });
};

// Unlike educator post
export const unlikeEducatorPost = async (id) => {
    return axios.delete(`${EDUCATOR_POSTS_API}/${id}/like`, {
        headers: getAuthHeaders()
    });
};

// Get comments for educator post
export const getEducatorPostComments = async (id, params = {}) => {
    const { page = 1, limit = 10 } = params;
    const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });
    
    return axios.get(`${EDUCATOR_POSTS_API}/${id}/comments?${queryParams}`, {
        headers: getAuthHeaders()
    });
};

// Add comment to educator post
export const addCommentToEducatorPost = async (id, commentData) => {
    return axios.post(`${EDUCATOR_POSTS_API}/${id}/comments`, commentData, {
        headers: getAuthHeaders()
    });
};

// Delete comment from educator post
export const deleteCommentFromEducatorPost = async (postId, commentId) => {
    return axios.delete(`${EDUCATOR_POSTS_API}/${postId}/comments/${commentId}`, {
        headers: getAuthHeaders()
    });
};

// Share educator post
export const shareEducatorPost = async (id, shareData = {}) => {
    return axios.post(`${EDUCATOR_POSTS_API}/${id}/share`, shareData, {
        headers: getAuthHeaders()
    });
};