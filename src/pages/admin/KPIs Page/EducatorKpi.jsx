import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useLanguage } from "@/i18n";
import { toast } from "sonner";
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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { format } from "date-fns";
import { useLazyGetLiveSessionListQuery } from "../../../store/api/admin/adminLiveSessionApiSlice";
import {
  useGetEducatorsQuery,
  useKpisExportMutation,
  useLazyKpisQuery,
} from "../../../store/api/admin/adminEducatorsApiSlice";

const EducatorKpi = ({ title = "Educator KPIs" }) => {
  const { isRTL } = useLanguage();
  const [getLiveSessionList, { data: liveSessionData, isLoading, refetch }] =
    useLazyGetLiveSessionListQuery();
  const [getKpiList, { data: kpiData, isLoading: kpiLoading }] =
    useLazyKpisQuery();
  const [exportKpis] = useKpisExportMutation();
  const { data: educators } = useGetEducatorsQuery({ page: 1, limit: 100 });
  const navigate = useNavigate();
  const [tableKey, setTableKey] = useState(0);
  const [selectedEducator, setSelectedEducator] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const reloadTable = () => {
    setTableKey((prevKey) => prevKey + 1);
  };

  const handleRedirect = (callId, row) => {
    navigate(`/admin/kpis/${callId}`, { state: row });
  };

  // Columns definition
  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row.title,
        id: "title",
        header: ({ column }) => (
          <DataGridColumnHeader title="Title" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          const { title, callId, status } = info.row.original;
          const isEnded = status === "ended";
          const isClickable = status !== "pending";

          return (
            <span>
              <p
                className={
                  isClickable ? "cursor-pointer hover:text-primary" : ""
                }
                onClick={
                  isClickable
                    ? () => handleRedirect(callId, info.row.original)
                    : undefined
                }
              >
                {title}
              </p>
            </span>
          );
        },
      },
      {
        accessorFn: (row) => row.educator,
        id: "educator",
        header: ({ column }) => (
          <DataGridColumnHeader title="Educator" column={column} />
        ),
        enableSorting: true,
        cell: (info) => (
          <div className="flex items-center gap-2.5">
            <span className="leading-none text-gray-800 font-normal">
              {info.row.original.educator?.first_name +
                " " +
                info.row.original.educator?.last_name}
            </span>
          </div>
        ),
        meta: {
          headerClassName: "min-w-[200px]",
        },
      },
      {
        accessorFn: (row) => row.callId,
        id: "callId",
        header: ({ column }) => (
          <DataGridColumnHeader title="Call Id" column={column} />
        ),
        enableSorting: true,
        cell: (info) => (
          <div className="flex items-center gap-2.5">
            <span className="leading-none text-gray-800 font-normal">
              {info.row.original.callId}
            </span>
          </div>
        ),
        meta: {
          headerClassName: "min-w-[200px]",
        },
      },
      //   {
      //     accessorFn: (row) => row.status,
      //     id: "status",
      //     header: ({ column }) => (
      //       <DataGridColumnHeader title="Status" column={column} />
      //     ),
      //     enableSorting: true,
      //     cell: (info) => {
      //       const row = info.row.original;

      //       return (
      //         <div className="flex items-center gap-2.5">
      //           {row.status === "ended" && (
      //             <button className="badge capitalize badge-outline badge-danger">
      //               Ended
      //             </button>
      //           )}
      //         </div>
      //       );
      //     },
      //     meta: {
      //       headerClassName: "min-w-[120px]",
      //     },
      //   },
      {
        accessorFn: (row) => row.datetime,
        id: "datetime",
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Scheduled from this date"
            column={column}
          />
        ),
        enableSorting: true,
        cell: (info) => (
          <div className="flex items-center gap-2.5">
            <span className="leading-none text-gray-800 font-normal">
              {info.row.original.datetime
                ? format(info.row.original.datetime, "MMM dd, yyyy, hh:mm a")
                : "N/A"}
            </span>
          </div>
        ),
        meta: {
          headerClassName: "min-w-[200px]",
        },
      },
      {
        accessorFn: (row) => row.kpi,
        id: "kpi",
        header: ({ column }) => (
          <DataGridColumnHeader title="KPI" column={column} />
        ),
        enableSorting: true,
        cell: (info) => (
          <div className="flex items-center gap-2.5">
            <button
              className="badge capitalize badge-outline badge-success"
              onClick={() =>
                handleRedirect(info.row.original.callId, info.row.original)
              }
            >
              See KPI
            </button>
          </div>
        ),
        meta: {
          headerClassName: "min-w-[200px]",
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

  // Toolbar
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

  // Fetch server-side data and filter ended calls

  const fetchKPIS = async ({ pageIndex, pageSize }) => {
    const newPage = pageIndex + 1;
    const newLimit = pageSize;

    try {
      const response = await getKpiList({
        page: newPage,
        limit: newLimit,
        ...(selectedEducator ? { educatorId: selectedEducator } : {}),
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
      }).unwrap();
      console.log("response", response);

      return {
        data: response.data || [],
        totalCount: response.pagination?.totalRecords || 0,
      };
    } catch (error) {
      console.error("Error fetching KPIs:", error);
      return { data: [], totalCount: 0 };
    }
  };

  const handleExport = async () => {
    try {
      const payload = kpiData?.data?.map((row) => ({
        title: row.title,
        educatorName: row.educator?.first_name + " " + row.educator?.last_name,
        callIds: row.callId,
      }));

      console.log("payload------------->", payload);

      const blob = await exportKpis(payload).unwrap();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "kpi_report.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast("Export successful");
    } catch (err) {
      console.error(err);
      toast("Export failed", { type: "error" });
    }
  };

  return (
    <div className="container-fluid">
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text="Educator KPIs" />
          <ToolbarDescription>
            Track and manage educator's KPIs
          </ToolbarDescription>
        </ToolbarHeading>
        <div className="flex gap-2 flex-wrap">
          <ToolbarActions>
            {/* <label className="form-label text-gray-900 gap-1">
              Educator<span className="text-danger">*</span>
            </label> */}
            <div className="relative w-72">
              <Select
                value={selectedEducator || ""}
                onValueChange={(value) => {
                  setSelectedEducator(value);
                  reloadTable();
                }}
              >
                <SelectTrigger className="pr-8">
                  {" "}
                  <SelectValue placeholder="Select Educator" />
                </SelectTrigger>
                <SelectContent>
                  {educators?.data?.map((item) => (
                    <SelectItem key={item._id} value={item._id}>
                      {item.first_name + " " + item.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedEducator && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedEducator(null);
                    reloadTable();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  ✖
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div>
                <label className="form-label text-gray-900 text-sm">
                  Start Date
                </label>
                <input
                  type="date"
                  className="border rounded-md px-2 py-1"
                  value={startDate || ""}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    reloadTable();
                  }}
                />
              </div>

              <div>
                <label className="form-label text-gray-900 text-sm">
                  End Date
                </label>
                <input
                  type="date"
                  className="border rounded-md px-2 py-1"
                  value={endDate || ""}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    reloadTable();
                  }}
                />
              </div>
            </div>

            <button
              type="button"
              className="px-2 py-2 bg-green-500 text-white rounded"
              onClick={handleExport}
            >
              Export Selected
            </button>
          </ToolbarActions>
        </div>
      </Toolbar>

      <DataGrid
        serverSide={true}
        key={tableKey}
        loading={isLoading}
        columns={columns}
        rowSelection={true}
        onRowSelectionChange={handleRowSelection}
        pagination={{
          size: 10,
        }}
        toolbar={<ToolbarTable />}
        layout={{
          card: true,
        }}
        onFetchData={fetchKPIS}
      />
    </div>
  );
};

export default EducatorKpi;
