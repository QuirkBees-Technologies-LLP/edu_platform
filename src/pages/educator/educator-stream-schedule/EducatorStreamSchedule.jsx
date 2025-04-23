import React from 'react';
/* eslint-disable prettier/prettier */
import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/i18n';
import { DataGrid, DataGridColumnHeader, DataGridColumnVisibility, DataGridRowSelect, DataGridRowSelectAll, KeenIcon, useDataGrid, Menu, MenuItem, MenuToggle } from '@/components';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Toolbar, ToolbarActions, ToolbarDescription, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import { format, set } from 'date-fns';
import { MenuIcon, MenuLink, MenuSeparator, MenuSub, MenuTitle } from '@/components';
import { useLazyGetAdminTradeIdeasQuery } from '../../../store/api/admin/adminTradeIdeasApiSlice';
import { useLazyGetLiveSessionListQuery } from '../../../store/api/admin/adminLiveSessionApiSlice';
import { formatSecondsToHMS } from '../../../lib/utils';
import CreateEducatorStreamSchedule from './CreateEducatorStreamSchedule';
import { useLazyGetEducatorStreamScheduleQuery } from '../../../store/api/educator/EducatorStreamScheduleApiSlice';

const EducatorStreamSchedule = ({ title = "Schedule Stream" }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});
  const [isLightBoxOpen, setIsLightBoxOpen] = useState(false);
  const [getEducatorStreamSchedule, { data, isLoading }] = useLazyGetEducatorStreamScheduleQuery();

  const handleClickOpen = () => {
    setIsCreateOpen(true);
  };

  const handleDeleteOpen = () => {
    console.log("handleDeleteOpen");
    setIsDeleteOpen(true);
  };

  const handleDeleteClose = () => {
    setIsDeleteOpen(false);
  }

  const {
    isRTL
  } = useLanguage();
  const storageFilterId = 'members-filter';
  const ColumnInputFilter = ({
    column
  }) => {
    return <Input placeholder="Filter..." value={column.getFilterValue() ?? ''} onChange={event => column.setFilterValue(event.target.value)} className="h-9 w-full max-w-40" />;
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
    )
  }
  console.log(selectedRow, "selectedrow");

  const columns = useMemo(() => [
    {
      accessorFn: row => row.status,
      id: 'title',
      header: ({
        column
      }) => <DataGridColumnHeader title='Title' column={column} />,
      enableSorting: true,
      cell: info => <span >
        {info.row.original.title}
      </span>,
    },
    {
      accessorFn: row => row.callId,
      id: 'callId',
      header: ({
        column
      }) => <DataGridColumnHeader title='Call Id' column={column} />,
      enableSorting: true,
      cell: info => <div className="flex items-center gap-2.5">
        <span className="leading-none text-gray-800 font-normal">
          {info.row.original.callId}
        </span>
      </div>,
      meta: {
        headerClassName: 'min-w-[200px]'
      }
    },
    {
      accessorFn: row => row.createdAt,
      id: 'createdAt',
      header: ({
        column
      }) => <DataGridColumnHeader title='Created At' column={column} />,
      enableSorting: true,
      cell: info => <div className="flex items-center gap-2.5">
        <span className="leading-none text-gray-800 font-normal">
          {format(info.row.original.createdAt, "MMM dd, yyyy, hh:mm a")}
        </span>
      </div>,
      meta: {
        headerClassName: 'min-w-[200px]'
      }
    },
  ], [isRTL]);

  // Initialize search term from localStorage if available
  const [searchTerm, setSearchTerm] = useState(() => {
    return localStorage.getItem(storageFilterId) || '';
  });


  // Filtered data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data?.data; // If no search term, return full data

    // return data.filter(member => member.member.name.toLowerCase().includes(searchTerm.toLowerCase()) || member.member.tasks.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, data?.data]);
  const handleRowSelection = state => {
    const selectedRowIds = Object.keys(state);
    if (selectedRowIds.length > 0) {
      toast(`Total ${selectedRowIds.length} are selected.`, {
        description: `Selected row IDs: ${selectedRowIds}`,
        action: {
          label: 'Undo',
          onClick: () => console.log('Undo')
        }
      });
    }
  };
  const ToolbarTable = () => {
    const {
      table
    } = useDataGrid();
    return <div className="card-header px-5 py-5 border-b-0 flex-wrap gap-2">
      <h3 className="card-title">{title}</h3>
      <div className="flex flex-wrap items-center gap-2.5">
        {/* <div className="relative">
          <KeenIcon icon="magnifier" className="leading-none text-md text-gray-500 absolute top-1/2 start-0 -translate-y-1/2 ms-3" />
          <input type="text" placeholder="Search Members" className="input input-md ps-8" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} // Update search term
          />
        </div> */}
        <DataGridColumnVisibility table={table} />
      </div>
    </div>;
  };

  const handleCloseCreate = () => {
    setIsCreateOpen(false);
  };

  const handleFetchData = async ({ pageIndex, pageSize }) => {
    const newPage = pageIndex + 1;
    const newLimit = pageSize;

    try {
      // Fetch API Data
      const response = await getEducatorStreamSchedule({ page: newPage, limit: newLimit }).unwrap();

      return {
        data: response.data || [],
        totalCount: response.pagination?.totalRecords || 0,
      };
    } catch (error) {
      console.error("Error fetching trade ideas:", error);
      return { data: [], totalCount: 0 };
    }
  };

  const [tableKey, setTableKey] = useState(0); // ✅ Key to trigger re-render


  const reloadTable = () => {
    setTableKey(prevKey => prevKey + 1); // ✅ Change key to force re-fetch
  };

  return (
    <div className='container-fluid'>
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text="Schedule Stream" />
          <ToolbarDescription>
            Track and analyze past live sessions with key insights and performance data.</ToolbarDescription>
        </ToolbarHeading>
        <ToolbarActions>
          <div className="text-end pb-4">
            <button className='btn btn-primary' onClick={handleClickOpen}>
              Create Live Session
            </button>
          </div>
        </ToolbarActions>
      </Toolbar>
      <DataGrid serverSide={true}
        loading={isLoading} columns={columns} rowSelection={true} onRowSelectionChange={handleRowSelection} pagination={{
          size: 10,
        }} toolbar={<ToolbarTable />} layout={{
          card: true
        }}
        onFetchData={handleFetchData}
      />

      <CreateEducatorStreamSchedule handleCloseCreate={handleCloseCreate} refetch={reloadTable} isCreateOpen={isCreateOpen} setIsCreateOpen={setIsCreateOpen} selectedRow={selectedRow} />
    </div>
  )
}

export default EducatorStreamSchedule