


import React from "react";
import { Card, CardContent } from "@/components/ui/card"; // Assuming these are shadcn/ui components
import { Button } from "@/components/ui/button"; // Assuming this is a shadcn/ui component
import { Video, BookOpen, LineChart } from "lucide-react"; // Lucide icons

export default function TrandingPlatform() {
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (newValue) => {
    setTabValue(newValue);
  };

  return (
    <div className="min-h-screen font-inter">
      <div className="container-fluid mx-auto">
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
          <h2 className="text-3xl sm:text-3xl text-gray-900 font-extrabold mb-4 sm:mb-0">
            Educator Profile
          </h2>
          <Button className="px-6 py-2 bg-primary text-white rounded-full shadow-md hover:bg-primary transition-colors duration-300">
            Follow
          </Button>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Educator Profile Card */}
          <Card className="rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 md:col-span-1 overflow-hidden">
            <CardContent className="p-0"> {/* Remove default padding */}
              <div className="flex flex-col items-center text-center p-6">
                {/* Image with rounded corners and aspect ratio */}
                <div className="w-full relative pb-[100%] mb-4"> {/* Aspect ratio box */}
                  <img
                    src="/media/avatars/300-6.png" // Placeholder image
                    alt="Educator"
                    className="absolute inset-0 w-full h-full object-cover rounded-lg shadow-md"
                  />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">John Trader</h2>
                <p className="text-base text-gray-700">Technical Analyst & Educator</p>
              </div>
            </CardContent>
          </Card>

          {/* Tabs and Content Card */}
          <Card className="rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 md:col-span-2">
            <CardContent className="p-0"> {/* Remove default padding */}
              {/* Tabs Header */}
              <div className="flex border-b border-gray-200 bg-white rounded-t-xl mx-2">
                <button
                  className={`flex-1 flex items-center justify-center py-4 px-2 text-sm sm:text-base font-medium rounded-tl-xl
                    ${tabValue === 0 ? "text-primary border-b-2 border-primary" : "text-gray-600 hover:text-primary"}
                    focus:outline-none transition-colors duration-200`}
                  onClick={() => handleTabChange(0)}
                >
                  <Video size={18} className="mr-2" />
                  Streams
                </button>
                <button
                  className={`flex-1 flex items-center justify-center py-4 px-2 text-sm sm:text-base font-medium
                    ${tabValue === 1 ? "text-primary border-b-2 border-primary" : "text-gray-600 hover:text-primary"}
                    focus:outline-none transition-colors duration-200`}
                  onClick={() => handleTabChange(1)}
                >
                  <BookOpen size={18} className="mr-2" />
                  Courses
                </button>
                <button
                  className={`flex-1 flex items-center justify-center py-4 px-2 text-sm sm:text-base font-medium rounded-tr-xl
                    ${tabValue === 2 ? "text-primary border-b-2 border-primary" : "text-gray-600 hover:text-primary"}
                    focus:outline-none transition-colors duration-200`}
                  onClick={() => handleTabChange(2)}
                >
                  <LineChart size={18} className="mr-2" />
                  Market Ideas
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {tabValue === 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2, 3].map((id) => (
                      <Card key={id} className="rounded-lg shadow-sm overflow-hidden">
                        <CardContent className="p-4">
                          <div className="w-full relative pb-[56.25%] mb-3 rounded bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                            {/* 16:9 aspect ratio for video placeholder */}
                            <img
                              src={`https://placehold.co/400x225/E0E0E0/000000?text=Stream+${id}`}
                              alt={`Live Stream ${id}`}
                              className="absolute inset-0 w-full h-full object-cover rounded"
                            />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">Live Stream #{id}</h3>
                          <p className="text-sm text-gray-700">Streaming now on TradingView</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {tabValue === 1 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2].map((id) => (
                      <Card key={id} className="rounded-lg shadow-sm overflow-hidden">
                        <CardContent className="p-4">
                          <div className="w-full relative pb-[56.25%] mb-3 rounded bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                            {/* 16:9 aspect ratio for course placeholder */}
                            <img
                              src={`https://placehold.co/400x225/E0E0E0/000000?text=Course+${id}`}
                              alt={`Course ${id}`}
                              className="absolute inset-0 w-full h-full object-cover rounded"
                            />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">Course #{id}</h3>
                          <p className="text-sm text-gray-700">Master Technical Indicators</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {tabValue === 2 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2, 3, 4].map((id) => (
                      <Card key={id} className="rounded-lg shadow-sm">
                        <CardContent className="p-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">Idea #{id}</h3>
                          <p className="text-sm text-gray-700 mb-3">
                            Bullish breakout spotted on NASDAQ.
                          </p>
                          <Button
                            size="sm"
                            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md border border-gray-300 hover:bg-gray-200 transition-colors duration-200 text-sm"
                          >
                            View Details
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
