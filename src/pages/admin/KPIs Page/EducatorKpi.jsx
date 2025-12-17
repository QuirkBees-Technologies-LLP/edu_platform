// import React, { useMemo, useState } from "react";
// import { useNavigate } from "react-router";
// import { useLanguage } from "@/i18n";
// import { toast } from "sonner";
// import {
//   DataGrid,
//   DataGridColumnHeader,
//   DataGridColumnVisibility,
//   useDataGrid,
// } from "@/components";
// import {
//   Toolbar,
//   ToolbarActions,
//   ToolbarDescription,
//   ToolbarHeading,
//   ToolbarPageTitle,
// } from "@/partials/toolbar";

// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { SearchFilterInput } from "@/components";
// import debounce from "lodash.debounce";

// import { format } from "date-fns";
// import { useLazyGetLiveSessionListQuery } from "../../../store/api/admin/adminLiveSessionApiSlice";
// import {
//   useGetEducatorsQuery,
//   useKpisExportMutation,
//   useLazyKpisQuery,
// } from "../../../store/api/admin/adminEducatorsApiSlice";
// import Loader from "../../../components/ui/loader";
// import { Loader2 } from "lucide-react";
// import CustomDateRangePicker from "../../../components/CustomDateRangePicker";

// const EducatorKpi = ({ title = "Educator KPIs" }) => {
//   const { isRTL } = useLanguage();
//   const [getLiveSessionList, { data: liveSessionData, isLoading, refetch }] =
//     useLazyGetLiveSessionListQuery();
//   const [
//     getKpiList,
//     { data: kpiData, isLoading: kpiLoading, refetch: kpiRefetch },
//   ] = useLazyKpisQuery();
//   const [exportKpis] = useKpisExportMutation();
//   const { data: educators } = useGetEducatorsQuery({ page: 1, limit: 100 });
//   const navigate = useNavigate();
//   const [tableKey, setTableKey] = useState(0);
//   const [selectedEducator, setSelectedEducator] = useState(null);
//   const [startDate, setStartDate] = useState(null);
//   const [endDate, setEndDate] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [searchText, setSearchText] = useState("");
//   const [searchTextInput, setSearchTextInput] = useState("");
//   const [selectedDateRange, setSelectedDateRange] = useState({
//     start: null,
//     end: null,
//     rangeName: "",
//   });

//   const reloadTable = () => {
//     setTableKey((prevKey) => prevKey + 1);
//   };

//   const handleRedirect = (callId, row) => {
//     navigate(`/admin/kpis/${callId}`, { state: row });
//   };

//   // Columns definition
//   const columns = useMemo(
//     () => [
//       {
//         accessorFn: (row) => row.title,
//         id: "title",
//         header: ({ column }) => (
//           <DataGridColumnHeader title="Title" column={column} />
//         ),
//         enableSorting: true,
//         cell: (info) => {
//           const { title, callId, status } = info.row.original;
//           const isEnded = status === "ended";
//           const isClickable = status !== "pending";

//           return (
//             <span>
//               <p
//                 className={
//                   isClickable ? "cursor-pointer hover:text-primary" : ""
//                 }
//                 onClick={
//                   isClickable
//                     ? () => handleRedirect(callId, info.row.original)
//                     : undefined
//                 }
//               >
//                 {title}
//               </p>
//             </span>
//           );
//         },
//       },
//       {
//         accessorFn: (row) => row.educator,
//         id: "educator",
//         header: ({ column }) => (
//           <DataGridColumnHeader title="Educator" column={column} />
//         ),
//         enableSorting: true,
//         cell: (info) => (
//           <div className="flex items-center gap-2.5">
//             <span className="leading-none text-gray-800 font-normal">
//               {info.row.original.educator?.first_name +
//                 " " +
//                 info.row.original.educator?.last_name}
//             </span>
//           </div>
//         ),
//         meta: {
//           headerClassName: "min-w-[200px]",
//         },
//       },
//       {
//         accessorFn: (row) => row.callId,
//         id: "callId",
//         header: ({ column }) => (
//           <DataGridColumnHeader title="Call Id" column={column} />
//         ),
//         enableSorting: true,
//         cell: (info) => (
//           <div className="flex items-center gap-2.5">
//             <span className="leading-none text-gray-800 font-normal">
//               {info.row.original.callId}
//             </span>
//           </div>
//         ),
//         meta: {
//           headerClassName: "min-w-[200px]",
//         },
//       },
//       //   {
//       //     accessorFn: (row) => row.status,
//       //     id: "status",
//       //     header: ({ column }) => (
//       //       <DataGridColumnHeader title="Status" column={column} />
//       //     ),
//       //     enableSorting: true,
//       //     cell: (info) => {
//       //       const row = info.row.original;

