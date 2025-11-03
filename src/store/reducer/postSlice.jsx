import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getEducatorPosts,
  createEducatorPost as createEducatorPostAPI,
  updateEducatorPost as updateEducatorPostAPI,
  deleteEducatorPost as deleteEducatorPostAPI,
} from "@/services/educatorPosts.api";

// Async thunks for API operations
export const fetchEducatorPosts = createAsyncThunk(
  "educatorPosts/fetchAll",
  async ({ page = 1, limit = 10, append = false }, { rejectWithValue }) => {
    try {
      const response = await getEducatorPosts({ page, limit });
      return { ...response.data, append };
    } catch (error) {
      console.error("Fetch posts error:", error); // Debug log

      // Check for JWT expired error
      if (
        error.response?.data?.error === "jwt expired" ||
        error.response?.data?.message?.includes("jwt expired")
      ) {
        // Return the full error object so we can handle it in the component
        return rejectWithValue(error.response.data);
      }

      // Handle API error responses with custom structure
      if (error.response?.data) {
        const apiError = error.response.data;

        // If the API returns a structured error response
        if (apiError.message && typeof apiError.message === "string") {
          return rejectWithValue(apiError.message);
        }

        // If the API returns a simple message string
        if (typeof apiError === "string") {
          return rejectWithValue(apiError);
        }
      }

      // Fallback error message
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch educator posts"
      );
    }
  }
);

export const createEducatorPost = createAsyncThunk(
  "educatorPosts/create",
  async (postData, { rejectWithValue }) => {
    try {
      const response = await createEducatorPostAPI(postData);

      return response.data;
    } catch (error) {
      console.error("Create post error:", error); // Debug log

      // Check for JWT expired error
      if (
        error.response?.data?.error === "jwt expired" ||
        error.response?.data?.message?.includes("jwt expired")
      ) {
        // Return the full error object so we can handle it in the component
        return rejectWithValue(error.response.data);
      }

      // Handle API error responses with custom structure
      if (error.response?.data) {
        const apiError = error.response.data;

        // If the API returns a structured error response
        if (apiError.message && typeof apiError.message === "string") {
          return rejectWithValue(apiError.message);
        }

        // If the API returns a simple message string
        if (typeof apiError === "string") {
          return rejectWithValue(apiError);
        }
      }

      // Fallback error message
      return rejectWithValue(
        error.response?.data?.message || "Failed to create educator post"
      );
    }
  }
);

export const updateEducatorPost = createAsyncThunk(
  "educatorPosts/update",
  async ({ id, postData }, { rejectWithValue }) => {
    try {
      const response = await updateEducatorPostAPI(id, postData);
      return response.data;
    } catch (error) {
      console.error("Update post error:", error); // Debug log

      // Check for JWT expired error
      if (
        error.response?.data?.error === "jwt expired" ||
        error.response?.data?.message?.includes("jwt expired")
      ) {
        // Return the full error object so we can handle it in the component
        return rejectWithValue(error.response.data);
      }

      // Handle API error responses with custom structure
      if (error.response?.data) {
        const apiError = error.response.data;

        // If the API returns a structured error response
        if (apiError.message && typeof apiError.message === "string") {
          return rejectWithValue(apiError.message);
        }

        // If the API returns a simple message string
        if (typeof apiError === "string") {
          return rejectWithValue(apiError);
        }
      }

      // Fallback error message
      return rejectWithValue(
        error.response?.data?.message || "Failed to update educator post"
      );
    }
  }
);

export const deleteEducatorPost = createAsyncThunk(
  "educatorPosts/delete",
  async (id, { rejectWithValue }) => {
    try {
      await deleteEducatorPostAPI(id);
      return id;
    } catch (error) {
      console.error("Delete post error:", error); // Debug log

      // Check for JWT expired error
      if (
        error.response?.data?.error === "jwt expired" ||
        error.response?.data?.message?.includes("jwt expired")
      ) {
        // Return the full error object so we can handle it in the component
        return rejectWithValue(error.response.data);
      }

      // Handle API error responses with custom structure
      if (error.response?.data) {
        const apiError = error.response.data;

        // If the API returns a structured error response
        if (apiError.message && typeof apiError.message === "string") {
          return rejectWithValue(apiError.message);
        }

        // If the API returns a simple message string
        if (typeof apiError === "string") {
          return rejectWithValue(apiError);
        }
      }

      // Fallback error message
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete educator post"
      );
    }
  }
);

