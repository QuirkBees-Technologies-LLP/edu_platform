import React from "react";
/* eslint-disable prettier/prettier */
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { selectSelectedLanguagesAdmin } from "../../../store/reducer/studentLanagugeSlice";
import { useLanguage } from "@/i18n";
import {
  DataGrid,
  DataGridColumnHeader,
  DataGridColumnVisibility,
  DataGridRowSelect,
  DataGridRowSelectAll,
  KeenIcon,
  useDataGrid,
  Menu,
  MenuItem,
  MenuToggle,
} from "@/components";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from "@/partials/toolbar";
import { format, set } from "date-fns";
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
import { useLazyGetAdminTradeIdeasQuery } from "../../../store/api/admin/adminTradeIdeasApiSlice";
import { useLazyGetLiveSessionListQuery } from "../../../store/api/admin/adminLiveSessionApiSlice";
import { formatSecondsToHMS } from "../../../lib/utils";
import DeleteAdminStreamSchedule from "./DeleteAdminStreamSchedule";
import CreateAdminStreamSchedule from "./CreateAdminStreamSchedule";
import { useLazyGetAdminStreamScheduleQuery } from "../../../store/api/admin/adminStreamScheduleApiSlice";
import { useEndCallMutation } from "../../../store/api/educator/educatorLiveStreamApiSlice";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import CreateAdminRecurrenceScheduleModel from "./CreateAdminRecurrenceScheduleModel";
import { useGetEducatorsQuery } from "../../../store/api/admin/adminEducatorsApiSlice";
import debounce from "lodash.debounce";
import SearchFilterInput from "../../../components/SearchFilterInput";

