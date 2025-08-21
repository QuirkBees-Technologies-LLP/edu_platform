import React, { useRef, useState, useEffect } from 'react'
import { Container } from '@/components/container';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEducatorPosts, selectAllEducatorPosts, selectEducatorPostsStatus } from '@/store/reducer/postSlice';
import PostCard from '@/components/PostCard';
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

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [isPostExpanded, setIsPostExpanded] = useState(false);
    const fileInputRef = useRef(null);

    // Fetch posts on component mount
    useEffect(() => {
        dispatch(fetchEducatorPosts({ page: 1, limit: 10 }));
    }, [dispatch]);

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
    
    return (
        <Container>
            <div className="min-h-screen font-sans">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    <div className="md:col-span-1 lg:col-span-1 space-y-4">
                        <div className="card rounded-lg shadow-md overflow-hidden">
                            <div className="relative">
                                <img src="https://i.ibb.co/gLV2tfjF/forex-banner.png" alt="Cover" className="w-full h-20 object-cover" />
                                <div className='relative'>
                                    <div className="absolute left-1/2 -translate-x-1/2 top-[-40px] h-[80px] w-[80px]">
                                        <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden">
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
                            <div className="text-center pt-8 pb-4 border-b border-gray-200 mt-3">
                                <h2 className="text-lg font-semibold font-termina">
                                    {auth?.user?.first_name && auth?.user?.last_name 
                                        ? `${auth.user.first_name} ${auth.user.last_name}` 
                                        : auth?.user?.name || 'User'
                                    }
                                </h2>
                            </div>
                        </div>
                    </div>
                    <div className="md:col-span-4 lg:col-span-4 space-y-4">
                        <div className="card rounded-lg shadow-md p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full overflow-hidden">
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
                            <div className="mt-4 flex justify-between">
                                <button 
                                    onClick={handleCreatePost}
                                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 p-2 rounded-md transition-colors"
                                >
                                    <Video size={20} className="text-red-500" />
                                    <span className="text-sm hidden md:inline font-termina">Video</span>
                                </button>
                                <button 
                                    onClick={handleCreatePost}
                                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 p-2 rounded-md transition-colors"
                                >
                                    <Image size={20} className="text-green-500" />
                                    <span className="text-sm hidden md:inline font-termina">Photo</span>
                                </button>
                                <button 
                                    onClick={handleCreatePost}
                                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 p-2 rounded-md transition-colors"
                                >
                                    <FileText size={20} className="text-purple-500" />
                                    <span className="text-sm hidden md:inline font-termina">Document</span>
                                </button>
                            </div>
                        </div>
                        {/* Posts Feed */}
                        {postsStatus === 'loading' ? (
                            <div className="card rounded-lg shadow-md p-8 text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                                <p className="mt-4 text-gray-600 font-termina">Loading posts...</p>
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="card rounded-lg shadow-md p-8 text-center">
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
                            posts.map((post) => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    onEdit={handleEditPost}
                                    isOwnPost={true} // TODO: Compare with actual user ID
                                />
                            ))
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