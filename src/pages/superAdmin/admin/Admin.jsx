import * as React from "react";
import { useMemo, useState, useEffect } from "react";
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
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from "@/partials/toolbar";
import { MenuIcon, MenuLink, MenuSub, MenuTitle } from "@/components";
import CreateAdmin from "./CreateAdmin";
import DeleteAdmin from "./DeleteAdmin";

import { toAbsoluteUrl } from "@/utils/Assets";
import { useLazyGetAdminsQuery } from "../../../store/api/admin/superAdminApiSlice";

const Admin = ({ title = "Admins" }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [getAdmins, { data: admins, isLoading }] = useLazyGetAdminsQuery();

  const { isRTL } = useLanguage();

  const handleCloseCreate = () => {
    setIsCreateOpen(false);
    setSelectedRow({});
  };

  const handleDeleteClose = () => {
    setIsDeleteOpen(false);
    setSelectedRow({});
  };

  const handleRowSelection = (state) => {
    const selectedIds = Object.keys(state);
    if (selectedIds.length > 0) {
      toast(`Total ${selectedIds.length} selected`, {
        description: `Row IDs: ${selectedIds.join(", ")}`,
      });
    }
  };

  const [tableKey, setTableKey] = useState(0);
  const reloadTable = () => setTableKey((prev) => prev + 1);
  useEffect(() => {
    reloadTable();
  }, [searchTerm]);

  const handleFetchData = async ({ pageIndex, pageSize }) => {
    const newPage = pageIndex + 1;
    const newLimit = pageSize;

    try {
      const response = await getAdmins({
        page: newPage,
        limit: newLimit,
        search: searchTerm,
      }).unwrap();

      return {
        data: response.data || [],
        totalCount: response.pagination?.total || 0,
      };
    } catch (error) {
      console.error("Error fetching admins:", error);
      return { data: [], totalCount: 0 };
    }
  };

  const ActionMenu = (row) => (
    <MenuSub className="menu-default" rootClassName="w-full max-w-[200px]">
      <MenuItem
        onClick={() => {
          setIsCreateOpen(true);
          setSelectedRow(row);
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

  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row.image,
        id: "image",
        header: ({ column }) => (
          <DataGridColumnHeader title="Profile" column={column} />
        ),
        enableSorting: false,
        cell: ({ row }) => (
          <img
            src={
              row.original.image?.includes("undefined")
                ? toAbsoluteUrl("/media/avatars/blank.png")
                : row.original.image
            }
            className="rounded-full size-9 cursor-pointer"
            alt="admin"
          />
        ),
        meta: { headerClassName: "w-[80px]" },
      },
      {
        accessorFn: (row) => row.name,
        id: "name",
        header: ({ column }) => (
          <DataGridColumnHeader title="Name" column={column} />
        ),
        enableSorting: true,
        cell: (info) => <div>{info.getValue()}</div>,
        meta: { headerClassName: "min-w-[200px]" },
      },
      {
        accessorFn: (row) => row.email,
        id: "email",
        header: ({ column }) => (
          <DataGridColumnHeader title="Email" column={column} />
        ),
        enableSorting: true,
        cell: (info) => <div>{info.getValue()}</div>,
        meta: { headerClassName: "min-w-[250px]" },
      },
      {
        accessorFn: (row) => row.role,
        id: "role",
        header: ({ column }) => (
          <DataGridColumnHeader title="Role" column={column} />
        ),
        enableSorting: true,
        cell: (info) => <span className="capitalize">{info.getValue()}</span>,
        meta: { headerClassName: "w-[150px]" },
      },
      {
        accessorFn: (row) => row.status,
        id: "status",
        header: ({ column }) => (
          <DataGridColumnHeader title="Status" column={column} />
        ),
        enableSorting: true,
        cell: (info) => (
          <span
            className={`badge badge-sm badge-outline capitalize ${info.getValue() === "true" ? "badge-success" : "badge-danger"
              }`}
          >
            {info.getValue() === "true" ? "Active" : "Inactive"}
          </span>
        ),
        meta: { headerClassName: "w-[150px]" },
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <Menu className="items-stretch">
            <MenuItem
              toggle="dropdown"
              //   onClick={() => setSelectedRow(row.original)}
              trigger="click"
              dropdownProps={{
                placement: isRTL() ? "bottom-start" : "bottom-end",
                modifiers: [
                  {
                    name: "offset",
                    options: { offset: isRTL() ? [0, -10] : [0, 10] },
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
        meta: { headerClassName: "w-[100px]" },
      },
    ],
    [isRTL]
  );

  const ToolbarTable = () => {
    const { table } = useDataGrid();
    return (
      <div className="card-header px-5 py-5 border-b-0 flex-wrap gap-2">
        <h3 className="card-title">{title}</h3>
        <div className="flex flex-wrap items-center gap-2.5">
          {/* <div className="relative">
          <input
            type="text"
            placeholder="Search Admins..."
            className="input input-md ps-3 h-8 border border-gray-300 rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div> */}
          <DataGridColumnVisibility table={table} />
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid">
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text="Admins" />
          <ToolbarDescription>
            Manage platform administrators, assign roles, and maintain access
            control securely.
          </ToolbarDescription>
        </ToolbarHeading>
        <ToolbarActions>
          <button
            className="btn btn-primary"
            onClick={() => setIsCreateOpen(true)}
          >
            Create Admin
          </button>
        </ToolbarActions>
      </Toolbar>

      <DataGrid
        key={searchTerm}
        reloadTrigger={tableKey}
        serverSide={true}
        loading={isLoading}
        columns={columns}
        rowSelection={true}
        onRowSelectionChange={handleRowSelection}
        pagination={{ size: 10 }}
        toolbar={
          <ToolbarTable
          // searchTerm={searchTerm}
          // // setSearchTerm={setSearchTerm}
          // title={title}
          />
        }
        layout={{ card: true }}
        onFetchData={handleFetchData}
      />

      {isCreateOpen && (
        <CreateAdmin
          refetch={reloadTable}
          isCreateOpen={isCreateOpen}
          handleCloseCreate={handleCloseCreate}
          selectedRow={selectedRow}
          setSelectedRow={setSelectedRow}
        />
      )}

      {isDeleteOpen && (
        <DeleteAdmin
          refetch={reloadTable}
          isDeleteOpen={isDeleteOpen}
          handleDeleteClose={handleDeleteClose}
          selectedRow={selectedRow}
        />
      )}
    </div>
  );
};

export default Admin;
