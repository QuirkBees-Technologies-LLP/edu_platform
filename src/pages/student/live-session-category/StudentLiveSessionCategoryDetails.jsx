import React from 'react'
import { Container } from '@/components/container';
import { useGetAcademySingleCategoryQuery } from '../../../store/api/client/clientAcademyCategoryApiSlice';
import { Link, useParams } from 'react-router-dom';
import WeeklyCalendar from './WeeklyCalendar';

const StudentLiveSessionCategoryDetails = () => {
    const { id } = useParams();
    const { data } = useGetAcademySingleCategoryQuery(id);

    const defaultImage = '/media/images/600x400/1.jpg';
    const educators = data?.data?.category?.educators;
    console.log(data, "educators===>");

    return (
        <div>
            <Container>
                {educators && educators.length > 0 ? <WeeklyCalendar educators={educators} /> : <div>There are no schedule found</div>}
                {educators && educators.length > 0 ? (
                    <div className="grid xl:grid-cols-3 sm:grid-cols-2 gap-4">
                        {educators.map((educator, index) => (
                            <Link
                                to={`/academy/course/${educator._id}`}
                                key={educator.id || index}
                                className="card hover:shadow-lg transition-shadow duration-300"
                            >
                                <div key={`educator-${educator.id || index}`}
                                    className="card">
                                    <div className="card-body">
                                        <h6 className="text-lg text-center font-medium text-gray-900 mb-3">
                                            {educator.first_name} {educator.last_name}
                                        </h6>
                                        <img
                                            className="rounded-xl h-80 w-full object-cover"
                                            src={educator.image || defaultImage}
                                            alt={`${educator.first_name} ${educator.last_name}`}
                                        />
                                        <button
                                            className="btn text-md btn-primary text-white w-full justify-center mt-3">
                                            Access to live
                                        </button>
                                        <button
                                            className="btn text-md bg-primary-light text-primary w-full justify-center mt-3">
                                            Access to Courses
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <h3 className="text-xl font-medium text-gray-700">
                            No educators available for this category
                        </h3>
                        <p className="text-gray-500 mt-2">
                            Please check back later or browse other categories
                        </p>
                    </div>
                )}
            </Container>
        </div>
    )
}

export default StudentLiveSessionCategoryDetails
