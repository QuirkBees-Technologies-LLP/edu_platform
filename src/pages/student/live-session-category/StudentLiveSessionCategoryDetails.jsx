import React from 'react'
import { Container } from '@/components/container';
import { useGetAcademySingleCategoryQuery } from '../../../store/api/client/clientAcademyCategoryApiSlice';
import { Link, useParams } from 'react-router-dom';
import WeeklyCalendar from './WeeklyCalendar';
import EducatorImage from './EducatorImage';
import Loader from '../../../components/ui/loader';
import WeeklyCalendarIQAcademy from './WeeklyCalendarIQAcademy';

const StudentLiveSessionCategoryDetails = () => {
    const { id } = useParams();
    const { data, isLoading } = useGetAcademySingleCategoryQuery(id);
    console.log(id, "id");

    const defaultImage = '/media/avatars/300-2.png';
    const educators = data?.data?.category?.educators;
    console.log(educators, "educators");

    return (
        <div>
            <div className='container-fluid'>
                {isLoading ? <Loader /> :
                    <>
                        {educators && educators.length > 0 ? <WeeklyCalendarIQAcademy educators={educators} /> : <div className='text-center'>There are no schedule found</div>}
                        {educators && educators.length > 0 ? (
                            <div className="grid xl:grid-cols-3 sm:grid-cols-2 gap-4">
                                {educators.map((educator, index) => (

                                    <div key={`educator-${educator.id || index}`}
                                        className="card">
                                        <Link
                                            to={`/academy/course/${educator._id}`}
                                            key={educator.id || index}
                                            className="card hover:shadow-lg transition-shadow duration-300"
                                        >
                                            <div className="card-body">
                                                <h6 className="text-lg text-center font-medium text-gray-900 mb-3">
                                                    {educator.first_name} {educator.last_name}
                                                </h6>
                                                <EducatorImage
                                                    educator={educator}  // The course object containing the imageUrl and title
                                                    defaultImage={defaultImage}  // Your fallback default image
                                                />

                                                <button
                                                    className="btn text-md btn-primary text-white w-full justify-center mt-3">
                                                    Access to live
                                                </button>

                                                <button
                                                    className="btn text-md bg-primary-light text-primary w-full justify-center mt-3">
                                                    Access to Courses
                                                </button>
                                                <Link to={`/educator-recording-session/${educator._id}`}>
                                                    <button
                                                        className="btn text-md bg-primary-light text-primary w-full justify-center mt-3">
                                                        Access to recording session
                                                    </button>                                                
                                                </Link>
                                            </div>
                                        </Link>
                                    </div>
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
                        )
                        }
                    </>}
            </div >
        </div >
    )
}

export default StudentLiveSessionCategoryDetails
