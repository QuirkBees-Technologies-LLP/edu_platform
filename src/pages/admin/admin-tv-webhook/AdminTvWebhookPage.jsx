import React, { useMemo, useState, useCallback } from "react";
import {
  useLazyGetAdminTvWebhooksQuery,
  useCreateAdminTvWebhookMutation,
  useUpdateAdminTvWebhookMutation,
  useDeleteAdminTvWebhookMutation,
  useRegenerateWebhookSecretMutation,
  useLazyGetWebhookSignalsQuery,
  useLazyGetDeliveryHistoryQuery,
  useRetrySignalNotificationMutation,
  useUpdateSignalMutation,
  useDeleteSignalMutation,
} from "../../../store/api/admin/adminTvWebhookApiSlice";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogBody,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  DataGrid,
  DataGridColumnHeader,
  DataGridColumnVisibility,
  KeenIcon,
  useDataGrid,
  Menu,
  MenuItem,
  MenuToggle,
  MenuSub,
  MenuLink,
  MenuIcon,
  MenuTitle,
} from "@/components";
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from "@/partials/toolbar";
import { useLanguage } from "@/i18n";
import { Copy, Target, ShieldAlert, Crosshair, Activity, Pencil, Check, X, Clock, ChartLine } from "lucide-react";
import signalConfig from "../../student/trading-signals/signalConfig";
import { formatTimeframe } from "../../student/trading-signals/signalUtils";

// ── Status / Signal Badge Maps ──────────────────────────────────────

const statusColorMap = {
  sent: "badge-success",
  delivered: "badge-success",
  partial: "badge-warning",
  failed: "badge-danger",
  pending: "badge-info",
  processing: "badge-primary",
  skipped: "badge-secondary",
};

const signalTypeBadgeMap = {
  BUY: "badge-success",
  SELL: "badge-danger",
  LONG: "badge-primary",
  SHORT: "badge-warning",
  CLOSE: "badge-secondary",
  INFO: "badge-info",
  OTHER: "badge-secondary",
  SL_HIT: "badge-danger",
  TP1_HIT: "badge-success",
  TP2_HIT: "badge-success",
  TP3_HIT: "badge-success",
  TP4_HIT: "badge-success",
  BREAKEVEN_EXIT: "badge-warning",
};

// ── Main Admin Page ─────────────────────────────────────────────────

const formatPrice = (value) => {
  if (value == null) return "—";
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  // Remove trailing zeros: 4342.8100 → 4342.81, but keep up to 4 decimals max
  return parseFloat(num.toFixed(4)).toString();
};

const AdminTvWebhookPage = () => {
  const [view, setView] = useState("configs");
  const [selectedConfig, setSelectedConfig] = useState(null);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isRegenerateOpen, setIsRegenerateOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  // DataGrid reload trigger
  const [tableKey, setTableKey] = useState(0);
  const reloadTable = () => setTableKey((k) => k + 1);

  return (
    <div className="container-fluid pb-5">
      {view === "configs" && (
        <ConfigsView
          tableKey={tableKey}
          reloadTable={reloadTable}
          onViewSignals={(config) => {
            setSelectedConfig(config);
            setView("signals");
          }}
          onViewDelivery={(config) => {
            setSelectedConfig(config);
            setView("delivery");
          }}
          onEdit={(config) => {
            setSelectedRow(config);
            setIsEditOpen(true);
          }}
          onDelete={(config) => {
            setSelectedRow(config);
            setIsDeleteOpen(true);
          }}
          onRegenerate={(config) => {
            setSelectedRow(config);
            setIsRegenerateOpen(true);
          }}
          onCreateOpen={() => setIsCreateOpen(true)}
        />
      )}

      {view === "signals" && selectedConfig && (
        <SignalsView
          config={selectedConfig}
          onBack={() => {
            setView("configs");
            setSelectedConfig(null);
          }}
        />
      )}

      {view === "delivery" && selectedConfig && (
        <DeliveryView
          config={selectedConfig}
          onBack={() => {
            setView("configs");
            setSelectedConfig(null);
          }}
        />
      )}

      {/* Modals */}
      <CreateWebhookDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        refetch={reloadTable}
      />

      {isEditOpen && selectedRow && (
        <EditWebhookDialog
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setSelectedRow(null);
          }}
          config={selectedRow}
          refetch={reloadTable}
        />
      )}

      {isDeleteOpen && selectedRow && (
        <DeleteWebhookDialog
          isOpen={isDeleteOpen}
          onClose={() => {
            setIsDeleteOpen(false);
            setSelectedRow(null);
          }}
          config={selectedRow}
          refetch={reloadTable}
        />
      )}

      {isRegenerateOpen && selectedRow && (
        <RegenerateSecretDialog
          isOpen={isRegenerateOpen}
          onClose={() => {
            setIsRegenerateOpen(false);
            setSelectedRow(null);
          }}
          config={selectedRow}
          refetch={reloadTable}
        />
      )}
    </div>
  );
};

// ── Webhook URL Cell Component  icator ──────────────



