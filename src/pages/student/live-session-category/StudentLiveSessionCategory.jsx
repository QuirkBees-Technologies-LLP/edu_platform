import React from 'react'
import { Container } from '@/components/container';
import { useGetAcademyCategoryQuery } from '../../../store/api/client/clientAcademyCategoryApiSlice'
import { Link } from 'react-router-dom';

const StudentLiveSessionCategory = () => {
    const { data } = useGetAcademyCategoryQuery();

    const defaultImage = "/media/images/600x400/1.jpg";

    return (
        <div>
            <Container>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data?.data?.map((category, index) => (
                        <Link
                            to={`/academy/${category._id}`}
                            key={category.id || index}
                            className="card hover:shadow-lg transition-shadow duration-300"
                        >
                            <div className="card-body">
                                <div className="flex justify-between items-center mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className='size-12 rounded-lg bg-primary flex items-center justify-center text-xl text-gray-100 dark:text-gray-900'><i class="ki-filled ki-messages"></i></div>
                                        <h4 className='text-lg font-semibold text-gray-800'>
                                            {category.name || "Crypto Academy"}
                                        </h4>
                                    </div>
                                    <i className="ki-filled ki-arrow-up-right"></i>
                                </div>
                                <img
                                    className='rounded-xl h-52 w-full object-cover'
                                    src={category.image || defaultImage}
                                    alt={category.name || "Category image"}
                                />
                            </div>
                        </Link>
                    ))}
                </div>
            </Container>
        </div>
    )
}

export default StudentLiveSessionCategory
