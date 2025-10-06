import React, { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useLanguage } from "@/i18n";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import debounce from "lodash.debounce";
import {
  DataGrid,
  DataGridColumnHeader,
  DataGridColumnVisibility,
  useDataGrid,
} from "@/components";
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from "@/partials/toolbar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MenuIcon,
  MenuLink,
  MenuSeparator,
  MenuSub,
  MenuTitle,
} from "@/components";
import { format } from "date-fns";
import { useLazyGetLiveSessionListQuery } from "../../../store/api/admin/adminLiveSessionApiSlice";
import { useGetEducatorsQuery } from "../../../store/api/admin/adminEducatorsApiSlice";
import { SearchFilterInput } from "@/components";

const AdminEndSchedule = ({ title = "Ended Live Sessions" }) => {
  const { language } = useLanguage();
  const { isRTL } = useLanguage();
  const storageFilterId = "members-filter";
  const [searchTerm, setSearchTerm] = useState(() => {
    return localStorage.getItem(storageFilterId) || "";
  });
  const { data: educators } = useGetEducatorsQuery({ page: 1, limit: 100 });
  const [selectedEducator, setSelectedEducator] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [searchTextInput,setSearchTextInput] = useState("");
  const ColumnInputFilter = ({ column }) => {
    return (
      <Input
        placeholder="Filter..."
        value={column.getFilterValue() ?? ""}
        onChange={(event) => column.setFilterValue(event.target.value)}
        className="h-9 w-full max-w-40"
      />
    );
  };
  const [getLiveSessionList, { data, isLoading, refetch }] =
    useLazyGetLiveSessionListQuery();
  const navigate = useNavigate();
  const [tableKey, setTableKey] = useState(0); // ✅ Key to trigger re-render

  const reloadTable = () => {
    setTableKey((prevKey) => prevKey + 1); // ✅ Change key to force re-fetch
  };

  const handleRedirect = (callId, row) => {
    navigate(`/educator/live-session/${callId}`, { state: row });
  };

  // Columns definition
  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row.title,
        id: "title",
        header: ({ column }) => (
          <DataGridColumnHeader title="Title" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          const { title, callId, status } = info.row.original;
          const isEnded = status === "ended";
          const isClickable = status !== "pending";

          return (
            <span>
              <p
                className={
                  isClickable ? "cursor-pointer hover:text-primary" : ""
                }
                onClick={
                  isClickable
                    ? () => handleRedirect(callId, info.row.original)
                    : undefined
                }
              >
                {title}
              </p>
            </span>
          );
        },
      },
      {
        accessorFn: (row) => row.educator,
        id: "educator",
        header: ({ column }) => (
          <DataGridColumnHeader title="Educator" column={column} />
        ),
        enableSorting: true,
        cell: (info) => (
          <div className="flex items-center gap-2.5">
            <span className="leading-none text-gray-800 font-normal">
              {info.row.original.educator?.first_name +
                " " +
                info.row.original.educator?.last_name}
            </span>
          </div>
        ),
        meta: {
          headerClassName: "min-w-[200px]",
        },
      },
      {
        accessorFn: (row) => row.callId,
        id: "callId",
        header: ({ column }) => (
          <DataGridColumnHeader title="Call Id" column={column} />
        ),
        enableSorting: true,
        cell: (info) => (
          <div className="flex items-center gap-2.5">
            <span className="leading-none text-gray-800 font-normal">
              {info.row.original.callId}
            </span>
          </div>
        ),
        meta: {
          headerClassName: "min-w-[200px]",
        },
      },
      {
        accessorFn: (row) => row.status,
        id: "status",
        header: ({ column }) => (
          <DataGridColumnHeader title="Status" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          const row = info.row.original;

          return (
            <div className="flex items-center gap-2.5">
              {row.status === "ended" && (
                <button className="badge capitalize badge-outline badge-danger">
                  Ended
                </button>
              )}
            </div>
          );
        },
        meta: {
          headerClassName: "min-w-[120px]",
        },
      },
      {
        accessorFn: (row) => row.datetime,
        id: "datetime",
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Scheduled from this date"
            column={column}
          />
        ),
        enableSorting: true,
        cell: (info) => (
          <div className="flex items-center gap-2.5">
            <span className="leading-none text-gray-800 font-normal">
              {info.row.original.datetime
                ? format(info.row.original.datetime, "MMM dd, yyyy, hh:mm a")
                : "N/A"}
            </span>
          </div>
        ),
        meta: {
          headerClassName: "min-w-[200px]",
        },
      },
    ],
    [isRTL]
  );

  const handleRowSelection = (state) => {
    const selectedRowIds = Object.keys(state);
    if (selectedRowIds.length > 0) {
      toast(`Total ${selectedRowIds.length} are selected.`, {
        description: `Selected row IDs: ${selectedRowIds}`,
        action: {
          label: "Undo",
          onClick: () => console.log("Undo"),
        },
      });
    }
  };

  // Toolbar
  const ToolbarTable = () => {
    const { table } = useDataGrid();
    return (
      <div className="card-header px-5 py-5 border-b-0 flex-wrap gap-2">
        <h3 className="card-title">{title}</h3>
        <div className="flex flex-wrap items-center gap-2.5">
          <DataGridColumnVisibility table={table} />
        </div>
      </div>
    );
  };

  // Fetch server-side data and filter ended calls

  const handleFetchData = async ({ pageIndex, pageSize }) => {
    const newPage = pageIndex + 1;
    const newLimit = pageSize;

    try {
      // Fetch API Data
      const response = await await getLiveSessionList({
        page: newPage,
        limit: newLimit,
        status: "ended",
        educator: selectedEducator?._id || "",
        search: searchTextInput || "",
      }).unwrap();

      const endedData = response.data.filter((row) => row.status === "ended");
      console.log("endedData", endedData);

      return {
        data: endedData || [],
        totalCount: response.pagination?.totalRecords || 0,
      };
    } catch (error) {
      console.error("Error fetching IQ Ideas:", error);
      return { data: [], totalCount: 0 };
    }
  };
  //  const handleSearch = useCallback(
  //   debounce(() => {
  //     setReloadKey(reloadKey + 1);
  //   }, 500), // Debounce for 500 milliseconds
  //   [reloadKey]
  // );

 const debouncedSearch = useMemo(
  () =>
    debounce((value) => {
      setSearchTextInput(value); 
      reloadTable(); 
    }, 500),
  []
);
  const handleSearchChange = (event) => {

    const value = event.target.value;
    setSearchText(value);
    debouncedSearch(value);
  };

  return (
    <div className="container-fluid">
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text="Ended Live Session" />
          <ToolbarDescription>
            Track Ended Live Sessions with key insights and performance data.
          </ToolbarDescription>
        </ToolbarHeading>
        <div className="flex gap-1 flex-wrap">
          <ToolbarActions>
            <div className="relative w-full md:w-80">
              <SearchFilterInput
                searchText={searchText}
                handleSearchChange={handleSearchChange}
              />
            </div>
            <div className="relative w-72">
              <Select
                value={selectedEducator?._id || ""}
                onValueChange={(value) => {
                  const selected = educators?.data?.find(
                    (item) => item._id === value
                  );
                  if (selected) {
                    setSelectedEducator({
                      _id: selected._id,
                      name: `${selected.first_name} ${selected.last_name}`,
                    });
                    reloadTable();
                  }
                }}
              >
                <SelectTrigger className="pr-8">
                  <SelectValue
                    placeholder="Select Educator"
                    value={selectedEducator?._id || ""}
                  >
                    {selectedEducator
                      ? selectedEducator.name
                      : "Select Educator"}
                  </SelectValue>
                </SelectTrigger>

                <SelectContent>
                  {educators?.data?.map((item) => (
                    <SelectItem key={item._id} value={item._id}>
                      {item.first_name + " " + item.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedEducator && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedEducator(null);
                    reloadTable();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  ✖
                </button>
              )}
            </div>
          </ToolbarActions>
        </div>
      </Toolbar>

      <DataGrid
        serverSide={true}
        key={tableKey}
        loading={isLoading}
        columns={columns}
        rowSelection={true}
        onRowSelectionChange={handleRowSelection}
        pagination={{
          size: 10,
        }}
        toolbar={<ToolbarTable />}
        layout={{
          card: true,
        }}
        onFetchData={handleFetchData}
      />
    </div>
  );
};

export default AdminEndSchedule;
