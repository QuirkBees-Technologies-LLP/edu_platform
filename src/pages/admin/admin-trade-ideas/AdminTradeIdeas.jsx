/* eslint-disable prettier/prettier */
import * as React from 'react';
import { useMemo, useState } from 'react';
import { useLanguage } from '@/i18n';
import { DataGrid, DataGridColumnHeader, DataGridColumnVisibility, KeenIcon, useDataGrid, Menu, MenuItem, MenuToggle } from '@/components';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Toolbar, ToolbarActions, ToolbarDescription, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import CreateTradeIdeas from './CreateTradeIdeas';
import DeleteAdminTradeIdeas from './DeleteAdminTradeIdeas';
import { MenuIcon, MenuLink, MenuSub, MenuTitle } from '@/components';
import TradeImageSlider from './TradeImageSlider';
import { useLazyGetAdminTradeIdeasQuery } from '../../../store/api/admin/adminTradeIdeasApiSlice';
import { TruncatedText } from '../../../lib/utils';

const AdminTradeIdeas = ({ title = "Trade Ideas" }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});
  const [isLightBoxOpen, setIsLightBoxOpen] = useState(false);
  const [fetchTradeIdeas, { data, isLoading, refetch }] = useLazyGetAdminTradeIdeasQuery();

  const handleClickOpen = () => {
    setIsCreateOpen(true);
  };

  const handleDeleteOpen = () => {
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

  const truncateText = (text, maxLength) => {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
};

  const columns = useMemo(() => [
    {
      accessorFn: row => row.image,
      id: 'image',
      header: ({
        column
      }) => <DataGridColumnHeader title='Images' column={column} />,
      enableSorting: true,
      cell: ({ row }) =>
        <div className="flex flex-col justify-center items-center gap-0.5" onClick={() => {
          setSelectedRow(row.original)
          setIsLightBoxOpen(true);
        }}>
          <img src={row.original.image[0]} class="rounded-full cursor-pointer size-9 shrink-0" alt="" />
        </div>,
      meta: {
        headerClassName: 'min-w-[100px]'
      }
    },
    {
      accessorFn: row => row.name,
      id: 'name',
      header: ({
        column
      }) => <DataGridColumnHeader title='Name' column={column} />,
      enableSorting: true,
      cell: info => <div className="flex items-center gap-2.5">
        <div className="flex flex-col gap-0.5">
          <a className="leading-none font-medium text-sm text-gray-900 hover:text-primary" href="#">
            {info.row.original.name}
          </a>
        </div>
      </div>,
      meta: {
        headerClassName: 'min-w-[200px]'
      }
    },
    {
      accessorFn: row => row.type,
      id: 'type',
      header: ({
        column
      }) => <DataGridColumnHeader title='Type' column={column} />,
      enableSorting: true,
      cell: info => <div className="flex items-center gap-1.5">
        <span className="leading-none text-gray-800 font-normal">
          {info.row.original.type}
        </span>
      </div>,
      meta: {
        headerClassName: 'min-w-[200px]'
      }
    },
    {
      accessorFn: row => row.message,
      id: 'message',
      header: ({
        column
      }) => <DataGridColumnHeader title='Message' column={column} />,
      enableSorting: true,
      cell:info => 
      <TruncatedText content={info.row.original.message} maxLength={50} />,
      meta: {
        headerClassName: 'min-w-[225px]'
      }
    },
    {
      accessorFn: row => row.status,
      id: 'status',
      header: ({
        column
      }) => <DataGridColumnHeader title='Status' column={column} />,
      enableSorting: true,
      cell: info => <span className={`badge badge-sm badge-outline capitalize ${info.row.original.status === "active" ? "badge-success" : "badge-danger"}`}>
        {info.row.original.status}
      </span>,
      meta: {
        headerClassName: 'w-[225px]'
      }
    },
    {
      accessorFn: row => row.entry,
      id: 'entry',
      header: ({
        column
      }) => <DataGridColumnHeader title='Entry' column={column} />,
      enableSorting: true,
      cell: info => info.getValue(),
      meta: {
        headerClassName: 'min-w-[125px]'
      }
    },
    {
      accessorFn: row => row.exits,
      id: 'exits',
      header: ({
        column
      }) => <DataGridColumnHeader title='Exits' column={column} />,
      enableSorting: true,
      cell: (info) => (
        <div className="flex flex-col">
          {info.getValue()?.map((exit, index) => (
            <span key={index}>{exit}</span>
          ))}
        </div>
      ),
      meta: {
        headerClassName: 'min-w-[125px]'
      }
    },
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
        <div className="relative">
          <KeenIcon icon="magnifier" className="leading-none text-md text-gray-500 absolute top-1/2 start-0 -translate-y-1/2 ms-3" />
          <input type="text" placeholder="Search Members" className="input input-md ps-8" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} // Update search term
          />
        </div>
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
      const response = await fetchTradeIdeas({ page: newPage, limit: newLimit }).unwrap();

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
          <ToolbarPageTitle text="Trade Ideas" />
          <ToolbarDescription>
            Generate, analyze, and execute profitable trading opportunities with smart insights, market trends, and data-driven strategies
          </ToolbarDescription>
        </ToolbarHeading>
        <ToolbarActions>
          <div className="text-end pb-4">
            <button className='btn btn-primary' onClick={handleClickOpen}>
              Create Trade Idea
            </button>
          </div>
        </ToolbarActions>
      </Toolbar>
      <DataGrid
        key={tableKey}
        serverSide={true}
        loading={isLoading} columns={columns} rowSelection={true} onRowSelectionChange={handleRowSelection} pagination={{
          size: 10,
        }} sorting={[{
          id: 'name',
          desc: true
        }]} toolbar={<ToolbarTable />} layout={{
          card: true
        }}
        onFetchData={handleFetchData}
      />
      <TradeImageSlider isLightBoxOpen={isLightBoxOpen} setIsLightBoxOpen={setIsLightBoxOpen} selectedRow={selectedRow} />
      <CreateTradeIdeas handleCloseCreate={handleCloseCreate} refetch={reloadTable} isCreateOpen={isCreateOpen} setIsCreateOpen={setIsCreateOpen} selectedRow={selectedRow} />
      {isDeleteOpen && <DeleteAdminTradeIdeas refetch={reloadTable} isDeleteOpen={isDeleteOpen} handleDeleteClose={handleDeleteClose} selectedRow={selectedRow} />}
    </div>
  )
};
export default AdminTradeIdeas;