//       //       return (
//       //         <div className="flex items-center gap-2.5">
//       //           {row.status === "ended" && (
//       //             <button className="badge capitalize badge-outline badge-danger">
//       //               Ended
//       //             </button>
//       //           )}
//       //         </div>
//       //       );
//       //     },
//       //     meta: {
//       //       headerClassName: "min-w-[120px]",
//       //     },
//       //   },
//       {
//         accessorFn: (row) => row.datetime,
//         id: "datetime",
//         header: ({ column }) => (
//           <DataGridColumnHeader
//             title="Scheduled from this date"
//             column={column}
//           />
//         ),
//         enableSorting: true,
//         cell: (info) => (
//           <div className="flex items-center gap-2.5">
//             <span className="leading-none text-gray-800 font-normal">
//               {info.row.original.datetime
//                 ? format(info.row.original.datetime, "MMM dd, yyyy, hh:mm a")
//                 : "N/A"}
//             </span>
//           </div>
//         ),
//         meta: {
//           headerClassName: "min-w-[200px]",
//         },
//       },
//       {
//         accessorFn: (row) => row.kpi,
//         id: "kpi",
//         header: ({ column }) => (
//           <DataGridColumnHeader title="KPI" column={column} />
//         ),
//         enableSorting: true,
//         cell: (info) => (
//           <div className="flex items-center gap-2.5">
//             <button
//               className="badge capitalize badge-outline badge-success"
//               onClick={() =>
//                 handleRedirect(info.row.original.callId, info.row.original)
//               }
//             >
//               See KPI
//             </button>
//           </div>
//         ),
//         meta: {
//           headerClassName: "min-w-[200px]",
//         },
//       },
//     ],
//     [isRTL]
//   );

//   const handleRowSelection = (state) => {
//     const selectedRowIds = Object.keys(state);
//     if (selectedRowIds.length > 0) {
//       toast(`Total ${selectedRowIds.length} are selected.`, {
//         description: `Selected row IDs: ${selectedRowIds}`,
//         action: {
//           label: "Undo",
//           onClick: () => console.log("Undo"),
//         },
//       });
//     }
//   };

//   // Toolbar
//   const ToolbarTable = () => {
//     const { table } = useDataGrid();
//     return (
//       <div className="card-header px-5 py-5 border-b-0 flex-wrap gap-2">
//         <h3 className="card-title">{title}</h3>
//         <div className="flex flex-wrap items-center gap-2.5">
//           <DataGridColumnVisibility table={table} />
//         </div>
//       </div>
//     );
//   };

//   // Fetch server-side data and filter ended calls

//   const fetchKPIS = async ({ pageIndex, pageSize }) => {
//     const newPage = pageIndex + 1;
//     const newLimit = pageSize;

//     try {
//       const response = await getKpiList({
//         page: newPage,
//         limit: newLimit,
//         search: searchTextInput || "",
//         educatorId: selectedEducator || "",
//         startDate: selectedDateRange.start
//           ? format(selectedDateRange.start, "yyyy-MM-dd 00:00:00")
//           : "",
//         endDate: selectedDateRange.end
//           ? format(selectedDateRange.end, "yyyy-MM-dd 23:59:59")
//           : "",
//       }).unwrap();