const WebhookUrlCell = ({ url }) => {
  const [copied, setCopied] = useState(false);

  const fallbackCopy = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      toast.success("Copied to clipboard");
    } catch (err) {
      console.error("Fallback copy failed", err);
    }
    document.body.removeChild(textArea);
  };

  const handleCopy = (e) => {
    e.stopPropagation();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url)
          .then(() => toast.success("Copied to clipboard"))
          .catch(() => fallbackCopy(url));
      } else {
        fallbackCopy(url);
      }
    } catch (err) {
      fallbackCopy(url);
    }
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div
      data-testid="webhook-url-container"
      className="relative group flex items-center justify-between gap-2.5 px-3 py-1.5 rounded-md hover:bg-secondary-active dark:hover:bg-coal-300 border border-transparent hover:border-gray-200 dark:hover:border-coal-100 transition-all duration-200 cursor-pointer w-full"
    >
      <span
        data-testid="webhook-url-text"
        className="font-mono text-sm text-gray-800 group-hover:text-black dark:group-hover:text-white truncate select-all block min-w-0 flex-1"
        onDoubleClick={handleCopy}
        title={url}
      >
        {url}
      </span>
      <div className="flex items-center flex-shrink-0">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                data-testid="webhook-url-copy-btn"
                onClick={handleCopy}
                className={`btn btn-xs btn-icon shadow-sm border rounded-md transition-all ${copied
                  ? "btn-success bg-green-500 hover:bg-green-600 border-green-500 text-white"
                  : "btn-light border-gray-200 dark:border-coal-100 bg-white dark:bg-coal-300 hover:btn-primary text-gray-600 dark:text-gray-400"
                  }`}
              >
                {copied ? <KeenIcon icon="check" className="text-white" /> : <KeenIcon icon="copy" />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" align="center" className="z-[9999] bg-gray-50 dark:bg-gray-200 text-gray-800 dark:text-white border-gray-800  py-1 text-xs rounded shadow-lg">
              {copied ? "Copied!" : "Copy URL"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

// ── Configs List View ───────────────────────────────────────────────

const ConfigsView = ({
  tableKey,
  reloadTable,
  onViewSignals,
  onViewDelivery,
  onEdit,
  onDelete,
  onRegenerate,
  onCreateOpen,
}) => {
  const { isRTL } = useLanguage();
  const [fetchConfigs, { isLoading }] = useLazyGetAdminTvWebhooksQuery();

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row.name,
        id: "name",
        header: ({ column }) => (
          <DataGridColumnHeader title="Name" column={column} />
        ),
        enableSorting: true,
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="flex flex-col gap-0.5">
              <a
                className="leading-none font-medium text-sm text-primary hover:text-primary-active cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewSignals(row.original);
                }}
              >
                {row.original.name}
              </a>
              {row.original.description && (
                <span className="text-2xs text-gray-500 leading-tight">
                  {row.original.description.length > 50
                    ? row.original.description.slice(0, 50) + "..."
                    : row.original.description}
                </span>
              )}
            </div>
          </div>
        ),
        meta: { headerClassName: "min-w-[180px]", cellClassName: "min-w-[180px]" },
      },
      {
        accessorFn: (row) => row.isEnabled,
        id: "status",
        header: ({ column }) => (
          <DataGridColumnHeader title="Status" column={column} />
        ),
        enableSorting: true,
        cell: ({ row }) => (
          <span
            className={`badge badge-sm badge-outline ${row.original.isEnabled ? "badge-success" : "badge-danger"
              }`}
          >
            {row.original.isEnabled ? "Active" : "Disabled"}
          </span>
        ),
        meta: { headerClassName: "w-[100px]", cellClassName: "w-[100px]" },
      },
      {
        accessorFn: (row) => row.webhookUrl,
        id: "webhookUrl",
        header: ({ column }) => (
          <DataGridColumnHeader title="Webhook URL" column={column} />
        ),
        enableSorting: false,
        cell: ({ row }) => {
          const url =
            row.original.webhookUrl ||
            `/api/v1/common/tv-webhook/${row.original.webhookSecret}`;
          return <WebhookUrlCell url={url} />;
        },
        meta: { headerClassName: "min-w-[320px] w-full max-w-[550px]", cellClassName: "min-w-[320px] w-full max-w-[550px]" },
      },
      {
        accessorFn: (row) => row.signalCount,
        id: "signals",
        header: ({ column }) => (
          <DataGridColumnHeader title="Signals" column={column} />
        ),
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-gray-700 font-medium">
            {row.original.signalCount || 0}
          </span>
        ),
        meta: { headerClassName: "w-[90px]", cellClassName: "w-[90px]" },
      },
      {
        accessorFn: (row) => row.createdAt,
        id: "createdAt",
        header: ({ column }) => (
          <DataGridColumnHeader title="Created" column={column} />
        ),
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-gray-600 text-2sm">
            {new Date(row.original.createdAt).toLocaleDateString()}
          </span>
        ),
        meta: { headerClassName: "min-w-[110px]", cellClassName: "min-w-[110px]" },
      },
      {
        id: "actions",
        header: () => "",
        enableSorting: false,
        cell: ({ row }) => (
          <ActionMenu
            config={row.original}
            isRTL={isRTL}
            onViewSignals={onViewSignals}
            // onViewDelivery={onViewDelivery}
            onEdit={onEdit}
            onDelete={onDelete}
            onRegenerate={onRegenerate}
          />
        ),
        meta: { headerClassName: "w-[60px]", cellClassName: "w-[60px]" },
      },
    ],
    [isRTL, onViewSignals, onViewDelivery, onEdit, onDelete, onRegenerate]
  );

  const handleFetchData = useCallback(
    async ({ pageIndex, pageSize }) => {
      try {
        const response = await fetchConfigs({
          page: pageIndex + 1,
          limit: pageSize,
        }).unwrap();
        return {
          data: response.data || [],
          totalCount: response.pagination?.total || 0,
        };
      } catch {
        return { data: [], totalCount: 0 };
      }
    },
    [fetchConfigs]
  );

  const ToolbarTable = () => {
    const { table } = useDataGrid();
    return (
      <div className="card-header px-5 py-5 border-b-0 flex-wrap gap-2">
        <h3 className="card-title">Webhooks</h3>
        <div className="flex flex-wrap items-center gap-2.5">
          <DataGridColumnVisibility table={table} />
        </div>
      </div>
    );
  };

  return (
    <>
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text="TradingView Webhooks" />
          <ToolbarDescription>
            Manage webhook configurations for IQ Strategies alerts
          </ToolbarDescription>
        </ToolbarHeading>
        <ToolbarActions>
          <button className="btn btn-primary" onClick={onCreateOpen}>
            <KeenIcon icon="plus" className="me-1" />
            New Webhook
          </button>
        </ToolbarActions>
      </Toolbar>

      <DataGrid
        reloadTrigger={tableKey}
        serverSide={true}
        loading={isLoading}
        columns={columns}
        pagination={{ size: 10 }}
        toolbar={<ToolbarTable />}
        layout={{ card: true }}
        onFetchData={handleFetchData}
      />
    </>
  );
};

// ── Action Menu ─────────────────────────────────────────────────────

const ActionMenu = ({
  config,
  isRTL,
  onViewSignals,
  // onViewDelivery,
  onEdit,
  onDelete,
  onRegenerate,
}) => {
  const ActionMenuSub = () => (
    <MenuSub className="menu-default" rootClassName="w-full max-w-[200px]">
      <MenuItem onClick={() => onViewSignals(config)}>
        <MenuLink>
          <MenuIcon>
            <KeenIcon icon="eye" />
          </MenuIcon>
          <MenuTitle>View Signals</MenuTitle>
        </MenuLink>
      </MenuItem>
      {/* <MenuItem onClick={() => onViewDelivery(config)}>
        <MenuLink>
          <MenuIcon>
            <KeenIcon icon="notification-on" />
          </MenuIcon>
          <MenuTitle>Delivery History</MenuTitle>
        </MenuLink>
      </MenuItem> */}
      <MenuItem onClick={() => onRegenerate(config)}>
        <MenuLink>
          <MenuIcon>
            <KeenIcon icon="arrows-circle" />
          </MenuIcon>
          <MenuTitle>Regenerate Secret</MenuTitle>
        </MenuLink>
      </MenuItem>
      <MenuItem onClick={() => onEdit(config)}>
        <MenuLink>
          <MenuIcon>
            <KeenIcon icon="notepad-edit" />
          </MenuIcon>
          <MenuTitle>Edit</MenuTitle>
        </MenuLink>
      </MenuItem>
      <MenuItem onClick={() => onDelete(config)}>
        <MenuLink>
          <MenuIcon>
            <KeenIcon icon="trash" />
          </MenuIcon>
          <MenuTitle>Delete</MenuTitle>
        </MenuLink>
      </MenuItem>
    </MenuSub>
  );

  return (
    <Menu className="items-stretch">
      <MenuItem
        toggle="dropdown"
        trigger="click"
        dropdownProps={{
          placement: isRTL() ? "bottom-start" : "bottom-end",
          modifiers: [
            {
              name: "offset",
              options: { offset: isRTL() ? [0, -10] : [0, 10] },
            },
          ],
        }}
      >
        <MenuToggle className="btn btn-sm btn-icon btn-light btn-clear">
          <KeenIcon icon="dots-vertical" />
        </MenuToggle>
        {ActionMenuSub()}
      </MenuItem>
    </Menu>
  );
};

// ── Signal Action Menu ──────────────────────────────────────────────

