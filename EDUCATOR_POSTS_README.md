# Educator Posts Functionality

This document describes the implementation of the educator post functionality in the LMS platform.

## Overview

The educator post system allows educators to create, edit, delete, and interact with posts in their community feed. Posts can contain text content and media (images/videos) with privacy controls.

## Features

- ✅ Create posts with text content
- ✅ Upload and preview images/videos/documents before posting
- ✅ Edit existing posts
- ✅ Delete posts
- ✅ Like/unlike posts
- ✅ Visibility controls (Public, Connections, Private)
- ✅ Category selection (General, Education, Trading, Technology, Business, Lifestyle, News, Other)
- ✅ Media preview in create/edit modal
- ✅ File validation (size, type)
- ✅ Redux Toolkit state management
- ✅ Responsive design

## Components

### 1. PostCard (`src/components/PostCard.jsx`)
Displays individual posts with:
- Author information and avatar
- Post content and media
- Like, comment, and share buttons
- Edit/delete options for own posts
- Responsive design

### 2. CreatePostModal (`src/components/CreatePostModal.jsx`)
Modal for creating/editing posts with:
- Text content input with character limit
- Multiple media upload (images/videos/documents)
- Media preview before posting
- Visibility settings
- Category selection
- Form validation

### 3. EducatorCommunityFeed (`src/pages/educator/educator-community-feed/EducatorCommunityFeed.jsx`)
Main page component that:
- Displays the feed of posts
- Handles post creation/editing
- Shows loading states and empty states
- Integrates with Redux store

## Redux Store

### State Structure
```javascript
{
  educatorPosts: {
    posts: [], // Array of post objects
    selectedPost: null, // Currently selected post for editing
    status: 'idle' | 'loading' | 'succeeded' | 'failed',
    error: null,
    pagination: {
      currentPage: 1,
      limit: 10,
      totalPages: 0,
      totalRecords: 0
    },
    createPostStatus: 'idle' | 'loading' | 'succeeded' | 'failed',
    createPostError: null
  }
}
```

### Actions
- `fetchEducatorPosts` - Fetch posts with pagination
- `createEducatorPost` - Create new post
- `updateEducatorPost` - Update existing post
- `deleteEducatorPost` - Delete post
- `likePost` / `unlikePost` - Like/unlike posts
- `setSelectedPost` - Set post for editing
- `clearSelectedPost` - Clear selected post

### Media Handling
- **Images**: Support for multiple image uploads with preview grid
- **Videos**: Support for multiple video uploads with controls
- **Documents**: Support for PDF, DOC, DOCX, and TXT files

### Selectors
- `selectAllEducatorPosts` - Get all posts
- `selectEducatorPostById` - Get specific post
- `selectCreateEducatorPostStatus` - Get create post status
- `selectCreateEducatorPostError` - Get create post errors

## API Integration

### Service File: `src/services/educatorPosts.api.js`

The service file contains all API calls for educator posts:

```javascript
// Get posts with pagination
export const getEducatorPosts = async (params = {}) => {
  // Implementation
};

// Create new post
export const createEducatorPost = async (postData) => {
  // Implementation with FormData for media uploads
};

// Update existing post
export const updateEducatorPost = async (id, postData) => {
  // Implementation
};

// Delete post
export const deleteEducatorPost = async (id) => {
  // Implementation
};
```

### API Endpoints Required

Your backend should implement these endpoints:

```
GET    /educator/posts          - Get posts with pagination
GET    /educator/posts/:id      - Get specific post
POST   /educator/posts          - Create new post
PUT    /educator/posts/:id      - Update post
DELETE /educator/posts/:id      - Delete post
POST   /educator/posts/:id/like - Like post
DELETE /educator/posts/:id/like - Unlike post
```

### Request/Response Format

#### Create/Update Post Request
```javascript
// FormData with:
{
  content: "Post text content",
  visibility: "public" | "connections" | "private",
  category: "general" | "education" | "trading" | "technology" | "business" | "lifestyle" | "news" | "other",
  images: File[], // Optional - array of image files
  videos: File[], // Optional - array of video files
  documents: File[] // Optional - array of document files
}
```

#### Post Response
```javascript
{
  id: "post_id",
  content: "Post content",
  visibility: "public",
  category: "general",
  images: ["image_url_1", "image_url_2"],
  videos: ["video_url_1"],
  documents: ["document_url_1"],
  author: {
    id: "user_id",
    name: "User Name",
    avatar: "avatar_url",
    company: "Company Name"
  },
  createdAt: "2024-01-01T00:00:00.000Z",
  likes: 0,
  comments: 0,
  shares: 0
}
```

## Usage

### 1. Basic Post Creation
```javascript
import { useDispatch } from 'react-redux';
import { createEducatorPost } from '@/store/reducer/postSlice';

const dispatch = useDispatch();

const handleCreatePost = async (postData) => {
  try {
    await dispatch(createEducatorPost(postData)).unwrap();
    // Post created successfully
  } catch (error) {
    // Handle error
  }
};
```

### 2. Fetching Posts
```javascript
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEducatorPosts, selectAllEducatorPosts } from '@/store/reducer/postSlice';

const posts = useSelector(selectAllEducatorPosts);
const dispatch = useDispatch();

useEffect(() => {
  dispatch(fetchEducatorPosts({ page: 1, limit: 10 }));
}, [dispatch]);
```

### 3. Post Actions
```javascript
import { likePost, unlikePost, deleteEducatorPost } from '@/store/reducer/postSlice';

// Like a post
dispatch(likePost(postId));

// Unlike a post
dispatch(unlikePost(postId));

// Delete a post
dispatch(deleteEducatorPost(postId));
```

## Customization

### Styling
The components use Tailwind CSS classes and can be customized by:
- Modifying the CSS classes in the component files
- Adding custom CSS in your stylesheets
- Using CSS-in-JS solutions

### Privacy Options
Privacy controls can be customized by modifying the `getPrivacyIcon` and `getPrivacyText` functions in `CreatePostModal.jsx`.

### Media Types
Supported media types can be extended by:
- Adding new file type validation in `handleFileChange`
- Updating the media preview rendering in `renderMedia`
- Modifying the API service to handle new media types

## Future Enhancements

- [ ] Comment system
- [ ] Post sharing
- [ ] Post scheduling
- [ ] Rich text editor
- [ ] Post templates
- [ ] Analytics and insights
- [ ] Moderation tools
- [ ] Post categories/tags

## Troubleshooting

### Common Issues

1. **Media not uploading**: Check file size limits and supported formats
2. **Posts not loading**: Verify API endpoints and authentication
3. **State not updating**: Ensure Redux store is properly configured
4. **Modal not opening**: Check z-index and positioning

### Debug Mode
Enable Redux DevTools to debug state changes and actions.

## Dependencies

- React 18+
- Redux Toolkit
- Lucide React (for icons)
- Tailwind CSS
- Axios (for API calls)

## Support

For issues or questions about the educator post functionality, please refer to:
- Redux Toolkit documentation
- React documentation
- Your backend API documentation
