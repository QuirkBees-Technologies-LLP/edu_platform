import React from 'react';
import { Container } from '@/components/container';
import { Link } from 'react-router-dom';
import {
    Toolbar,
    ToolbarActions,
    ToolbarDescription,
    ToolbarHeading,
    ToolbarPageTitle,
} from '@/partials/toolbar';
import { Videotape } from 'lucide-react';
import Spinner from '@/components/common/LoadingSpinner'; // Optional loader component

const EducatorViseRecording = ({ data, isLoading, isError, error }) => {
    if (isLoading) {
        return (
            <Container>
                <div className="flex justify-center py-20">
                    <Spinner />
                </div>
            </Container>
        );
    }

    if (isError) {
        return (
            <Container>
                <div className="text-center text-red-500 py-10">
                    Error fetching recordings: {error?.message || 'Something went wrong'}
                </div>
            </Container>
        );
    }

    const hasNoData = Array.isArray(data) && data.length === 0;

    return (
        <div>
            {hasNoData ? (
                <div className="card w-full h-100 items-center justify-center">
                    <div className="text-center flex items-center gap-3 flex-col py-24">
                        <Videotape size={30} />
                        <h3 className="text-xl font-medium text-gray-700">
                            No Recordings Available
                        </h3>
                    </div>
                </div>
            ) : (
                <div className="grid xl:grid-cols-3 sm:grid-cols-2 gap-4">
                    {Array.isArray(data) &&
                        data.map(({ recorder }) => (
                            <div key={recorder.id} className="card">
                                <Link
                                    to={`/admin/stream-recording/${recorder.id}`}
                                    className="card hover:shadow-lg transition-shadow duration-300"
                                >
                                    <div className="card-body">
                                        <h6 className="flex items-center justify-between text-lg text-center font-medium text-gray-900 mb-2">
                                            {recorder.full_name}{" "}
                                            <span
                                                className={`inline-block badge badge-xs rounded-full font-medium ${recorder.role === 'admin'
                                                    ? 'bg-red-100 text-red-600'
                                                    : 'bg-blue-100 text-blue-600'
                                                    }`}
                                            >
                                                {recorder.role}
                                            </span>
                                        </h6>
                                        <img
                                            className="rounded-xl h-80 w-full object-cover"
                                            src={recorder.image || '/media/avatars/default.png'}
                                            alt={recorder.full_name}
                                        />
                                        <button className="btn text-md bg-primary-light text-primary w-full justify-center mt-3">
                                            {recorder.total_recording} Recordings
                                        </button>
                                    </div>
                                </Link>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
};

export default EducatorViseRecording;
