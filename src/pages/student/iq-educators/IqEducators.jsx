import React, { useState, useEffect, useRef } from "react";
import { ArrowUp, CirclePlay, Send, Share2, Check } from "lucide-react"; // Added Check icon
import { useAuthContext } from "@/auth";
import { Sparkles, TrendingUpDown } from "lucide-react";
import { Bitcoin, BarChart3, ArrowRight } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useGetEducatorWithCoursesQuery } from "../../../store/api/client/clientCoursesApiSlice";
import VideoPlayerModal from "./VideoPlayerModal";
import ClientViewLiveSession from "../client-live-session/ClientViewLiveSession";

const IqEducators = () => {
  const { auth } = useAuthContext();
  console.log(auth);
  const userName = auth?.user?.name;

  const { id } = useParams();
  const { data: response } = useGetEducatorWithCoursesQuery(id);
  const [callId, setCallId] = useState(null);
  const [showShareToast, setShowShareToast] = useState(false); // Add toast state

//  useEffect(() => {
//   if (response?.data?.schedules?.length > 0) {
//     const now = new Date();

//     // Pehle sirf aaj ke schedules filter karo
//     const todaySchedules = response.data.schedules.filter((item) => {
//       const scheduleDate = new Date(item.date);
//       return scheduleDate.toDateString() === now.toDateString();
//     });

//     if (todaySchedules.length > 0) {
//       // Time ke according sort karo
//       const sorted = todaySchedules.sort((a, b) => {
//         return new Date(a.date) - new Date(b.date);
//       });

//       // Abhi ke baad ka first schedule lo (upcoming)
//       const upcoming = sorted.find((item) => new Date(item.date) > now);

//       // Agar upcoming mila to use set karo, nahi to latest past ka set karo
//       setCallId(upcoming ? upcoming.callId : sorted[sorted.length - 1].callId);
//     }
//   }
// }, [response]);


useEffect(() => {
    if (response?.data?.schedules && response.data.schedules.length > 0) {
      setCallId(response.data.schedules[0].callId);
    }
  }, [response]);
  console.log("response", response);
  console.log("callId", callId);

  const updates = [
    {
      id: 1,
      name: "Jenny Klabber",
      time: "Week ago",
      message: "I just released a new bootcamp covering my trading strategy.",
      avatar: "/media/avatars/300-14.png",
    },
    {
      id: 2,
      name: "Jenny Klabber",
      time: "Week ago",
      message: "I just released a new bootcamp covering my trading strategy.",
      avatar: "/media/avatars/300-15.png",
    },
    {
      id: 3,
      name: "Jenny Klabber",
      time: "Week ago",
      message: "I just released a new bootcamp covering my trading strategy.",
      avatar: "/media/avatars/300-16.png",
    },
  ];

  const feedData = [
    {
      id: 1,
      name: "Jenny Klabber",
      time: "Week ago",
      message: "I just released a new bootcamp covering my trading strategy.",
      avatar: "/media/avatars/300-14.png",
    },
    {
      id: 2,
      name: "Jenny Klabber",
      time: "Week ago",
      message: "I just released a new bootcamp covering my trading strategy.",
      avatar: "/media/avatars/300-15.png",
    },
    {
      id: 3,
      name: "Jenny Klabber",
      time: "Week ago",
      message: "I just released a new bootcamp covering my trading strategy.",
      avatar: "/media/avatars/300-16.png",
    },
    {
      id: 4,
      name: "Jenny Klabber",
      time: "Week ago",
      message: "I just released a new bootcamp covering my trading strategy.",
      avatar: "/media/avatars/300-16.png",
    },
  ];

  const ideasData = [
    {
      id: 1,
      name: "Jenny Klabber",
      time: "Week ago",
      message: "I just released a new bootcamp covering my trading strategy.",
      avatar: "/media/avatars/300-14.png",
    },
  ];
  const trades = [
    {
      id: 1,
      pair: "EUR/USD",
      date: "WED, FEB 16, 12:30 CET",
      status: "Partial Win",
      statusColor: "green",
      entry: 3639.234,
      stopLoss: 3323.989,
      exit1: 3639.234,
      exit2: 3639.234,
      image: "/media/images/2600x1600/chart.jpg",
    },
    {
      id: 2,
      pair: "GBP/USD",
      date: "THU, FEB 17, 14:00 CET",
      status: "Full Win",
      statusColor: "blue",
      entry: 4450.5,
      stopLoss: 4300.25,
      exit1: 4500.0,
      exit2: 4550.0,
      image: "/media/images/2600x1600/chart.jpg",
    },
  ];

  const courses = [
    {
      id: 1,
      title: "Market Outlook",
      address: "WED, FEB 16, 12:30 CET",
      image: "public/media/images/2600x1600/recordings.jpg",
    },
    {
      id: 2,
      title: "Market Outlook",
      address: "WED, FEB 16, 12:30 CET",
      image: "public/media/images/2600x1600/recordings.jpg",
    },
    {
      id: 3,
      title: "Market Outlook",
      address: "WED, FEB 16, 12:30 CET",
      image: "public/media/images/2600x1600/recordings.jpg",
    },
    {
      id: 4,
      title: "Market Outlook",
      address: "WED, FEB 16, 12:30 CET",
      image: "public/media/images/2600x1600/recordings.jpg",
    },
    {
      id: 5,
      title: "Market Outlook",
      address: "WED, FEB 16, 12:30 CET",
      image: "public/media/images/2600x1600/recordings.jpg",
    },
    {
      id: 6,
      title: "Market Outlook",
      address: "WED, FEB 16, 12:30 CET",
      image: "public/media/images/2600x1600/recordings.jpg",
    },
  ];

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "Mr. Anderson",
      time: "1 Day ago",
      text: "Long before you sit dow to put digital pen to paper you need to make sure you have to sit down and write. I'll show you how to write a great blog post in five simple steps that people will actually want to read. Ready?",
    },
    {
      id: 2,
      sender: "Mrs. Anderson",
      time: "1 Day ago",
      text: "Long before you sit dow to put digital pen to paper.",
    },
  ]);

  // State for the new message input
  const [newMessage, setNewMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");

  // Ref for the messages container to enable auto-scrolling
  const messagesEndRef = useRef(null);

  // Function to scroll to the bottom of the messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom whenever messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending a new message
  const handleSendMessage = (e) => {
    e.preventDefault(); // Prevent form submission and page reload
    if (newMessage.trim() === "") return; // Don't send empty messages

    const newId =
      messages.length > 0 ? Math.max(...messages.map((msg) => msg.id)) + 1 : 1;
    const now = new Date();
    const timeString = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`; // Basic time

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: newId,
        sender: "You", // Assuming the user is "You"
        time: "Just now", // Can be improved to actual time or "X minutes ago"
        text: newMessage.trim(),
      },
    ]);
    setNewMessage(""); // Clear the input field
  };
  const [activeTab, setActiveTab] = useState("feed");
  const data = activeTab === "feed" ? feedData : ideasData;

  const handleOpen = (url) => {
    console.log(url, "urls");

    setVideoUrl(url);
    setOpen(true);
  };

  function handleShare() {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl)
      .then(() => {
        console.log("URL copied to clipboard:", currentUrl);
        // Show toast notification
        setShowShareToast(true);
        // Hide toast after 3 seconds
        setTimeout(() => {
          setShowShareToast(false);
        }, 3000);
      })
      .catch(err => {
        console.error("Failed to copy URL:", err);
        // Show error toast
        setShowShareToast(true);
        setTimeout(() => {
          setShowShareToast(false);
        }, 3000);
      });
  }

  return (
    <div className="container-fluid pb-10">
      {/* Share Toast Notification */}
      {showShareToast && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 transform transition-all duration-300 ease-in-out animate-bounce">
          <Check size={20} className="animate-pulse" />
          <span className="font-medium">Link copied to clipboard!</span>
        </div>
      )}

      <div className="bg-gradient-to-r from-[#2B44D3] to-[#0D0D21] rounded-2xl mb-8 p-8 sm:p-8 flex items-center justify-between sm:flex-row flex-col gap-4">
        <div className="flex items-center gap-4 sm:flex-row flex-col sm:justify-start justify-center">
          <img
            src={response?.data?.educator?.image}
            alt="Ralph Danquah"
            className="w-20 h-20 object-cover rounded-full border-2 border-white object-top"
          />
          <div className="text-center  sm:text-start">
            <h3 className="text-white font-semibold text-base sm:text-lg mb-1">
              {response?.data?.educator?.first_name}{" "}
              {response?.data?.educator?.last_name}
            </h3>
            {/* <p className="text-gray-300 dark:text-gray-50 text-xs sm:text-sm">
              Forex Day Trading, Price Action, Risk Management
            </p> */}
          </div>
        </div>

        <button onClick={() => handleShare()} className="border border-primary bg-primary text-white px-4 py-1 sm:px-5 sm:py-2 rounded-lg text-xs sm:text-sm flex items-center gap-1 hover:bg-primary/90 transition-colors">
          <span><Share2 size={16} /></span> Share
        </button>
      </div>
      <div className="grid grid-cols-12 gap-y-8 md:gap-x-8">
        <div className="col-span-12 xl:col-span-12 space-y-8 mb-8">
          <ClientViewLiveSession bannerImage={response?.data?.educator?.bannerImage} callId={callId}/>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-y-8 md:gap-x-8">
        <div className="col-span-12 xl:col-span-8 space-y-8">
          {/* <div className="">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-y-8 lg:gap-x-8 md:gap-y-8">
              <div className="col-span-12 lg:col-span-12">
                <div className="card rounded-none rounded-b-xl">
                  <img
                    src="/media/images/2600x1600/iq_educators.jpg"
                    alt=""
                    className="w-full h-full rounded-xl object-cover"
                  />
                </div>
              </div>
            </div>
          </div> */}
          {/* <ClientViewLiveSession /> */}
          <div className="text-gray-900 mb-2">
            <div className="bg-[#1f103f] text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium">Recordings</h2>
                <Link className="text-xs text-primary font-normal border-dashed border-b-2 pb-2 border-primary">
                  View All
                </Link>
              </div>
            </div>

            <div className="rounded-b-2xl shadow-md p-6 overflow-x-auto">
              <div className="flex gap-4">
                {response?.data?.recordings?.map((course) => (
                  <div
                    key={course.id}
                    className="w-full sm:w-1/2 md:w-1/3 cursor-pointer border rounded-xl shadow-sm flex-shrink-0"
                  >
                    <div className="rounded-t-xl overflow-hidden">
                      <img
                        src={"/media/images/600x400/1.jpg"}
                        alt={course.title}
                        className="w-full h-36 object-cover"
                        onClick={() => handleOpen(course?.url)}
                      />

                      {/* <div className="absolute inset-0 flex items-center justify-center">
                        <button
                          type="button"
                          className="btn btn-icon btn-circle btn-lg"
                          onClick={() => handleOpen(course?.url)}
                        >
                          <CirclePlay size={60} className="text-white" />
                        </button>
                      </div> */}
                    </div>
                    <div className="p-4">
                      <h3 className="text-md font-normal mb-2">
                        {course.call_title}
                      </h3>
                      <p className="text-xs text-gray-600">{course.address}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="text-gray-900 mb-28">
            <div className="bg-[#1f103f] text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium">Courses</h2>
                <Link className="text-xs text-primary font-normal border-dashed border-b-2 pb-2 border-primary">
                  View All
                </Link>
              </div>
            </div>

            <div className="rounded-b-2xl shadow-md p-6 overflow-x-auto">
              <div className="flex gap-4">
                {response?.data?.courses?.map((course) => (
                  <div
                    key={course.id}
                    className="w-full sm:w-1/2 md:w-1/3 border rounded-xl shadow-sm flex-shrink-0"
                  >
                    <div className="rounded-t-xl overflow-hidden">
                      <img
                        src={course.imageUrl}
                        alt={course.title}
                        className="w-full h-36 object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-md font-normal mb-2">
                        {course.title}
                      </h3>
                      <p className="text-xs text-gray-600">{course.address}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-span-12 xl:col-span-4">
          <div className="grid grid-cols-12 gap-6">
            {/* <div className="col-span-12 md:col-span-6 xl:col-span-12 space-y-6">
              <div className="card rounded-2xl shadow-md overflow-hidden">
                <div className="bg-[#1A1446] px-4 py-3 flex justify-between items-center rounded-t-2xl">
                  <h3 className="text-white font-semibold text-sm">Chatbox</h3>
                </div>

                <div className="p-4 overflow-y-auto flex flex-col space-y-4 relative group">
                  {messages.map((message) => (
                    <div key={message.id} className="flex flex-col gap-2">
                      <div className="text-sm text-gray-900 font-medium">
                        {message.sender}{" "}
                        <span className="text-xs text-gray-600 font-normal ml-1">
                          {message.time}
                        </span>
                      </div>
                      <div className="text-xs font-normal rounded-lg text-gray-800 break-words leading-[1.9]">
                        {message.text}
                      </div>
                    </div>
                  ))}

                  <div ref={messagesEndRef} />

                  <div className="absolute inset-0 flex text-center items-center bg-gray-50 dark:bg-gray-100 justify-center text-gray-800 text-lg opacity-0 group-hover:opacity-100 transition duration-300">
                    No This feature is under-development
                  </div>
                </div>

                <form onSubmit={handleSendMessage} className="p-4">
                  <div className="flex items-center justify-center">
                    <div className="relative w-full max-w-md">
                      <input
                        type="text"
                        placeholder="Your comment..."
                        className="w-full p-4 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 text-xs dark:bg-gray-100"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                      />

                      <button
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 duration-200 focus:outline-none"
                        aria-label="Send message"
                      >
                        <Send size={20} />
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div> */}
            <div className="col-span-12 md:col-span-6 xl:col-span-12">
              <div className="card rounded-2xl shadow-md overflow-hidden">
                {/* Header */}
                <div className="bg-[#1A1446] px-4 py-3 flex justify-between items-center rounded-t-2xl">
                  <h3 className="text-white font-semibold text-sm">
                    Live Updates
                  </h3>
                  <div className="flex space-x-2 bg-[#2D265F] rounded-full p-1">
                    <button
                      onClick={() => setActiveTab("feed")}
                      className={`px-3 py-1 text-xs font-medium rounded-full ${activeTab === "feed"
                        ? "bg-white text-[#1A1446]"
                        : "text-white"
                        }`}
                    >
                      Feed
                    </button>
                    <button
                      onClick={() => setActiveTab("ideas")}
                      className={`px-3 py-1 text-xs font-medium rounded-full ${activeTab === "ideas"
                        ? "bg-white text-[#1A1446]"
                        : "text-white"
                        }`}
                    >
                      Ideas
                    </button>
                  </div>
                </div>

                {/* Updates */}
                <div className="p-4 space-y-3 live_updates iq_educators overflow-auto relative group">
                  {/* Hover Overlay */}
                  <div className="absolute h-screen inset-0 flex text-center items-center bg-gray-50 dark:bg-gray-100 justify-center text-gray-800 text-lg opacity-0 group-hover:opacity-100 transition duration-300">
                    No This feature is under-development
                  </div>

                  {/* Messages */}
                  {updates.map((update) => (
                    <div
                      key={update.id}
                      className="bg-[#F5F2FF] dark:bg-gray-100 rounded-xl p-4"
                    >
                      <div className="flex flex-col gap-4 mb-4">
                        <img
                          src={update.avatar}
                          alt={update.name}
                          className="w-12 h-12 rounded-full"
                        />
                        <div>
                          <h4 className="text-sm font-normal mb-1 text-gray-900">
                            {update.name}
                          </h4>
                          <p className="text-xs font-normal text-gray-600">
                            {update.time}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-normal text-gray-700">
                        {update.message}
                      </p>
                    </div>
                  ))}

                  {/* Cards */}
                  {/* {trades.map((trade) => (
                                        <div key={trade.id} className="card rounded-2xl overflow-hidden w-full relative z-0">
                                        <img src={trade.image} alt={trade.pair} className="w-full h-40 object-cover" />
                                        <div className="p-4">
                                            <div className="flex justify-between items-start sm:flex-row flex-col sm:gap-0 gap-3">
                                            <div className="flex items-center gap-2">
                                                <ArrowUp className="text-green-500 w-8 h-8 shrink-0" />
                                                <div>
                                                <h3 className="font-medium text-gray-800 text-sm mb-1">{trade.pair}</h3>
                                                <p className="text-2xs font-normal text-gray-500 line-clamp-1">{trade.date}</p>
                                                </div>
                                            </div>
                                            <span
                                                className={`bg-${trade.statusColor}-100 text-${trade.statusColor}-700 text-3xs font-normal px-2 py-2 truncate rounded-lg`}
                                            >
                                                {trade.status}
                                            </span>
                                            </div>

                                            <div className="mt-6 space-y-4">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600 font-normal text-sm">Entry</span>
                                                <span className="font-medium text-gray-800">{trade.entry}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600 font-normal text-sm">Stop Loss</span>
                                                <span className="font-medium text-gray-800">{trade.stopLoss}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600 font-normal text-sm">Exit 1</span>
                                                <span className="font-medium text-gray-800">{trade.exit1}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600 font-normal text-sm">Exit 2</span>
                                                <span className="font-medium text-gray-800">{trade.exit2}</span>
                                            </div>
                                            </div>
                                        </div>
                                        </div>
                                    ))} */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <VideoPlayerModal
        open={open}
        onOpenChange={setOpen}
        videoUrl={videoUrl}
      />
    </div>
  );
};

export default IqEducators;
