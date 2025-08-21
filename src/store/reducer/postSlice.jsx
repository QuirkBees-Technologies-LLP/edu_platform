import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { 
  getEducatorPosts, 
  createEducatorPost as createEducatorPostAPI, 
  updateEducatorPost as updateEducatorPostAPI, 
  deleteEducatorPost as deleteEducatorPostAPI 
} from "@/services/educatorPosts.api";

// Async thunks for API operations
export const fetchEducatorPosts = createAsyncThunk(
  "educatorPosts/fetchAll",
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await getEducatorPosts({ page, limit });
      return response.data;
    } catch (error) {
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
    addLocalPost: (state, action) => {
      state.posts.unshift(action.payload);
    },
    updateLocalPost: (state, action) => {
      const index = state.posts.findIndex(post => post.id === action.payload.id);
      if (index !== -1) {
        state.posts[index] = { ...state.posts[index], ...action.payload };
      }
    },
    removeLocalPost: (state, action) => {
      state.posts = state.posts.filter(post => post.id !== action.payload);
    },
    likePost: (state, action) => {
      const post = state.posts.find(p => p.id === action.payload);
      if (post) {
        post.likeCount += 1;
        post.isLiked = true;
      }
    },
    unlikePost: (state, action) => {
      const post = state.posts.find(p => p.id === action.payload);
      if (post && post.likeCount > 0) {
        post.likeCount -= 1;
        post.isLiked = false;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch educator posts
      .addCase(fetchEducatorPosts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchEducatorPosts.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Map backend response to frontend structure
        const mappedPosts = action.payload.posts.map(post => ({
          id: post._id,
          content: post.content,
          author: {
            id: post.author._id,
            name: `${post.author.first_name || ''} ${post.author.last_name || ''}`.trim() || 'Anonymous User',
            first_name: post.author.first_name,
            last_name: post.author.last_name,
            role: post.author.role,
            bio: post.author.bio,
            image: post.author.image
          },
          images: post.images?.map(img => img.url) || [],
          videos: post.videos?.map(video => video.url) || [],
          documents: post.documents?.map(doc => doc.url) || [],
          hashtags: post.hashtags || [],
          mentions: post.mentions || [],
          visibility: post.visibility,
          category: post.category || 'general',
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
          shareCount: post.shareCount || 0
        }));
        state.posts = mappedPosts;
        
        // Map pagination structure
        state.pagination = {
          currentPage: action.payload.pagination.currentPage,
          limit: action.payload.pagination.limit || 10,
          totalPages: action.payload.pagination.totalPages,
          totalRecords: action.payload.pagination.totalPosts
        };
        state.error = null;
      })
      .addCase(fetchEducatorPosts.rejected, (state, action) => {
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
        const newPost = {
          id: action.payload._id,
          content: action.payload.content,
          author: {
            id: action.payload.author._id,
            name: `${action.payload.author.first_name || ''} ${action.payload.author.last_name || ''}`.trim() || 'Anonymous User',
            first_name: action.payload.author.first_name,
            last_name: action.payload.author.last_name,
            role: action.payload.author.role,
            bio: action.payload.author.bio,
            image: action.payload.author.image
          },
          images: action.payload.images?.map(img => img.url) || [],
          videos: action.payload.videos?.map(video => video.url) || [],
          documents: action.payload.documents?.map(doc => doc.url) || [],
          hashtags: action.payload.hashtags || [],
          mentions: action.payload.mentions || [],
          visibility: action.payload.visibility,
          category: action.payload.category || 'general',
          likes: action.payload.likes || [],
          comments: action.payload.comments || [],
          shares: action.payload.shares || [],
          isEdited: action.payload.isEdited || false,
          isPinned: action.payload.isPinned || false,
          isArchived: action.payload.isArchived || false,
          createdAt: action.payload.createdAt,
          updatedAt: action.payload.updatedAt,
          isLiked: action.payload.isLiked || false,
          likeCount: action.payload.likeCount || 0,
          commentCount: action.payload.commentCount || 0,
          shareCount: action.payload.shareCount || 0
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
        const updatedPost = {
          id: action.payload._id,
          content: action.payload.content,
          author: {
            id: action.payload.author._id,
            name: `${action.payload.author.first_name || ''} ${action.payload.author.last_name || ''}`.trim() || 'Anonymous User',
            first_name: action.payload.author.first_name,
            last_name: action.payload.author.last_name,
            role: action.payload.author.role,
            bio: action.payload.author.bio,
            image: action.payload.author.image
          },
          images: action.payload.images?.map(img => img.url) || [],
          videos: action.payload.videos?.map(video => video.url) || [],
          documents: action.payload.documents?.map(doc => doc.url) || [],
          hashtags: action.payload.hashtags || [],
          mentions: action.payload.mentions || [],
          visibility: action.payload.visibility,
          category: action.payload.category || 'general',
          likes: action.payload.likes || [],
          comments: action.payload.comments || [],
          shares: action.payload.shares || [],
          isEdited: action.payload.isEdited || false,
          isPinned: action.payload.isPinned || false,
          isArchived: action.payload.isArchived || false,
          createdAt: action.payload.createdAt,
          updatedAt: action.payload.updatedAt,
          isLiked: action.payload.isLiked || false,
          likeCount: action.payload.likeCount || 0,
          commentCount: action.payload.commentCount || 0,
          shareCount: action.payload.shareCount || 0
        };
        const index = state.posts.findIndex(post => post.id === updatedPost.id);
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
        state.posts = state.posts.filter(post => post.id !== action.payload);
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
  addLocalPost,
  updateLocalPost,
  removeLocalPost,
  likePost,
  unlikePost,
} = educatorPostSlice.actions;

// Selectors
export const selectAllEducatorPosts = (state) => state.educatorPosts.posts;
export const selectEducatorPostById = (state, postId) => 
  state.educatorPosts.posts.find(post => post.id === postId);
export const selectSelectedEducatorPost = (state) => state.educatorPosts.selectedPost;
export const selectEducatorPostsStatus = (state) => state.educatorPosts.status;
export const selectEducatorPostsError = (state) => state.educatorPosts.error;
export const selectCreateEducatorPostStatus = (state) => state.educatorPosts.createPostStatus;
export const selectCreateEducatorPostError = (state) => state.educatorPosts.createPostError;
export const selectEducatorPostsPagination = (state) => state.educatorPosts.pagination;

export default educatorPostSlice.reducer;
