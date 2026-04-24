'use client';

import { getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, getFacetedRowModel, getFacetedUniqueValues } from '@tanstack/react-table';
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DataGridInner } from './DataGridInner';
import { deepMerge, debounce } from '@/lib/helpers';

const DataGridContext = createContext(undefined);

export const useDataGrid = () => {
  const context = useContext(DataGridContext);
  if (!context) {
    throw new Error('useDataGrid must be used within a DataGridProvider');
  }
  return context;
};

export const DataGridProvider = props => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const id = props.id || '';
  const pageParam = id ? `${id}_page` : 'page';
  const sizeParam = id ? `${id}_size` : 'size';

  const defaultValues = {
    messages: {
      empty: 'No data available',
      loading: 'Loading...'
    },
    layout: {
      cellSpacing: 'md',
      cellBorder: true,
      card: false
    },
    pagination: {
      info: '{from} - {to} of {count}',
      sizes: [5, 10, 25, 50, 100],
      sizesLabel: 'Show',
      sizesDescription: 'per page',
      size: 5,
      page: 0,
      moreLimit: 5,
      more: false
    },
    rowSelection: false,
    serverSide: false
  };

  const mergedProps = deepMerge(defaultValues, props);
  
  const initialPageIndex = useMemo(() => {
    const urlPage = searchParams.get(pageParam);
    if (urlPage) return parseInt(urlPage) - 1;
    return props.pagination?.page ?? 0;
  }, [searchParams, pageParam, props.pagination?.page]);

  const initialPageSize = useMemo(() => {
    const urlSize = searchParams.get(sizeParam);
    if (urlSize) return parseInt(urlSize);
    return props.pagination?.size ?? 5;
  }, [searchParams, sizeParam, props.pagination?.size]);

  const [data, setData] = useState(mergedProps.data || []);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(mergedProps.data ? mergedProps.data.length : 0);
  const [pagination, setPagination] = useState({
    pageIndex: initialPageIndex,
    pageSize: initialPageSize
  });
  const [rowSelection, setRowSelection] = useState(mergedProps.rowSelection);
  const [sorting, setSorting] = useState(mergedProps.sorting ?? []);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});

  // Sync state to URL
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    let changed = false;

    // We use 1-based indexing for the URL
    const urlPage = pagination.pageIndex + 1;
    if (urlPage > 1) {
      if (newParams.get(pageParam) !== urlPage.toString()) {
        newParams.set(pageParam, urlPage.toString());
        changed = true;
      }
    } else if (newParams.has(pageParam)) {
      newParams.delete(pageParam);
      changed = true;
    }

    if (pagination.pageSize !== (props.pagination?.size ?? 5)) {
      if (newParams.get(sizeParam) !== pagination.pageSize.toString()) {
        newParams.set(sizeParam, pagination.pageSize.toString());
        changed = true;
      }
    } else if (newParams.has(sizeParam)) {
      newParams.delete(sizeParam);
      changed = true;
    }

    if (changed) {
      setSearchParams(newParams, { replace: true });
    }
  }, [pagination, pageParam, sizeParam, setSearchParams, searchParams, props.pagination?.size]);

  // Sync URL to state (handles back/forward)
  useEffect(() => {
    const urlPage = searchParams.get(pageParam);
    const urlSize = searchParams.get(sizeParam);
    
    const nextPageIndex = urlPage ? parseInt(urlPage) - 1 : (props.pagination?.page ?? 0);
    const nextPageSize = urlSize ? parseInt(urlSize) : (props.pagination?.size ?? 5);
    
    setPagination(prev => {
      if (prev.pageIndex !== nextPageIndex || prev.pageSize !== nextPageSize) {
        return { pageIndex: nextPageIndex, pageSize: nextPageSize };
      }
      return prev;
    });
  }, [searchParams, pageParam, sizeParam, props.pagination?.page, props.pagination?.size]);

  const fetchServerSideData = useCallback(async () => {
    if (loading || !mergedProps.onFetchData) return;
    setLoading(true);
    try {
      const requestParams = {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        sorting,
        columnFilters
      };
      const {
        data,
        totalCount
      } = await mergedProps.onFetchData(requestParams);
      setData(data || []);
      setTotalRows(totalCount || 0);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, pagination, sorting, columnFilters, mergedProps.onFetchData]);

  const debouncedFetchData = debounce(fetchServerSideData, 100);

  const loadData = () => {
    if (mergedProps.serverSide) {
      debouncedFetchData();
    } else {
      setLoading(true);
      setData(mergedProps.data || []);
      setTotalRows(mergedProps.data ? mergedProps.data.length : 0);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [pagination, sorting, columnFilters, mergedProps.data, mergedProps.serverSide, mergedProps.reloadTrigger]);

  const handleRowSelectionChange = updaterOrValue => {
    setRowSelection(prev => typeof updaterOrValue === 'function' ? updaterOrValue(prev) : updaterOrValue);
    if (mergedProps.onRowSelectionChange) {
      const newSelection = typeof updaterOrValue === 'function' ? updaterOrValue(rowSelection) : updaterOrValue;
      mergedProps.onRowSelectionChange(newSelection, table);
    }
  };

  const table = useReactTable({
    data,
    columns: mergedProps.columns,
    pageCount: mergedProps.serverSide ? Math.ceil(totalRows / pagination.pageSize) : undefined,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination
    },
    getRowId: mergedProps.getRowId || ((row, index) => String(index)),
    enableRowSelection: mergedProps.rowSelection,
    onRowSelectionChange: handleRowSelectionChange,
    onSortingChange: newSorting => {
      !loading && setSorting(newSorting);
      setPagination(prev => ({
        ...prev,
        pageIndex: 0
      }));
    },
    onColumnFiltersChange: newFilters => {
      !loading && setColumnFilters(newFilters);
      setPagination(prev => ({
        ...prev,
        pageIndex: 0
      }));
    },
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: newPagination => !loading && setPagination(newPagination),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: mergedProps.serverSide,
    manualFiltering: mergedProps.serverSide,
    autoResetPageIndex: false
  });

  return <DataGridContext.Provider value={{
    props: mergedProps,
    table,
    totalRows,
    loading,
    setLoading,
    reload: loadData
  }}>
    <DataGridInner />
  </DataGridContext.Provider>;
};