const SignalActionMenu = ({
  signal,
  isRTL,
  onView,
  onEdit,
  onDelete,
}) => {
  const ActionMenuSub = () => (
    <MenuSub className="menu-default" rootClassName="w-full max-w-[150px]">
      <MenuItem onClick={() => onView(signal)}>
        <MenuLink>
          <MenuIcon>
            <KeenIcon icon="eye" />
          </MenuIcon>
          <MenuTitle>View</MenuTitle>
        </MenuLink>
      </MenuItem>
      <MenuItem onClick={() => onEdit(signal)}>
        <MenuLink>
          <MenuIcon>
            <KeenIcon icon="notepad-edit" />
          </MenuIcon>
          <MenuTitle>Edit</MenuTitle>
        </MenuLink>
      </MenuItem>
      <MenuItem onClick={() => onDelete(signal)}>
        <MenuLink>
          <MenuIcon>
            <KeenIcon icon="trash" />
          </MenuIcon>
          <MenuTitle>Delete</MenuTitle>
        </MenuLink>
      </MenuItem>
    </MenuSub>
  );

  return (
    <Menu className="items-stretch">
      <MenuItem
        toggle="dropdown"
        trigger="click"
        dropdownProps={{
          placement: isRTL() ? "bottom-start" : "bottom-end",
          modifiers: [
            {
              name: "offset",
              options: { offset: isRTL() ? [0, -10] : [0, 10] },
            },
          ],
        }}
      >
        <MenuToggle className="btn btn-sm btn-icon btn-light btn-clear">
          <KeenIcon icon="dots-vertical" />
        </MenuToggle>
        {ActionMenuSub()}
      </MenuItem>
    </Menu>
  );
};

// ── Signals View ────────────────────────────────────────────────────

const SignalsView = ({ config, onBack }) => {
  const [fetchSignals, { isLoading }] = useLazyGetWebhookSignalsQuery();
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [isSignalEditMode, setIsSignalEditMode] = useState(false);
  const [deleteSignalRow, setDeleteSignalRow] = useState(null);
  const [tableKey, setTableKey] = useState(0);
  const reloadTable = () => setTableKey((k) => k + 1);
  const { isRTL } = useLanguage();

  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row.symbol,
        id: "symbol",
        header: ({ column }) => (
          <DataGridColumnHeader title="Symbol" column={column} />
        ),
        enableSorting: true,
        cell: ({ row }) => (
          <div className="flex flex-col gap-0.5">
            <a
              className="leading-none font-medium text-sm text-primary hover:text-primary-active cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedSignal(row.original);
                setIsSignalEditMode(false);
              }}
            >
              {row.original.symbol || "—"}
            </a>
            {row.original.exchange && (
              <span className="text-2xs text-gray-500">
                {row.original.exchange}
              </span>
            )}
          </div>
        ),
        meta: { headerClassName: "w-[90px]", cellClassName: "w-[90px]" },
      },
      {
        accessorFn: (row) => row.signalType,
        id: "type",
        header: ({ column }) => (
          <DataGridColumnHeader title="Type" column={column} />
        ),
        enableSorting: true,
        cell: ({ row }) => {
          const type = row.original.signalType || "OTHER";
          return (
            <span
              className={`badge badge-sm badge-outline ${signalTypeBadgeMap[type] || "badge-secondary"
                }`}
            >
              {type}
            </span>
          );
        },
        meta: { headerClassName: "w-[80px]", cellClassName: "w-[80px]" },
      },
      {
        accessorFn: (row) => row.entryPrice,
        id: "entryPrice",
        header: ({ column }) => (
          <DataGridColumnHeader title="Entry Price" column={column} />
        ),
        enableSorting: true,
        cell: (info) => (
          <span className="text-gray-700">{formatPrice(info.getValue())}</span>
        ),
        meta: { headerClassName: "w-[80px]", cellClassName: "w-[80px]" },
      },
      {
        accessorFn: (row) => row.stopLoss,
        id: "sl",
        header: ({ column }) => (
          <DataGridColumnHeader title="SL" column={column} />
        ),
        enableSorting: true,
        cell: (info) => (
          <span className="text-gray-700">{formatPrice(info.getValue())}</span>
        ),
        meta: { headerClassName: "w-[70px]", cellClassName: "w-[70px]" },
      },
      {
        accessorFn: (row) => row.takeProfit,
        id: "tp",
        header: ({ column }) => (
          <DataGridColumnHeader title="TP" column={column} />
        ),
        enableSorting: true,
        cell: (info) => (
          <span className="text-gray-700">{formatPrice(info.getValue())}</span>
        ),
        meta: { headerClassName: "w-[70px]", cellClassName: "w-[70px]" },
      },
      {
        accessorFn: (row) => row.timeframe,
        id: "timeframe",
        header: ({ column }) => (
          <DataGridColumnHeader title="Timeframe" column={column} />
        ),
        enableSorting: true,
        cell: (info) => (
          <span className="text-gray-700">{info.getValue() || "—"}</span>
        ),
        meta: { headerClassName: "w-[60px]", cellClassName: "w-[60px]" },
      },
      {
        accessorFn: (row) => row.deliveryStatus,
        id: "delivery",
        header: ({ column }) => (
          <DataGridColumnHeader title="Delivery" column={column} />
        ),
        enableSorting: true,
        cell: ({ row }) => {
          const status = row.original.deliveryStatus || "pending";
          return (
            <span
              className={`badge badge-sm badge-outline ${statusColorMap[status] || "badge-secondary"
                }`}
            >
              {status}
            </span>
          );
        },
        meta: { headerClassName: "w-[80px]", cellClassName: "w-[80px]" },
      },
      {
        accessorFn: (row) => row.notificationStatus,
        id: "notification",
        header: ({ column }) => (
          <DataGridColumnHeader title="Notification" column={column} />
        ),
        enableSorting: true,
        cell: ({ row }) => {
          const status = row.original.notificationStatus || "pending";
          return (
            <span
              className={`badge badge-sm badge-outline ${statusColorMap[status] || "badge-secondary"
                }`}
            >
              {status}
            </span>
          );
        },
        meta: { headerClassName: "w-[80px]", cellClassName: "w-[80px]" },
      },
      {
        accessorFn: (row) => row.strategyName,
        id: "strategy",
        header: ({ column }) => (
          <DataGridColumnHeader title="Strategy" column={column} />
        ),
        enableSorting: true,
        cell: (info) => (
          <span className="text-gray-700 text-2sm truncate max-w-[110px] block">
            {info.getValue() || "—"}
          </span>
        ),
        meta: { headerClassName: "w-[110px]", cellClassName: "w-[110px]" },
      },
      {
        accessorFn: (row) => row.createdAt,
        id: "received",
        header: ({ column }) => (
          <DataGridColumnHeader title="Received" column={column} />
        ),
        enableSorting: true,
        cell: ({ row }) => {
          const date = new Date(row.original.createdAt);
          return (
            <div className="flex flex-col text-2sm leading-tight text-gray-600">
              <span className="font-medium">{date.toLocaleDateString()}</span>
              <span className="text-2xs text-gray-400">{date.toLocaleTimeString()}</span>
            </div>
          );
        },
        meta: { headerClassName: "w-[100px]", cellClassName: "w-[100px]" },
      },
      {
        id: "actions",
        header: () => "",
        enableSorting: false,
        cell: ({ row }) => (
          <SignalActionMenu
            signal={row.original}
            isRTL={isRTL}
            onView={(signal) => {
              setSelectedSignal(signal);
              setIsSignalEditMode(false);
            }}
            onEdit={(signal) => {
              setSelectedSignal(signal);
              setIsSignalEditMode(true);
            }}
            onDelete={(signal) => {
              setDeleteSignalRow(signal);
            }}
          />
        ),
        meta: { headerClassName: "w-[60px]", cellClassName: "w-[60px]" },
      },
    ],
    [isRTL]
  );

  const handleFetchData = useCallback(
    async ({ pageIndex, pageSize }) => {
      try {
        const response = await fetchSignals({
          id: config._id,
          page: pageIndex + 1,
          limit: pageSize,
        }).unwrap();
        return {
          data: response.data || [],
          totalCount: response.pagination?.total || 0,
        };
      } catch {
        return { data: [], totalCount: 0 };
      }
    },
    [fetchSignals, config._id]
  );

  const ToolbarTable = () => {
    const { table } = useDataGrid();
    return (
      <div className="card-header px-5 py-5 border-b-0 flex-wrap gap-2">
        <h3 className="card-title">Signals — {config.name}</h3>
        <div className="flex flex-wrap items-center gap-2.5">
          <DataGridColumnVisibility table={table} />
        </div>
      </div>
    );
  };

  return (
    <>
      <Toolbar>
        <ToolbarHeading>
          <div className="flex items-center gap-2">
            <button className="btn btn-sm btn-icon btn-light" onClick={onBack}>
              <KeenIcon icon="arrow-left" />
            </button>
            <div>
              <ToolbarPageTitle text={`Signals — ${config.name}`} />
              <ToolbarDescription>
                View received IQ Strategies Signals for this webhook
              </ToolbarDescription>
            </div>
          </div>
        </ToolbarHeading>
      </Toolbar>

      <DataGrid
        key={tableKey}
        serverSide={true}
        loading={isLoading}
        columns={columns}
        pagination={{ size: 10 }}
        toolbar={<ToolbarTable />}
        layout={{ card: true }}
        onFetchData={handleFetchData}
      />

      {selectedSignal && (
        <AdminSignalDetailModal
          signal={selectedSignal}
          initialEditMode={isSignalEditMode}
          onClose={() => {
            setSelectedSignal(null);
            setIsSignalEditMode(false);
          }}
          onUpdate={(updatedSignal) => {
            setSelectedSignal(updatedSignal);
            reloadTable();
          }}
        />
      )}

      {deleteSignalRow && (
        <DeleteSignalDialog
          isOpen={!!deleteSignalRow}
          onClose={() => setDeleteSignalRow(null)}
          signal={deleteSignalRow}
          refetch={reloadTable}
        />
      )}
    </>
  );
};

