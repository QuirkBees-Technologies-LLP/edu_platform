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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from "@/partials/toolbar";
import CreateTradeIdeas from "./CreateTradeIdeas";
import DeleteAdminTradeIdeas from "./DeleteAdminTradeIdeas";
import FollowUpThreadModal from "./FollowUpThreadModal";
import { MenuIcon, MenuLink, MenuSub, MenuTitle } from "@/components";
import TradeImageSlider from "./TradeImageSlider";
import { TruncatedText } from "../../../lib/utils";
import {
  useLazyGetEducatorTradeIdeasQuery,
  useLazyGetEducatorTradeIdeaThreadQuery,
} from "../../../store/api/educator/educatorTradeIdeasApiSlice";
import ViewEducatorTradeIdeas from "./ViewEducatorTradeIdeas";
import EducatorTradeCards from "./EducatorTradeCards";
import { set } from "date-fns";
import { useGetEducatorAcademyCategoryQuery } from "../../../store/api/educator/educatorAcademyCategoryApiSlice";
import SocialPostPrompt from "@/components/SocialPostPrompt";
import CreatePostModal from "@/components/CreatePostModal";

const EducatorTradeIdeas = ({ title = "IQ Ideas" }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});
  // Whether the create dialog should open in "Update" (chain) mode rather than plain
  // Edit — see admin's AdminTradeAnalysis.jsx for the equivalent flag. Here ActionMenu
  // takes the row directly as an argument (not a frozen closure), so this could in
  // principle be derived inline, but keeping it as a separate flag matches the shape
  // CreateTradeIdeas expects everywhere else (selectedRow vs. chainFrom).
  const [isChainMode, setIsChainMode] = useState(false);
  // "Follow Up" action: which root idea's thread the modal below should display, and
  // whether the modal is open. Kept separate from selectedRow/isChainMode so opening a
  // thread doesn't disturb the Edit/Update (chain) flow's own state.
  const [threadRootId, setThreadRootId] = useState(null);
  const [isThreadOpen, setIsThreadOpen] = useState(false);
  // Only set when editing an EXISTING follow-up from the thread modal — the predecessor
  // record it chains from, shown as the create form's read-only reference strip. Kept
  // separate from isChainMode/selectedRow (which drive plain-create/chain-create) so
  // "Edit Follow-Up" can pass its own chainFrom without disturbing that pair.
  const [followUpEditSource, setFollowUpEditSource] = useState(null);
  const [isLightBoxOpen, setIsLightBoxOpen] = useState(false);
  const [tradeIdeas, setTradeIdeas] = useState([]);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState({});
  const [category, setCategory] = useState(null);
  const [isSocialPromptOpen, setIsSocialPromptOpen] = useState(false);
  const [isSocialComposerOpen, setIsSocialComposerOpen] = useState(false);
  const [getEducatorTradeIdeas, { data, isLoading, refetch }] =
    useLazyGetEducatorTradeIdeasQuery();
  // Only used to resolve a follow-up row's true parent when "Edit" is clicked directly
  // on it (the table now shows the latest follow-up as its own row, not just the
  // original) — see the Edit MenuItem below.
  const [fetchThreadForEdit] = useLazyGetEducatorTradeIdeaThreadQuery();
  const { data: categoryList } = useGetEducatorAcademyCategoryQuery();

  const handleCloseView = () => {
    setIsLightBoxOpen(false);
  };
  const handleClickOpen = () => {
    // Plain create: drop any row/follow-up state left behind by a row click, Edit or
    // Follow Up so the form can't open in edit/chain mode with stale data.
    setSelectedRow({});
    setIsChainMode(false);
    setFollowUpEditSource(null);
    setIsCreateOpen(true);
  };

  // const handleDeleteOpen = () => {
  //   setIsDeleteOpen(true);
  // };

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
          onClick={async () => {
            setSelectedRow(raw);
            setIsChainMode(false);
            // The table shows both the original and the current latest follow-up as
            // their own rows now, so "Edit" here can land on either — resolve the
            // clicked row's true parent (if it has one) so a follow-up still opens as
            // "Edit Follow-Up" (reference strip, no share prompt) instead of the plain
            // full-editable form.
            if (raw?.previousIdea) {
              try {
                const thread = await fetchThreadForEdit(raw._id).unwrap();
                const items = thread?.data || [];
                const clicked = items.find((t) => String(t._id) === String(raw._id));
                const parent = clicked?.previousIdea
                  ? items.find((t) => String(t._id) === String(clicked.previousIdea))
                  : null;
                setFollowUpEditSource(parent || null);
              } catch (err) {
                setFollowUpEditSource(null);
              }
            } else {
              setFollowUpEditSource(null);
            }
            setIsCreateOpen(!isCreateOpen);
          }}
        >
          <MenuLink>
            <MenuIcon>
              <KeenIcon icon="notepad-edit" />
            </MenuIcon>
            <MenuTitle>Edit</MenuTitle>
          </MenuLink>
        </MenuItem>
        <MenuItem
          onClick={() => {
            // Follow Up = open the full update thread for this idea instead of jumping
            // straight into a chained create — see FollowUpThreadModal.
            setThreadRootId(raw?._id);
            setIsThreadOpen(true);
          }}
        >
          <MenuLink>
            <MenuIcon>
              <KeenIcon icon="arrow-circle-right" />
            </MenuIcon>
            <MenuTitle>Follow Up</MenuTitle>
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
        accessorFn: (row) => row.name,
        id: "name",
        header: ({ column }) => (
          <DataGridColumnHeader title="Symbol" column={column} />
        ),
        enableSorting: true,
        cell: (info) => (
          <div className="flex items-center gap-2.5">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <a
                  className="leading-none font-medium text-sm text-gray-900 hover:text-primary"
                  href="#"
                >
                  {info.row.original.name}
                </a>
                {/* This row is the current latest Follow-Up in its thread, not the
                    original — the table shows both as separate rows (see onlyRoot). */}
                {info.row.original.previousIdea && (
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex cursor-pointer">
                          <KeenIcon
                            icon="arrow-circle-right"
                            className="text-primary text-sm shrink-0"
                          />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        Follow-Up
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
          </div>
        ),
        meta: {
          headerClassName: "min-w-[200px]",
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
        accessorFn: (row) => row.timeFrame,
        id: "timeFrame",
        header: ({ column }) => (
          <DataGridColumnHeader title="Type" column={column} />
        ),
        enableSorting: true,
        cell: (info) => (
          <div className="flex flex-col">
            {info.getValue()?.map((exit, index) => (
              <span key={index}>{LabelMap[exit]}</span>
            ))}
          </div>
        ),
        meta: {
          headerClassName: "min-w-[125px]",
        },
      },
      {
        accessorFn: (row) => row.entry,
        id: "entry",
        header: ({ column }) => (
          <DataGridColumnHeader title="Entry" column={column} />
        ),
        enableSorting: true,
        cell: (info) => info.getValue(),
        meta: {
          headerClassName: "min-w-[100px]",
        },
      },
      {
        accessorFn: (row) => row.exits,
        id: "exits",
        header: ({ column }) => (
          <DataGridColumnHeader title="Exits" column={column} />
        ),
        enableSorting: true,
        cell: (info) => (
          <div className="flex flex-col">
            {info.getValue()?.map((exit, index) => (
              <span key={index}>{exit}</span>
            ))}
          </div>
        ),
        meta: {
          headerClassName: "min-w-[100px]",
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
        category: category?._id || "",
        onlyRoot: true,
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
          <Toolbar>
            <ToolbarHeading>
              <ToolbarPageTitle text="IQ Ideas" />
              <ToolbarDescription>
                Generate, analyze, and execute profitable trading opportunities
                with smart insights, market trends, and data-driven strategies
              </ToolbarDescription>
            </ToolbarHeading>
            <ToolbarActions>
              {/* <div className="flex-1 min-w-[150px] md:min-w-[200px] relative">
                <Select
                  value={category?._id || ""}
                  onValueChange={(value) => {
                    const selected = categoryList?.data?.find(
                      (item) => item._id === value
                    );
                    if (selected) {
                      setCategory({
                        _id: selected._id,
                        name: `${selected.name}`,
                      });
                      reloadTable();
                    }
                  }}
                >
                  <SelectTrigger className="pr-5">
                    <SelectValue
                      placeholder="Select Category"
                      value={category?._id || ""}
                    >
                      {category ? category.name : "Select Category"}
                    </SelectValue>
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
                      reloadTable();
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    ✖
                  </button>
                )}
              </div> */}
              <div className="text-end">
                <button className="btn btn-primary" onClick={handleClickOpen}>
                  Create IQ Idea
                </button>
              </div>
            </ToolbarActions>
          </Toolbar>

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

          <CreateTradeIdeas
            setSelectedRow={setSelectedRow}
            handleCloseCreate={handleCloseCreate}
            refetch={reloadTable}
            isCreateOpen={isCreateOpen}
            setIsCreateOpen={setIsCreateOpen}
            selectedRow={isChainMode ? {} : selectedRow}
            chainFrom={isChainMode ? selectedRow : followUpEditSource}
            setChainFrom={() => {
              setIsChainMode(false);
              setFollowUpEditSource(null);
            }}
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

          <FollowUpThreadModal
            isOpen={isThreadOpen}
            rootId={threadRootId}
            onClose={() => setIsThreadOpen(false)}
            onEditItem={(item, predecessor) => {
              setIsThreadOpen(false);
              setSelectedRow(item);
              setIsChainMode(false);
              // Non-null only for an actual follow-up (predecessor = the record it
              // chains from) — this is what makes CreateTradeIdeas render "Edit
              // Follow-Up" (reference strip + status-only editing) instead of the
              // plain full-editable "Edit IQ Idea" form. Null for the root item.
              setFollowUpEditSource(predecessor);
              setIsCreateOpen(true);
            }}
            onAddFollowUp={(latestItem) => {
              setIsThreadOpen(false);
              setSelectedRow(latestItem);
              setIsChainMode(true);
              setIsCreateOpen(true);
            }}
            onDeleted={reloadTable}
          />

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
