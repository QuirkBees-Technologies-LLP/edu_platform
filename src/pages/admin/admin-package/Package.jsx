import React, { useState, useMemo } from "react";
import { useLanguage } from "@/i18n";
import {
  DataGrid,
  DataGridColumnHeader,
  DataGridColumnVisibility,
  useDataGrid,
  Menu,
  MenuItem,
  MenuLink,
  MenuIcon,
  MenuTitle,
  MenuToggle,
  KeenIcon,
  MenuSub,
} from "@/components";
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
  ToolbarPageTitle,
  ToolbarDescription,
} from "@/partials/toolbar";
import { toast } from "sonner";
import SearchFilterInput from "@/components/SearchFilterInput";
import debounce from "lodash.debounce";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  useLazyGetPackagesListQuery,
  useDeletePackageMutation,
} from "../../../store/api/admin/adminPackageApiSlice";
import CreatePackageModel from "./CreatePackageModel";
import DeletePackage from "./DeletePackage";

const Package = () => {
  const [selectedRow, setSelectedRow] = useState({});
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchTextInput, setSearchTextInput] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [tableKey, setTableKey] = useState(0);

  const { isRTL } = useLanguage();
  const [getPackages, { isLoading, refetch }] = useLazyGetPackagesListQuery();

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
          const res = await getPackages({
            page,
            limit,
            search: searchTextInput || "",
          }).unwrap();

          return {
            data: res.data || [],
            totalCount: res.total || 0,
          };
        } catch (error) {
          console.error("❌ Fetch packages error:", error);
          return { data: [], totalCount: 0 };
        }
      },
    [getPackages, searchTextInput]
  );
  const ActionMenu = (row) => (
    <MenuSub className="menu-default" rootClassName="w-full max-w-[200px]">
      <MenuItem
        onClick={() => {
          setSelectedRow(row);
          setIsAddOpen(true); 
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
          setSelectedRow(row);
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

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        id: "name",
        enableSorting: false,
        header: ({ column }) => (
          <DataGridColumnHeader title="Package Name" column={column} />
        ),
        cell: (info) => <span>{info.row.original.name}</span>,
        meta: { headerClassName: "min-w-[180px]" },
      },
      {
        accessorKey: "allowedCategories",
        id: "categories",
        enableSorting: false,
        header: ({ column }) => (
          <DataGridColumnHeader title="Allowed Categories" column={column} />
        ),
        cell: (info) => {
          const categories = info.row.original.allowedCategories || [];
          return (
            <span>
              {categories.length
                ? categories.map((cat) => cat.name).join(", ")
                : "—"}
            </span>
          );
        },
        meta: { headerClassName: "min-w-[220px]" },
      },
      {
        accessorKey: "allowedSideBar",
        id: "sidebar",
        enableSorting: false,
        header: ({ column }) => (
          <DataGridColumnHeader title="Allowed Routes" column={column} />
        ),
        cell: (info) => {
          const routes = info.row.original.allowedSideBar || [];
          return (
            <span className="text-gray-700">
              {routes.length ? routes.join(", ") : "—"}
            </span>
          );
        },
        meta: { headerClassName: "min-w-[200px]" },
      },
      {
        id: "click",
        header: () => "",
        enableSorting: false,
        cell: ({ row }) => (
          <Menu className="items-stretch">
            <MenuItem
              toggle="dropdown"
              // onClick={() => setSelectedRow(row.original)}
              trigger="click"
              dropdownProps={{
                placement: isRTL() ? "bottom-start" : "bottom-end",
                modifiers: [
                  {
                    name: "offset",
                    options: {
                      offset: isRTL() ? [0, -10] : [0, 10],
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
    []
  );

  const ToolbarTable = () => {
    const { table } = useDataGrid();
    return (
      <div className="card-header px-5 py-5 border-b-0 flex-wrap gap-2">
        <h3 className="card-title">SKUs</h3>
        <div className="flex flex-wrap items-center gap-2.5">
          <DataGridColumnVisibility table={table} />
        </div>
      </div>
    );
  };
  const handleClose = () => {
    setIsAddOpen(false);
    setIsEditOpen(false);
    setIsDeleteOpen(false);
    setSelectedRow(null);
  };

  return (
    <div className="container-fluid pb-5">
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text="SKUs" />
          <ToolbarDescription>
            Manage and configure SKU access — control allowed categories and
            sidebar visibility for each plan.
          </ToolbarDescription>
        </ToolbarHeading>
        <div className="flex flex-wrap items-center gap-2">
          <ToolbarActions>
            <div className="flex-1 min-w-[200px] md:min-w-[300px]">
              <SearchFilterInput
                searchText={searchText}
                handleSearchChange={handleSearchChange}
              />
            </div>

            <div className="text-end">
              <button
                className="btn btn-primary"
                onClick={() => setIsAddOpen(true)}
              >
                Add Package
              </button>
            </div>
          </ToolbarActions>
        </div>
      </Toolbar>

      <DataGrid
        key={tableKey}
        serverSide
        loading={isLoading}
        columns={columns}
        pagination={{ size: 10 }}
        toolbar={<ToolbarTable />}
        layout={{ card: true }}
        onFetchData={handleFetchData}
      />
      {isAddOpen && (
        <CreatePackageModel
          isOpen={isAddOpen}
          setIsAddOpen={setIsAddOpen}
          handleClose={handleClose}
          selectedRow={selectedRow}
          tableKey={tableKey}
          setTableKey={setTableKey}
          refetch={reloadTable}
        />
      )}
      
      {isDeleteOpen && selectedRow && (
        <DeletePackage
          isDeleteOpen={isDeleteOpen}
          setIsDeleteOpen={setIsDeleteOpen}
          selectedRow={selectedRow}
          tableKey={tableKey}
          setTableKey={setTableKey}
          handleDeleteClose={handleClose}
          refetch={reloadTable}
        />
      )}
    </div>
  );
};

export default Package;