// ── Delivery History View ───────────────────────────────────────────

const DeliveryView = ({ config, onBack }) => {
  const [fetchDelivery, { isLoading }] = useLazyGetDeliveryHistoryQuery();
  const [retryNotification, { isLoading: retrying }] =
    useRetrySignalNotificationMutation();

  const handleRetry = async (signalId) => {
    try {
      const result = await retryNotification(signalId).unwrap();
      toast.success(
        `Retry complete: ${result.data?.totalSuccess || 0} succeeded`
      );
    } catch {
      toast.error("Retry failed");
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row.signal?.symbol,
        id: "signal",
        header: ({ column }) => (
          <DataGridColumnHeader title="Signal" column={column} />
        ),
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-sm text-gray-900">
              {row.original.signal?.symbol || "—"}
            </span>
            {row.original.signal?.signalType && (
              <span
                className={`badge badge-sm badge-outline ${signalTypeBadgeMap[row.original.signal.signalType] ||
                  "badge-secondary"
                  }`}
              >
                {row.original.signal.signalType}
              </span>
            )}
          </div>
        ),
        meta: { headerClassName: "min-w-[140px]", cellClassName: "min-w-[140px]" },
      },
      {
        accessorFn: (row) => row.batchIndex,
        id: "batch",
        header: ({ column }) => (
          <DataGridColumnHeader title="Batch" column={column} />
        ),
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-gray-700">
            #{row.original.batchIndex + 1}
          </span>
        ),
        meta: { headerClassName: "w-[70px]", cellClassName: "w-[70px]" },
      },
      {
        accessorFn: (row) => row.tokenCount,
        id: "tokens",
        header: ({ column }) => (
          <DataGridColumnHeader title="Tokens" column={column} />
        ),
        enableSorting: true,
        cell: (info) => (
          <span className="text-gray-700">{info.getValue()}</span>
        ),
        meta: { headerClassName: "w-[80px]", cellClassName: "w-[80px]" },
      },
      {
        accessorFn: (row) => row.successCount,
        id: "success",
        header: ({ column }) => (
          <DataGridColumnHeader title="Success" column={column} />
        ),
        enableSorting: true,
        cell: (info) => (
          <span className="text-success font-semibold">{info.getValue()}</span>
        ),
        meta: { headerClassName: "w-[80px]", cellClassName: "w-[80px]" },
      },
      {
        accessorFn: (row) => row.failureCount,
        id: "failed",
        header: ({ column }) => (
          <DataGridColumnHeader title="Failed" column={column} />
        ),
        enableSorting: true,
        cell: (info) => (
          <span
            className={`font-semibold ${info.getValue() > 0 ? "text-danger" : "text-gray-400"
              }`}
          >
            {info.getValue()}
          </span>
        ),
        meta: { headerClassName: "w-[80px]", cellClassName: "w-[80px]" },
      },
      {
        accessorFn: (row) => row.status,
        id: "status",
        header: ({ column }) => (
          <DataGridColumnHeader title="Status" column={column} />
        ),
        enableSorting: true,
        cell: ({ row }) => {
          const status = row.original.status || "pending";
          return (
            <span
              className={`badge badge-sm badge-outline ${statusColorMap[status] || "badge-secondary"
                }`}
            >
              {status}
            </span>
          );
        },
        meta: { headerClassName: "w-[90px]", cellClassName: "w-[90px]" },
      },
      {
        accessorFn: (row) => row.retryCount,
        id: "retries",
        header: ({ column }) => (
          <DataGridColumnHeader title="Retries" column={column} />
        ),
        enableSorting: true,
        cell: (info) => (
          <span className="text-gray-700">{info.getValue()}</span>
        ),
        meta: { headerClassName: "w-[80px]", cellClassName: "w-[80px]" },
      },
      {
        accessorFn: (row) => row.createdAt,
        id: "date",
        header: ({ column }) => (
          <DataGridColumnHeader title="Date" column={column} />
        ),
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-gray-600 text-2sm">
            {new Date(row.original.createdAt).toLocaleString()}
          </span>
        ),
        meta: { headerClassName: "min-w-[150px]", cellClassName: "min-w-[150px]" },
      },
      {
        id: "actions",
        header: () => "",
        enableSorting: false,
        cell: ({ row }) => {
          const status = row.original.status;
          if (status === "failed" || status === "partial") {
            return (
              <button
                onClick={() => handleRetry(row.original.signal?._id)}
                disabled={retrying}
                className="btn btn-xs btn-warning"
              >
                <KeenIcon icon="arrows-circle" className="me-1" />
                Retry
              </button>
            );
          }
          return null;
        },
        meta: { headerClassName: "w-[90px]", cellClassName: "w-[90px]" },
      },
    ],
    [retrying]
  );

  const handleFetchData = useCallback(
    async ({ pageIndex, pageSize }) => {
      try {
        const response = await fetchDelivery({
          id: config._id,
          page: pageIndex + 1,
          limit: pageSize,
        }).unwrap();
        return {
          data: response.data || [],
          totalCount: response.pagination?.total || 0,
        };
      } catch {
        return { data: [], totalCount: 0 };
      }
    },
    [fetchDelivery, config._id]
  );

  const ToolbarTable = () => {
    const { table } = useDataGrid();
    return (
      <div className="card-header px-5 py-5 border-b-0 flex-wrap gap-2">
        <h3 className="card-title">Delivery History — {config.name}</h3>
        <div className="flex flex-wrap items-center gap-2.5">
          <DataGridColumnVisibility table={table} />
        </div>
      </div>
    );
  };

  return (
    <>
      <Toolbar>
        <ToolbarHeading>
          <div className="flex items-center gap-2">
            <button className="btn btn-sm btn-icon btn-light" onClick={onBack}>
              <KeenIcon icon="arrow-left" />
            </button>
            <div>
              <ToolbarPageTitle text={`Delivery — ${config.name}`} />
              <ToolbarDescription>
                FCM notification delivery history
              </ToolbarDescription>
            </div>
          </div>
        </ToolbarHeading>
      </Toolbar>

      <DataGrid
        serverSide={true}
        loading={isLoading}
        columns={columns}
        pagination={{ size: 10 }}
        toolbar={<ToolbarTable />}
        layout={{ card: true }}
        onFetchData={handleFetchData}
      />
    </>
  );
};

