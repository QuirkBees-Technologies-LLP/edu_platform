import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useLanguage } from "@/i18n";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
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
  MenuIcon,
  MenuLink,
  MenuSeparator,
  MenuSub,
  MenuTitle,
} from "@/components";
import { format } from "date-fns";
import { useLazyGetEducatorStreamScheduleQuery } from "../../../store/api/educator/educatorStreamScheduleApiSlice";
import debounce from "lodash.debounce";
import { SearchFilterInput } from "@/components";

const EducatorEndSession = ({ title = "Ended Schedule" }) => {
  const { language } = useLanguage();
  const { isRTL } = useLanguage();
  const storageFilterId = "members-filter";
  const [searchTerm, setSearchTerm] = useState(() => {
    return localStorage.getItem(storageFilterId) || "";
  });
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
  const [getScheduleList, { data, isLoading, refetch }] =
    useLazyGetEducatorStreamScheduleQuery();
  const navigate = useNavigate();
  const [tableKey, setTableKey] = useState(0); // ✅ Key to trigger re-render

  const [searchText, setSearchText] = useState("");
  const [searchTextInput, setSearchTextInput] = useState("");

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
        accessorFn: (row) => row.status,
        id: "title",
        header: ({ column }) => (
          <DataGridColumnHeader title="Title" column={column} />
        ),
        enableSorting: true,
        cell: (info) => <span>{info.row.original.title}</span>,
      },
      {
        accessorFn: (row) => row.name,
        id: "Language",
        header: ({ column }) => (
          <DataGridColumnHeader title="Language" column={column} />
        ),
        enableSorting: true,
        cell: (info) => (
          <div className="flex items-center gap-2.5">
            <div className="flex flex-col gap-0.5">
              <p>{info.row.original.language ?? "NA"}</p>
            </div>
          </div>
        ),
        meta: {
          headerClassName: "min-w-[150px]",
        },
      },
      {
        accessorFn: (row) => row.name,
        id: "Category",
        header: ({ column }) => (
          <DataGridColumnHeader title="Category" column={column} />
        ),
        enableSorting: true,
        cell: (info) => (
          <div className="flex items-center gap-2.5">
            <div className="flex flex-col gap-0.5">
              <p>{info.row.original.category?.name ?? "NA"}</p>
            </div>
          </div>
        ),
        meta: {
          headerClassName: "min-w-[150px]",
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
          headerClassName: "min-w-[140px]",
        },
      },
      {
        accessorFn: (row) => row.create_by,
        id: "schedule_time",
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
              {format(info.row.original.datetime, "MMM dd, yyyy, hh:mm a")}
            </span>
          </div>
        ),
        meta: {
          headerClassName: "min-w-[150px]",
        },
      },
      {
        accessorFn: (row) => row.status,
        id: "status",
        header: ({ column }) => (
          <DataGridColumnHeader title="Status" column={column} />
        ),
        enableSorting: true,
        cell: (info) => (
          <div className="flex items-center gap-2.5">
            <span
              className={`badge capitalize badge-outline ${
                info.row.original.status === "active"
                  ? "badge-primary"
                  : info.row.original.status === "pending"
                    ? "badge-warning"
                    : "badge-danger"
              }`}
            >
              {info.row.original.status}
            </span>
            {info.row.original.status === "active" && (
              <button
                className="btn btn-sm btn-danger"
                onClick={() => openConfirmEnd(info.row.original)}
              >
                End Call
              </button>
            )}
          </div>
        ),
        meta: {
          headerClassName: "min-w-[120px]",
        },
      },
      {
        accessorFn: (row) => row.recurrent,
        id: "Recurrent",
        header: ({ column }) => (
          <DataGridColumnHeader title="Recurrent" column={column} />
        ),
        enableSorting: true,
        cell: (info) => (
          <div className="flex items-center gap-2.5">
            <span
              className={`badge capitalize badge-outline ml-9 ${
                info.row.original.isRecurent ? "badge-success" : "badge-danger"
              }`}
            >
              {info.row.original.isRecurent ? "Yes" : "No"}
            </span>
          </div>
        ),
        meta: {
          headerClassName: "min-w-[90px]",
        },
      },
      // {
      //   accessorFn: row => row.createdAt,
      //   id: 'createdAt',
      //   header: ({
      //     column
      //   }) => <DataGridColumnHeader title='Created At' column={column} />,
      //   enableSorting: true,
      //   cell: info => <div className="flex items-center gap-2.5">
      //     <span className="leading-none text-gray-800 font-normal">
      //       {format(info.row.original.createdAt, "MMM dd, yyyy, hh:mm a")}
      //     </span>
      //   </div>,
      //   meta: {
      //     headerClassName: 'min-w-[200px]'
      //   }
      // },
      // {
      //   accessorFn: row => row.create_by,
      //   id: 'create_by',
      //   header: ({
      //     column
      //   }) => <DataGridColumnHeader title='Created By' column={column} />,
      //   enableSorting: true,
      //   cell: info => <div className="flex items-center gap-2.5">
      //     <span className="leading-none text-gray-800 font-normal">
      //       {info.row.original.create_by?.first_name + " " + info.row.original.create_by?.last_name}
      //     </span>
      //   </div>,
      //   meta: {
      //     headerClassName: 'min-w-[200px]'
      //   }
      // },
      // {
      //   accessorFn: row => row.callId,
      //   id: 'callId',
      //   header: ({
      //     column
      //   }) => <DataGridColumnHeader title='Call Id' column={column} />,
      //   enableSorting: true,
      //   cell: info => <div className="flex items-center gap-2.5">
      //     <span className="leading-none text-gray-800 font-normal">
      //       {info.row.original.callId}
      //     </span>
      //   </div>,
      //   meta: {
      //     headerClassName: 'min-w-[200px]'
      //   }
      // },
      //   {
      //     id: "click",
      //     header: () => "",
      //     enableSorting: false,
      //     cell: ({ row }) => (
      //       <Menu className="items-stretch">
      //         <MenuItem
      //           toggle="dropdown"
      //           onClick={() => setSelectedRow(row.original)} // ✅ Set selected row
      //           trigger="click"
      //           dropdownProps={{
      //             placement: isRTL() ? "bottom-start" : "bottom-end",
      //             modifiers: [
      //               {
      //                 name: "offset",
      //                 options: {
      //                   offset: isRTL() ? [0, -10] : [0, 10], // [skid, distance]
      //                 },
      //               },
      //             ],
      //           }}
      //         >
      //           <MenuToggle className="btn btn-sm btn-icon btn-light btn-clear">
      //             <KeenIcon icon="dots-vertical" />
      //           </MenuToggle>
      //           {ActionMenu(row.original)}
      //         </MenuItem>
      //       </Menu>
      //     ),
      //     meta: {
      //       headerClassName: "w-[60px]",
      //     },
      //   },
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
      const response = await getScheduleList({
        page: newPage,
        limit: newLimit,
        status: "ended",
        search: searchTextInput || "",
      }).unwrap();

      const endedData = response.data.filter((row) => row.status === "ended");

      return {
        data: endedData || [],
        totalCount: response.pagination?.totalRecords || 0,
      };
    } catch (error) {
      console.error("Error fetching IQ Ideas:", error);
      return { data: [], totalCount: 0 };
    }
  };

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
        <ToolbarActions>
          <div className="relative w-full md:w-80">
            <SearchFilterInput
              searchText={searchText}
              handleSearchChange={handleSearchChange}
            />
          </div>
        </ToolbarActions>
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

export default EducatorEndSession;