//       return {
//         data: response.data || [],
//         totalCount: response.pagination?.totalRecords || 0,
//       };
//     } catch (error) {
//       console.error("Error fetching KPIs:", error);
//       return { data: [], totalCount: 0 };
//     }
//   };

//   const handleExport = async () => {
//     try {
//       setLoading(true);
//       const payload = kpiData?.data?.map((row) => ({
//         title: row.title,
//         educatorName: row.educator?.first_name + " " + row.educator?.last_name,
//         callIds: row.callId,
//       }));

//       const blob = await exportKpis(payload).unwrap();

//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = "kpi_report.xlsx";
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//       window.URL.revokeObjectURL(url);

//       toast("Export successful");
//     } catch (err) {
//       console.error(err);
//       toast("Export failed", { type: "error" });
//     } finally {
//       setLoading(false); // loader stop
//     }
//   };

//   const debouncedSearch = useMemo(
//     () =>
//       debounce((value) => {
//         setSearchTextInput(value);
//         reloadTable();
//       }, 500),
//     []
//   );
//   const handleSearchChange = (event) => {
//     const value = event.target.value;
//     setSearchText(value);
//     debouncedSearch(value);
//   };

//   const handleDateRangeChangeCallback = (startDate, endDate, rangeName) => {
//     setSelectedDateRange({
//       start: startDate,
//       end: endDate,
//       rangeName,
//     });
//     reloadTable();
//   };

//   return (
//     <div className="container-fluid">
//       <Toolbar>
//         <ToolbarHeading>
//           <ToolbarPageTitle text="Educator KPIs" />
//           <ToolbarDescription>
//             Track and manage educator's KPIs
//           </ToolbarDescription>
//         </ToolbarHeading>
//         <div className="flex gap-2 flex-wrap">
//           <div className="flex items-center gap-2.5 flex-wrap">
//             {/* <label className="form-label text-gray-900 gap-1">
//               Educator<span className="text-danger">*</span>
//             </label> */}
//             <div className="relative gap-2 border border-gray-200 rounded-md">
//               <SearchFilterInput
//                 searchText={searchText}
//                 handleSearchChange={handleSearchChange}
//               />
//             </div>
//             <div className="relative w-72">
//               <Select
//                 value={selectedEducator || ""}
//                 onValueChange={(value) => {
//                   setSelectedEducator(value);
//                   reloadTable();
//                 }}
//               >
//                 <SelectTrigger className="pr-8">
//                   {" "}
//                   <SelectValue placeholder="Select Educator" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {educators?.data?.map((item) => (
//                     <SelectItem key={item._id} value={item._id}>
//                       {item.first_name + " " + item.last_name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>

//               {selectedEducator && (
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setSelectedEducator(null);
//                     reloadTable();
//                   }}
//                   className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
//                 >
//                   ✖
//                 </button>
//               )}
//             </div>
//             <div className="flex items-center gap-2 border border-gray-200 rounded-md">
//               <CustomDateRangePicker
//                 handleDateRangeChangeCallback={handleDateRangeChangeCallback}
//               />
//               {/* <div>
//                 <label className="form-label text-gray-900 text-sm">
//                   Start Date
//                 </label>
//                 <input
//                   type="date"
//                   className="border rounded-md px-2 py-1"
//                   value={startDate || ""}
//                   onChange={(e) => {
//                     setStartDate(e.target.value);
//                     reloadTable();
//                   }}
//                 />
//               </div>

//               <div>
//                 <label className="form-label text-gray-900 text-sm">
//                   End Date
//                 </label>
//                 <input
//                   type="date"
//                   className="border rounded-md px-2 py-1"
//                   value={endDate || ""}
//                   onChange={(e) => {
//                     setEndDate(e.target.value);
//                     reloadTable();
//                   }}
//                 />
//               </div> */}
//             </div>

