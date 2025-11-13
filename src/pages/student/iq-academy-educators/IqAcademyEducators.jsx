import React, { useState, useMemo, useEffect } from "react";
import debounce from "lodash.debounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlignJustify,
  ArrowRight,
  CheckCircle,
  EyeIcon,
  LayoutGrid,
  Search,
  SlidersHorizontal,
  UserPlus,
} from "lucide-react";
import { useGetEducatorsQuery } from "../../../store/api/admin/adminEducatorsApiSlice";
import {
  useGetClientEducatorAcademyCategoryQuery,
  useGetEducatorsListQuery,
  useToggleFollowMutation,
} from "../../../store/api/client/clientEductorApiSlice";
import Loader from "../../../components/ui/loader";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import SearchFilterInput from "../../../components/SearchFilterInput";

const educatorsData = [
  {
    id: 1,
    name: "Ralph Danquah",
    skills: "Forex Day Trading, Price Action, Risk Management",
    avatar: "/media/avatars/300-1.png",
    category: "Forex",
    isFollowing: true,
  },
  {
    id: 2,
    name: "John Smith",
    skills: "Crypto Trading, Risk Management",
    avatar: "/media/avatars/300-2.png",
    category: "Crypto",
    isFollowing: false,
  },
  {
    id: 3,
    name: "Alex Brown",
    skills: "Stock Options, Technical Analysis",
    avatar: "/media/avatars/300-3.png",
    category: "Stock Options",
    isFollowing: false,
  },
];

