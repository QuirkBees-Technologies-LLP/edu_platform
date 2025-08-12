import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectSelectedLanguage } from "../../../store/reducer/studentLanagugeSlice";
import {
  useGetAcademyCategoryQuery,
  useGetAcademySingleCategoryQuery,
} from "../../../store/api/client/clientAcademyCategoryApiSlice";
import Loader from "../../../components/ui/loader";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function IqAcademy() {
  const selectedLanguage = useSelector(selectSelectedLanguage);

  const {
    data: categoryData,
    isLoading: isCategoryLoading,
    isError: isCategoryError,
  } = useGetAcademyCategoryQuery();

  const [activeCategoryId, setActiveCategoryId] = useState(null);

  useEffect(() => {
    if (!isCategoryLoading && categoryData?.data?.length > 0) {
      setActiveCategoryId(categoryData.data[0]._id);
    }
  }, [isCategoryLoading, categoryData, selectedLanguage]);

  const {
    data: singleCategoryData,
    isLoading: isDetailLoading,
    isError: isDetailError,
  } = useGetAcademySingleCategoryQuery(
    { 
      id: activeCategoryId,
      language: selectedLanguage 
    },
    {
      skip: !activeCategoryId,
      refetchOnMountOrArgChange: true,
    }
  );

  const categoryList = categoryData?.data || [];
  const educators = singleCategoryData?.data?.category?.educators || [];

  const isInitialLoading =
    isCategoryLoading || !activeCategoryId || isDetailLoading;

  const getDayName = (datetime) =>
    new Date(datetime).toLocaleDateString("en-US", { weekday: "short" });

  const isToday = (datetime) => {
    const today = new Date();
    const scheduleDate = new Date(datetime);
    return today.toDateString() === scheduleDate.toDateString();
  };
console.log(educators, "educators");

  return (
    <div className="container-fluid">
      {/* Smart Loader */}
      {isInitialLoading && (
        <div className="text-center py-10 text-gray-500">
          <Loader />
        </div>
      )}

      {/* No categories */}
      {!isCategoryLoading && categoryList.length === 0 && (
        <div className="text-center py-10 text-red-500">No categories found.</div>
      )}

      {/* Category Tabs */}
      {!isCategoryLoading && categoryList.length > 0 && (
        <div className="flex items-center justify-between mb-4 gap-5 flex-col sm:flex-row">
          <div className="flex gap-3 text-sm font-normal flex-wrap">
            {categoryList.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setActiveCategoryId(cat._id)}
                className={`pb-4 border-b-2 ${activeCategoryId === cat._id
                  ? "border-black dark:border-white text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-900"
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          {/* <div>
            <select className="bg-gray-100 border rounded-lg px-3 py-3 text-sm text-gray-600 focus:outline-none">
              <option>Scalping</option>
              <option>Day Trading</option>
              <option>Swing Trading</option>
            </select>
          </div> */}
        </div>
      )}

      {/* Schedule Table */}
      {!isInitialLoading && activeCategoryId && singleCategoryData && (
        <>
          {educators.length === 0 ? (
            <div className="bg-gray-100 dark:bg-gray-100 py-12 rounded-2xl flex justify-center items-center h-72 w-full">
              <div className="text-center">
                <p className="text-lg sm:text-xl tracking-widest text-gray-500 dark:text-gray-400">
                  No educators found in this category.
                </p>
              </div>
            </div>
          ) : (
            <div className="card forex_calender rounded-2xl shadow">
              <div className="calender">
                {/* Table Header */}
                <div className="grid grid-cols-8 text-center table_head">
                  <div className="bg-[#1A1446] text-gray-100 dark:text-gray-900 py-5 px-4 font-normal rounded-tl-2xl">Educators</div>
                  {days.map((day) => (
                    <div key={day} className="bg-[#1A1446] text-gray-100 dark:text-gray-900 py-5 px-4 font-normal last:rounded-tr-2xl">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Educator Rows */}
                {educators.map((educator, index) => (
                  <div key={index} className="grid grid-cols-8 border-t">
                    {/* Educator Info */}
                    <div className="flex flex-col items-center justify-center p-4 bg-gray-200 border-r">
                      <img
                        src={educator.image}
                        alt={educator.first_name}
                        className="w-12 h-12 rounded-full mb-2"
                      />
                      <span className="text-xs font-normal text-gray-800 text-center">
                        {educator.first_name} {educator.last_name}
                      </span>
                    </div>

                    {/* Day-wise schedule */}
                    {days.map((day) => {
                      const filtered = educator.schedules?.filter(
                        (s) => getDayName(s.datetime) === day
                      ) || [];

                      return (
                        <div
                          key={day}
                          className="p-2 min-h-[80px] border-r flex flex-col justify-center gap-2"
                        >
                                                     {filtered.length > 0 ? (
                             filtered.map((s, i) => (
                               <div
                                 key={i}
                                 className={`text-xs rounded-lg p-2 text-center ${
                                   isToday(s.datetime)
                                     ? "bg-[#4E34E3] text-white font-medium shadow-lg"
                                     : "bg-[#E5DEFF] dark:bg-primar-clarity text-[#4E34E3]"
                                 }`}
                               >
                                 {s.title}
                                 <br />
                                 {new Date(s.datetime).toLocaleTimeString([], {
                                   hour: "2-digit",
                                   minute: "2-digit",
                                 })}
                               </div>
                             ))
                          ) : (
                            <div className="text-xs text-gray-700 text-center">–</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Educator Cards */}
      {!isInitialLoading && activeCategoryId && singleCategoryData && educators.length > 0 && (
        <div className="py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {educators.map((educator, index) => (
              <div key={index} className="card rounded-2xl shadow-md overflow-hidden">
                <div className="relative h-56 flex items-center justify-center">
                  <img
                    src={educator.image}
                    alt={educator.first_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-gray-900 font-medium text-md mb-4">
                    {educator.first_name} {educator.last_name}
                  </h3>
                  <Link
                    to={`/iq-educators/${educator._id}`}
                    className="btn btn-light btn-lg rounded-2xl bg-gray-200 text-xs text-gray-800 font-medium"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
