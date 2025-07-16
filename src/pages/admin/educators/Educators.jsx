/* eslint-disable prettier/prettier */
import * as React from 'react';
import { useMemo, useState } from 'react';
import { useLanguage } from '@/i18n';
import {
  DataGrid,
  DataGridColumnHeader,
  DataGridColumnVisibility,
  KeenIcon,
  useDataGrid,
  Menu,
  MenuItem,
  MenuToggle,
} from '@/components';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from '@/partials/toolbar';
import {
  MenuIcon,
  MenuLink,
  MenuSub,
  MenuTitle
} from '@/components';
import CreateEducator from './CreateEducator';
import DeleteEducator from './DeleteEducator';
import { useLazyGetEducatorsQuery } from '../../../store/api/admin/adminEducatorsApiSlice';
import { toAbsoluteUrl } from '@/utils/Assets';


// ✅ MOVED OUTSIDE COMPONENT
const ToolbarTable = ({ searchTerm, setSearchTerm, title }) => {
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
            className="input input-md ps-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <DataGridColumnVisibility table={table} />
      </div>
    </div>
  );
};


const Educators = ({ title = "Educators" }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isLightBoxOpen, setIsLightBoxOpen] = useState(false);
  const [getEducators, { data, isLoading }] = useLazyGetEducatorsQuery();

  // const [tableKey, setTableKey] = useState(0);
  // const reloadTable = () => setTableKey(prev => prev + 1);

  const { isRTL } = useLanguage();

  const handleClickOpen = () => setIsCreateOpen(true);
  const handleDeleteOpen = () => setIsDeleteOpen(true);
  const handleDeleteClose = () => setIsDeleteOpen(false);
  const handleCloseCreate = () => setIsCreateOpen(false);

  const handleRowSelection = state => {
    const selectedRowIds = Object.keys(state);
    if (selectedRowIds.length > 0) {
      toast(`Total ${selectedRowIds.length} are selected.`, {
        description: `Selected row IDs: ${selectedRowIds}`,
        action: {
          label: 'Undo',
          onClick: () => console.log('Undo'),
        },
      });
    }
  };

  // ✅ Re-fetch on search term change
  const [tableKey, setTableKey] = useState(0);
const reloadTable = () => setTableKey(prev => prev + 1);

React.useEffect(() => {
  reloadTable(); // this triggers setTableKey and remounts the entire DataGrid
}, [searchTerm]);


  const handleFetchData = async ({ pageIndex, pageSize }) => {
    const newPage = pageIndex + 1;
    const newLimit = pageSize;

    try {
      const response = await getEducators({
        page: newPage,
        limit: newLimit,
        search: searchTerm,
      }).unwrap();

      return {
        data: response.data || [],
        totalCount: response.pagination?.totalRecords || 0,
      };
    } catch (error) {
      console.error("Error fetching educators:", error);
      return { data: [], totalCount: 0 };
    }
  };

  const ActionMenu = () => (
    <MenuSub className="menu-default" rootClassName="w-full max-w-[200px]">
      <MenuItem onClick={() => setIsCreateOpen(true)}>
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

  const columns = useMemo(() => [
    {
      accessorFn: row => row.image,
      id: 'image',
      header: ({ column }) => <DataGridColumnHeader title='Images' column={column} />,
      enableSorting: true,
      cell: ({ row }) => (
        <div
          className="flex flex-col justify-center items-center gap-0.5"
          onClick={() => {
            setSelectedRow(row.original);
            setIsLightBoxOpen(true);
          }}
        >
          <img
            src={
              row.original.image?.includes("undefined")
                ? toAbsoluteUrl(`/media/avatars/blank.png`)
                : row.original.image
            }
            className="rounded-full cursor-pointer size-9 shrink-0"
            alt=""
          />
        </div>
      ),
      meta: {
        headerClassName: 'w-[80px]',
      },
    },
    {
      accessorFn: row => `${row.first_name} ${row.last_name}`,
      id: 'name',
      header: ({ column }) => <DataGridColumnHeader title='Name' column={column} />,
      enableSorting: true,
      cell: info => <div>{info.getValue()}</div>,
      meta: { headerClassName: 'min-w-[200px]' },
    },
    {
      accessorFn: row => row.email,
      id: 'email',
      header: ({ column }) => <DataGridColumnHeader title='Email' column={column} />,
      enableSorting: true,
      cell: info => <div>{info.getValue()}</div>,
      meta: { headerClassName: 'min-w-[200px]' },
    },
    {
      accessorFn: row => row.status,
      id: 'status',
      header: ({ column }) => <DataGridColumnHeader title='Status' column={column} />,
      enableSorting: true,
      cell: info => (
        <span className={`badge badge-sm badge-outline capitalize ${info.row.original.status === true ? "badge-success" : "badge-danger"}`}>
          {info.row.original.status === true ? "Active" : "Inactive"}
        </span>
      ),
      meta: { headerClassName: 'w-[225px]' },
    },
    {
      id: 'click',
      header: () => '',
      enableSorting: false,
      cell: ({ row }) => (
        <Menu className="items-stretch">
          <MenuItem
            toggle="dropdown"
            onClick={() => setSelectedRow(row.original)}
            trigger="click"
            dropdownProps={{
              placement: isRTL() ? 'bottom-start' : 'bottom-end',
              modifiers: [
                {
                  name: 'offset',
                  options: { offset: isRTL() ? [0, -10] : [0, 10] },
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
      meta: { headerClassName: 'w-[150px]' },
    }
  ], [isRTL]);

  return (
    <div className='container-fluid'>
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text="Educators" />
          <ToolbarDescription>
            Oversee educator profiles, manage their sessions, and ensure quality trade and course content across the platform.
          </ToolbarDescription>
        </ToolbarHeading>
        <ToolbarActions>
          <div className="text-end pb-4">
            <button className='btn btn-primary' onClick={handleClickOpen}>
              Create Educator
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
        toolbar={
          <ToolbarTable
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            title={title}
          />
        }
        layout={{ card: true }}
        onFetchData={handleFetchData}
      />

      <CreateEducator
        setSelectedRow={setSelectedRow}
        handleCloseCreate={handleCloseCreate}
        refetch={reloadTable}
        isCreateOpen={isCreateOpen}
        setIsCreateOpen={setIsCreateOpen}
        selectedRow={selectedRow}
      />

      {isDeleteOpen && (
        <DeleteEducator
          refetch={reloadTable}
          isDeleteOpen={isDeleteOpen}
          handleDeleteClose={handleDeleteClose}
          selectedRow={selectedRow}
        />
      )}
    </div>
  );
};

export default Educators;