const IqAcademyEducators = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState("list");
  const [educators, setEducators] = useState(educatorsData);
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [language, setLanguage] = useState("All");
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [category, setCategory] = useState("All");

  const { data, isLoading, refetch } = useGetEducatorsListQuery({
    search: searchText,
    category: category,
  });
  const { data: categoryList } = useGetClientEducatorAcademyCategoryQuery();

  const [toggleFollowData, { isLoading: followLoading }] =
    useToggleFollowMutation();

  const toggleFollow = (id) => {
    setEducators((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isFollowing: !e.isFollowing } : e))
    );
  };

  const handleToggle = async (educator) => {
    try {
      let res = await toggleFollowData(educator._id).unwrap();
      if (res.isFollowing === true) {
        toast.success(
          `You are now following ${educator.first_name} ${educator.last_name}`
        );
      } else if (res.isFollowing === false) {
        toast.info(
          `You have unfollowed ${educator.first_name} ${educator.last_name}`
        );
      }
    } catch (error) {
      if (error.status == 400) {
        toast.error(error.data.message);
      }

      console.error("Follow toggle failed:", error);
    }
  };

  // Filter educators based on tab, search, and language
  const filteredEducators = educators.filter((e) => {
    const matchTab = activeTab === "All" || e.category === activeTab;
    const matchSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchLanguage = language === "All" || e.language === language;
    return matchTab && matchSearch && matchLanguage;
  });

  // const debouncedSearch = useMemo(
  //   () =>
  //     debounce((value) => {
  //       setSearchText(value);
  //     }, 500),
  //   []
  // );

  // useEffect(() => {
  //   return () => debouncedSearch.cancel();
  // }, [debouncedSearch]);

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        setSearchText(value);
        // reloadTable();
      }, 500),
    []
  );
  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchText(value);
    debouncedSearch(value);
  };

  // const handleSearchChange = (event) => {
  //   const value = event.target.value;
  //   debouncedSearch(value);
  // };

  return (
    <div className="container-fluid pb-10">
      <div className="flex items-start justify-between">
        <h2 className="text-lg font-medium text-gray-800 mb-10">
          {data?.data?.length} Educators
        </h2>
        <div className="flex bg-gray-200 p-1 rounded-lg shadow-inner w-fit">
          <button
            onClick={() => setActive("grid")}
            className={`p-2 rounded-lg transition-all ${active === "grid" ? "bg-white shadow-md" : "bg-transparent"
              }`}
          >
            <LayoutGrid
              className={`w-5 h-5 ${active === "grid" ? "text-gray-700" : "text-gray-400"
                }`}
            />
          </button>

          <button
            onClick={() => setActive("list")}
            className={`p-2 rounded-lg transition-all ${active === "list" ? "bg-white shadow-md" : "bg-transparent"
              }`}
          >
            <AlignJustify
              className={`w-5 h-5 ${active === "list" ? "text-gray-700" : "text-gray-400"
                }`}
            />
          </button>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex gap-3 sm:gap-6 pb-2 flex-wrap">
          {["All"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 border-b-2 ${activeTab === tab
                ? "border-black dark:border-white text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className=" flex gap-3 sm:gap-6 pb-2 flex-wrap">
          <div className="relative w-72">
            <Select
              value={category || ""}
              onValueChange={(value) => {
                setCategory(value);
                refetch();
              }}
            >
              <SelectTrigger className="pr-8">
                {" "}
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categoryList?.data?.map((item) => (
                  <SelectItem key={item._id} value={item._id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {category && (
              <button
                type="button"
                onClick={() => {
                  setCategory(null);
                  refetch();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                ✖
              </button>
            )}
          </div>
          <div>

            <SearchFilterInput
              searchText={searchText}
              handleSearchChange={handleSearchChange}
            />
          </div>
        </div>
      </div>
      {/* {!isLoading ? (
        <div className="flex flex-col gap-4">
          {data?.data?.length > 0 ? (
            data?.data?.map((educator) => (
              <div
                className="card cursor-pointer"
              >
                <div
                  key={educator._id}
                  className="flex items-center justify-between p-8 rounded-xl border flex-col sm:flex-row gap-4"
                >
                  <div className="flex items-center gap-4 flex-col sm:flex-row">
                    <img
                      src={educator.image}
                      alt={educator.image}
                      className="w-20 h-20 object-cover rounded-full object-top"
                      onClick={() => navigate(`/iq-educators/${educator._id}`)}
                    />
                    <div
                      className="text-center sm:text-start"
                      onClick={() => navigate(`/iq-educators/${educator._id}`)}
                    >
                      <h4 className="text-gray-800 font-medium mb-1">
                        {educator.first_name} {educator.last_name}
                      </h4>
                      <p className="text-xs text-gray-500">{educator.skills}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => handleToggle(educator)}
                      className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium border ${educator?.isFollowing
                        ? "bg-[#4F46E5] text-white border-[#4F46E5]"
                        : "bg-transparent text-[#4F46E5] border-[#4F46E5]"
                        }`}
                    >
                      <EyeIcon size={16} />
                      {educator?.isFollowing ? "Following" : "Follow"}
                    </button>

                    <button
                      onClick={() => navigate(`/iq-educators/${educator._id}`)}
                      className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium border bg-[#4F46E5] text-white border-[#4F46E5]"
                    >
                      <EyeIcon size={16} />
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm text-center py-4">
              No educators found.
            </p>
          )}
        </div>
      ) : (
        <Loader />
      )} */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {/* Card */}
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="rounded-2xl bg-white dark:bg-[#0F0F1A] shadow-lg border overflow-hidden hover:shadow-xl transition-all"
          >
            {/* COVER IMAGE */}
            <div className="relative h-[200px] bg-gray-300 dark:bg-gray-700 flex justify-center items-center overflow-hidden">
              <span className="text-gray-500 dark:text-gray-400 text-sm select-none">
                {/* <img src="../../public/media/avatars/1.jpg" alt="" /> */}
                400 × 200
              </span>

              {/* Top Left Badge */}
              <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-3 py-1 rounded-lg">
                Forex
              </span>

              {/* Languages */}
              <span className="absolute top-3 right-3 bg-gray-200 text-dark dark:text-white text-xs px-3 py-1 rounded-lg flex items-center gap-1">
                English
              </span>
            </div>

            {/* PROFILE SECTION */}
            <div className="p-5 relative">
              {/* Profile Image */}
              <div className="absolute -top-10 left-5">
                <div className="w-20 h-20 rounded-full border-4 border-white dark:border-[#0F0F1A] bg-gray-300 dark:bg-gray-700" />
                <div className="w-5 h-5 bg-blue-600 text-white rounded-full grid place-items-center text-xs absolute bottom-1 right-1">
                  ✓
                </div>
              </div>

              <div className="mt-12">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-900">
                  Felipe Ferrer
                </h2>
                <p className="text-sm text-purple-500 font-medium">Senior Trader</p>

                <p className="text-sm text-gray-600 dark:text-gray-800 mt-2 leading-relaxed">
                  15+ years trading forex markets. Specializing in major currency
                  pairs and risk management.
                </p>

                {/* Stats */}
                <div className="flex justify-between text-gray-700 dark:text-gray-300 mt-6">
                  <div className="text-center">
                    <p className="font-semibold dark:text-gray-800">12.5K</p>
                    <p className="text-xs dark:text-gray-700">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold dark:text-gray-800">⭐ 4.9</p>
                    <p className="text-xs dark:text-gray-700">Rating</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold dark:text-gray-800">8</p>
                    <p className="text-xs dark:text-gray-700">Courses</p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-3 mt-6">
                  <button className="flex-1 bg-purple-600 hover:bg-purple-700 transition text-white text-sm py-2 rounded-xl">
                    Follow
                  </button>

                  <button className="flex-1 bg-gray-200 dark:bg-light text-gray-800 dark:text-gray-900 py-2 rounded-xl text-sm">
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IqAcademyEducators;
