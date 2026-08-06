import React, { useRef, useState, useEffect } from 'react'
import { Container } from '@/components/container';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEducatorPosts, selectAllEducatorPosts, selectEducatorPostsStatus, selectEducatorPostsPagination, selectHasMoreEducatorPosts } from '@/store/reducer/postSlice';
import SocialPostCard from '../../student/iq-social/SocialPostCard';
import CreatePostModal from '@/components/CreatePostModal';
import { useAuthContext } from '@/auth/useAuthContext';
import {
  Save,
  Users,
  Rss,
  Edit,
  X,
  Smile,
  Globe,
  Plus,
  Play,
  Video,
  Image,
  FileText,
} from 'lucide-react';

const EducatorCommunityFeed = () => {
  const dispatch = useDispatch();
  const { auth } = useAuthContext();
  const posts = useSelector(selectAllEducatorPosts);
  const postsStatus = useSelector(selectEducatorPostsStatus);
  const pagination = useSelector(selectEducatorPostsPagination);
  const hasMore = useSelector(selectHasMoreEducatorPosts);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [isPostExpanded, setIsPostExpanded] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch posts on component mount (StrictMode-safe, run once)
  const didInitRef = useRef(false);
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    if (posts.length === 0) {
      dispatch(fetchEducatorPosts({ page: 1, limit: 10 }));
    }
  }, [dispatch, posts.length]);

  // Loader for react-infinite-scroll-component
  const loader = (
    <div className="card rounded-lg shadow-md p-6 text-center max-w-full sm:max-w-2xl mx-auto">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
      <p className="mt-2 text-gray-600 font-termina">Loading more...</p>
    </div>
  );

  const loadMore = () => {
    const nextPage = (pagination.currentPage || 1) + 1;
    if (hasMore) {
      setTimeout(() => {
        dispatch(fetchEducatorPosts({ page: nextPage, limit: pagination.limit || 10, append: true }));
      }, 1500);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // You can now handle the file. For example, log its name to the console.
      console.log('Selected file:', file.name);
    }
  };

  const handleCreatePost = () => {
    setEditingPost(null);
    setIsModalOpen(true);
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPost(null);
  };

  // Adapt educator post data to match SocialPostCard's expected format
  const adaptPostForSocialCard = (post) => ({
    _id: post.id || post._id,
    id: post.id || post._id,
    content: post.content,
    images: (post.images || []).map((img, idx) =>
      typeof img === 'string' ? { _id: `img-${idx}`, url: img } : img
    ),
    videos: (post.videos || []).map((vid, idx) =>
      typeof vid === 'string' ? { _id: `vid-${idx}`, url: vid } : vid
    ),
    author: {
      _id: post.author?.id,
      first_name: post.author?.first_name || post.author?.name?.split(' ')[0] || '',
      last_name: post.author?.last_name || post.author?.name?.split(' ').slice(1).join(' ') || '',
      image: post.author?.image,
    },
    dyntubeUrl: post.dyntubeUrl,
    createdAt: post.createdAt,
    likeCount: post.likeCount || 0,
    commentCount: post.commentCount || 0,
  });

  return (
    <Container>
      <div className="min-h-screen font-sans">
        <div className="flex flex-col lg:flex-row justify-center gap-6 mb-5">
          {/* Top Section: Profile Card (Left) */}
          <div className="w-full lg:w-[260px] flex-shrink-0">
            <div className="card rounded-lg shadow-md overflow-hidden">
              <div className="relative">
                <img src="https://i.ibb.co/gLV2tfjF/forex-banner.png" alt="Cover" className="w-full h-20 object-cover" />
                <div className='relative'>
                  <div className="absolute left-1/2 -translate-x-1/2 top-[-40px] h-[80px] w-[80px]">
                    <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden bg-white">
                      <img
                        src={auth?.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(auth?.user?.first_name || 'User')}&background=random&color=fff&size=80`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(auth?.user?.first_name || 'User')}&background=random&color=fff&size=80`;
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center pt-8 pb-4 mt-3">
                <h2 className="text-sm font-semibold font-termina">
                  {auth?.user?.first_name && auth?.user?.last_name
                    ? `${auth.user.first_name} ${auth.user.last_name}`
                    : auth?.user?.name || 'User'
                  }
                </h2>
              </div>
            </div>
          </div>

          {/* Main Feed Column (Right) */}
          <div className="w-full max-w-2xl flex-shrink-0 space-y-4">
            {/* Create Post Card */}
            <div className="card rounded-lg shadow-md p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src={auth?.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(auth?.user?.first_name || 'User')}&background=random&color=fff&size=48`}
                    alt="User"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(auth?.user?.first_name || 'User')}&background=random&color=fff&size=48`;
                    }}
                  />
                </div>
                <button
                  onClick={handleCreatePost}
                  className="flex-1 text-left px-4 py-3 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100 transition-colors font-termina"
                >
                  Start a post
                </button>
              </div>
              {/* Media Upload Buttons */}
              <div className="mt-4">
                <div className="flex items-center justify-center gap-6">
                  {/* Video Upload Button */}
                  <button
                    onClick={handleCreatePost}
                    className="group flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 hover:bg-red-50 hover:scale-105"
                  >
                    <div className="p-2 rounded-full bg-red-100 group-hover:bg-red-200 transition-colors">
                      <Video size={20} className="text-red-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-red-700 font-termina">Video</span>
                    <span className="text-xs text-gray-500">MP4, MOV</span>
                  </button>

                  {/* Photo Upload Button */}
                  <button
                    onClick={handleCreatePost}
                    className="group flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 hover:bg-green-50 hover:scale-105"
                  >
                    <div className="p-2 rounded-full bg-green-100 group-hover:bg-green-200 transition-colors">
                      <Image size={20} className="text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-green-700 font-termina">Photo</span>
                    <span className="text-xs text-gray-500">JPG, PNG</span>
                  </button>
                </div>
              </div>
            </div>


          {/* Posts Feed */}
          {postsStatus === 'loading' ? (
            <div className="card rounded-lg shadow-md p-8 text-center max-w-full sm:max-w-2xl mx-auto">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600 font-termina">Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="card rounded-lg shadow-md p-8 text-center max-w-full sm:max-w-2xl mx-auto">
              <div className="text-gray-400 mb-4">
                <Rss size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2 font-termina">No posts yet</h3>
              <p className="text-gray-500 mb-4 font-termina">Be the first to share something with your community!</p>
              <div className="flex justify-center">
                <button
                  onClick={handleCreatePost}
                  className="btn btn-primary px-6 py-2 text-sm font-termina"
                >
                  Create First Post
                </button>
              </div>
            </div>
          ) : (
            <InfiniteScroll
              dataLength={posts.length}
              next={loadMore}
              hasMore={hasMore}
              loader={loader}
              endMessage={posts.length > 0 ? (
                <div className="text-center text-sm text-gray-400 py-4 font-termina">No more posts</div>
              ) : null}
            >
              <div className="container max-w-full sm:max-w-2xl mx-auto">
                {posts.map((post) => (
                  <SocialPostCard
                    key={post.id}
                    post={adaptPostForSocialCard(post)}
                    onEdit={handleEditPost}
                    refetch={() => dispatch(fetchEducatorPosts({ page: 1, limit: 10 }))}
                  />
                ))}
              </div>
            </InfiniteScroll>
          )}
          </div>
        </div>

        {/* Create/Edit Post Modal */}
        <CreatePostModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          editingPost={editingPost}
        />
      </div>
    </Container>
  )
}

export default EducatorCommunityFeed