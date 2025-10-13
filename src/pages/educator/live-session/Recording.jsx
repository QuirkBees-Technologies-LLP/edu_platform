import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk';
import { useEffect, useState } from 'react';
import { Eye, Pencil, RefreshCcw, Save, Trash } from 'lucide-react';
import { useGetEducatorRecordingByCallIDQuery, useSaveEducatorRecordingMutation } from '../../../store/api/educator/educatorRecordingApiSlice';
import { useAuthContext } from '../../../auth/useAuthContext';
import ShowMoreLess from '../../../components/ui/showmoreless';
// import CreateEducatorRecording from '../../educator/recording/CreateEducatorRecording';
import DeleteEducatorRecording from '../../educator/recording/DeleteEducatorRecording';
import VideoThumbnail from './VideoThumbnail';
import { format } from 'date-fns';
import Loader from '../../../components/ui/loader';
import UpdateEducatorRecording from '../recording/UpdateEducatorRecording';

const Recording = () => {
    const call = useCall();
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState({});
    const [streamRecordings, setStreamRecordings] = useState([]);
    const [savingRecordings, setSavingRecordings] = useState(new Set()); // Track loading state for each recording
    const [isLoadingRecordings, setIsLoadingRecordings] = useState(false);
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);

    const { auth } = useAuthContext();
    const educator_id = auth?.user?._id ?? '';
    const { data: backendRecordings = [], refetch } = useGetEducatorRecordingByCallIDQuery(call?.id);
    const [addRecording] = useSaveEducatorRecordingMutation();

    // Get live status from Stream.io
    const { useIsCallLive } = useCallStateHooks();
    const isLive = useIsCallLive();

    console.log("backendRecordings",backendRecordings)
    // Fetch Stream recordings
    const fetchStreamRecordings = async () => {
        setIsLoadingRecordings(true);
        try {
            const response = await call.queryRecordings();
            console.log('Recordings response:', response);
            if (response && response.recordings) {
                setStreamRecordings(response.recordings);
            } else {
                setStreamRecordings([]);
            }
        } catch (err) {
            console.error('Failed to fetch stream recordings:', err);
            setStreamRecordings([]);
        } finally {
            setIsLoadingRecordings(false);
        }
    };

    // Handle saving a Stream recording to backend
    const handleSaveRecording = async (recording) => {
        const recordingKey = recording.filename || recording.id || `recording-${Date.now()}`;
        console.log("Starting to save recording with key:", recordingKey);
        console.log("Current savingRecordings:", Array.from(savingRecordings));
        
        setSavingRecordings(prev => new Set([...prev, recordingKey]));
        
        try {
            const payload = {
                ...recording,
                educator_id,
                call_id: call.id,
                call_title: call?.state?.custom?.title,
                call_description: call?.state?.custom?.description,
                call_category: call?.state?.custom?.category,
                call_tags: call?.state?.custom?.tags,
            };
            await addRecording(payload).unwrap();
            refetch(); // Refresh the backend recordings list
        } catch (err) {
            console.error('Failed to save recording:', err);
        } finally {
            console.log("Finishing save for recording with key:", recordingKey);
            setSavingRecordings(prev => {
                const newSet = new Set(prev);
                newSet.delete(recordingKey);
                console.log("Updated savingRecordings:", Array.from(newSet));
                return newSet;
            });
        }
    };

    // Auto-fetch recordings when live stream stops
    useEffect(() => {
        if (!isLive && call) {
            // Fetch immediately when live stops
            fetchStreamRecordings();
            
            // Set up limited polling to check for new recordings
            let pollCount = 0;
            const maxPolls = 4; // Poll for maximum 20 seconds (4 * 5 seconds)
            
            const pollInterval = setInterval(() => {
                pollCount++;
                
                // Stop polling if we've reached max attempts
                if (pollCount >= maxPolls) {
                    clearInterval(pollInterval);
                    return;
                }
                
                // Fetch recordings
                fetchStreamRecordings();
            }, 5000);
            
            return () => {
                clearInterval(pollInterval);
            };
        }
    }, [isLive, call]);

    // Also fetch recordings when component mounts or call changes
    useEffect(() => {
        if (call) {
            fetchStreamRecordings();
        }
    }, [call]);

    // Add a manual refresh function that can be called from parent
    const refreshRecordings = () => {
        fetchStreamRecordings();
    };

    // Expose refresh function to parent component if needed
    useEffect(() => {
        if (window) {
            window.refreshRecordings = refreshRecordings;
        }
    }, []);

    const handleRefresh = () => {
        refetch();
        fetchStreamRecordings();
    };

    const handleEdit = (rec) => {
        setSelectedRow(rec);
        setIsUpdateOpen(true);
        setIsDeleteOpen(false);
    };

    const handleDelete = (rec) => {
        setSelectedRow(rec);
        setIsDeleteOpen(true);
        setIsCreateOpen(false);
    };

    const handleCloseCreate = () => {
        setIsDeleteOpen(false);
        setIsCreateOpen(false);
    };
     const handleCloseUpdate = () => {
    setIsUpdateOpen(false);
    setSelectedRow(null);
  };

    const handleDeleteClose = () => {
        setIsDeleteOpen(false);
    };

    console.log(streamRecordings, "streamRecordings");

    const handleView = (url) => {
        window.open(url, '_blank');
    }

    return (
        <div className="card rounded-lg shadow-sm py-6 md:mb-8">
            <div className="card-body">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-gray-900 text-xl font-bold">Session Recordings</h3>
                    <button
                        onClick={handleRefresh}
                        className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary-dark text-white font-medium rounded-md"
                    >
                        <RefreshCcw size={16} className="me-2" />
                        Refresh List
                    </button>
                </div>

                <div className='grid grid-cols-12 gap-5'>
                    <div className="col-span-12 xl:col-span-6">
                        {/* Stream Recordings Section */}
                        <div>
                            <h4 className="text-lg font-semibold mb-4 text-gray-800">Available Recordings</h4>
                            {/* <p className="text-sm mb-4 text-danger">Note: This recording will be available for the next 2 weeks. Please make sure to save it if you wish to retain access.</p> */}
                            <div className="grid grid-cols-1  gap-4">
                                {isLoadingRecordings ? (
                                    <Loader />
                                ) : (
                                    streamRecordings?.map((rec, index) => {

                                        console.log("Recording object:", rec);
                                        console.log("Recording filename:", rec.filename);
                                        console.log("Recording id:", rec.id);
                                        console.log("Is saving:", savingRecordings.has(rec.filename || rec.id));
                                        
                                        // Check if this recording is already saved
                                        const isSaved = backendRecordings?.data?.recordings?.some(
                                            backendRec => backendRec.streamio_filename === rec.filename
                                        );

                                        return (
                                            <div key={rec.id} className="border rounded-lg p-4 hover:shadow-md">
                                                <div className="w-full mb-3">
                                                    <div>
                                                        <VideoThumbnail key={index} videoUrl={rec.url} />
                                                        <p className="text-gray-900 text-xs mt-2">{call?.state?.custom?.title || 'No title'}</p>
                                                        <ShowMoreLess className="text-gray-900 text-xs mt-2" html={call?.state?.custom?.description || 'No description'} maxLength={100} />
                                                        <p className="text-gray-900 text-xs mt-2">{format(rec.start_time, "MMM dd, yyyy, hh:mm a")} -- {format(rec.end_time, "MMM dd, yyyy, hh:mm a")}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleSaveRecording(rec)}
                                                    disabled={isSaved || savingRecordings.has(rec.filename || rec.id)}
                                                    className={`w-full py-2 px-4 rounded-md flex items-center justify-center ${isSaved
                                                        ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                                                        : 'bg-primary hover:bg-primary-dark text-white'
                                                        }`}
                                                >
                                                    {savingRecordings.has(rec.filename || rec.id) ? (
                                                        'Saving...'
                                                    ) : (
                                                        <>
                                                            <Save size={16} className="mr-2" />
                                                            {isSaved ? 'Saved' : 'Save Recording'}
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {streamRecordings.length === 0 && !isLoadingRecordings && (
                                <div className="text-center py-4 text-gray-500">
                                    <p>No available recordings to save</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-span-12 xl:col-span-6">
                        {/* Saved Recordings Section */}
                        <div className="mb-8">
                            <h4 className="text-lg font-semibold mb-4 text-gray-800">Saved Recordings</h4>
                            <div className="grid grid-cols-1 gap-4">
                                {backendRecordings?.data?.recordings?.map((rec, index) => (
                                    <div key={rec._id} className="border rounded-lg p-4 hover:shadow-md">
                                        <div className="w-full mb-3">
                                            <div>
                                                <VideoThumbnail key={index} videoUrl={rec.url} recordingThumbnail={rec.thumbnail} />
                                                <p className="text-gray-900 text-xs mt-2">{rec.call_title || 'No title'}</p>
                                                <ShowMoreLess isHtml={true} className="text-gray-900 text-xs mt-2" html={rec.call_description || 'No description'} maxLength={100} />
                                                <p className="text-gray-900 text-xs mt-2">{format(rec.start_time, "MMM dd, yyyy, hh:mm a")} -- {format(rec.end_time, "MMM dd, yyyy, hh:mm a")}</p>
                                            </div>
                                        </div>
                                        <div className='flex justify-center mt-3 gap-5'>
                                            <button className="bg-gray-200 p-3 rounded-lg" onClick={() => handleEdit(rec)}><Pencil size={16} /></button>
                                            <button className="bg-gray-200 p-3 rounded-lg" onClick={() => handleDelete(rec)}><Trash size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {backendRecordings?.data?.recordings?.length === 0 && (
                                <div className="text-center py-4 text-gray-500">
                                    <p>No saved recordings available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
              {isUpdateOpen && (
                    <UpdateEducatorRecording
                      setSelectedRow={setSelectedRow}
                      handleCloseUpdate={handleCloseUpdate}
                      isUpdateOpen={isUpdateOpen}
                      setIsUpdateOpen={setIsUpdateOpen}
                      refetch={refetch}
                      selectedRow={selectedRow}
                    />
                  )}
            {/* <CreateEducatorRecording
                setSelectedRow={setSelectedRow}
                handleCloseCreate={handleCloseCreate}
                isCreateOpen={isCreateOpen}
                setIsCreateOpen={setIsCreateOpen}
                refetch={refetch}
                selectedRow={selectedRow}
            /> */}
            {isDeleteOpen && (
                <DeleteEducatorRecording
                    refetch={refetch}
                    isDeleteOpen={isDeleteOpen}
                    handleDeleteClose={handleDeleteClose}
                    selectedRow={selectedRow}
                />
            )}
        </div>
    );
};

export default Recording;