// ── Admin Signal Detail Modal ───────────────────────────────────────

const signalTypeLabel = (type) => {
  const labels = {
    BUY: "Buy", SELL: "Sell", LONG: "Long", SHORT: "Short",
    CLOSE: "Close", INFO: "Info", OTHER: "Other",
    SL_HIT: "SL Hit", TP1_HIT: "TP1 Hit", TP2_HIT: "TP2 Hit",
    TP3_HIT: "TP3 Hit", TP4_HIT: "TP4 Hit", BREAKEVEN_EXIT: "BE Exit",
  };
  return labels[type] || type;
};

const PriceBlock = ({ label, value, colorClass, bgClass, icon: Icon }) => {
  const handleCopy = (e) => {
    e?.stopPropagation?.();
    if (value != null) {
      try {
        navigator?.clipboard?.writeText?.(formatPrice(value)?.toString?.());
        toast?.success?.(`${label || "Value"} copied!`);
      } catch (_) { /* clipboard may not be available */ }
    }
  };

  return (
    <div
      onClick={handleCopy}
      className={`group flex-1 flex flex-col p-4 rounded-xl border border-slate-100 dark:border-[#1F1F35]/50 hover:border-slate-200 dark:hover:border-slate-800 transition-all cursor-pointer select-none ${bgClass}`}
      title={`Click to copy ${label}`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          {label}
        </span>
        {Icon && <Icon size={12} className="text-slate-400 dark:text-slate-500" />}
      </div>
      <div className="flex items-baseline justify-between">
        <span className={`text-[15px] font-black tracking-tight ${colorClass}`}>
          {value != null ? formatPrice(value) : "\u2014"}
        </span>
        {value != null && (
          <Copy size={12} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1.5" />
        )}
      </div>
    </div>
  );
};

const MetaItem = ({ label, value, colSpan = 1 }) => (
  <div className={`flex flex-col gap-0.5 ${colSpan === 2 ? 'col-span-2' : ''}`}>
    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</span>
    <span className="text-[12px] font-black text-slate-700 dark:text-slate-200 truncate">{value || "—"}</span>
  </div>
);

const AdminSignalDetailModal = ({ signal, onClose, onUpdate, initialEditMode = false }) => {
  const [showRaw, setShowRaw] = useState(false);
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [updateSignal, { isLoading: isUpdating }] = useUpdateSignalMutation();
  const [formData, setFormData] = useState({
    symbol: "",
    exchange: "",
    market: "",
    strategyName: "",
    alertName: "",
    alertMessage: "",
    signalType: "",
    entryPrice: "",
    stopLoss: "",
    takeProfit: "",
    timeframe: "",
    customVariablesStr: "",
    tp1: "",
    tp2: "",
    tp3: "",
    tp4: "",
    confirmations: {
      candle_match: null,
      trade_time: null,
      "238_behind": null,
      with_the_trend: null,
      poc: null,
    },
  });

  React.useEffect(() => {
    setIsEditing(initialEditMode);
  }, [initialEditMode, signal]);

  React.useEffect(() => {
    if (signal) {
      // Build TP values from takeProfits array + customVariables
      const tpVals = { tp1: "", tp2: "", tp3: "", tp4: "" };
      if (Array.isArray(signal.takeProfits)) {
        signal.takeProfits.forEach((tp) => {
          if (tp?.level != null && tp?.price != null) {
            const key = `tp${tp.level}`;
            if (key in tpVals) tpVals[key] = String(tp.price);
          }
        });
      }
      // Supplement from customVariables
      const cv = signal.customVariables || {};
      Object.entries(cv).forEach(([k, v]) => {
        const norm = (k ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
        if (norm.startsWith("tp") && /^\d+$/.test(norm.slice(2))) {
          const num = parseInt(norm.slice(2), 10);
          const key = `tp${num}`;
          if (key in tpVals && !tpVals[key]) tpVals[key] = String(v);
        }
      });
      // Fallback: signal.takeProfit (singular) as TP1
      if (!tpVals.tp1 && signal.takeProfit != null) {
        tpVals.tp1 = String(signal.takeProfit);
      }

      // Build confirmations
      const sigConfs = signal.confirmations || {};
      const confState = {
        candle_match: sigConfs.candle_match ?? null,
        trade_time: sigConfs.trade_time ?? null,
        "238_behind": sigConfs["238_behind"] ?? null,
        with_the_trend: sigConfs.with_the_trend ?? null,
        poc: sigConfs.poc ?? null,
      };

      setFormData({
        symbol: signal.symbol || "",
        exchange: signal.exchange || "",
        market: signal.market || "",
        strategyName: signal.strategyName || "",
        alertName: signal.alertName || "",
        alertMessage: signal.alertMessage || "",
        signalType: signal.signalType || "OTHER",
        entryPrice: signal.entryPrice != null ? String(signal.entryPrice) : "",
        stopLoss: signal.stopLoss != null ? String(signal.stopLoss) : "",
        takeProfit: signal.takeProfit != null ? String(signal.takeProfit) : "",
        timeframe: signal.timeframe || "",
        customVariablesStr: signal.customVariables ? JSON.stringify(signal.customVariables, null, 2) : "{}",
        ...tpVals,
        confirmations: confState,
      });
    }
  }, [signal, isEditing]);

  if (!signal) return null;

  const type = signal.signalType || "OTHER";
  const badgeClass = signalTypeBadgeMap[type] || "badge-secondary";

  // Collect all custom / extra fields dynamically
  const customVars = signal?.customVariables || {};
  const processedExtra = signal?.processedPayload || {};

  const formatKey = (key) =>
    key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  // ── Build TP levels from takeProfits array + customVariables ────────
  const tpLevels = [];
  if (Array.isArray(signal?.takeProfits) && signal.takeProfits.length > 0) {
    signal.takeProfits.forEach((tp) => {
      if (tp?.level != null) tpLevels.push({ label: `TP ${tp.level}`, value: tp?.price });
    });
  }
  const tpKeys = [
    "tp1", "tp2", "tp3", "tp4",
    "takeprofit1", "takeprofit2", "takeprofit3", "takeprofit4",
    "take_profit1", "take_profit2", "take_profit3", "take_profit4",
  ];
  Object.entries(customVars).forEach(([key, val]) => {
    const normKey = (key ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
    if (
      tpKeys.includes(normKey) ||
      (normKey.startsWith("tp") && /^\d+$/.test(normKey.slice(2)))
    ) {
      const num = parseInt(normKey.replace(/\D/g, ""), 10);
      // Skip if TP already added from signal.takeProfits
      const alreadyExists = tpLevels.some(
        (tp) => tp.label === `TP ${num}`
      );
      if (!alreadyExists) {
        tpLevels.push({ label: `TP ${num}`, value: val, key });
      }
    }
  });
  tpLevels.sort((a, b) => {
    const aNum = parseInt((a?.label ?? "").replace(/\D/g, ""), 10) || 0;
    const bNum = parseInt((b?.label ?? "").replace(/\D/g, ""), 10) || 0;
    return aNum - bNum;
  });

  // Extract context/market indicators to display as premium badges
  const badgeKeys = [
    "session", "trend", "adx", "strength", "volume_delta", "volume",
    "poc", "rrr", "lot_size", "pnl", "supertrend", "signal_strength"
  ];
  const marketBadges = [];
  const otherVars = {};

  Object.entries(customVars).forEach(([key, val]) => {
    const normKey = (key ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const isTp = tpLevels.some(tp => tp.key === key);
    if (isTp) return;

    if (badgeKeys.some(bk => normKey.includes(bk.replace(/_/g, "")))) {
      marketBadges.push({ key, label: formatKey(key), value: String(val) });
    } else {
      otherVars[key] = val;
    }
  });

  const knownKeys = new Set([
    "symbol", "exchange", "market", "strategyName", "alertName", "alertMessage",
    "signalType", "entryPrice", "stopLoss", "takeProfit", "timeframe",
    "alertTimestamp", "tvTimestamp", "customVariables",
  ]);

  // Extra fields from processedPayload not already shown
  const extraProcessed = {};
  for (const [k, v] of Object.entries(processedExtra)) {
    if (!knownKeys.has(k) && v != null && v !== "") {
      extraProcessed[k] = v;
    }
  }

  // ── Confirmations ────────────────────────────────────────────────
  const CONFIRMATION_LABELS = {
    candle_match: "Candle Match",
    trade_time: "Trade Time",
    "238_behind": "238 Behind",
    with_the_trend: "With The Trend",
    poc: "POC",
  };
  const confs = signal?.confirmations || {};
  const confirmations = Object.entries(CONFIRMATION_LABELS)
    .filter(([key]) => confs[key] !== undefined && confs[key] !== null)
    .map(([key, label]) => ({ key, label, passed: !!confs[key] }));
  const passedCount = confirmations.filter((c) => c.passed).length;

  const config = signalConfig?.[type] || signalConfig?.OTHER || {};
  const IconComponent = config?.icon || Activity;

  const InfoRow = ({ label, value }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-150 dark:border-coal-200 last:border-0">
      <span className="text-[13px] text-slate-400 font-medium">{label}</span>
      <span className="text-[13px] font-bold text-slate-800 dark:text-white">{value}</span>
    </div>
  );

  const handleSave = async () => {
    const {
      symbol,
      exchange,
      market,
      strategyName,
      alertName,
      alertMessage,
      signalType,
      entryPrice,
      stopLoss,
      timeframe,
      customVariablesStr,
      tp1, tp2, tp3, tp4,
      confirmations: formConfirmations,
    } = formData;

    if (entryPrice !== "" && entryPrice !== null && isNaN(Number(entryPrice))) {
      toast.error("Entry Price must be a valid number");
      return;
    }
    if (stopLoss !== "" && stopLoss !== null && isNaN(Number(stopLoss))) {
      toast.error("Stop Loss must be a valid number");
      return;
    }
    // Validate TP values
    for (const [label, val] of [["TP1", tp1], ["TP2", tp2], ["TP3", tp3], ["TP4", tp4]]) {
      if (val !== "" && val !== null && isNaN(Number(val))) {
        toast.error(`${label} must be a valid number`);
        return;
      }
    }

    // Build takeProfits array
    const takeProfits = [];
    [tp1, tp2, tp3, tp4].forEach((val, idx) => {
      if (val !== "" && val !== null && !isNaN(Number(val))) {
        takeProfits.push({ level: idx + 1, price: Number(val) });
      }
    });

    // Build confirmations — only include non-null values
    const confirmationsPayload = {};
    Object.entries(formConfirmations).forEach(([key, val]) => {
      if (val !== null) confirmationsPayload[key] = val;
    });

    let parsedCustomVariables = null;
    if (customVariablesStr && customVariablesStr.trim()) {
      try {
        parsedCustomVariables = JSON.parse(customVariablesStr);
        if (typeof parsedCustomVariables !== "object" || Array.isArray(parsedCustomVariables)) {
          toast.error("Custom Variables must be a valid JSON Object");
          return;
        }
      } catch (e) {
        toast.error("Custom Variables must be valid JSON: " + e.message);
        return;
      }
    }

    try {
      const response = await updateSignal({
        signalId: signal?._id,
        symbol: symbol.trim() || null,
        exchange: exchange.trim() || null,
        market: market.trim() || null,
        strategyName: strategyName.trim() || null,
        alertName: alertName.trim() || null,
        alertMessage: alertMessage || null,
        signalType,
        entryPrice: entryPrice === "" ? null : Number(entryPrice),
        stopLoss: stopLoss === "" ? null : Number(stopLoss),
        takeProfit: tp1 === "" ? null : Number(tp1),
        takeProfits: takeProfits.length > 0 ? takeProfits : null,
        confirmations: Object.keys(confirmationsPayload).length > 0 ? confirmationsPayload : null,
        timeframe: timeframe.trim() || null,
        customVariables: parsedCustomVariables,
      }).unwrap();

      toast.success("Signal updated successfully");
      setIsEditing(false);
      if (onUpdate && response.data) {
        onUpdate(response.data);
      }
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update signal");
    }
  };

  return (
    <Dialog open={!!signal} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={isEditing ? "p-5 max-w-[1200px]" : "p-0 max-w-[650px] max-h-[85vh] overflow-y-auto flex flex-col"}>
        {isEditing ? (
          <DialogHeader>
            <DialogTitle>Edit TradingView Alert</DialogTitle>
          </DialogHeader>
        ) : (
        <DialogHeader className="px-6 pt-6 pb-5 border-b border-slate-100 dark:border-[#1F1F35]/50">
          <div className="flex items-start gap-3.5">
            <div
              style={{ background: config?.bgLight || "#64748b15" }}
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
            >
              {IconComponent && <IconComponent size={24} color={config?.bg || "#64748b"} />}
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="margin-0 text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                {signal?.symbol || "Signal Detail"}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Detailed view of the trading signal
              </DialogDescription>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {signal?.signalType && signal?.signalType !== "OTHER" && (
                  <span
                    style={{ background: config?.bgLight || "#64748b15", color: config?.text || "#64748b", borderColor: (config?.text || "#64748b") + "30" }}
                    className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold border"
                  >
                    {config?.label || ""}
                  </span>
                )}
                {signal?.timeframe && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30 px-2 py-0.5 rounded-md">
                    <Clock size={10} />
                    {formatTimeframe(signal?.timeframe)}
                  </span>
                )}
                {signal?.session && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-600 dark:text-teal-300 bg-teal-50 dark:bg-teal-500/15 border border-teal-200 dark:border-teal-500/30 px-2 py-0.5 rounded-md">
                    🌍 {signal.session}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-sm btn-light flex items-center gap-1.5"
                title="Edit Alert"
              >
                <Pencil size={14} />
                <span>Edit</span>
              </button>
            </div>
          </div>
        </DialogHeader>
        )}

        {isEditing ? (
          <>
            <div className="grid gap-5 px-0 py-5">
              {/* Row 1: Symbol & Timeframe */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">Symbol</label>
                  <input
                    type="text"
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                    placeholder="e.g. BTCUSDT"
                    className="input input-md w-full"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">Timeframe</label>
                  <input
                    type="text"
                    value={formData.timeframe}
                    onChange={(e) => setFormData({ ...formData, timeframe: e.target.value })}
                    placeholder="e.g. 15m, 1h, 4h, D"
                    className="input input-md w-full"
                  />
                </div>
              </div>

              {/* Row 2: Signal Type & Strategy Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">Signal Type</label>
                  <select
                    value={formData.signalType}
                    onChange={(e) => setFormData({ ...formData, signalType: e.target.value })}
                    className="select select-md w-full"
                  >
                    <option value="BUY">BUY</option>
                    <option value="SELL">SELL</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">Strategy Name</label>
                  <input
                    type="text"
                    value={formData.strategyName}
                    onChange={(e) => setFormData({ ...formData, strategyName: e.target.value })}
                    placeholder="e.g. Bullseye, Supernova"
                    className="input input-md w-full"
                  />
                </div>
              </div>

              {/* Row 3: Entry Price & Stop Loss */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">Entry Price</label>
                  <input
                    type="text"
                    value={formData.entryPrice}
                    onChange={(e) => setFormData({ ...formData, entryPrice: e.target.value })}
                    placeholder="e.g. 50000"
                    className="input input-md w-full"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900">Stop Loss (Invalidation)</label>
                  <input
                    type="text"
                    value={formData.stopLoss}
                    onChange={(e) => setFormData({ ...formData, stopLoss: e.target.value })}
                    placeholder="e.g. 49500"
                    className="input input-md w-full"
                  />
                </div>
              </div>

              {/* Row 4: Take Profit Levels */}
              <div>
                <label className="form-label text-gray-900 mb-2">🎯 Target Levels</label>
                <div className="grid grid-cols-4 gap-3">
                  {["tp1", "tp2", "tp3", "tp4"].map((key, idx) => (
                    <div key={key} className="flex flex-col gap-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">TP {idx + 1}</span>
                      <input
                        type="text"
                        value={formData[key]}
                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                        placeholder={`TP${idx + 1} price`}
                        className="input input-md w-full"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 5: Confirmations */}
              <div>
                <label className="form-label text-gray-900 mb-2">Confirmations</label>
                <div className="grid grid-cols-5 gap-3">
                  {[
                    { key: "candle_match", label: "Candle Match" },
                    { key: "trade_time", label: "Trade Time" },
                    { key: "238_behind", label: "238 Behind" },
                    { key: "with_the_trend", label: "With The Trend" },
                    { key: "poc", label: "POC" },
                  ].map((item) => {
                    const val = formData?.confirmations?.[item.key] ?? null;
                    return (
                      <div
                        key={item.key}
                        onClick={() => {
                          const next = val === true ? false : val === false ? null : true;
                          setFormData({
                            ...formData,
                            confirmations: { ...(formData?.confirmations || {}), [item.key]: next },
                          });
                        }}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border cursor-pointer transition-all select-none ${
                          val === true
                            ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 dark:border-emerald-500/40"
                            : val === false
                            ? "border-red-400 bg-red-50 dark:bg-red-500/10 dark:border-red-500/40"
                            : "border-gray-200 bg-gray-50 dark:bg-coal-300 dark:border-coal-200"
                        }`}
                        title={`Click to toggle: ✅ → ❌ → Not set → ✅`}
                      >
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 text-center leading-tight">
                          {item.label}
                        </span>
                        <span className="text-[18px]">
                          {val === true ? "✅" : val === false ? "❌" : "➖"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex border-gray-200 border-t justify-end py-5 rounded-b dark:border-gray-200 gap-3">
              <button type="button" className="btn btn-light" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
              <button disabled={isUpdating} onClick={handleSave} className="btn btn-primary">
                {isUpdating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </>
        ) : (
          <DialogBody className="px-6 py-1 overflow-y-auto flex-1">
            <>
              {/* ── Chart Screenshot Section ── */}
              {signal?.chartImageUrl && (
                <div className="mb-5 overflow-hidden rounded-xl border border-slate-200 dark:border-[#1F1F35]/70 shadow-sm">
                  <div className="flex items-center justify-between px-4 py-2 bg-slate-100/80 dark:bg-[#161626]/80 border-b border-slate-200 dark:border-[#202038]">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Chart at Alert Time
                    </span>
                    <a
                      href={signal?.chartImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-blue-500 hover:text-blue-400 transition-colors"
                    >
                      Open full size ↗
                    </a>
                  </div>
                  <img
                    src={signal?.chartImageUrl}
                    alt={`${signal?.symbol || "Chart"} at alert time`}
                    className="w-full h-auto block bg-[#0a0a14]"
                    loading="lazy"
                    style={{ maxHeight: "360px", objectFit: "contain" }}
                  />
                </div>
              )}

              {/* Core Price Levels */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <PriceBlock
                  label="Entry"
                  value={signal?.entryPrice}
                  colorClass="text-slate-800 dark:text-white"
                  bgClass="bg-slate-50/70 dark:bg-[#121222]/40"
                  icon={Crosshair}
                />
                <PriceBlock
                  label="Stop Loss (Invalidation)"
                  value={signal?.stopLoss}
                  colorClass="text-red-500 dark:text-[#ff3b30]"
                  bgClass="bg-red-50/30 dark:bg-[#ef4444]/5"
                  icon={ShieldAlert}
                />
              </div>

              {/* TP Target Levels */}
              {tpLevels.length > 0 && (
                <div className="mb-5">
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mb-2.5 uppercase tracking-wider px-1">
                    🎯 Target Levels
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {tpLevels.map((tp, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          try {
                            if (tp?.value != null) {
                              navigator?.clipboard?.writeText?.(formatPrice(tp?.value)?.toString?.());
                              toast?.success?.(`${tp?.label || "Value"} copied!`);
                            }
                          } catch (_) { /* clipboard may not be available */ }
                        }}
                        className="flex justify-between items-center p-3 rounded-xl bg-emerald-50/30 dark:bg-[#10b981]/5 border border-emerald-100/30 dark:border-emerald-950/20 hover:border-emerald-300 dark:hover:border-emerald-800/50 transition-all cursor-pointer group"
                        title={`Click to copy ${tp.label}`}
                      >
                        <div className="flex items-center gap-2">
                          <Target size={12} className="text-emerald-500" />
                          <span className="text-[12px] font-bold text-slate-600 dark:text-slate-400">
                            {tp?.label || ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[13px] font-black text-emerald-600 dark:text-emerald-400">
                            {tp?.value != null ? formatPrice(tp.value) : "—"}
                          </span>
                          {tp?.value != null && (
                            <Copy size={10} className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity ml-0.5" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Confirmations */}
              {confirmations.length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center justify-between px-1 mb-2.5">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                      Confirmations
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                      {passedCount}/{confirmations.length} passed
                    </span>
                  </div>
                  <div className="bg-slate-50/30 dark:bg-[#0E0E18]/50 rounded-xl border border-slate-100 dark:border-[#1F1F35]/50 overflow-hidden">
                    {confirmations.map((item, idx) => (
                      <div
                        key={item?.key ?? idx}
                        className={`flex justify-between items-center px-4 py-3 ${idx < confirmations.length - 1
                          ? "border-b border-slate-100 dark:border-[#1F1F35]/30"
                          : ""
                          }`}
                      >
                        <span className="text-[13px] text-slate-600 dark:text-slate-300 font-medium">
                          {item?.label || ""}
                        </span>
                        {item?.passed ? (
                          <span className="text-[16px]">✅</span>
                        ) : (
                          <span className="text-[16px]">❌</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Market Intelligence badges */}
              {marketBadges.length > 0 && (
                <div className="mb-5">
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mb-2.5 uppercase tracking-wider px-1">Market Indicators</div>
                  <div className="flex flex-wrap gap-1.5 px-0.5">
                    {marketBadges.map((badge, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-slate-50 dark:bg-[#131324]/60 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-[#1F1F35]/50"
                      >
                        <span className="text-slate-400 dark:text-slate-500 font-semibold">{badge.label}:</span>
                        <span className="text-slate-800 dark:text-slate-200 font-black">{badge.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}


              {/* ── Footer Metadata ── */}
              <div className="pt-4 mt-2 border-t border-slate-100 dark:border-[#1F1F35]/50">
                <div className="flex justify-between items-center text-[11px] text-slate-400 dark:text-slate-100">
                  <span>
                    {signal?.webhookConfig?.name ? `Strategy: ${signal.webhookConfig.name}` : (signal?.strategyName ? `Strategy: ${signal.strategyName}` : "")}
                  </span>
                  <span>
                    {signal?.createdAt ? `Received: ${signal?.alertTimestamp || new Date(signal.createdAt).toLocaleString()}` : ""}
                  </span>
                </div>
              </div>
            </>

          </DialogBody>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ── Create Webhook Dialog ───────────────────────────────────────────

const CreateWebhookDialog = ({ isOpen, onClose, refetch }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [createWebhook, { isLoading }] = useCreateAdminTvWebhookMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      await createWebhook({
        name: name.trim(),
        description: description.trim(),
      }).unwrap();
      toast.success("Webhook created!");
      setName("");
      setDescription("");
      refetch();
      onClose();
    } catch {
      toast.error("Failed to create webhook");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-5 max-w-md">
        <DialogHeader>
          <DialogTitle>Create Webhook</DialogTitle>
          <DialogDescription>
            Create a new TradingView webhook configuration
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-5 px-0 py-5">
          <form onSubmit={handleSubmit} id="create-webhook-form">
            <div className="flex flex-col gap-1 mb-4">
              <label className="form-label text-gray-900">
                Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. BTC Scalping Strategy"
                className="input input-md w-full"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a description for webhook"
                className="textarea w-full min-h-[80px] mt-2"
                rows={3}
              />
            </div>
          </form>
        </div>
        <div className="flex border-gray-200 border-t justify-end py-5 rounded-b dark:border-gray-200 gap-3">
          <button type="button" className="btn btn-light" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            form="create-webhook-form"
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? "Creating..." : "Create Webhook"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ── Edit Webhook Dialog ─────────────────────────────────────────────

const EditWebhookDialog = ({ isOpen, onClose, config, refetch }) => {
  const [name, setName] = useState(config.name || "");
  const [description, setDescription] = useState(config.description || "");
  const [isEnabled, setIsEnabled] = useState(config.isEnabled);
  const [updateWebhook, { isLoading }] = useUpdateAdminTvWebhookMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      await updateWebhook({
        id: config._id,
        name: name.trim(),
        description: description.trim(),
        isEnabled,
      }).unwrap();
      toast.success("Webhook updated!");
      refetch();
      onClose();
    } catch {
      toast.error("Failed to update webhook");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-5 max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Webhook</DialogTitle>
          <DialogDescription>
            Update webhook configuration settings
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-5 px-0 py-5">
          <form onSubmit={handleSubmit} id="edit-webhook-form">
            <div className="flex flex-col gap-1 mb-4">
              <label className="form-label text-gray-900">
                Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input input-md w-full"
                required
              />
            </div>
            <div className="flex flex-col gap-1 mb-4">
              <label className="form-label text-gray-900">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="textarea w-full min-h-[80px]"
                rows={3}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="checkbox-group">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={isEnabled}
                  onChange={(e) => setIsEnabled(e.target.checked)}
                />
                <span className="checkbox-label">Enabled</span>
              </label>
            </div>
          </form>
        </div>
        <div className="flex border-gray-200 border-t justify-end py-5 rounded-b dark:border-gray-200 gap-3">
          <button type="button" className="btn btn-light" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            form="edit-webhook-form"
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ── Delete Webhook Dialog ───────────────────────────────────────────

const DeleteWebhookDialog = ({ isOpen, onClose, config, refetch }) => {
  const [deleteWebhook, { isLoading }] = useDeleteAdminTvWebhookMutation();

  const handleDelete = async () => {
    try {
      await deleteWebhook(config._id).unwrap();
      toast.success("Webhook deleted");
      refetch();
      onClose();
    } catch {
      toast.error("Failed to delete webhook");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-5 max-w-[500px]">
        <VisuallyHidden>
          <DialogTitle>Delete Webhook</DialogTitle>
        </VisuallyHidden>
        <div className="text-center">
          <i className="ki-filled text-3xl ki-trash text-gray-500 dark:text-gray-700 mb-3.5 mx-auto"></i>
          <p className="mb-4 text-gray-700 dark:text-gray-700 text-center">
            Are you sure you want to delete{" "}
            <strong>"{config.name}"</strong>? This action cannot be undone, and
            any TradingView alerts pointing to this webhook URL will stop
            working.
          </p>
        </div>
        <div className="flex justify-center items-center space-x-4">
          <button className="btn btn-light" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-danger"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Yes, I'm sure"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ── Regenerate Secret Dialog ────────────────────────────────────────

const RegenerateSecretDialog = ({ isOpen, onClose, config, refetch }) => {
  const [regenerateSecret, { isLoading }] =
    useRegenerateWebhookSecretMutation();

  const handleRegenerate = async () => {
    try {
      await regenerateSecret(config._id).unwrap();
      toast.success("Secret regenerated successfully");
      refetch();
      onClose();
    } catch {
      toast.error("Failed to regenerate secret");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-5 max-w-[500px]">
        <VisuallyHidden>
          <DialogTitle>Regenerate Secret</DialogTitle>
        </VisuallyHidden>
        <div className="text-center">
          <i className="ki-filled text-3xl ki-arrows-circle text-gray-500 dark:text-gray-700 mb-3.5 mx-auto"></i>
          <p className="mb-4 text-gray-700 dark:text-gray-700 text-center">
            Are you sure you want to regenerate the secret for{" "}
            <strong>"{config.name}"</strong>? The old webhook URL will stop
            working immediately, and you will need to update the URL in your
            TradingView alerts.
          </p>
        </div>
        <div className="flex justify-center items-center space-x-4">
          <button className="btn btn-light" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-warning"
            onClick={handleRegenerate}
            disabled={isLoading}
          >
            {isLoading ? "Regenerating..." : "Yes, Regenerate"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ── Delete Signal Dialog ─────────────────────────────────────────────

const DeleteSignalDialog = ({ isOpen, onClose, signal, refetch }) => {
  const [deleteSignal, { isLoading }] = useDeleteSignalMutation();

  const handleDelete = async () => {
    try {
      await deleteSignal(signal._id).unwrap();
      toast.success("Signal deleted successfully");
      refetch();
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete signal");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-5 max-w-[500px]">
        <VisuallyHidden>
          <DialogTitle>Delete Alert/Signal</DialogTitle>
        </VisuallyHidden>
        <div className="text-center">
          <i className="ki-filled text-3xl ki-trash text-gray-500 dark:text-gray-700 mb-3.5 mx-auto"></i>
          <p className="mb-4 text-gray-700 dark:text-gray-700 text-center">
            Are you sure you want to delete the alert/signal for{" "}
            <strong>"{signal.symbol || "unknown"}"</strong>?
          </p>
        </div>
        <div className="flex justify-center items-center space-x-4">
          <button className="btn btn-light" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-danger"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Yes, I'm sure"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminTvWebhookPage;
