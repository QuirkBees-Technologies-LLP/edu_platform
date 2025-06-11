import React, { useState, useEffect } from 'react'
import { Container } from '@/components/container';
import { Play } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useGetClientSingleCourseSectionQuery } from '../../../store/api/client/clientCoursesApiSlice';
import ShowMoreLess from '../../../components/ui/showmoreless';
import Loader from '../../../components/ui/loader';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../../components/ui/breadcrumb';

const ClientSpecificCourses = () => {
    const { id } = useParams();
    const { data, isLoading } = useGetClientSingleCourseSectionQuery(id);
    const defaultImage = '/media/images/600x400/1.jpg';

    const sections = data?.data;
    const [currentLecture, setCurrentLecture] = useState(null);

    useEffect(() => {
        if (sections && sections.length > 0) {
            const firstSectionWithLectures = sections.find(section => section.lectures?.length > 0);
            if (firstSectionWithLectures) {
                setCurrentLecture(firstSectionWithLectures.lectures[0]);
            }
        }
    }, [sections]);

    const getVideoId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const videoId = currentLecture?.type === 'VIDEO'
        ? getVideoId(currentLecture.content)
        : null;

    const handleLectureClick = (lecture) => {
        setCurrentLecture(lecture);
    };

    const getVideoThumbnail = (url) => {
        const videoId = getVideoId(url);
        return videoId
            ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
            : defaultImage;
    };

    if (isLoading || !data) {
        return <Loader />
    }

    return (
        <div>
            <Container>
                <Breadcrumb className="mb-5">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <Link to="/video-library" className='hover:text-primary'>Courses</Link>
                            <BreadcrumbSeparator />
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            <BreadcrumbPage>{sections?.[0]?.title || 'No sections'}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </Container>
            {(!isLoading && data && (!sections || sections.length === 0) && !currentLecture) ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <h3 className="text-xl font-medium text-gray-900">No sections available</h3>
                        <p className="mt-2 text-gray-600">This course doesn't have any sections yet.</p>
                    </div>
                </div>
            ) :
                <Container>
                    <div className="grid grid-cols-12 gap-4">
                        {/* Main Content Area */}
                        <div className="xl:col-span-8 col-span-12">
                            {currentLecture?.type === 'VIDEO' && videoId ? (
                                <div className="mb-4">
                                    <iframe
                                        className='w-full rounded-lg'
                                        height="480"
                                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                                        title={currentLecture.title}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        referrerPolicy="strict-origin-when-cross-origin"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            ) : currentLecture?.type === 'TEXT' ? (
                                <div className="bg-light p-6 rounded-lg shadow mb-4">
                                    <h2 className="text-2xl font-bold mb-4">{currentLecture.title}</h2>
                                    <div
                                        className="prose max-w-none"
                                        dangerouslySetInnerHTML={{ __html: currentLecture.content }}
                                    />
                                </div>
                            ) : (
                                <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center mb-4">
                                    <p>Select a lecture to view content</p>
                                </div>
                            )}

                            <div className="mt-3 mb-5">
                                <h3 className='text-2xl font-semibold text-gray-900'>
                                    {currentLecture?.title || 'Select a lecture'}
                                </h3>
                                <h5 className='text-md font-medium text-gray-700'>
                                    {sections?.[0]?.course?.title || 'Course Content'}
                                </h5>
                                {/* {currentLecture?.description && (
                                <p className="mt-2 text-gray-600">{currentLecture.description}</p>
                            )} */}
                                <ShowMoreLess html={currentLecture?.description} limit={180} />
                            </div>
                        </div>

                        <div className="xl:col-span-4 col-span-12 space-y-4">
                            {sections?.map((section) => (
                                <div className="card p-3 rounded-lg" key={section._id}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className='text-lg font-medium text-gray-900'>
                                            {section.title}
                                        </h4>
                                        <span className="text-sm text-gray-500">
                                            {section.lectures?.length || 0} lectures
                                        </span>
                                    </div>
                                    {section.lectures?.length > 0 ? (
                                        <div className="flex flex-col">
                                            {section.lectures.map((lecture, index) => (
                                                <div
                                                    className={`rounded-lg p-3 mb-2 cursor-pointer transition-all ${currentLecture?._id === lecture._id ? 'bg-light border border-primary' : 'hover:bg-light'}`}
                                                    key={lecture._id}
                                                    onClick={() => handleLectureClick(lecture)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className='flex items-center gap-2'>
                                                            <span className="text-sm text-gray-500 w-5">
                                                                {index + 1}
                                                            </span>
                                                            {lecture.type === 'VIDEO' ? (
                                                                <div className="relative">
                                                                    <img
                                                                        className='rounded-lg h-14 w-24 object-cover'
                                                                        src={getVideoThumbnail(lecture.content)}
                                                                        alt={lecture.title}
                                                                    />
                                                                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded-lg">
                                                                        <Play className="text-white w-5 h-5" />
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className='rounded-lg h-14 w-24 bg-gray-100 flex items-center justify-center'>
                                                                    <span className='text-gray-500 text-sm'>Text</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className='text-md font-medium text-gray-900 truncate'>
                                                                {lecture.title}
                                                            </h4>
                                                            <div className="flex items-center justify-between">
                                                                <p className='text-xs text-gray-500'>
                                                                    {lecture.type}
                                                                </p>
                                                                {lecture.preview && (
                                                                    <span className="text-xs bg-primary-light text-primary px-2 py-0.5 rounded">
                                                                        Preview
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 text-gray-500 text-sm">
                                            No lectures in this section
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </Container>}
        </div>
    )
}

export default ClientSpecificCourses