//             <button
//               type="button"
//               className="px-2 py-2 bg-green-500 text-white rounded"
//               onClick={handleExport}
//             >
//               {loading ? <Loader2 /> : "Export KPI   "}
//             </button>
//           </div>
//         </div>
//       </Toolbar>

//       <DataGrid
//         serverSide={true}
//         key={tableKey}
//         loading={isLoading}
//         columns={columns}
//         rowSelection={true}
//         onRowSelectionChange={handleRowSelection}
//         pagination={{
//           size: 10,
//         }}
//         toolbar={<ToolbarTable />}
//         layout={{
//           card: true,
//         }}
//         onFetchData={fetchKPIS}
//       />
//     </div>
//   );
// };

// export default EducatorKpi;

import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { SearchFilterInput } from "@/components";
import debounce from "lodash.debounce";
import { format } from "date-fns";
import {
  useLazyKpisQuery,
  useGetEducatorsQuery,
  useKpisExportMutation,
} from "../../../store/api/admin/adminEducatorsApiSlice";
import { Loader2 } from "lucide-react";
import CustomDateRangePicker from "../../../components/CustomDateRangePicker";

const EducatorKpi = () => {
  const navigate = useNavigate();
  const { isRTL } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  /* ---------------- URL BASED STATE ---------------- */
  const [searchText, setSearchText] = useState(
    searchParams.get("search") || ""
  );
  const [selectedEducator, setSelectedEducator] = useState(
    searchParams.get("educator") || ""
  );
  const [pageIndex, setPageIndex] = useState(
    Number(searchParams.get("page")) || 0
  );
  const [pageSize, setPageSize] = useState(
    Number(searchParams.get("limit")) || 100
  );

  const [dateRange, setDateRange] = useState({
    start: searchParams.get("startDate")
      ? new Date(searchParams.get("startDate"))
      : null,
    end: searchParams.get("endDate")
      ? new Date(searchParams.get("endDate"))
      : null,
  });

  const [tableKey, setTableKey] = useState(0);

  const reloadTable = () => setTableKey((k) => k + 1);

  /* ---------------- API ---------------- */
  const [getKpis, { data: kpiData, isLoading }] = useLazyKpisQuery();
  const { data: educators } = useGetEducatorsQuery({ page: 1, limit: 100 });
  const [exportKpis, { isLoading: exportLoading }] = useKpisExportMutation();

  /* ---------------- SYNC URL ---------------- */
  const syncParams = (params) => {
    setSearchParams((prev) => {
      Object.entries(params).forEach(([key, value]) => {
        if (value === "" || value === null) {
          prev.delete(key);
        } else {
          prev.set(key, value);
        }
      });
      return prev;
    });
  };

  /* ---------------- SEARCH ---------------- */
  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        syncParams({ search: value, page: 0 });
        setPageIndex(0);
        reloadTable();
      }, 500),
    []
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    debouncedSearch(value);
  };

  /* ---------------- DATE RANGE ---------------- */
  const handleDateRangeChangeCallback = (start, end) => {
    setDateRange({ start, end });

    syncParams({
      startDate: start ? format(start, "yyyy-MM-dd") : "",
      endDate: end ? format(end, "yyyy-MM-dd") : "",
      page: 0,
    });

    setPageIndex(0);
    reloadTable();
  };

  /* ---------------- TABLE FETCH ---------------- */
  const fetchKPIS = async ({ pageIndex, pageSize }) => {
    const finalPageSize = pageSize || 100;
    setPageIndex(pageIndex);
    setPageSize(finalPageSize);

    syncParams({
      page: pageIndex,
      limit: finalPageSize,
    });

    const response = await getKpis({
      page: pageIndex + 1,
      limit: finalPageSize,
      search: searchText,
      educatorId: selectedEducator,
      startDate: dateRange.start
        ? format(dateRange.start, "yyyy-MM-dd 00:00:00")
        : "",
      endDate: dateRange.end
        ? format(dateRange.end, "yyyy-MM-dd 23:59:59")
        : "",
    }).unwrap();

    return {
      data: response.data || [],
      totalCount: response.pagination?.totalRecords || 0,
    };
  };

  /* ---------------- COLUMNS ---------------- */
  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row.title,
        id: "title",
        header: ({ column }) => (
          <DataGridColumnHeader title="Title" column={column} />
        ),
        cell: (info) => (
          <p
            className="cursor-pointer hover:text-primary"
            onClick={() => navigate(`/admin/kpis/${info.row.original.callId}`)}
          >
            {info.row.original.title}
          </p>
        ),
      },
      {
        accessorFn: (row) => row.educator,
        id: "educator",
        header: ({ column }) => (
          <DataGridColumnHeader title="Educator" column={column} />
        ),
        cell: (info) =>
          `${info.row.original.educator?.first_name} ${info.row.original.educator?.last_name}`,
      },
      {
        accessorFn: (row) => row.callId,
        id: "callId",
        header: ({ column }) => (
          <DataGridColumnHeader title="Call ID" column={column} />
        ),
      },
      {
        accessorFn: (row) => row.datetime,
        id: "datetime",
        header: ({ column }) => (
          <DataGridColumnHeader title="Scheduled Date" column={column} />
        ),
        cell: (info) =>
          info.row.original.datetime
            ? format(info.row.original.datetime, "MMM dd, yyyy hh:mm a")
            : "N/A",
      },
      {
        id: "kpi",
        header: ({ column }) => (
          <DataGridColumnHeader title="KPI" column={column} />
        ),
        cell: (info) => (
          <button
            className="badge badge-outline badge-success"
            onClick={() => navigate(`/admin/kpis/${info.row.original.callId}`)}
          >
            See KPI
          </button>
        ),
      },
    ],
    [isRTL]
  );

  /* ---------------- EXPORT ---------------- */
  const handleExport = async () => {
    try {
      const payload = kpiData?.data?.map((row) => ({
        title: row.title,
        educatorName: `${row.educator?.first_name} ${row.educator?.last_name}`,
        callId: row.callId,
      }));

      const blob = await exportKpis(payload).unwrap();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "kpi_report.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);

      toast("Export successful");
    } catch {
      toast("Export failed");
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="container-fluid">
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text="Educator KPIs" />
          <ToolbarDescription>
            Track and manage educator KPIs
          </ToolbarDescription>
        </ToolbarHeading>

        <div className="flex gap-2 flex-wrap">
          <SearchFilterInput
            searchText={searchText}
            handleSearchChange={handleSearchChange}
          />

          <Select
            value={selectedEducator}
            onValueChange={(value) => {
              setSelectedEducator(value);
              syncParams({ educator: value, page: 0 });
              setPageIndex(0);
              reloadTable();
            }}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select Educator" />
            </SelectTrigger>
            <SelectContent>
              {educators?.data?.map((e) => (
                <SelectItem key={e._id} value={e._id}>
                  {e.first_name} {e.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <CustomDateRangePicker
            handleDateRangeChangeCallback={handleDateRangeChangeCallback}
          />

          <button
            onClick={handleExport}
            className="px-3 py-2 bg-green-500 text-white rounded"
          >
            {exportLoading ? <Loader2 /> : "Export KPI"}
          </button>
        </div>
      </Toolbar>

      <DataGrid
        serverSide
        key={tableKey}
        loading={isLoading}
        columns={columns}
        pagination={{ pageIndex, size: pageSize || 100 }}
        onFetchData={fetchKPIS}
        layout={{ card: true }}
      />
    </div>
  );
};

export default EducatorKpi;
