import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  DataGrid,
  DataGridColumnHeader,
  DataGridColumnVisibility,
  useDataGrid,
} from "@/components";
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from "@/partials/toolbar";
import { SearchFilterInput } from "@/components";
import debounce from "lodash.debounce";
import { Loader2 } from "lucide-react";
import CustomDateRangePicker from "../../../components/CustomDateRangePicker";
import { useLazyLogsQuery } from "../../../store/api/admin/adminEducatorsApiSlice";

const AdminLogs = ({ title = "Admin Logs" }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableKey, setTableKey] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [searchTextInput, setSearchTextInput] = useState("");
  const [selectedDateRange, setSelectedDateRange] = useState({
    start: null,
    end: null,
    rangeName: "",
  });

  const [getLogsList] = useLazyLogsQuery();

  const fetchLogs = async ({ pageIndex, pageSize }) => {
    const newPage = pageIndex + 1;
    const newLimit = pageSize;
    setLoading(true);

    try {
      const response = await getLogsList({
        page: newPage,
        limit: newLimit,
        search: searchTextInput || "",
        startDate: selectedDateRange.start
          ? format(selectedDateRange.start, "yyyy-MM-dd 00:00:00")
          : "",
        endDate: selectedDateRange.end
          ? format(selectedDateRange.end, "yyyy-MM-dd 23:59:59")
          : "",
      }).unwrap();

      setLogs(response.logs || []);

      return {
        data: response.logs || [],
        totalCount: response.pagination?.totalRecords || 0,
      };
    } catch (error) {
      console.error("Error fetching logs:", error);
      setLogs([]);
      return { data: [], totalCount: 0 };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitialLogs = async () => {
      try {
        const res = await getLogsList({
          page: 1,
          limit: 10,
          search: searchTextInput || "",
          startDate: selectedDateRange.start
            ? format(selectedDateRange.start, "yyyy-MM-dd 00:00:00")
            : "",
          endDate: selectedDateRange.end
            ? format(selectedDateRange.end, "yyyy-MM-dd 23:59:59")
            : "",
        }).unwrap();

        setLogs(res.logs || []);
      } catch (err) {
        console.error("Error fetching logs:", err);
        setLogs([]);
      }
    };

    fetchInitialLogs();
  }, [tableKey, searchTextInput, selectedDateRange]);

  const reloadTable = () => setTableKey((prev) => prev + 1);

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        setSearchTextInput(value);
        reloadTable();
      }, 500),
    []
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    debouncedSearch(value);
  };

  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row.createdAt,
        id: "Timestamp",
        header: ({ column }) => (
          <DataGridColumnHeader title="Timestamp" column={column} />
        ),
        enableSorting: true,
        cell: (info) => (
          <span>
            {format(
              new Date(info.row.original.createdAt),
              "MMM dd, yyyy, hh:mm a"
            )}
          </span>
        ),
        meta: { headerClassName: "min-w-[180px]" },
      },
      {
        accessorFn: (row) => row.username,
        id: "Admin",
        header: ({ column }) => (
          <DataGridColumnHeader title="Admin" column={column} />
        ),
        enableSorting: true,
        cell: (info) => <span>{info.row.original.username || "N/A"}</span>,
        meta: { headerClassName: "min-w-[140px]" },
      },
      {
        accessorFn: (row) => row.action,
        id: "Action",
        header: ({ column }) => (
          <DataGridColumnHeader title="Action" column={column} />
        ),
        enableSorting: true,
        cell: (info) => (
          <span
            className={`badge capitalize badge-outline ${
              info.row.original.action === "POST"
                ? "badge-success"
                : info.row.original.action === "PUT"
                  ? "badge-warning"
                  : "badge-danger"
            }`}
          >
            {info.row.original.action === "PUT"
              ? "UPDATE"
              : info.row.original.action === "POST"
                ? "CREATE"
                : "DELETE"}
          </span>
        ),
        meta: { headerClassName: "min-w-[120px]" },
      },
      {
        accessorFn: (row) => row.description,
        id: "Description",
        header: ({ column }) => (
          <DataGridColumnHeader title="Description" column={column} />
        ),
        cell: (info) => (
          <span className="text-gray-700">
            {info.row.original.description || "—"}
          </span>
        ),
        meta: { headerClassName: "min-w-[200px]" },
      },
      {
        accessorFn: (row) => row.ipAddress,
        id: "IP_Address",
        header: ({ column }) => (
          <DataGridColumnHeader title="IP Address" column={column} />
        ),
        cell: (info) => <span>{info.row.original.ipAddress || "N/A"}</span>,
        meta: { headerClassName: "min-w-[130px]" },
      },
    ],
    []
  );

  const ToolbarTable = () => {
    const { table } = useDataGrid();
    return (
      <div className="card-header px-5 py-5 border-b-0 flex-wrap gap-2">
        <h3 className="card-title">{title}</h3>
        <div className="flex flex-wrap items-center gap-2.5">
          <DataGridColumnVisibility table={table} />
        </div>
      </div>
    );
  };

  const handleDateRangeChangeCallback = (startDate, endDate, rangeName) => {
    setSelectedDateRange({
      start: startDate,
      end: endDate,
      rangeName,
    });
    reloadTable();
  };

  return (
    <div className="container-fluid">
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text="Admin Logs" />
          <ToolbarDescription>Track all admin activities</ToolbarDescription>
        </ToolbarHeading>
        <div className="flex gap-2 flex-wrap">
          <ToolbarActions>
            <div className="relative gap-2 border border-gray-200 rounded-md">
              <SearchFilterInput
                searchText={searchText}
                handleSearchChange={handleSearchChange}
              />
            </div>
            <div className="flex gap-2">
         
              <CustomDateRangePicker
                handleDateRangeChangeCallback={handleDateRangeChangeCallback}
              />
            </div>
          </ToolbarActions>
        </div>
      </Toolbar>

      <DataGrid
        key={tableKey}
        loading={loading}
        columns={columns}
        data={logs}
        rowSelection={true}
        onRowSelectionChange={(state) => {
          const selected = Object.keys(state);
          if (selected.length) toast.info(`${selected.length} rows selected.`);
        }}
        pagination={{ size: 10 }}
        toolbar={<ToolbarTable />}
        layout={{ card: true }}
        onFetchData={fetchLogs}
      />
    </div>
  );
};

export default AdminLogs;
