import React, { useState, useRef, useEffect } from "react";
import { Container } from "@/components/container";
import InfiniteScroll from "react-infinite-scroll-component";
import { useAuthContext } from "@/auth/useAuthContext";
import { Video, Image, Rss } from "lucide-react";
import TaskCard from "./TaskCard";
import CreateTask from "./CreateTask";
import { useLazyGetTasksQuery } from "../../../store/api/admin/adminTaskManagementApiSlice";
import DeleteTask from "./DeleteTask";

const Task = () => {
  const { auth } = useAuthContext();

  const [triggerGetTasks, { data, isLoading, isFetching }] =
    useLazyGetTasksQuery();

  const [tasks, setTasks] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);

  useEffect(() => {
    fetchTasks(1);
  }, []);

  const fetchTasks = async (pageNum) => {
    try {
      const response = await triggerGetTasks({
        page: pageNum,
        limit: 10,
      }).unwrap();
      const newData = response?.tickets || [];

      if (pageNum === 1) setTasks(newData);
      else setTasks((prev) => [...prev, ...newData]);

      const total = response?.pagination?.total || 0;
      const totalFetched = (pageNum - 1) * 10 + newData.length;
      setHasMore(totalFetched < total);
      setPage(pageNum);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const loadMore = () => {
    if (hasMore && !isFetching) {
      fetchTasks(page + 1);
    }
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };
  const handleDeleteTask = (task) => {
    setDeletingTask(task);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    fetchTasks(1);
  };

  return (
    <Container>
      <div className="min-h-screen font-sans">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {/* Left Sidebar */}
          <div className="md:col-span-12 lg:col-span-2 xl:col-span-1 space-y-4">
            <div className="card rounded-lg shadow-md overflow-hidden">
              <div className="relative">
                <img
                  src="https://i.ibb.co/gLV2tfjF/forex-banner.png"
                  alt="Cover"
                  className="w-full h-20 object-cover"
                />
                <div className="relative">
                  <div className="absolute left-1/2 -translate-x-1/2 top-[-40px] h-[80px] w-[80px]">
                    <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden">
                      <img
                        src={
                          auth?.user?.image ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            auth?.user?.first_name || "User"
                          )}&background=random&color=fff&size=80`
                        }
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center pt-8 pb-4 border-b border-gray-200 mt-3">
                <h2 className="text-lg font-semibold font-termina">
                  {auth?.user?.first_name && auth?.user?.last_name
                    ? `${auth.user.first_name} ${auth.user.last_name}`
                    : auth?.user?.name || "User"}
                </h2>
              </div>
            </div>
          </div>

          <div className="md:col-span-12 lg:col-span-3 xl:col-span-4 space-y-4 mb-5">
            <div className="card rounded-lg shadow-md p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img
                    src={
                      auth?.user?.image ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        auth?.user?.first_name || "User"
                      )}&background=random&color=fff&size=48`
                    }
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={handleCreateTask}
                  className="flex-1 text-center px-4 py-3 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100 transition-colors font-termina"
                >
                  Create a Ticket
                </button>
              </div>

              <div className="mt-4 flex justify-center gap-6">
                <button
                  onClick={handleCreateTask}
                  className="group flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-red-50 hover:scale-105 transition"
                >
                  <div className="p-2 rounded-full bg-red-100 group-hover:bg-red-200">
                    <Video size={20} className="text-red-600" />
                  </div>
                  <span className="text-sm text-gray-700 group-hover:text-red-700 font-termina">
                    Video
                  </span>
                </button>
                <button
                  onClick={handleCreateTask}
                  className="group flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-green-50 hover:scale-105 transition"
                >
                  <div className="p-2 rounded-full bg-green-100 group-hover:bg-green-200">
                    <Image size={20} className="text-green-600" />
                  </div>
                  <span className="text-sm text-gray-700 group-hover:text-green-700 font-termina">
                    Photo
                  </span>
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="card rounded-lg shadow-md p-8 text-center">
                <div className="animate-spin h-12 w-12 border-b-2 border-blue-500 mx-auto rounded-full"></div>
                <p className="mt-4 text-gray-600 font-termina">
                  Loading tickets...
                </p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="card rounded-lg shadow-md p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
                <div className="text-gray-400 mb-4">
                  <Rss size={48} className="mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2 font-termina">
                  No tickets yet
                </h3>
                <p className="text-gray-500 mb-4 font-termina">
                  Be the first to create a tickets!
                </p>
                <button
                  onClick={handleCreateTask}
                  className="btn btn-primary px-6 py-2 font-termina"
                >
                  Create Ticket
                </button>
              </div>
            ) : (
              <InfiniteScroll
                dataLength={tasks.length}
                next={loadMore}
                hasMore={hasMore}
                loader={
                  <div className="text-center py-4 text-gray-500 font-termina">
                    Loading more tickets...
                  </div>
                }
                endMessage={
                  <div className="text-center text-sm text-gray-400 py-4 font-termina">
                    No more tickets
                  </div>
                }
              >
                {tasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    refetch={() => fetchTasks(1)}
                    isOwnTask={auth?.user?._id === task?.author?._id}
                  />
                ))}
              </InfiniteScroll>
            )}
          </div>
        </div>

        {isModalOpen && (
          <CreateTask
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false), setEditingTask(null);
            }}
            editingTask={editingTask}
            refetch={() => fetchTasks(1)}
          />
        )}
        {deletingTask && (
          <DeleteTask
            isDeleteOpen={!!deletingTask}
            handleDeleteClose={() => setDeletingTask(null)}
            selectedTask={deletingTask}
            refetch={() => fetchTasks(1)}
          />
        )}
      </div>
    </Container>
  );
};

export default Task;
