import { useCall } from '@stream-io/video-react-sdk';
import { Eye, Pencil, RefreshCcw, Trash } from 'lucide-react';
import React, { useEffect, useState } from 'react'

const Recording = () => {
    const call = useCall();
    const [sentRecordingIds, setSentRecordingIds] = useState(new Set());
    const [recordings, setRecordings] = useState([]);

    // Automatically send new recordings to backend
    useEffect(() => {
        const sendNewRecordings = async () => {
            const newRecordings = recordings.filter(
                (rec) => !sentRecordingIds.has(rec.id)
            );

            for (const recording of newRecordings) {
                const payload = {
                    ...recording,
                    call_id: call.id,
                    call_title: call?.state?.custom?.title,
                    call_description: call?.state?.custom?.description,
                    call_category: call?.state?.custom?.category,
                    call_tags: call?.state?.custom?.tags,
                };
                try {
                    const response = await fetch('/api/recordings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(recording),
                    });

                    if (response.ok) {
                        setSentRecordingIds(prev => new Set(prev).add(recording.id));
                    }
                } catch (err) {
                    console.error('Failed to send recording:', err);
                }
            }
        };

        sendNewRecordings();
    }, [recordings, sentRecordingIds]);

    const fetchRecordings = async () => {
        try {
            const response = await call.queryRecordings();
            setRecordings(response.recordings);
        } catch (err) {
            console.error('Failed to fetch recordings:', err);
        }
    };

    useEffect(() => {
        // Fetch recordings when the component mounts
        fetchRecordings();
    }, [call]);

    console.log(recordings, "recordings inner");
    
    return (
        <div className="rounded-lg shadow-sm py-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-gray-900 text-xl font-bold">Session Recordings</h3>
                <button
                    onClick={fetchRecordings}
                    className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary-dark text-white font-medium rounded-md transition-colors duration-300 focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                    <RefreshCcw size={16} className='me-2'/>
                    Refresh List
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                {recordings.map((rec) => (
                    <div
                        key={rec.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <div className='mb-3'>
                                    <h5 className="text-sm font-medium text-gray-500">Title</h5>
                                    <p className="text-gray-900 font-semibold">THis is a title</p>
                                </div>
                                <div className='mb-3'>
                                    <h5 className="text-sm font-medium text-gray-500">Description</h5>
                                    <p className="text-gray-900 font-semibold">THis is a Description</p>
                                </div>
                                <p className="text-sm font-medium text-gray-500">Start Time</p>
                                <p className="text-gray-900 font-semibold">
                                    {new Date(rec.start_time).toLocaleString()}
                                </p>
                            </div>
                            {/* <span className={`px-2 py-1 text-xs rounded-full ${rec.status === 'completed'
                                    ? 'bg-green-100 text-green-800'
                                    : rec.status === 'processing'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                {rec.status}
                            </span> */}
                            <div>
                                
                                <button className='px-2 py-2 text-xs rounded-full bg-primary-light text-primary hover:text-white hover:bg-primary  dark:bg-light dark:hover:bg-primary me-2'><Eye size={16} /></button>
                                <button className='px-2 py-2 text-xs rounded-full bg-green-100 text-green-800 hover:text-white hover:bg-green-600  dark:bg-light dark:hover:bg-green-600 me-2'><Pencil size={16} /></button>
                                <button className='px-2 py-2 text-xs rounded-full bg-red-100 text-red-800 hover:text-white hover:bg-red-600 dark:bg-light dark:hover:bg-red-600 '><Trash size={16} /></button>
                            </div>
                        </div>

                        <div className="mb-3">
                            <p className="text-sm font-medium text-gray-500">End Time</p>
                            <p className="text-gray-900 font-semibold">
                                {new Date(rec.end_time).toLocaleString()}
                            </p>
                        </div>
                        
                        <button className="inline-flex items-center w-full justify-center px-4 py-2 border border-gray-300 rounded-md bg-light text-gray-700 transition-colors duration-300">Save</button>
                        {/* {rec.url && (
                            <a
                                href={rec.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center w-full justify-center px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition-colors duration-300"
                            >
                                <svg
                                    className="w-5 h-5 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                    />
                                </svg>
                                Download Recording
                            </a>
                        )} */}
                    </div>
                ))}
            </div>

            {recordings.length === 0 && (
                <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">
                        <svg
                            className="w-16 h-16 mx-auto"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z"
                            />
                        </svg>
                    </div>
                    <p className="text-gray-500 text-lg">No recordings available</p>
                    <p className="text-gray-400 text-sm">Start a recording session to see results here</p>
                </div>
            )}
        </div>
    )
}

export default Recording;