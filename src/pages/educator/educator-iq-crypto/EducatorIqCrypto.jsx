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
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from "@/partials/toolbar";

import { MenuIcon, MenuLink, MenuSub, MenuTitle } from "@/components";

import { useLazyGetEducatorCryptoAnalysisQuery } from "../../../store/api/educator/educatorCryptoAnalysisApiSlice";
import DeleteEducatorIqCrypto from "./DeleteEducatorIqCrypto";
import CreateEducatorIqCrypto from "./CreateEducatorIqCrypto";
import ViewEducatorIqCrypto from "./ViewEducatorIqCrypto";

const EducatorIqCrypto = ({ title = "IQ Crypto" }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});
  const [isLightBoxOpen, setIsLightBoxOpen] = useState(false);
  const [getEducatorCryptoAnalysis, { data, isLoading }] =
    useLazyGetEducatorCryptoAnalysisQuery();

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
              <p>Crypto</p>
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
          <div className="relative"></div>
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
      const response = await getEducatorCryptoAnalysis({
        page: newPage,
        limit: newLimit,
      }).unwrap();

      return {
        data: response.data || [],
        totalCount: response.pagination?.totalRecords || 0,
      };
    } catch (error) {
      console.error("Error fetching IQ Crypto:", error);
      return { data: [], totalCount: 0 };
    }
  };

  const [tableKey, setTableKey] = useState(0); // ✅ Key to trigger re-render

  const reloadTable = () => {
    setTableKey((prevKey) => prevKey + 1); // ✅ Change key to force re-fetch
  };

  return (
    <div className="container-fluid">
      <>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle text="IQ Crypto" />
            <ToolbarDescription>
              Generate, analyze, and execute profitable trading opportunities
              with smart insights, market trends, and data-driven strategies
            </ToolbarDescription>
          </ToolbarHeading>
          <ToolbarActions>
            <div className="text-end">
              <button className="btn btn-primary" onClick={handleClickOpen}>
                Create IQ Crypto
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

        <ViewEducatorIqCrypto
          isViewOpen={isLightBoxOpen}
          setIsLightBoxOpen={setIsLightBoxOpen}
          handleCloseView={handleCloseView}
          selectedIdea={selectedRow}
        />

        <CreateEducatorIqCrypto
          setSelectedRow={setSelectedRow}
          handleCloseCreate={handleCloseCreate}
          refetch={reloadTable}
          isCreateOpen={isCreateOpen}
          setIsCreateOpen={setIsCreateOpen}
          selectedRow={selectedRow}
        />

        {isDeleteOpen && (
          <DeleteEducatorIqCrypto
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
export default EducatorIqCrypto;
