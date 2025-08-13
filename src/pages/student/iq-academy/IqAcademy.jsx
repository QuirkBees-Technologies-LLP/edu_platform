import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectSelectedLanguage } from "../../../store/reducer/studentLanagugeSlice";
import {
  useGetAcademyCategoryQuery,
  useGetAcademySingleCategoryQuery,
} from "../../../store/api/client/clientAcademyCategoryApiSlice";
import Loader from "../../../components/ui/loader";
import { addDays, startOfWeek, isSameDay } from "date-fns";

function toEST(date) {
  return new Date(
    date.toLocaleString("en-US", { timeZone: "America/New_York" })
  );
}

export default function IqAcademy() {
  const selectedLanguage = useSelector(selectSelectedLanguage);

  const [weekOffset, setWeekOffset] = useState(0);
  const startOfCurrentWeek = startOfWeek(toEST(new Date()), {
    weekStartsOn: 0,
  });
  const displayedWeekStart = addDays(startOfCurrentWeek, weekOffset * 7);

  const days = Array.from({ length: 7 }).map((_, i) =>
    toEST(addDays(displayedWeekStart, i))
  );

  const { data: categoryData, isLoading: isCategoryLoading } =
    useGetAcademyCategoryQuery();

  const [activeCategoryId, setActiveCategoryId] = useState(null);

  useEffect(() => {
    if (!isCategoryLoading && categoryData?.data?.length > 0) {
      setActiveCategoryId(categoryData.data[0]._id);
    }
  }, [isCategoryLoading, categoryData, selectedLanguage]);

  const { data: singleCategoryData, isLoading: isDetailLoading } =
    useGetAcademySingleCategoryQuery(
      {
        id: activeCategoryId,
        language: selectedLanguage,
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

  const isToday = (datetime) =>
    isSameDay(toEST(new Date()), toEST(new Date(datetime)));

  return (
    <div className="container-fluid">
      {isInitialLoading && (
        <div className="text-center py-10 text-gray-500">
          <Loader />
        </div>
      )}

      {/* {educators && educators.length > 0 ? null : (
        <div className="text-center">There are no schedule found</div>
      )} */}

      {!isCategoryLoading && categoryList.length === 0 && (
        <div className="text-center py-10 text-red-500">
          No categories found.
        </div>
      )}

      {!isCategoryLoading && categoryList.length > 0 && (
        <div className="flex items-center justify-between mb-4 gap-5 flex-col sm:flex-row">
          <div className="flex gap-3 text-sm font-normal flex-wrap">
            {categoryList.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setActiveCategoryId(cat._id)}
                className={`pb-4 border-b-2 ${
                  activeCategoryId === cat._id
                    ? "border-black dark:border-white text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Week Switch */}
      <div className="flex border-b mb-4 space-x-4">
        <button
          className={`px-4 py-2 ${
            weekOffset === 0
              ? "text-primary font-semibold border-b-2 border-primary"
              : "text-gray-600"
          }`}
          onClick={() => setWeekOffset(0)}
        >
          Current Week
        </button>
        <button
          className={`px-4 py-2 ${
            weekOffset === 1
              ? "text-primary font-semibold border-b-2 border-primary"
              : "text-gray-600"
          }`}
          onClick={() => setWeekOffset(1)}
        >
          Next Week
        </button>
      </div>
      {!isInitialLoading && activeCategoryId && singleCategoryData && (
        <>
          {educators.length === 0 ? (
            <div className="bg-gray-100 py-12 rounded-2xl flex justify-center items-center h-72 w-full">
              <div className="text-center">
                <p className="text-lg sm:text-xl tracking-widest text-gray-500">
                  No educators found in this category.
                </p>
              </div>
            </div>
          ) : (
            <div className="card forex_calender rounded-2xl shadow">
              <div className="calender">
                {/* Table Header */}
                <div className="grid grid-cols-8 text-center table_head">
                  <div className="bg-[#1A1446] text-gray-100 py-5 px-4 font-normal rounded-tl-2xl">
                    Educators
                  </div>
                  {days.map((day) => (
                    <div
                      key={day.toISOString()}
                      className="bg-[#1A1446] text-gray-100 py-5 px-4 font-normal last:rounded-tr-2xl"
                    >
                      {day.toLocaleDateString("en-US", {
                        weekday: "short",
                        day: "numeric",
                      })}
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
                      const filtered =
                        educator.schedules?.filter((s) =>
                          isSameDay(toEST(new Date(s.datetime)), day)
                        ) || [];

                      return (
                        <div
                          key={day.toISOString()}
                          className="p-2 min-h-[80px] border-r flex flex-col justify-center gap-2"
                        >
                          {filtered.length > 0 ? (
                            filtered.map((s, i) => (
                              <div
                                key={i}
                                className={`text-xs rounded-lg p-2 text-center ${
                                  isToday(s.datetime)
                                    ? "bg-[#4E34E3] text-white font-medium shadow-lg"
                                    : "bg-[#E5DEFF] text-[#4E34E3]"
                                }`}
                              >
                                {s.title}
                                <br />
                                {toEST(new Date(s.datetime)).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="text-xs text-gray-700 text-center">
                              –
                            </div>
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
      {!isInitialLoading &&
        activeCategoryId &&
        singleCategoryData &&
        educators.length > 0 && (
          <div className="py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {educators.map((educator, index) => (
                <div
                  key={index}
                  className="card rounded-2xl shadow-md overflow-hidden"
                >
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