const initialState = {
  posts: [],
  selectedPost: null,
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  pagination: {
    currentPage: 1,
    limit: 10,
    totalPages: 0,
    totalRecords: 0,
  },
  createPostStatus: "idle",
  createPostError: null,
  hasMorePosts: true,
  loadingMore: false,
};

const educatorPostSlice = createSlice({
  name: "educatorPosts",
  initialState,
  reducers: {
    setSelectedPost: (state, action) => {
      state.selectedPost = action.payload;
    },
    clearSelectedPost: (state) => {
      state.selectedPost = null;
    },
    clearCreatePostStatus: (state) => {
      state.createPostStatus = "idle";
      state.createPostError = null;
    },
    clearEducatorPostsStatus: (state) => {
      state.status = "idle";
      state.error = null;
    },
    addLocalPost: (state, action) => {
      state.posts.unshift(action.payload);
    },
    updateLocalPost: (state, action) => {
      const index = state.posts.findIndex(
        (post) => post.id === action.payload.id
      );
      if (index !== -1) {
        state.posts[index] = { ...state.posts[index], ...action.payload };
      }
    },
    removeLocalPost: (state, action) => {
      state.posts = state.posts.filter((post) => post.id !== action.payload);
    },
    likePost: (state, action) => {
      const post = state.posts.find((p) => p.id === action.payload);
      if (post) {
        post.likeCount += 1;
        post.isLiked = true;
      }
    },
    unlikePost: (state, action) => {
      const post = state.posts.find((p) => p.id === action.payload);
      if (post && post.likeCount > 0) {
        post.likeCount -= 1;
        post.isLiked = false;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch educator posts
      .addCase(fetchEducatorPosts.pending, (state, action) => {
        const isAppend = action.meta?.arg?.append;
        if (isAppend) {
          state.loadingMore = true;
        } else {
          state.status = "loading";
        }
      })
      .addCase(fetchEducatorPosts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.loadingMore = false;
        // Map backend response to frontend structure
        const postsToAdd = action.payload.posts.map((post) => ({
          id: post._id,
          content: post.content,
          author: {
            id: post.author._id,
            name:
              `${post.author.first_name || ""} ${post.author.last_name || ""}`.trim() ||
              "Anonymous User",
            first_name: post.author.first_name,
            last_name: post.author.last_name,
            role: post.author.role,
            bio: post.author.bio,
            image: post.author.image,
          },
          images: post.images?.map((img) => img.url) || [],
          videos: post.videos?.map((video) => video.url) || [],
          documents: post.documents?.map((doc) => doc.url) || [],
          hashtags: post.hashtags || [],
          mentions: post.mentions || [],
          visibility: post.visibility,
          category: post.category || "general",
          likes: post.likes || [],
          comments: post.comments || [],
          shares: post.shares || [],
          isEdited: post.isEdited || false,
          isPinned: post.isPinned || false,
          isArchived: post.isArchived || false,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          isLiked: post.isLiked || false,
          likeCount: post.likeCount || 0,
          commentCount: post.commentCount || 0,
          shareCount: post.shareCount || 0,
        }));
        if (action.payload.append) {
          state.posts = [...state.posts, ...postsToAdd];
        } else {
          state.posts = postsToAdd;
        }

        // Map pagination structure
        state.pagination = {
          currentPage: action.payload.pagination.currentPage,
          limit: action.payload.pagination.limit || 10,
          totalPages: action.payload.pagination.totalPages,
          totalRecords: action.payload.pagination.totalPosts,
        };
        state.hasMorePosts =
          state.pagination.currentPage < state.pagination.totalPages;
        state.error = null;
      })
      .addCase(fetchEducatorPosts.rejected, (state, action) => {
        state.loadingMore = false;
        state.status = "failed";
        state.error = action.payload;
      })
      // Create educator post
      .addCase(createEducatorPost.pending, (state) => {
        state.createPostStatus = "loading";
        state.createPostError = null;
      })
      .addCase(createEducatorPost.fulfilled, (state, action) => {
        state.createPostStatus = "succeeded";

        // Map backend response to frontend structure
        // Handle both old and new API response formats
        const postData = action.payload.post || action.payload;

        const newPost = {
          id: postData._id || postData.id,
          content: postData.content,
          author: {
            id: postData.author._id || postData.author.id,
            name:
              `${postData.author.first_name || ""} ${postData.author.last_name || ""}`.trim() ||
              "Anonymous User",
            first_name: postData.author.first_name,
            last_name: postData.author.last_name,
            role: postData.author.role,
            bio: postData.author.bio,
            image: postData.author.image,
          },
          images: postData.images?.map((img) => img.url || img) || [],
          videos: postData.videos?.map((video) => video.url || video) || [],
          documents: postData.documents?.map((doc) => doc.url || doc) || [],
          hashtags: postData.hashtags || [],
          mentions: postData.mentions || [],
          visibility: postData.visibility,
          category: postData.category || "general",
          likes: postData.likes || [],
          comments: postData.comments || [],
          shares: postData.shares || [],
          isEdited: postData.isEdited || false,
          isPinned: postData.isPinned || false,
          isArchived: postData.isArchived || false,
          createdAt: postData.createdAt,
          updatedAt: postData.updatedAt,
          isLiked: postData.isLiked || false,
          likeCount: postData.likeCount || 0,
          commentCount: postData.commentCount || 0,
          shareCount: postData.shareCount || 0,
        };

        state.posts.unshift(newPost);
        state.createPostError = null;
      })
      .addCase(createEducatorPost.rejected, (state, action) => {
        state.createPostStatus = "failed";
        state.createPostError = action.payload;
      })
      // Update educator post
      .addCase(updateEducatorPost.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateEducatorPost.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Map backend response to frontend structure
        // Handle both old and new API response formats
        const postData = action.payload.post || action.payload;
        const updatedPost = {
          id: postData._id || postData.id,
          content: postData.content,
          author: {
            id: postData.author._id || postData.author.id,
            name:
              `${postData.author.first_name || ""} ${postData.author.last_name || ""}`.trim() ||
              "Anonymous User",
            first_name: postData.author.first_name,
            last_name: postData.author.last_name,
            role: postData.author.role,
            bio: postData.author.bio,
            image: postData.author.image,
          },
          images: postData.images?.map((img) => img.url || img) || [],
          videos: postData.videos?.map((video) => video.url || video) || [],
          documents: postData.documents?.map((doc) => doc.url || doc) || [],
          hashtags: postData.hashtags || [],
          mentions: postData.mentions || [],
          visibility: postData.visibility,
          category: postData.category || "general",
          likes: postData.likes || [],
          comments: postData.comments || [],
          shares: postData.shares || [],
          isEdited: postData.isEdited || false,
          isPinned: postData.isPinned || false,
          isArchived: postData.isArchived || false,
          createdAt: postData.createdAt,
          updatedAt: postData.updatedAt,
          isLiked: postData.isLiked || false,
          likeCount: postData.likeCount || 0,
          commentCount: postData.commentCount || 0,
          shareCount: postData.shareCount || 0,
        };
        const index = state.posts.findIndex(
          (post) => post.id === updatedPost.id
        );
        if (index !== -1) {
          state.posts[index] = updatedPost;
        }
        state.error = null;
      })
      .addCase(updateEducatorPost.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Delete educator post
      .addCase(deleteEducatorPost.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteEducatorPost.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Remove post by _id (MongoDB format)
        state.posts = state.posts.filter((post) => post.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteEducatorPost.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const {
  setSelectedPost,
  clearSelectedPost,
  clearCreatePostStatus,
  clearEducatorPostsStatus,
  addLocalPost,
  updateLocalPost,
  removeLocalPost,
  likePost,
  unlikePost,
} = educatorPostSlice.actions;

// Selectors
export const selectAllEducatorPosts = (state) => state.educatorPosts.posts;
export const selectEducatorPostById = (state, postId) =>
  state.educatorPosts.posts.find((post) => post.id === postId);
export const selectSelectedEducatorPost = (state) =>
  state.educatorPosts.selectedPost;
export const selectEducatorPostsStatus = (state) => state.educatorPosts.status;
export const selectEducatorPostsError = (state) => state.educatorPosts.error;
export const selectCreateEducatorPostStatus = (state) =>
  state.educatorPosts.createPostStatus;
export const selectCreateEducatorPostError = (state) =>
  state.educatorPosts.createPostError;
export const selectEducatorPostsPagination = (state) =>
  state.educatorPosts.pagination;
export const selectHasMoreEducatorPosts = (state) =>
  state.educatorPosts.hasMorePosts;
export const selectIsLoadingMoreEducatorPosts = (state) =>
  state.educatorPosts.loadingMore;

export default educatorPostSlice.reducer;
