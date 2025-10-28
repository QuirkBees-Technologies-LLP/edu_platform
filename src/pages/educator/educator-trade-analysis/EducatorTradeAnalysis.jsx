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
import CreateTradeAnalysis from "./CreateTradeAnalysis";
// import DeleteAdminTradeIdeas from "./DeleteAdminTradeIdeas";
import { MenuIcon, MenuLink, MenuSub, MenuTitle } from "@/components";
import ViewEducatorTradeAnalysis from "./ViewEducatorTradeAnalysis";

import { useLazyGetEducatorTradeAnalysisQuery } from "../../../store/api/educator/educatorTradeAnalysisApiSlice";
import DeleteTradeAnalysis from "./DeleteTradeAnalysis";
import { useGetEducatorAcademyCategoryQuery } from "../../../store/api/educator/educatorLiveStreamApiSlice";

const EducatorTradeAnalysis = ({ title = "IQ Insight" }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});
  const [isLightBoxOpen, setIsLightBoxOpen] = useState(false);
  const [category, setCategory] = useState(null);
  const [getEducatorTradeAnalysis, { data, isLoading, refetch }] =
    useLazyGetEducatorTradeAnalysisQuery();
  const { data: categoryList } = useGetEducatorAcademyCategoryQuery();

  const handleCloseView = () => {
    setIsLightBoxOpen(false);
  };
  const handleClickOpen = () => {
    setIsCreateOpen(true);
  };

  const handleDeleteOpen = () => {
    setIsDeleteOpen(true);
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
    scalp: "Scalp",
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

  const ActionMenu = (row) => {
    return (
      <MenuSub className="menu-default" rootClassName="w-full max-w-[200px]">
        <MenuItem
          onClick={() => {
            setSelectedRow(row);
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
            setIsDeleteOpen(true);
            setSelectedRow(row);
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
        accessorFn: (row) => row.title,
        id: "title",
        header: ({ column }) => (
          <DataGridColumnHeader title="Title" column={column} />
        ),
        enableSorting: true,
        cell: (info) => (
          <div className="flex items-center gap-2.5">
            <div className="flex flex-col gap-0.5">
              <a
                className="leading-none font-medium text-sm text-gray-900 hover:text-primary"
                href="#"
              >
                {info.row.original.title}
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
          headerClassName: "min-w-[200px]",
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
      const response = await getEducatorTradeAnalysis({
        page: newPage,
        limit: newLimit,
        category: category?._id || "",
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
      <>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle text="IQ Insight" />
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
                Create IQ Insight
              </button>
            </div>
          </ToolbarActions>
        </Toolbar>

        <DataGrid
          key={tableKey}
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

        <ViewEducatorTradeAnalysis
          isViewOpen={isLightBoxOpen}
          setIsLightBoxOpen={setIsLightBoxOpen}
          handleCloseView={handleCloseView}
          selectedIdea={selectedRow}
        />

        <CreateTradeAnalysis
          setSelectedRow={setSelectedRow}
          handleCloseCreate={handleCloseCreate}
          refetch={reloadTable}
          isCreateOpen={isCreateOpen}
          setIsCreateOpen={setIsCreateOpen}
          selectedRow={selectedRow}
        />

        {isDeleteOpen && (
          <DeleteTradeAnalysis
            refetch={reloadTable}
            isDeleteOpen={isDeleteOpen}
            handleDeleteClose={handleDeleteClose}
            selectedRow={selectedRow}
            setSelectedRow={setSelectedRow}
          />
        )}
      </>
    </div>
  );
};
export default EducatorTradeAnalysis;
