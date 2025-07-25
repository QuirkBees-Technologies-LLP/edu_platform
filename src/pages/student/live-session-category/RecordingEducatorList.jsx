import React from 'react'
import { Container } from '@/components/container';
import { Link } from 'react-router-dom';
import { Toolbar, ToolbarActions, ToolbarDescription, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import { Videotape } from 'lucide-react';

const RecordingEducatorList = () => {
  return (
    <div>
        <Container>
            <Toolbar>
                <ToolbarHeading>
                    <ToolbarPageTitle text="Educator Recording" />
                    <ToolbarDescription>
                    Oversee educator profiles, manage their sessions, and ensure quality trade and course content across the platform.
                    </ToolbarDescription>
                </ToolbarHeading>
            </Toolbar>
            <div className="grid xl:grid-cols-3 sm:grid-cols-2 gap-4">
                    <div
                        className="card">
                        <Link
                            to="3"
                            className="card hover:shadow-lg transition-shadow duration-300"
                        >
                            <div className="card-body">
                                <h6 className="text-lg text-center font-medium text-gray-900 mb-3">
                                    Filipe Forner
                                </h6>
                                <img
                                                            className="rounded-xl h-80 w-full object-cover"
                                                            src="/media/avatars/300-1.png"
                                                            alt=""
                                                        />

                                {/* <button
                                    className="btn text-md btn-primary text-white w-full justify-center mt-3">
                                    Access to live
                                </button> */}

                                <button
                                    className="btn text-md bg-primary-light text-primary w-full justify-center mt-3">
                                    Access to Courses
                                </button>
                            </div>
                        </Link>
                    </div>
                    <div
                        className="card">
                        <Link
                            to="3"
                            className="card hover:shadow-lg transition-shadow duration-300"
                        >
                            <div className="card-body">
                                <h6 className="text-lg text-center font-medium text-gray-900 mb-3">
                                    Filipe Forner
                                </h6>
                                <img
                                                            className="rounded-xl h-80 w-full object-cover"
                                                            src="/media/avatars/300-1.png"
                                                            alt=""
                                                        />

                                {/* <button
                                    className="btn text-md btn-primary text-white w-full justify-center mt-3">
                                    Access to live
                                </button> */}

                                <button
                                    className="btn text-md bg-primary-light text-primary w-full justify-center mt-3">
                                    Access to Courses
                                </button>
                            </div>
                        </Link>
                    </div>
                    <div
                        className="card">
                        <Link
                            to="3"
                            className="card hover:shadow-lg transition-shadow duration-300"
                        >
                            <div className="card-body">
                                <h6 className="text-lg text-center font-medium text-gray-900 mb-3">
                                    Filipe Forner
                                </h6>
                                <img
                                                            className="rounded-xl h-80 w-full object-cover"
                                                            src="/media/avatars/300-1.png"
                                                            alt=""
                                                        />

                                {/* <button
                                    className="btn text-md btn-primary text-white w-full justify-center mt-3">
                                    Access to live
                                </button> */}

                                <button
                                    className="btn text-md bg-primary-light text-primary w-full justify-center mt-3">
                                    Access to Courses
                                </button>
                            </div>
                        </Link>
                    </div>
                    <div
                        className="card">
                        <Link
                            to="3"
                            className="card hover:shadow-lg transition-shadow duration-300"
                        >
                            <div className="card-body">
                                <h6 className="text-lg text-center font-medium text-gray-900 mb-3">
                                    Filipe Forner
                                </h6>
                                <img
                                                            className="rounded-xl h-80 w-full object-cover"
                                                            src="/media/avatars/300-1.png"
                                                            alt=""
                                                        />

                                {/* <button
                                    className="btn text-md btn-primary text-white w-full justify-center mt-3">
                                    Access to live
                                </button> */}

                                <button
                                    className="btn text-md bg-primary-light text-primary w-full justify-center mt-3">
                                    Access to Courses
                                </button>
                            </div>
                        </Link>
                    </div>
            </div>
            {/* no data found  */}
            <div className="card w-full h-100 items-center justify-center hidden">
                <div className="text-center flex items-center gap-3 flex-col py-24">
                    <Videotape size={30}/>
                    <h3 className="text-xl font-medium text-gray-700">
                        No Recording available
                    </h3>
                </div>
            </div>
        </Container>
    </div>
  )
}

export default RecordingEducatorList