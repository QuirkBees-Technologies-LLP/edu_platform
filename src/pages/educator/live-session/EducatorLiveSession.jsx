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
import CreateLiveSession from './CreateLiveSession';
import { formatSecondsToHMS } from '../../../lib/utils';
import { useNavigate } from 'react-router';
import { useLazyGetLiveSessionListQuery } from '../../../store/api/educator/educatorLiveStreamApiSlice';

const EducatorLiveSession = ({ title = "IQ Academy" }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});
  const [isLightBoxOpen, setIsLightBoxOpen] = useState(false);
  const [getLiveSessionList, { data, isLoading }] = useLazyGetLiveSessionListQuery();
  const navigate = useNavigate();

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

  const handleRedirect = (callId, row) => {
    navigate(`/educator/live-session/${callId}`, { state: row })
  }

  const columns = useMemo(() => [
    // {
    //   accessorFn: row => row.status,
    //   id: 'status',
    //   header: ({
    //     column
    //   }) => <DataGridColumnHeader title='Status' column={column} />,
    //   enableSorting: true,
    //   cell: info => <span className={`badge badge-sm badge-outline capitalize ${info.row.original.status === "Active" ? "badge-success" : "badge-danger"}`}>
    //     {info.row.original.status}
    //   </span>,
    // },
    {
      accessorFn: row => row.title,
      id: 'title',
      header: ({
        column
      }) => <DataGridColumnHeader title='Title' column={column} />,
      enableSorting: true,
      cell: info => <span>
        <p className='cursor-pointer hover:text-primary' onClick={() => handleRedirect(info.row.original.callId, info.row.original)}>
          {info.row.original.title}
        </p>
      </span>,
    },
    {
      accessorFn: row => row.educatorDetails,
      id: 'educator',
      header: ({
        column
      }) => <DataGridColumnHeader title='Educator' column={column} />,
      enableSorting: true,
      cell: info => <div className="flex items-center gap-2.5">
        <span className="leading-none text-gray-800 font-normal">
          {info.row.original.educatorDetails?.first_name + " " + info.row.original.educatorDetails?.last_name}
        </span>
      </div>,
      meta: {
        headerClassName: 'min-w-[200px]'
      }
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
      accessorFn: row => row.status,
      id: 'status',
      header: ({
        column
      }) => <DataGridColumnHeader title='Status' column={column} />,
      enableSorting: true,
      cell: info => <div className="flex items-center gap-2.5">
        {/* <span className="leading-none text-gray-800 font-normal">
          {info.row.original.status}
        </span> */}
        <span class={`badge badge-outline ${info.row.original.status === "Active" ? "badge-primary" : "badge-danger"}`}>
          {info.row.original.status}
        </span>
      </div>,
      meta: {
        headerClassName: 'min-w-[200px]'
      }
    },
    {
      accessorFn: row => row.datetime,
      id: 'datetime',
      header: ({
        column
      }) => <DataGridColumnHeader title='Schedule At' column={column} />,
      enableSorting: true,
      cell: info => <div className="flex items-center gap-2.5">
        <span className="leading-none text-gray-800 font-normal">
          {info.row.original.datetime ? format(info.row.original.datetime, "MMM dd, yyyy, hh:mm a") : "N/A"}
        </span>
      </div>,
      meta: {
        headerClassName: 'min-w-[200px]'
      }
    },
    // {
    //   accessorFn: row => row.createdAt,
    //   id: 'createdAt',
    //   header: ({
    //     column
    //   }) => <DataGridColumnHeader title='Created At' column={column} />,
    //   enableSorting: true,
    //   cell: info => <div className="flex items-center gap-2.5">
    //     <span className="leading-none text-gray-800 font-normal">
    //       {format(info.row.original.createdAt, "MMM dd, yyyy, hh:mm a")}
    //     </span>
    //   </div>,
    //   meta: {
    //     headerClassName: 'min-w-[200px]'
    //   }
    // },
    // {
    //   accessorFn: row => row.duration,
    //   id: 'duration',
    //   header: ({
    //     column
    //   }) => <DataGridColumnHeader title='Duration' column={column} />,
    //   enableSorting: true,
    //   cell: info => <div className="flex items-center gap-2.5">
    //     <span className="leading-none text-gray-800 font-normal">
    //       {formatSecondsToHMS(info.row.original.duration)}
    //     </span>
    //   </div>,
    //   meta: {
    //     headerClassName: 'min-w-[200px]'
    //   }
    // },
    // {
    //   accessorFn: row => row.viewerCount,
    //   id: 'viewerCount',
    //   header: ({
    //     column
    //   }) => <DataGridColumnHeader title='Viewer Count' column={column} />,
    //   enableSorting: true,
    //   cell: info => <div className="flex items-center gap-2.5">
    //     <span className="leading-none text-gray-800 font-normal">
    //       {info.row.original.viewerCount}
    //     </span>
    //   </div>,
    //   meta: {
    //     headerClassName: 'min-w-[200px]'
    //   }
    // },
  ], [isRTL]);

  // Initialize search term from localStorage if available
  const [searchTerm, setSearchTerm] = useState(() => {
    return localStorage.getItem(storageFilterId) || '';
  });

  console.log(data, "data");

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
      const response = await getLiveSessionList({ page: newPage, limit: newLimit }).unwrap();

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
    setTableKey(prevKey => prevKey + 1); // ✅ Change key to force re-fetch
  };

  return (
    <div className='container-fluid'>
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text="IQ Academy" />
          <ToolbarDescription>
            Track and analyze past IQ Academy with key insights and performance data.</ToolbarDescription>
        </ToolbarHeading>
        {/* <ToolbarActions>
          <div className="text-end pb-4">
            <button className='btn btn-primary' onClick={handleClickOpen}>
              Create IQ Academy
            </button>
          </div>
        </ToolbarActions> */}
      </Toolbar>
      <DataGrid serverSide={true}
        loading={isLoading} columns={columns} rowSelection={true} onRowSelectionChange={handleRowSelection} pagination={{
          size: 10,
        }} toolbar={<ToolbarTable />} layout={{
          card: true
        }}
        onFetchData={handleFetchData}
      />

      <CreateLiveSession handleCloseCreate={handleCloseCreate} refetch={reloadTable} isCreateOpen={isCreateOpen} setIsCreateOpen={setIsCreateOpen} selectedRow={selectedRow} />
    </div>
  )
}

export default EducatorLiveSession