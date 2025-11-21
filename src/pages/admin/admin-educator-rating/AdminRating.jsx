import React, { useState, useMemo } from "react";
import {
  DataGrid,
  DataGridColumnHeader,
  DataGridColumnVisibility,
  useDataGrid,
} from "@/components";
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
  ToolbarPageTitle,
  ToolbarDescription,
} from "@/partials/toolbar";
import SearchFilterInput from "@/components/SearchFilterInput";
import debounce from "lodash.debounce";
import { useLazyGetEducatorsRatingsQuery } from "../../../store/api/admin/adminRatingApiSlice";
import { useNavigate } from "react-router";

const AdminRating = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [searchTextInput, setSearchTextInput] = useState("");
  const [tableKey, setTableKey] = useState(0);
  const [triggerEducatorsRatings, { isLoading: isLoadingRatings }] =
    useLazyGetEducatorsRatingsQuery();

  const reloadTable = () => setTableKey((prev) => prev + 1);

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        setSearchTextInput(value);
        reloadTable();
      }, 400),
    []
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    debouncedSearch(value);
  };

  const handleFetchData = useMemo(
    () =>
      async ({ pageIndex, pageSize }) => {
        const page = pageIndex + 1;
        const limit = pageSize;

        try {
          const res = await triggerEducatorsRatings({
            page,
            limit,
            search: searchTextInput || "",
            sort: "-avgRating",
          }).unwrap();

          return {
            data: res.data || [],
            totalCount: res.pagination?.total || 0,
          };
        } catch (error) {
          console.error("❌ Fetch educator ratings error:", error);
          return { data: [], totalCount: 0 };
        }
      },
    [triggerEducatorsRatings, searchTextInput]
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        id: "name",
        enableSorting: false,
        header: ({ column }) => (
          <DataGridColumnHeader title="Educator Name" column={column} />
        ),
        cell: (info) => {
          const row = info.row.original;
          const initials =
            `${row.first_name?.[0] || ""}${row.last_name?.[0] || ""}`.toUpperCase();

          return (
            <div className="flex items-center gap-3">
              {row.image ? (
                <img
                  src={row.image}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-semibold">
                  {initials || "NA"}
                </div>
              )}

              <div className="flex flex-col">
                <span className="font-semibold text-gray-900">
                  {row.first_name} {row.last_name}
                </span>
                <span className="text-sm text-gray-700">{row.email}</span>
              </div>
            </div>
          );
        },
        meta: { headerClassName: "min-w-[220px]" },
      },

      {
        accessorKey: "categoryDetails",
        id: "categories",
        enableSorting: false,
        header: ({ column }) => (
          <DataGridColumnHeader title="Category" column={column} />
        ),
        cell: (info) => {
          const categories = info.row.original.categoryDetails || [];
          return (
            <span className="text-gray-700">
              {categories.length
                ? categories.map((c) => c.name).join(", ")
                : "—"}
            </span>
          );
        },
        meta: { headerClassName: "min-w-[150px]" },
      },

      {
        accessorKey: "avgRating",
        id: "avgRating",
        enableSorting: false,
        header: ({ column }) => (
          <DataGridColumnHeader title="Average Rating" column={column} />
        ),
        cell: (info) => {
          const rating = info.row.original.avgRating || 0;

          return (
            <div className="flex items-center gap-3">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill={i <= rating ? "#FBBF24" : "none"}
                    stroke={i <= rating ? "#FBBF24" : "#D1D5DB"}
                    className="w-5 h-4"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>

              <span className="font-semibold text-gray-900">
                {rating.toFixed(1)}
              </span>
            </div>
          );
        },
        meta: { headerClassName: "min-w-[150px]" },
      },

      {
        accessorKey: "ratingCount",
        id: "ratingCount",
        enableSorting: false,
        header: ({ column }) => (
          <DataGridColumnHeader title="Total Reviews" column={column} />
        ),
        cell: (info) => {
          const count = info.row.original.ratingCount || 0;
          return <span className="text-gray-700">{count} reviews</span>;
        },
        meta: { headerClassName: "min-w-[120px]" },
      },

      {
        accessorKey: "followersCount",
        id: "followersCount",
        enableSorting: false,
        header: ({ column }) => (
          <DataGridColumnHeader title="Followers" column={column} />
        ),
        cell: (info) => (
          <span className="text-gray-700">
            {info.row.original.followersCount || 0}
          </span>
        ),
        meta: { headerClassName: "min-w-[100px]" },
      },

      {
        id: "actions",
        header: () => "",
        enableSorting: false,
        cell: ({ row }) => {
          const educatorId = row.original._id;
          return (
            <button
              className="bg-purple-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-purple-700 transition"
              onClick={() =>
                navigate(`/admin/educator-rating/${educatorId}`, {
                  state: { educator: row.original },
                })
              }
            >
              View Ratings
            </button>
          );
        },
        meta: { headerClassName: "w-[120px]" },
      },
    ],
    []
  );

  const ToolbarTable = () => {
    const { table } = useDataGrid();
    return (
      <div className="card-header px-5 py-5 border-b-0 flex-wrap gap-2">
        <h3 className="card-title">Educator Ratings</h3>
        <div className="flex flex-wrap items-center gap-2.5">
          <DataGridColumnVisibility table={table} />
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid pb-5">
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text="Educator Ratings" />
          <ToolbarDescription>
            View and manage all Educator's ratings & feedback
          </ToolbarDescription>
        </ToolbarHeading>
        <div className="flex flex-wrap items-center gap-2">
          <ToolbarActions>
            <div className="flex-1 min-w-[165px] md:min-w-[240px]">
              <SearchFilterInput
                searchText={searchText}
                handleSearchChange={handleSearchChange}
              />
            </div>

            {/* <div className="text-end">
              <button
                className="btn btn-primary"
                onClick={() => setIsAddOpen(true)}
              >
                Add Package
              </button>
            </div> */}
          </ToolbarActions>
        </div>
      </Toolbar>

      <DataGrid
        key={tableKey}
        serverSide
        loading={isLoadingRatings}
        columns={columns}
        pagination={{ size: 10 }}
        toolbar={<ToolbarTable />}
        layout={{ card: true }}
        onFetchData={handleFetchData}
      />
    </div>
  );
};

export default AdminRating;
