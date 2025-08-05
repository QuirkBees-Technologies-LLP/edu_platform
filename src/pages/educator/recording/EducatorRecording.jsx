/* eslint-disable prettier/prettier */
import * as React from "react";
import { useMemo, useState } from "react";
import { useLanguage } from "@/i18n";
import {
  DataGrid,
  DataGridColumnHeader,
  DataGridColumnVisibility,
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
import { MenuIcon, MenuLink, MenuSub, MenuTitle } from "@/components";
import { toAbsoluteUrl } from "@/utils/Assets";
import DeleteEducatorRecording from "./DeleteEducatorRecording";
import { Create } from "@mui/icons-material";
import CreateEducatorRecording from "./CreateEducatorRecording";
import { useLazyGetEducatorRecordingQuery } from "../../../store/api/educator/educatorRecordingApiSlice";
import ShowMoreLess from "../../../components/ui/showmoreless";
import VideoThumbnail from "../live-session/VideoThumbnail";
import { PlayCircle } from "lucide-react";

const EducatorRecording = ({ title = "Session Recordings" }) => {
 
  const handleThumbnailClick = () => {
    window.open(videoUrl, "_blank");
  };
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});
  const [isLightBoxOpen, setIsLightBoxOpen] = useState(false);
  const [getEducatorRecording, { data, isLoading, refetch }] =
    useLazyGetEducatorRecordingQuery();

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

  const ActionMenu = () => {
    return (
      <MenuSub className="menu-default" rootClassName="w-full max-w-[200px]">
        <MenuItem onClick={() => setIsCreateOpen(!isCreateOpen)}>
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
  };

  const truncateText = (text, maxLength) => {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  const columns = useMemo(
    () => [
      // {
      //   accessorFn: row => row.url,
      //   id: 'Recoding',
      //   header: ({
      //     column
      //   }) => <DataGridColumnHeader title='Recoding' column={column} />,
      //   enableSorting: true,
      //   cell: ({ row }) =>
      //     <div className="flex flex-col justify-center items-center gap-0.5" onClick={() => {
      //       setSelectedRow(row.original)
      //       setIsLightBoxOpen(true);
      //     }}>
      //       <img src={row.original.url?.includes("undefined") ? toAbsoluteUrl(`/media/avatars/blank.png`) : row.original.url} class="rounded-full cursor-pointer size-9 shrink-0" alt="" />

      //     </div>,
      //   meta: {
      //     headerClassName: 'w-[80px]'
      //   }
      // },
      {
        accessorFn: (row) => row.url,
        id: "Recoding",
        header: ({ column }) => (
          <DataGridColumnHeader title="Recoding" column={column} />
        ),
        enableSorting: true,
        cell: ({ row }) => {
          const videoUrl = row.original.url;

          return (
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Play Recording"
              className="flex items-center justify-center text-blue-600 hover:text-blue-800"
            >
              <PlayCircle size={24} />
            </a>
          );
        },
        meta: {
          headerClassName: "w-[80px]",
        },
      },

      {
        accessorFn: (row) => `${row.call_title}`,
        id: "title",
        header: ({ column }) => (
          <DataGridColumnHeader title="Title" column={column} />
        ),
        enableSorting: true,
        cell: (info) => (
          <div className="flex items-center gap-2.5">
            <div className="flex flex-col gap-0.5">{info.getValue()}</div>
          </div>
        ),
        meta: {
          headerClassName: "min-w-[200px]",
        },
      },
      {
        accessorFn: (row) => row.call_description,
        id: "Description",
        header: ({ column }) => (
          <DataGridColumnHeader title="Description" column={column} />
        ),
        enableSorting: true,
        cell: (info) => (
          <div className="flex items-center gap-2.5">
            <div className="flex flex-col gap-0.5">
              {/* {info.getValue()} */}
              <ShowMoreLess isHtml={true} html={info.getValue()} />
            </div>
          </div>
        ),
        meta: {
          headerClassName: "min-w-[200px]",
        },
      },
      // {
      //   accessorFn: row => row.status,
      //   id: 'status',
      //   header: ({
      //     column
      //   }) => <DataGridColumnHeader title='Status' column={column} />,
      //   enableSorting: true,
      //   cell: info => <span className={`badge badge-sm badge-outline capitalize ${info.row.original.status === true ? "badge-success" : "badge-danger"}`}>
      //     {info.row.original.status === true ? "Active" : "Inactive"}
      //   </span>,
      //   meta: {
      //     headerClassName: 'w-[225px]'
      //   }
      // },
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
              {ActionMenu()}
            </MenuItem>
          </Menu>
        ),
        meta: {
          headerClassName: "w-[60px]",
        },
      },
    ],
    [isRTL]
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
  const ToolbarTable = () => {
    const { table } = useDataGrid();
    return (
      <div className="card-header px-5 py-5 border-b-0 flex-wrap gap-2">
        <h3 className="card-title">{title}</h3>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <KeenIcon
              icon="magnifier"
              className="leading-none text-md text-gray-500 absolute top-1/2 start-0 -translate-y-1/2 ms-3"
            />
            <input
              type="text"
              placeholder="Search Members"
              className="input input-md ps-8 h-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} // Update search term
            />
          </div>
          <DataGridColumnVisibility table={table} />
        </div>
      </div>
    );
  };

  const handleCloseCreate = () => {
    setIsCreateOpen(false);
  };

  const handleFetchData = async ({ pageIndex, pageSize }) => {
    const newPage = pageIndex + 1;
    const newLimit = pageSize;

    try {
      // Fetch API Data
      const response = await getEducatorRecording({
        page: newPage,
        limit: newLimit,
      }).unwrap();

      return {
        data: response.data || [],
        totalCount: response.pagination?.total || 0,
      };
    } catch (error) {
      console.error("Error fetching educators:", error);
      return { data: [], totalCount: 0 };
    }
  };

  const [tableKey, setTableKey] = useState(0); // ✅ Key to trigger re-render

  const reloadTable = () => {
    setTableKey((prevKey) => prevKey + 1); // ✅ Change key to force re-fetch
  };

  return (
    <div className="container-fluid">
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text="Session Recordings" />
          <ToolbarDescription>
            Oversee educator profiles, manage their sessions, and ensure quality
            trade and course content across the platform.
          </ToolbarDescription>
        </ToolbarHeading>
        {/* <ToolbarActions>
          <div className="text-end pb-4">
            <button className='btn btn-primary' onClick={handleClickOpen}>
              Create Educator
            </button>
          </div>
        </ToolbarActions> */}
      </Toolbar>
      <DataGrid
        key={tableKey}
        serverSide={true}
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
        <CreateEducatorRecording
          setSelectedRow={setSelectedRow}
          handleCloseCreate={handleCloseCreate}
          refetch={reloadTable}
          isCreateOpen={isCreateOpen}
          setIsCreateOpen={setIsCreateOpen}
          selectedRow={selectedRow}
        />
      )}{" "}
      {isDeleteOpen && (
        <DeleteEducatorRecording
          refetch={reloadTable}
          isDeleteOpen={isDeleteOpen}
          handleDeleteClose={handleDeleteClose}
          selectedRow={selectedRow}
        />
      )}
    </div>
  );
};
export default EducatorRecording;
