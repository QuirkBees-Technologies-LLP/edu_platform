import React from 'react'
import { Container } from '@/components/container';
import { Link, useParams } from 'react-router-dom';
import { useGetClientCoursesQuery } from '../../../store/api/client/clientCoursesApiSlice';

const ClientCourses = () => {
    const { id } = useParams();
    const { data } = useGetClientCoursesQuery(id);
    const defaultImage = '/media/images/600x400/1.jpg';
    const courses = data?.data;

    return (
        <div>
            <Container>
                <div className="card">
                    <div className="card-body">
                        <h4 className='text-xl font-medium text-gray-900 mb-10'>Binance Training</h4>

                        {courses && courses.length > 0 ? (
                            <>
                                <ul className='flex flex-col md:gap-12 gap-8'>
                                    {courses.map((course) => (
                                        <Link
                                            to={`/academy/course/detail/${course._id}`}
                                            key={course._id}
                                            className="card hover:shadow-lg transition-shadow duration-300"
                                        >
                                        <li>
                                            <a href="#">
                                                <div className="flex items-center gap-5">
                                                    <img
                                                        className='rounded-xl sm:h-24 sm:w-40 w-20 h-22 object-cover'
                                                        src={course.image || defaultImage}
                                                        alt={course.title || "Course image"}
                                                    />
                                                    <h5 className='sm:text-lg text-md font-semibold text-gray-900'>
                                                        {course.title}
                                                    </h5>
                                                </div>
                                            </a>
                                        </li>
                                        </Link>
                                    ))}
                                </ul>
                                <div className="text-end mt-3">
                                    <button className='btn btn-primary'>More</button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-10">
                                <h3 className="text-xl font-medium text-gray-700">
                                    No courses available for this category
                                </h3>
                                <p className="text-gray-500 mt-2">
                                    Please check back later or browse other categories
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </Container>
        </div>
    )
}

export default ClientCourses
