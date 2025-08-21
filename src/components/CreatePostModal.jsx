import React, { useState, useRef, useEffect } from 'react';
import { X, Image, Video, FileText, Globe, Users, Lock, FolderOpen } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { createEducatorPost, updateEducatorPost, clearCreatePostStatus, selectCreateEducatorPostStatus, selectCreateEducatorPostError } from '@/store/reducer/postSlice';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert } from '@/components/alert/Alert';
import { toast } from 'sonner';
import { useAuthContext } from '@/auth/useAuthContext';

const CreatePostModal = ({ isOpen, onClose, editingPost = null }) => {
    const dispatch = useDispatch();
    const { auth } = useAuthContext();
    const createStatus = useSelector(selectCreateEducatorPostStatus);
    const createError = useSelector(selectCreateEducatorPostError);
    
    const [content, setContent] = useState('');
    const [images, setImages] = useState([]);
    const [videos, setVideos] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [visibility, setVisibility] = useState('public');
    const [category, setCategory] = useState('general');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const imageInputRef = useRef(null);
    const videoInputRef = useRef(null);
    const documentInputRef = useRef(null);

    useEffect(() => {
        if (editingPost) {
            setContent(editingPost.content || '');
            setImages(editingPost.images || []);
            setVideos(editingPost.videos || []);
            setDocuments(editingPost.documents || []);
            setVisibility(editingPost.visibility || 'public');
            setCategory(editingPost.category || 'general');
        }
    }, [editingPost]);

    useEffect(() => {
        if (createStatus === 'succeeded') {
            // Success toast is already shown in handleSubmit
            handleClose();
            dispatch(clearCreatePostStatus());
        }
    }, [createStatus, dispatch]);

    const handleClose = () => {
        setContent('');
        setImages([]);
        setVideos([]);
        setDocuments([]);
        setVisibility('public');
        setCategory('general');
        setIsSubmitting(false);
        // Clear any Redux errors when closing
        dispatch(clearCreatePostStatus());
        onClose();
    };

    const handleFileChange = (event, type) => {
        const files = Array.from(event.target.files);
        
        files.forEach(file => {
            if (file.size > 10 * 1024 * 1024) {
                toast.error(`File ${file.name} must be less than 10MB`);
                return;
            }

            if (type === 'image' && !file.type.startsWith('image/')) {
                toast.error(`Please select a valid image file for ${file.name}`);
                return;
            }
            if (type === 'video' && !file.type.startsWith('video/')) {
                toast.error(`Please select a valid video file for ${file.name}`);
                return;
            }
            if (type === 'document' && !file.type.includes('pdf') && !file.type.includes('doc') && !file.type.includes('txt')) {
                toast.error(`Please select a valid document file for ${file.name}`);
                return;
            }

            if (type === 'image') {
                setImages(prev => [...prev, file]);
            } else if (type === 'video') {
                setVideos(prev => [...prev, file]);
            } else if (type === 'document') {
                setDocuments(prev => [...prev, file]);
            }
        });
    };

    const removeFile = (file, type) => {
        if (type === 'image') {
            setImages(prev => prev.filter(f => f !== file));
        } else if (type === 'video') {
            setVideos(prev => prev.filter(f => f !== file));
        } else if (type === 'document') {
            setDocuments(prev => prev.filter(f => f !== file));
        }
    };

    const clearAllFiles = () => {
        setImages([]);
        setVideos([]);
        setDocuments([]);
        if (imageInputRef.current) imageInputRef.current.value = '';
        if (videoInputRef.current) videoInputRef.current.value = '';
        if (documentInputRef.current) documentInputRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!content.trim() && images.length === 0 && videos.length === 0 && documents.length === 0) {
            toast.error('Please add some content or media to your post');
            return;
        }

        setIsSubmitting(true);

        try {
            const postData = {
                content: content.trim(),
                visibility,
                category,
                images: images.length > 0 ? images : undefined,
                videos: videos.length > 0 ? videos : undefined,
                documents: documents.length > 0 ? documents : undefined
            };

            if (editingPost) {
                await dispatch(updateEducatorPost({ id: editingPost.id, postData })).unwrap();
                toast.success('Post updated successfully!');
            } else {
                await dispatch(createEducatorPost(postData)).unwrap();
                toast.success('Post created successfully!');
            }
        } catch (error) {
            console.error('Failed to submit post:', error);
            const errorMessage = error?.message || 'Failed to submit post. Please try again.';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getVisibilityIcon = () => {
        switch (visibility) {
            case 'public':
                return <Globe size={16} />;
            case 'connections':
                return <Users size={16} />;
            case 'private':
                return <Lock size={16} />;
            default:
                return <Globe size={16} />;
        }
    };

    const getVisibilityText = () => {
        switch (visibility) {
            case 'public':
                return 'Anyone';
            case 'connections':
                return 'Connections';
            case 'private':
                return 'Only you';
            default:
                return 'Anyone';
        }
    };

    const categories = [
        'general',
        'education',
        'trading',
        'technology',
        'business',
        'lifestyle',
        'news',
        'other'
    ];

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="p-5 max-w-[800px]">
                <DialogHeader>
                    <DialogTitle>
                        {editingPost ? 'Edit Post' : 'Create a Post'}
                    </DialogTitle>
                </DialogHeader>
                
                {/* Error Alert */}
                {createError && (
                    <div className="px-5">
                        <Alert variant="danger" icon="shield-cross">
                            {createError}
                        </Alert>
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-5 px-0 py-5">
                        {/* User Info and Privacy */}
                        <div className="flex items-center justify-between">
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
                                <div>
                                    <h3 className="font-semibold text-gray-800">
                                        {auth?.user?.first_name && auth?.user?.last_name 
                                            ? `${auth.user.first_name} ${auth.user.last_name}` 
                                            : auth?.user?.name || 'User'
                                        }
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => setVisibility(visibility === 'public' ? 'connections' : visibility === 'connections' ? 'private' : 'public')}
                                        className="flex items-center gap-2 mt-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                        {getVisibilityIcon()}
                                        <span>Post to {getVisibilityText()}</span>
                                    </button>
                                </div>
                            </div>
                            
                            {/* Category Selection */}
                            <div className="flex items-center gap-2">
                                <FolderOpen size={16} className="text-gray-500" />
                                <Select onValueChange={(value) => setCategory(value)} defaultValue={category}>
                                    <SelectTrigger className="text-xs text-gray-700 border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500">
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(cat => (
                                            <SelectItem key={cat} value={cat}>
                                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Content Textarea */}
                        <div className="flex flex-col gap-1">
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full min-h-32 p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-lg"
                                placeholder="What do you want to talk about?"
                                maxLength={2000}
                            />
                            
                            {/* Character count */}
                            <div className="text-right text-sm text-gray-500">
                                {content.length}/2000
                            </div>
                        </div>

                        {/* Selected Files Preview */}
                        {(images.length > 0 || videos.length > 0 || documents.length > 0) && (
                            <div className="space-y-3">
                                {/* Images */}
                                {images.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Images ({images.length})</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {images.map((image, index) => (
                                                <div key={index} className="relative group">
                                                    <img 
                                                        src={URL.createObjectURL(image)} 
                                                        alt={`Preview ${index + 1}`} 
                                                        className="w-full h-24 object-cover rounded-lg"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(image, 'image')}
                                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Videos */}
                                {videos.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Videos ({videos.length})</h4>
                                        <div className="space-y-2">
                                            {videos.map((video, index) => (
                                                <div key={index} className="relative group">
                                                    <video 
                                                        src={URL.createObjectURL(video)} 
                                                        controls 
                                                        className="w-full max-h-48 object-cover rounded-lg"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(video, 'video')}
                                                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Documents */}
                                {documents.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Documents ({documents.length})</h4>
                                        <div className="space-y-2">
                                            {documents.map((doc, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group">
                                                    <div className="flex items-center gap-2">
                                                        <FileText size={20} className="text-blue-500" />
                                                        <span className="text-sm text-gray-700">{doc.name}</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(doc, 'document')}
                                                        className="p-1 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Clear All Button */}
                                <button
                                    type="button"
                                    onClick={clearAllFiles}
                                    className="text-sm text-red-600 hover:text-red-800 hover:underline"
                                >
                                    Clear all files
                                </button>
                            </div>
                        )}

                        {/* Media Upload Buttons */}
                        <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                                <input
                                    type="file"
                                    ref={imageInputRef}
                                    onChange={(e) => handleFileChange(e, 'image')}
                                    className="hidden"
                                    accept="image/*"
                                    multiple
                                />
                                <button 
                                    type="button"
                                    onClick={() => imageInputRef.current?.click()} 
                                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 p-2 rounded-md hover:bg-blue-50 transition-colors"
                                >
                                    <Image size={20} />
                                    <span>Images</span>
                                </button>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <input
                                    type="file"
                                    ref={videoInputRef}
                                    onChange={(e) => handleFileChange(e, 'video')}
                                    className="hidden"
                                    accept="video/*"
                                    multiple
                                />
                                <button 
                                    type="button"
                                    onClick={() => videoInputRef.current?.click()} 
                                    className="flex items-center gap-2 text-gray-600 hover:text-red-600 p-2 rounded-md hover:bg-red-50 transition-colors"
                                >
                                    <Video size={20} />
                                    <span>Videos</span>
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="file"
                                    ref={documentInputRef}
                                    onChange={(e) => handleFileChange(e, 'document')}
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.txt"
                                    multiple
                                />
                                <button 
                                    type="button"
                                    onClick={() => documentInputRef.current?.click()} 
                                    className="flex items-center gap-2 text-gray-600 hover:text-green-600 p-2 rounded-md hover:bg-green-50 transition-colors"
                                >
                                    <FileText size={20} />
                                    <span>Documents</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Modal Actions */}
                    <div className="flex border-gray-200 border-t justify-end py-5 rounded-b dark:border-gray-200 gap-3 md:py-5">
                        <div className="flex gap-3">
                            <button 
                                type="button"
                                onClick={handleClose}
                                className="btn btn-light"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                disabled={isSubmitting || (!content.trim() && images.length === 0 && videos.length === 0 && documents.length === 0)}
                                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    'Posting...'
                                ) : editingPost ? (
                                    'Update Post'
                                ) : (
                                    'Post'
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreatePostModal;
