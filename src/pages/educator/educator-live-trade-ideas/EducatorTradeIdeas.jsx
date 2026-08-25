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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CreateLiveTradeIdeas from "./CreateLiveTradeIdea";
import DeleteAdminTradeIdeas from "./DeleteAdminTradeIdeas";
import { MenuIcon, MenuLink, MenuSub, MenuTitle } from "@/components";
import ViewEducatorTradeIdeas from "./ViewEducatorTradeIdeas";
import EducatorTradeCards from "./EducatorTradeCards";
import { useLazyGetEducatorLiveTradeIdeasQuery } from "../../../store/api/educator/educatorLiveTradeIdeasApiSlice";
import { useGetEducatorAcademyCategoryQuery } from "../../../store/api/educator/educatorAcademyCategoryApiSlice";
import { debounce } from "lodash";
import SearchFilterInput from "../../../components/SearchFilterInput";
import SocialPostPrompt from "@/components/SocialPostPrompt";
import CreatePostModal from "@/components/CreatePostModal";

const EducatorTradeIdeas = ({ title = "IQ Ideas" }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});
  const [isLightBoxOpen, setIsLightBoxOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [selectedEducator, setSelectedEducator] = useState("");
  const [searchText, setSearchText] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [isSocialPromptOpen, setIsSocialPromptOpen] = useState(false);
  const [isSocialComposerOpen, setIsSocialComposerOpen] = useState(false);


  const [getEducatorTradeIdeas, { data, isLoading, refetch }] =
    useLazyGetEducatorLiveTradeIdeasQuery();
  const { data: categoryList } = useGetEducatorAcademyCategoryQuery();

  const handleCloseView = () => {
    setIsLightBoxOpen(false);
  };
  const handleClickOpen = () => {
    setIsCreateOpen(true);
  };

  // const handleDeleteOpen = () => {
  //   setIsDeleteOpen(true);
  // };



  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        // setSearchText(value);
        reloadTable();
      }, 500),
    []
  );
  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchText(value);
    debouncedSearch(value);
  };

  const handleDeleteClose = () => {
    setSelectedRow(null);
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

  const LabelMap = {
    active: "Active",
    pending: "Pending",
    win: "Win",
    partialWin: "Partial Win",
    loss: "Loss",
    buy: "Buy",
    sell: "Sell",
    scalping: "Scalping",
    intraday: "Intraday",
    swing: "Swing",
  };

  const statusColorMap = {
    active: "badge-success",
    pending: "badge-warning",
    win: "badge-primary",
    partialWin: "badge-info",
    loss: "badge-danger",
  };

  const ActionMenu = (raw) => {
    return (
      <MenuSub className="menu-default" rootClassName="w-full max-w-[200px]">
        <MenuItem
          onClick={() => {
            setSelectedRow(raw);
            setIsCreateOpen(!isCreateOpen);
          }}
        >
          <MenuLink>
            <MenuIcon>
              <KeenIcon icon="notepad-edit" />
            </MenuIcon>
            <MenuTitle>Update</MenuTitle>
          </MenuLink>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setSelectedRow(raw);
            setIsDeleteOpen(true);
          }}
        >
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
      {
        accessorFn: (row) => row.image,
        id: "image",
        header: ({ column }) => (
          <DataGridColumnHeader title="Images" column={column} />
        ),
        enableSorting: false,
        cell: ({ row }) => (
          <div
            className="flex flex-col justify-center items-center gap-0.5"
            onClick={() => {
              setSelectedRow(row.original);
              setIsLightBoxOpen(true);
            }}
          >
            <img
              src={row.original.image[0]}
              class="rounded-full cursor-pointer size-9 shrink-0"
              alt=""
            />
          </div>
        ),
        meta: {
          headerClassName: "min-w-[100px]",
        },
      },
      {
        accessorFn: (row) => row.streamTitle,
        id: "streamTitle",
        header: ({ column }) => (
          <DataGridColumnHeader title="Stream Title" column={column} />
        ),
        enableSorting: true,
        cell: (info) => (
          <div className="flex items-center gap-2.5">
            <div className="flex flex-col gap-0.5">
              <a
                className="leading-none font-medium text-sm text-gray-900 hover:text-primary"
                href="#"
              >
                {info.row.original.streamTitle}
              </a>
            </div>
          </div>
        ),
        meta: {
          headerClassName: "min-w-[200px]",
        },
      },
      {
        accessorFn: (row) => row.name,
        id: "name",
        header: ({ column }) => (
          <DataGridColumnHeader title="Symbol" column={column} />
        ),
        enableSorting: true,
        cell: (info) => (
          <div className="flex items-center gap-2.5">
            <div className="flex flex-col gap-0.5">
              <a
                className="leading-none font-medium text-sm text-gray-900 hover:text-primary"
                href="#"
              >
                {info.row.original.name}
              </a>
            </div>
          </div>
        ),
        meta: {
          headerClassName: "min-w-[200px]",
        },
      },
      {
        accessorFn: (row) => row.timeFrame,
        id: "timeFrame",
        header: ({ column }) => (
          <DataGridColumnHeader title="Type" column={column} />
        ),
        enableSorting: true,
        cell: (info) => (
          <div className="flex flex-col">
            {info.row.original.timeFrame}
          </div>
        ),
        meta: {
          headerClassName: "min-w-[125px]",
        },
      },
      {
        accessorFn: (row) => row.type,
        id: "type",
        header: ({ column }) => (
          <DataGridColumnHeader title="Direction" column={column} />
        ),
        enableSorting: true,
        cell: (info) => (
          <div className="flex items-center gap-1.5">
            <span className="leading-none text-gray-800 font-normal">
              {info.row.original.type}
            </span>
          </div>
        ),
        meta: {
          headerClassName: "min-w-[100px]",
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
          const status = info.row.original.status;
          const badgeColor = statusColorMap[status] || "badge-secondary"; // fallback

          return (
            <span
              className={`badge badge-sm badge-outline capitalize ${badgeColor}`}
            >
              {status}
            </span>
          );
        },
        meta: {
          headerClassName: "w-[100px]",
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
          headerClassName: "min-w-[100px]",
        },
      },
      {
        accessorFn: (row) => row.createdAt,
        id: "date",
        header: ({ column }) => (
          <DataGridColumnHeader title="Date" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          const value = info.row.original.createdAt;
          if (!value) return <span className="text-gray-500">-</span>;
          const parsed = new Date(value);
          if (isNaN(parsed)) return <span className="text-gray-500">-</span>;
          return (
            <span>
              {parsed.toLocaleString("en-US", {
                timeZone: "America/Panama",
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </span>
          );
        },
        meta: {
          headerClassName: "min-w-[160px]",
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
              // onClick={() => setSelectedRow(row.original)} // ✅ Set selected row
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
              {ActionMenu(row.original)}
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
            {/* <KeenIcon
              icon="magnifier"
              className="leading-none text-md text-gray-500 absolute top-1/2 start-0 -translate-y-1/2 ms-3"
            />
            <input
              type="text"
              placeholder="Search Members"
              className="input input-md ps-8 h-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} // Update search term
            /> */}
          </div>
          <DataGridColumnVisibility table={table} />
        </div>
      </div>
    );
  };

  const handleCloseCreate = () => {
    setSelectedRow(null);
    setIsCreateOpen(false);
  };

  const handleFetchData = async ({ pageIndex, pageSize }) => {
    const newPage = pageIndex + 1;
    const newLimit = pageSize;

    try {
      // Fetch API Data
      const response = await getEducatorTradeIdeas({
        page: newPage,
        limit: newLimit,
        category: category || "",
        status: selectedType || "",
        search: searchText || "",
      }).unwrap();

      return {
        data: response.data || [],
        totalCount: response.pagination?.totalRecords || 0,
      };
    } catch (error) {
      console.error("Error fetching IQ Ideas:", error);
      return { data: [], totalCount: 0 };
    }
  };

  const [tableKey, setTableKey] = useState(0); // ✅ Key to trigger re-render

  const reloadTable = () => {
    setTableKey((prevKey) => prevKey + 1); // ✅ Change key to force re-fetch
  };

  const [activeTab, setActiveTab] = useState("TableView");

  return (
    <div className="container-fluid">
      <div className="pb-10">
        <div className="inline-flex bg-gray-200 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("TableView")}
            className={`px-2 sm:px-4 py-2 text-sm rounded-lg font-semibold transition-all duration-200 ${activeTab === "TableView"
              ? "bg-gray-100 text-gray-900 shadow"
              : "text-gray-600"
              }`}
          >
            Table View
          </button>
          <button
            onClick={() => setActiveTab("UserView")}
            className={`px-2 sm:px-4 py-2 text-sm rounded-lg font-semibold transition-all duration-200 ${activeTab === "UserView"
              ? "bg-gray-100 text-gray-900 shadow"
              : "text-gray-600"
              }`}
          >
            User View
          </button>
        </div>
      </div>

      {activeTab === "TableView" && (
        <>
          <div className="flex flex-col mb-5">
            {/* TOP: Toolbar */}
            <Toolbar>
              <ToolbarHeading>
                <ToolbarPageTitle text="Live IQ Ideas" />
                <ToolbarDescription>
                  Generate, analyze, and execute profitable trading opportunities
                  with smart insights, market trends, and data-driven strategies
                </ToolbarDescription>
              </ToolbarHeading>

              <ToolbarActions />
            </Toolbar>

            {/* BOTTOM: Button */}
            <div className="flex flex-wrap gap-2">
              <div>
                <SearchFilterInput
                  searchText={searchText}
                  handleSearchChange={handleSearchChange}
                />
              </div>
              <div className="flex items-center gap-2  relative">
                <Select
                  value={category}
                  onValueChange={(value) => {
                    setCategory(value);
                    reloadTable();
                  }}
                >
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryList?.data?.map((e) => (
                      <SelectItem key={e._id} value={e._id}>
                        {e.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {category && (
                  <button
                    type="button"
                    onClick={() => {
                      setCategory("");
                      reloadTable();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    ✖
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2  relative">
                <Select
                  value={selectedType}
                  onValueChange={(value) => {
                    setSelectedType(value);
                    reloadTable();
                  }}
                >
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="win">Win</SelectItem>
                    <SelectItem value="partialWin">Partial Win</SelectItem>
                    <SelectItem value="breakEven">Break Even</SelectItem>
                    <SelectItem value="loss">Loss</SelectItem>
                  </SelectContent>
                </Select>

                {selectedType && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedType("");
                      reloadTable();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    ✖
                  </button>
                )}
              </div>
            </div>
          </div>

          <DataGrid
            key={category?._id || ""}
            reloadTrigger={tableKey}
            serverSide={true}
            loading={isLoading}
            columns={columns}
            rowSelection={true}
            onRowSelectionChange={handleRowSelection}
            pagination={{ size: 10 }}
            toolbar={<ToolbarTable />}
            layout={{ card: true }}
            onFetchData={handleFetchData}
          />

          <ViewEducatorTradeIdeas
            isViewOpen={isLightBoxOpen}
            setIsLightBoxOpen={setIsLightBoxOpen}
            handleCloseView={handleCloseView}
            selectedIdea={selectedRow}
          />

          <CreateLiveTradeIdeas
            setSelectedRow={setSelectedRow}
            handleCloseCreate={handleCloseCreate}
            refetch={reloadTable}
            isCreateOpen={isCreateOpen}
            setIsCreateOpen={setIsCreateOpen}
            selectedRow={selectedRow}
            onSubmitSuccess={() => setIsSocialPromptOpen(true)}
          />

          {isDeleteOpen && (
            <DeleteAdminTradeIdeas
              refetch={reloadTable}
              isDeleteOpen={isDeleteOpen}
              handleDeleteClose={handleDeleteClose}
              selectedRow={selectedRow}
              setSelectedRow={setSelectedRow}
            />
          )}

          <SocialPostPrompt
            isOpen={isSocialPromptOpen}
            onClose={() => setIsSocialPromptOpen(false)}
            onConfirm={() => {
              setIsSocialPromptOpen(false);
              setIsSocialComposerOpen(true);
            }}
          />

          <CreatePostModal
            isOpen={isSocialComposerOpen}
            onClose={() => setIsSocialComposerOpen(false)}
            editingPost={null}
            showCategorySelector={false}
          />
        </>
      )}
      {activeTab === "UserView" && <EducatorTradeCards />}
    </div>
  );
};
export default EducatorTradeIdeas;
