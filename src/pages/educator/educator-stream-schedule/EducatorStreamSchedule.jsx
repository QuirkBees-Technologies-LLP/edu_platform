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
import { useLazyGetEducatorStreamScheduleQuery } from '../../../store/api/educator/educatorStreamScheduleApiSlice';
import DeleteEducatorStreamSchedule from './DeleteEducatorStreamSchedule';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useEndCallMutation } from '../../../store/api/educator/educatorLiveStreamApiSlice';

const EducatorStreamSchedule = ({ title = "Live Schedule" }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});
  const [isLightBoxOpen, setIsLightBoxOpen] = useState(false);
  const [getEducatorStreamSchedule, { data, isLoading }] = useLazyGetEducatorStreamScheduleQuery();
  const [endCall, { isLoading: isEnding }] = useEndCallMutation();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [tableKey, setTableKey] = useState(0); // ✅ Key to trigger re-render


  const reloadTable = () => {
    setTableKey(prevKey => prevKey + 1); // ✅ Change key to force re-fetch
  };

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

  const handleEndCall = async (rowData) => {
    try {
      const callId = rowData?.callId;
      if (!callId) {
        toast.error('Missing callId');
        return;
      }
      await endCall({ callId }).unwrap();
      setSelectedRow({});
      reloadTable && reloadTable();
      toast.success('Call ended successfully');
    } catch (error) {
      console.error('Failed to end call', error);
      const message = error?.data?.message || 'Failed to end call';
      toast.error(message);
    }
  }

  const openConfirmEnd = (row) => {
    setSelectedRow(row);
    setIsConfirmOpen(true);
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
      accessorFn: (row) => row.name,
      id: "Language",
      header: ({ column }) => (
        <DataGridColumnHeader title="Language" column={column} />
      ),
      enableSorting: true,
      cell: (info) => (
        <div className="flex items-center gap-2.5">
          <div className="flex flex-col gap-0.5">
            <p>
              {info.row.original.language ?? "NA"}
            </p>
          </div>
        </div>
      ),
      meta: {
        headerClassName: "min-w-[150px]",
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
            <p>
              {info.row.original.category?.name ?? "NA"}
            </p>
          </div>
        </div>
      ),
      meta: {
        headerClassName: "min-w-[200px]",
      },
    },
    {
      accessorFn: row => row.educator,
      id: 'educator',
      header: ({
        column
      }) => <DataGridColumnHeader title='Educator' column={column} />,
      enableSorting: true,
      cell: info => <div className="flex items-center gap-2.5">
        <span className="leading-none text-gray-800 font-normal">
          {info.row.original.educator?.first_name + " " + info.row.original.educator?.last_name}
        </span>
      </div>,
      meta: {
        headerClassName: 'min-w-[200px]'
      }
    },
    {
      accessorFn: row => row.create_by,
      id: 'schedule_time',
      header: ({
        column
      }) => <DataGridColumnHeader title='Schedule At' column={column} />,
      enableSorting: true,
      cell: info => <div className="flex items-center gap-2.5">
        <span className="leading-none text-gray-800 font-normal">
          {format(info.row.original.datetime, "MMM dd, yyyy, hh:mm a")}
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
        <span
          className={`badge capitalize badge-outline ${info.row.original.status === "active"
            ? "badge-primary"
            : info.row.original.status === "pending"
              ? "badge-warning"
              : "badge-danger"
            }`}
        >
          {info.row.original.status}
        </span>
        {info.row.original.status === "active" && (
          <button
            className="btn btn-sm btn-danger"
            onClick={() => openConfirmEnd(info.row.original)}
          >
            End Call
          </button>
        )}
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
    //   accessorFn: row => row.create_by,
    //   id: 'create_by',
    //   header: ({
    //     column
    //   }) => <DataGridColumnHeader title='Created By' column={column} />,
    //   enableSorting: true,
    //   cell: info => <div className="flex items-center gap-2.5">
    //     <span className="leading-none text-gray-800 font-normal">
    //       {info.row.original.create_by?.first_name + " " + info.row.original.create_by?.last_name}
    //     </span>
    //   </div>,
    //   meta: {
    //     headerClassName: 'min-w-[200px]'
    //   }
    // },
    // {
    //   accessorFn: row => row.callId,
    //   id: 'callId',
    //   header: ({
    //     column
    //   }) => <DataGridColumnHeader title='Call Id' column={column} />,
    //   enableSorting: true,
    //   cell: info => <div className="flex items-center gap-2.5">
    //     <span className="leading-none text-gray-800 font-normal">
    //       {info.row.original.callId}
    //     </span>
    //   </div>,
    //   meta: {
    //     headerClassName: 'min-w-[200px]'
    //   }
    // },
    {
      id: 'click',
      header: () => '',
      enableSorting: false,
      cell: ({ row }) => <Menu className="items-stretch">
        <MenuItem toggle="dropdown"
          onClick={() => setSelectedRow(row.original)} // ✅ Set selected row
          trigger="click" dropdownProps={{
            placement: isRTL() ? 'bottom-start' : 'bottom-end',
            modifiers: [{
              name: 'offset',
              options: {
                offset: isRTL() ? [0, -10] : [0, 10] // [skid, distance]
              }
            }]
          }}>
          <MenuToggle className="btn btn-sm btn-icon btn-light btn-clear">
            <KeenIcon icon="dots-vertical" />
          </MenuToggle>
          {ActionMenu()}
        </MenuItem>
      </Menu>,
      meta: {
        headerClassName: 'w-[60px]'
      }
    }
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
      console.error("Error fetching IQ Ideas:", error);
      return { data: [], totalCount: 0 };
    }
  };

  return (
    <div className='container-fluid'>
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text="Live Schedule" />
          <ToolbarDescription>
            Track and analyze past IQ Academy with key insights and performance data.</ToolbarDescription>
        </ToolbarHeading>
        <ToolbarActions>
          <div className="text-end pb-4">
            <button className='btn btn-primary' onClick={handleClickOpen}>
              Create Live Schedule
            </button>
          </div>
        </ToolbarActions>
      </Toolbar>
      <DataGrid serverSide={true}
        key={tableKey}
        loading={isLoading} columns={columns} rowSelection={true} onRowSelectionChange={handleRowSelection} pagination={{
          size: 10,
        }} toolbar={<ToolbarTable />} layout={{
          card: true
        }}
        onFetchData={handleFetchData}
      />

      <CreateEducatorStreamSchedule setSelectedRow={setSelectedRow} handleCloseCreate={handleCloseCreate} refetch={reloadTable} isCreateOpen={isCreateOpen} setIsCreateOpen={setIsCreateOpen} selectedRow={selectedRow} />
      {isDeleteOpen && <DeleteEducatorStreamSchedule refetch={reloadTable} isDeleteOpen={isDeleteOpen} handleDeleteClose={handleDeleteClose} selectedRow={selectedRow} />}
      <Dialog open={isConfirmOpen} onOpenChange={() => setIsConfirmOpen(false)}>
        <DialogContent className="p-5 max-w-[500px]">
          <VisuallyHidden>
            <DialogTitle>Hidden Title</DialogTitle>
          </VisuallyHidden>
          <div className="text-center">
            <i className="ki-filled text-3xl ki-alert text-gray-500 dark:text-gray-700 mb-3.5 mx-auto"></i>
          </div>
          <p className="mb-4 text-gray-700 dark:text-gray-700 text-center">
            Are you sure you want to end this livestream for everyone?
          </p>
          <div className="flex justify-center items-center space-x-4">
            <button className='btn btn-light' onClick={() => setIsConfirmOpen(false)} disabled={isEnding}>Cancel</button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={async () => { await handleEndCall(selectedRow); setIsConfirmOpen(false); }}
              disabled={isEnding}
            >
              {isEnding ? "Ending..." : "Yes, End Call"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default EducatorStreamSchedule