const AdminStreamSchedule = ({ title = "Live Schedule" }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});
  const [isLightBoxOpen, setIsLightBoxOpen] = useState(false);
  const [getAdminStreamSchedule, { data, isLoading }] =
    useLazyGetAdminStreamScheduleQuery();
  const { data: educators } = useGetEducatorsQuery({ page: 1, limit: 100 });
  const [endCall, { isLoading: isEnding }] = useEndCallMutation();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isReccurenceScheduleOpen, setIsReccurenceScheduleOpen] =
    useState(false);
  const [selectedEducator, setSelectedEducator] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [searchTextInput, setSearchTextInput] = useState("");
  const selectedLanguage = useSelector(selectSelectedLanguagesAdmin);

  const handleClickOpen = () => {
    setIsCreateOpen(true);
  };

  const handleDeleteOpen = () => {
    setIsDeleteOpen(true);
  };

  const handleDeleteClose = () => {
    setIsDeleteOpen(false);
  };

  const { isRTL } = useLanguage();
  const storageFilterId = "members-filter";
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

  const handleEdit = () => {
    setIsReccurenceScheduleOpen(true);
  };

  const ActionMenu = useMemo(() => {
    return (
      <MenuSub className="menu-default" rootClassName="w-full max-w-[200px]">
        <MenuItem onClick={() => handleEdit()}>
          <MenuLink>
            <MenuIcon>
              <KeenIcon icon="notepad-edit" />
            </MenuIcon>
            <MenuTitle>Edit</MenuTitle>
          </MenuLink>
        </MenuItem>
        <MenuItem onClick={handleDeleteOpen}>
          <MenuLink>
            <MenuIcon>
              <KeenIcon icon="trash" />
            </MenuIcon>
            <MenuTitle>Delete</MenuTitle>
          </MenuLink>
        </MenuItem>
      </MenuSub>
    );
  }, [isCreateOpen]);

  const handleEndCall = async (rowData) => {
    try {
      const callId = rowData?.callId;
      if (!callId) {
        toast.error("Missing callId");
        return;
      }
      await endCall({ callId }).unwrap();
      setSelectedRow({});
      reloadTable && reloadTable();
      toast.success("Call ended successfully");
    } catch (error) {
      console.error("Failed to end call", error);
      const message = error?.data?.message || "Failed to end call";
      toast.error(message);
    }
  };

  const openConfirmEnd = (row) => {
    setSelectedRow(row);
    setIsConfirmOpen(true);
  };

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
        meta: {
          headerClassName: "min-w-[170px]",
        },
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
          headerClassName: "min-w-[110px]",
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
          headerClassName: "min-w-[120px]",
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
        accessorFn: (row) => row.datetime,
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
          headerClassName: "min-w-[120px]",
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
            {/* <span className="leading-none text-gray-800 font-normal">
          {info.row.original.status}
        </span> */}
            <span
              className={`badge capitalize badge-outline ${info.row.original.status === "active"
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
          headerClassName: "min-w-[90px]",
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
              className={`badge capitalize badge-outline ml-9 ${info.row.original.isRecurent ? "badge-success" : "badge-danger"
                }`}
            >
              {info.row.original.isRecurent ? "Yes" : "No"}
            </span>
          </div>
        ),
        meta: {
          headerClassName: "min-w-[100px]",
        },
      },

      {
        id: "click",
        header: () => "",
        enableSorting: false,
        cell: ({ row }) => (
          <Menu className="items-stretch">
            <MenuItem
              toggle="dropdown"
              onClick={() => setSelectedRow(row.original)} // ✅ Set selected row
              trigger="click"
              dropdownProps={{
                placement: isRTL() ? "bottom-start" : "bottom-end",
                modifiers: [
                  {
                    name: "offset",
                    options: {
                      offset: isRTL() ? [0, -10] : [0, 10], // [skid, distance]
                    },
                  },
                ],
              }}
            >
              <MenuToggle className="btn btn-sm btn-icon btn-light btn-clear">
                <KeenIcon icon="dots-vertical" />
              </MenuToggle>
              {ActionMenu}
            </MenuItem>
          </Menu>
        ),
        meta: {
          headerClassName: "w-[60px]",
        },
      },
    ],
    []
  );

  // Initialize search term from localStorage if available
  const [searchTerm, setSearchTerm] = useState(() => {
    return localStorage.getItem(storageFilterId) || "";
  });

  // Filtered data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data?.data; // If no search term, return full data

    // return data.filter(member => member.member.name.toLowerCase().includes(searchTerm.toLowerCase()) || member.member.tasks.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, data?.data]);
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

  const ToolbarTableContent = ({ table }) => {
    return (
      <div className="card-header px-5 py-5 border-b-0 flex-wrap gap-2">
        <h3 className="card-title">{title}</h3>
        <div className="flex flex-wrap items-center gap-2.5">
          {/* <div className="relative">
          <KeenIcon icon="magnifier" className="leading-none text-md text-gray-500 absolute top-1/2 start-0 -translate-y-1/2 ms-3" />
          <input type="text" placeholder="Search Members" className="input input-md ps-8" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} // Update search term
          </div> */}
          <DataGridColumnVisibility table={table} />
        </div>
      </div>
    );
  };

  const ToolbarTable = () => {
    const { table } = useDataGrid();
    return <ToolbarTableContent table={table} />;
  };

  const handleCloseCreate = () => {
    setSelectedRow({});
    setIsCreateOpen(false);
  };

  const handleFetchData = useMemo(
    () =>
      async ({ pageIndex, pageSize }) => {
        const newPage = pageIndex + 1;
        const newLimit = pageSize;

        try {
          // Fetch API Data
          const response = await getAdminStreamSchedule({
            page: newPage,
            limit: newLimit,
            educator: selectedEducator?._id || "",
            search: searchTextInput || "",
            ...(selectedLanguage?.length > 0 ? { language: selectedLanguage.join(',') } : {}),
          }).unwrap();

          return {
            data: response.data || [],
            totalCount: response.pagination?.totalRecords || 0,
          };
        } catch (error) {
          console.error("Error fetching IQ Ideas:", error);
          return { data: [], totalCount: 0 };
        }
      },
    [getAdminStreamSchedule, selectedEducator, searchTextInput, selectedLanguage]
  );

  const [tableKey, setTableKey] = useState(0); // ✅ Key to trigger re-render

  const reloadTable = () => {
    setTableKey((prevKey) => prevKey + 1); // ✅ Change key to force re-fetch
  };
  const handleClickOpenReccurenceSchedule = () => {
    setIsReccurenceScheduleOpen(true);
  };

  const handleClickCloseReccurenceSchedule = () => {
    setSelectedRow({});
    setIsReccurenceScheduleOpen(false);
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
    <div className="container-fluid pb-5">
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text="Live Schedule" />
          <ToolbarDescription>
            Track and analyze past IQ Academy with key insights and performance
            data.
          </ToolbarDescription>
        </ToolbarHeading>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex-1 min-w-[200px] md:min-w-[300px]">
              <SearchFilterInput
                searchText={searchText}
                handleSearchChange={handleSearchChange}
              />
            </div>

            <div className="flex-1 min-w-[200px] md:min-w-[250px] relative">
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

            <div>
              <button
                className="btn btn-primary"
                onClick={handleClickOpenReccurenceSchedule}
              >
                Create Recurring Schedule
              </button>
            </div>
          </div>
        </div>
      </Toolbar>
      <DataGrid
        key={`${searchTextInput}-${selectedEducator?._id || ""}`}
        serverSide={true}
        reloadTrigger={`${tableKey}-${selectedLanguage}`}
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
      {isCreateOpen && (
        <CreateAdminStreamSchedule
          setSelectedRow={setSelectedRow}
          handleCloseCreate={handleCloseCreate}
          refetch={reloadTable}
          isCreateOpen={isCreateOpen}
          setIsCreateOpen={setIsCreateOpen}
          selectedRow={selectedRow}
        />
      )}{" "}
      {isReccurenceScheduleOpen && (
        <CreateAdminRecurrenceScheduleModel
          setSelectedRow={setSelectedRow}
          handleCloseCreate={handleClickCloseReccurenceSchedule}
          refetch={reloadTable}
          isOpen={isReccurenceScheduleOpen}
          setIsOpen={setIsReccurenceScheduleOpen}
          selectedRow={selectedRow}
        />
      )}
      {isDeleteOpen && (
        <DeleteAdminStreamSchedule
          refetch={reloadTable}
          isDeleteOpen={isDeleteOpen}
          handleDeleteClose={handleDeleteClose}
          selectedRow={selectedRow}
        />
      )}
      <Dialog open={isConfirmOpen} onOpenChange={() => setIsConfirmOpen(false)}>
        <DialogContent className="p-5 max-w-[500px]">
          <VisuallyHidden>
            <DialogTitle>Hidden Title</DialogTitle>
          </VisuallyHidden>
          <div className="text-center">
            <i className="ki-filled text-3xl ki-alert text-gray-500 dark:text-gray-700 mb-3.5 mx-auto"></i>
          </div>
          <p className="mb-4 text-gray-700 dark:text-gray-700 text-center">
            Are you sure you want to end this livestream for everyone?
          </p>
          <div className="flex justify-center items-center space-x-4">
            <button
              className="btn btn-light"
              onClick={() => setIsConfirmOpen(false)}
              disabled={isEnding}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={async () => {
                await handleEndCall(selectedRow);
                setIsConfirmOpen(false);
              }}
              disabled={isEnding}
            >
              {isEnding ? "Ending..." : "Yes, End Call"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminStreamSchedule;
