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
import { toAbsoluteUrl } from '@/utils/Assets';
import { useLazyGetLanguagesQuery } from '../../../../store/api/admin/adminLanguagesApiSlice';
import CreateCoursesTypes from './createCoursesTypes';
import DeleteCoursesTypes from './DeleteCoursesTypes';
import { useLazyGetAdminCoursesTypesQuery, useUpdateAdminCoursesTypesMutation } from '../../../../store/api/admin/adminCoursesTypesApiSlice';
import { Switch } from '../../../../components/ui/switch';
import { set } from 'date-fns';


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


const CoursesTypes = ({ title = "Courses Types" }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [getAdminCoursesTypes, { isLoading }] = useLazyGetAdminCoursesTypesQuery();
  const [updateAdminCoursesTypes] = useUpdateAdminCoursesTypesMutation();
  const [toggleStatusData, setToggleStatusData] = useState([]);

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

  const handleVisibilityToggle = async (typeId, currentVisibility) => {
    try {
      const newVisibility = !Boolean(currentVisibility);

      setToggleStatusData(toggleStatusData.map(type => type._id === typeId ? { ...type, status: newVisibility } : type));
      const payload = toggleStatusData.find(type => type._id === typeId);
      // Make API call
      await updateAdminCoursesTypes({ ...payload, id: payload?._id, status: String(newVisibility) }).unwrap();
      toast.success(`Course type status updated to ${newVisibility ? 'Active' : 'Inactive'}`);
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update test visibility');
    }
  };

  const handleFetchData = async ({ pageIndex, pageSize }) => {
    const newPage = pageIndex + 1;
    const newLimit = pageSize;

    try {
      const response = await getAdminCoursesTypes({
        page: newPage,
        limit: newLimit,
        search: searchTerm,
      }).unwrap();
      setToggleStatusData(response.data);

      return {
        data: response.data || [],
        totalCount: response.pagination?.total || 0,
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
  console.log(toggleStatusData, "toggleStatusData");

  const columns = useMemo(() => [
    {
      accessorFn: row => `${row.name}`,
      id: 'name',
      header: ({ column }) => <DataGridColumnHeader title='Name' column={column} />,
      enableSorting: true,
      cell: info => <div>{info.getValue()}</div>,
      meta: { headerClassName: 'min-w-[200px]' },
    },
    {
      id: 'status',
      header: () => 'Status',
      enableSorting: false,
      cell: ({ row }) => {


        return (
          <Switch
            checked={toggleStatusData.find(test => test._id === row?.original?._id)?.status}
            onCheckedChange={() => handleVisibilityToggle(row?.original?._id, toggleStatusData.find(type => type._id === row?.original?._id)?.status)}
          />
        );
      },
    },
    {
      id: 'click',
      header: () => '',
      enableSorting: false,
      cell: ({ row }) => (
        <Menu className="items-stretch">
          <MenuItem
            toggle="dropdown"
            onClick={() => setSelectedRow(toggleStatusData.find(type => type._id === row?.original?._id))}
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
  ], [isRTL, toggleStatusData, handleVisibilityToggle]);

  return (
    <div className='mt-5'>
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text="IQ Vault Types" />
          <ToolbarDescription>
            <ToolbarDescription>
              Define and manage different types of IQ Vault offered on the platform.
            </ToolbarDescription>
          </ToolbarDescription>
        </ToolbarHeading>
        <ToolbarActions>
          <div className="text-end pb-4">
            <button className='btn btn-primary' onClick={handleClickOpen}>
              Create Course Types
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

      <CreateCoursesTypes
        setSelectedRow={setSelectedRow}
        handleCloseCreate={handleCloseCreate}
        refetch={reloadTable}
        isCreateOpen={isCreateOpen}
        setIsCreateOpen={setIsCreateOpen}
        selectedRow={selectedRow}
      />

      {isDeleteOpen && (
        <DeleteCoursesTypes
          refetch={reloadTable}
          isDeleteOpen={isDeleteOpen}
          handleDeleteClose={handleDeleteClose}
          selectedRow={selectedRow}
          setSelectedRow={setSelectedRow}
        />
      )}
    </div>
  );
};

export default CoursesTypes;
