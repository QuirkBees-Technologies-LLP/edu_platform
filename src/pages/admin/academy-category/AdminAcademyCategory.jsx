/* eslint-disable prettier/prettier */
import * as React from 'react';
import { useMemo, useState } from 'react';
import { useLanguage } from '@/i18n';
import { DataGrid, DataGridColumnHeader, DataGridColumnVisibility, KeenIcon, useDataGrid, Menu, MenuItem, MenuToggle } from '@/components';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Toolbar, ToolbarActions, ToolbarDescription, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import { MenuIcon, MenuLink, MenuSub, MenuTitle } from '@/components';
import { TruncatedText } from '../../../lib/utils';
import CreateAdminAcademyCategory from './CreateAdminAcademyCategory';
import DeleteAdminAcademyCategory from './DeleteAdminAcademyCategory';
import { useLazyGetAdminAcademyCategoryQuery, useUpdateAdminAcademyCategoryMutation } from '../../../store/api/admin/adminAcademyCategoryApiSlice';
import { Switch } from '../../../components/ui/switch';

const AdminAcademyCategory = ({ title = "Academy Category" }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});
  const [getAdminAcademyCategory, { data, isLoading, refetch }] = useLazyGetAdminAcademyCategoryQuery();
  const [toggleStatusData, setToggleStatusData] = useState([]);
  const [updateAdminAcademyCategory] = useUpdateAdminAcademyCategoryMutation();

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

  const handleVisibilityToggle = async (typeId, currentVisibility) => {
    try {
      const newVisibility = !Boolean(currentVisibility);

      setToggleStatusData(toggleStatusData.map(type => type._id === typeId ? { ...type, status: newVisibility } : type));
      const payload = toggleStatusData.find(type => type._id === typeId);
      // Make API call
      await updateAdminAcademyCategory({ id: payload?._id, data: { status: String(newVisibility), name: payload?.name }}).unwrap();
      toast.success(`Academy status updated to ${newVisibility ? 'Active' : 'Inactive'}`);
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update test visibility');
    }
  };

  const columns = useMemo(() => [
    {
      accessorFn: row => row.icon,
      id: 'icon',
      header: ({
        column
      }) => <DataGridColumnHeader title='Icon' column={column} />,
      enableSorting: true,
      cell: ({ row }) =>
        <div className="flex flex-col justify-center items-center gap-0.5" onClick={() => {
          setSelectedRow(row.original)
          setIsLightBoxOpen(true);
        }}>
          <img src={row.original.icon?.includes("undefined") ? toAbsoluteUrl(`/media/avatars/blank.png`) : row.original.icon} class="rounded-full cursor-pointer size-9 shrink-0" alt="" />
        </div>,
      meta: {
        headerClassName: 'min-w-[100px]'
      }
    },
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
          <img src={row.original.image?.includes("undefined") ? toAbsoluteUrl(`/media/avatars/blank.png`) : row.original.image} class="rounded-full cursor-pointer size-9 shrink-0" alt="" />
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
          {info.row.original.name}
        </div>
      </div>,
      meta: {
        headerClassName: 'min-w-[200px]'
      }
    },
    {
      id: 'status',
      header: () => 'Status',
      enableSorting: false,
      cell: ({ row }) => {
        console.log(toggleStatusData, "toggleStatusData");

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
      cell: ({ row }) => <Menu className="items-stretch">
        <MenuItem toggle="dropdown"
          onClick={() => setSelectedRow(toggleStatusData.find(type => type._id === row?.original?._id))}
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
  ], [isRTL, toggleStatusData, handleVisibilityToggle]);

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
      const response = await getAdminAcademyCategory({ page: newPage, limit: newLimit }).unwrap();
      setToggleStatusData(response.data);
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
    <div className='container-fluid p-0 mt-5'>
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text="Academy Category" />
          <ToolbarDescription>
            Learn, Master, and Apply Trading Skills with Expert-Led IQ Vault, Practical Strategies, and Real-World Market Insights.          </ToolbarDescription>
        </ToolbarHeading>
        <ToolbarActions>
          <div className="text-end pb-4">
            <button className='btn btn-primary' onClick={handleClickOpen}>
              Create Academy Category
            </button>
          </div>
        </ToolbarActions>
      </Toolbar>
      <DataGrid
        key={tableKey}
        serverSide={true}
        loading={isLoading} columns={columns} rowSelection={true} onRowSelectionChange={handleRowSelection} pagination={{
          size: 10,
        }} toolbar={<ToolbarTable />} layout={{
          card: true
        }}
        onFetchData={handleFetchData}
      />
      <CreateAdminAcademyCategory setSelectedRow={setSelectedRow} handleCloseCreate={handleCloseCreate} refetch={reloadTable} isCreateOpen={isCreateOpen} setIsCreateOpen={setIsCreateOpen} selectedRow={selectedRow} />
      {isDeleteOpen && <DeleteAdminAcademyCategory refetch={reloadTable} isDeleteOpen={isDeleteOpen} handleDeleteClose={handleDeleteClose} selectedRow={selectedRow} />}
    </div>
  )
};

export default AdminAcademyCategory;
