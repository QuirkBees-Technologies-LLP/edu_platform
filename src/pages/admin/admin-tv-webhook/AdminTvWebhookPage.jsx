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
import { Copy, Target, ShieldAlert, Crosshair, Activity, Pencil, Check, X } from "lucide-react";

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
            Manage webhook configurations for TradingView alerts
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
                View received trading signals for this webhook
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
    e.stopPropagation();
    if (value != null) {
      navigator.clipboard.writeText(formatPrice(value).toString());
      toast.success(`${label} copied!`);
    }
  };

  return (
    <div
      onClick={handleCopy}
      className={`group flex-1 flex flex-col p-4 rounded-xl border border-gray-100 dark:border-coal-200 hover:border-gray-200 dark:hover:border-coal-100 transition-all cursor-pointer select-none ${bgClass}`}
      title={`Click to copy ${label}`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
        {Icon && <Icon size={12} className="text-slate-400" />}
      </div>
      <div className="flex items-baseline justify-between">
        <span className={`text-[15px] font-black tracking-tight ${colorClass}`}>
          {value != null ? formatPrice(value) : "—"}
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
    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
    <span className="text-[12px] font-black text-slate-900 dark:text-white truncate">{value || "—"}</span>
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
    customVariablesStr: ""
  });

  React.useEffect(() => {
    setIsEditing(initialEditMode);
  }, [initialEditMode, signal]);

  React.useEffect(() => {
    if (signal) {
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
        customVariablesStr: signal.customVariables ? JSON.stringify(signal.customVariables, null, 2) : "{}"
      });
    }
  }, [signal, isEditing]);

  if (!signal) return null;

  const type = signal.signalType || "OTHER";
  const badgeClass = signalTypeBadgeMap[type] || "badge-secondary";

  // Collect all custom / extra fields dynamically
  const customVars = signal.customVariables || {};
  const processedExtra = signal.processedPayload || {};

  const formatKey = (key) =>
    key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  // Extract exit levels from customVariables
  const tpLevels = [];
  if (signal.takeProfit != null) {
    tpLevels.push({ label: "TP 1", value: signal.takeProfit });
  }

  const tpKeys = ["tp2", "tp3", "tp4", "takeprofit2", "takeprofit3", "takeprofit4", "take_profit2", "take_profit3", "take_profit4"];
  Object.entries(customVars).forEach(([key, val]) => {
    const normKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (tpKeys.includes(normKey) || (normKey.startsWith("tp") && /^\d+$/.test(normKey.slice(2)))) {
      const num = parseInt(normKey.replace(/\D/g, ""), 10);
      if (num > 1) {
        tpLevels.push({ label: `TP ${num}`, value: val, key });
      }
    }
  });

  tpLevels.sort((a, b) => {
    const numA = parseInt(a.label.replace(/\D/g, ""), 10);
    const numB = parseInt(b.label.replace(/\D/g, ""), 10);
    return numA - numB;
  });

  // Extract context/market indicators to display as premium badges
  const badgeKeys = [
    "session", "trend", "adx", "strength", "volume_delta", "volume",
    "poc", "rrr", "lot_size", "pnl", "supertrend", "signal_strength"
  ];
  const marketBadges = [];
  const otherVars = {};

  Object.entries(customVars).forEach(([key, val]) => {
    const normKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
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
      takeProfit,
      timeframe,
      customVariablesStr,
    } = formData;

    if (entryPrice !== "" && entryPrice !== null && isNaN(Number(entryPrice))) {
      toast.error("Entry Price must be a valid number");
      return;
    }
    if (stopLoss !== "" && stopLoss !== null && isNaN(Number(stopLoss))) {
      toast.error("Stop Loss must be a valid number");
      return;
    }
    if (takeProfit !== "" && takeProfit !== null && isNaN(Number(takeProfit))) {
      toast.error("Take Profit must be a valid number");
      return;
    }

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
        signalId: signal._id,
        symbol: symbol.trim() || null,
        exchange: exchange.trim() || null,
        market: market.trim() || null,
        strategyName: strategyName.trim() || null,
        alertName: alertName.trim() || null,
        alertMessage: alertMessage || null,
        signalType,
        entryPrice: entryPrice === "" ? null : Number(entryPrice),
        stopLoss: stopLoss === "" ? null : Number(stopLoss),
        takeProfit: takeProfit === "" ? null : Number(takeProfit),
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
      <DialogContent className="p-0 max-w-[650px] max-h-[85vh] overflow-y-auto flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-coal-100 flex-shrink-0">
          <div className="flex items-center justify-between w-full pr-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <KeenIcon icon="chart-line-star" className="text-primary text-lg" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white m-0">
                  {isEditing ? "Edit TradingView Alert" : (signal.symbol || "Signal Detail")}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Detailed view of the trading signal
                </DialogDescription>
                {!isEditing && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`badge badge-sm badge-outline ${badgeClass}`}>
                      {signalTypeLabel(type)}
                    </span>
                    {signal.strategyName && (
                      <span className="badge badge-sm badge-outline badge-primary">
                        {signal.strategyName}
                      </span>
                    )}
                    {signal.timeframe && (
                      <span className="text-2xs text-gray-400 bg-gray-50 dark:bg-coal-300 px-1.5 py-0.5 rounded">
                        {signal.timeframe}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isUpdating}
                    className="btn btn-sm btn-success flex items-center gap-1.5"
                    title="Save Changes"
                  >
                    <Check size={14} />
                    <span>{isUpdating ? "Saving..." : "Save"}</span>
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="btn btn-sm btn-light flex items-center gap-1.5"
                    title="Cancel Edit"
                  >
                    <X size={14} />
                    <span>Cancel</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-sm btn-light flex items-center gap-1.5"
                  title="Edit Alert"
                >
                  <Pencil size={14} />
                  <span>Edit</span>
                </button>
              )}
            </div>
          </div>
        </DialogHeader>

        <DialogBody className="px-6 py-5 overflow-y-auto flex-1">
          {isEditing ? (
            <div className="flex flex-col gap-4 text-slate-800 dark:text-white">
              {/* Row 1: Symbol & Timeframe */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="form-label text-slate-500 dark:text-slate-400 font-bold text-2xs uppercase tracking-wider">Symbol</label>
                  <input
                    type="text"
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                    placeholder="e.g. BTCUSDT"
                    className="input input-md w-full bg-white dark:bg-coal-600 text-slate-900 dark:text-white border-gray-250 dark:border-coal-200"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="form-label text-slate-500 dark:text-slate-400 font-bold text-2xs uppercase tracking-wider">Timeframe</label>
                  <input
                    type="text"
                    value={formData.timeframe}
                    onChange={(e) => setFormData({ ...formData, timeframe: e.target.value })}
                    placeholder="e.g. 15m, 1h, 4h, D"
                    className="input input-md w-full bg-white dark:bg-coal-600 text-slate-900 dark:text-white border-gray-250 dark:border-coal-200"
                  />
                </div>
              </div>

              {/* Row 2: Signal Type & Strategy Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="form-label text-slate-500 dark:text-slate-400 font-bold text-2xs uppercase tracking-wider">Signal Type</label>
                  <select
                    value={formData.signalType}
                    onChange={(e) => setFormData({ ...formData, signalType: e.target.value })}
                    className="select select-md w-full bg-white dark:bg-coal-600 text-slate-900 dark:text-white border-gray-250 dark:border-coal-200"
                  >
                    <option value="BUY">BUY</option>
                    <option value="SELL">SELL</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="form-label text-slate-500 dark:text-slate-400 font-bold text-2xs uppercase tracking-wider">Strategy Name</label>
                  <input
                    type="text"
                    value={formData.strategyName}
                    onChange={(e) => setFormData({ ...formData, strategyName: e.target.value })}
                    placeholder="e.g. Bullseye, Supernova"
                    className="input input-md w-full bg-white dark:bg-coal-600 text-slate-900 dark:text-white border-gray-250 dark:border-coal-200"
                  />
                </div>
              </div>

              {/* Row 3: Entry Price, Stop Loss & Take Profit (TP1) */}
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="form-label text-slate-500 dark:text-slate-400 font-bold text-2xs uppercase tracking-wider">Entry Price</label>
                  <input
                    type="text"
                    value={formData.entryPrice}
                    onChange={(e) => setFormData({ ...formData, entryPrice: e.target.value })}
                    placeholder="e.g. 50000"
                    className="input input-md w-full bg-white dark:bg-coal-600 text-slate-900 dark:text-white border-gray-250 dark:border-coal-200"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="form-label text-slate-500 dark:text-slate-400 font-bold text-2xs uppercase tracking-wider">Stop Loss (SL)</label>
                  <input
                    type="text"
                    value={formData.stopLoss}
                    onChange={(e) => setFormData({ ...formData, stopLoss: e.target.value })}
                    placeholder="e.g. 49500"
                    className="input input-md w-full bg-white dark:bg-coal-600 text-slate-900 dark:text-white border-gray-250 dark:border-coal-200"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="form-label text-slate-500 dark:text-slate-400 font-bold text-2xs uppercase tracking-wider">Take Profit (TP1)</label>
                  <input
                    type="text"
                    value={formData.takeProfit}
                    onChange={(e) => setFormData({ ...formData, takeProfit: e.target.value })}
                    placeholder="e.g. 51000"
                    className="input input-md w-full bg-white dark:bg-coal-600 text-slate-900 dark:text-white border-gray-250 dark:border-coal-200"
                  />
                </div>
              </div>

              {/* Row 4: Exchange, Market & Alert Name */}
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="form-label text-slate-500 dark:text-slate-400 font-bold text-2xs uppercase tracking-wider">Exchange</label>
                  <input
                    type="text"
                    value={formData.exchange}
                    onChange={(e) => setFormData({ ...formData, exchange: e.target.value })}
                    placeholder="e.g. BINANCE, BYBIT"
                    className="input input-md w-full bg-white dark:bg-coal-600 text-slate-900 dark:text-white border-gray-250 dark:border-coal-200"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="form-label text-slate-500 dark:text-slate-400 font-bold text-2xs uppercase tracking-wider">Market</label>
                  <input
                    type="text"
                    value={formData.market}
                    onChange={(e) => setFormData({ ...formData, market: e.target.value })}
                    placeholder="e.g. Crypto, Forex"
                    className="input input-md w-full bg-white dark:bg-coal-600 text-slate-900 dark:text-white border-gray-250 dark:border-coal-200"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="form-label text-slate-500 dark:text-slate-400 font-bold text-2xs uppercase tracking-wider">Alert Name</label>
                  <input
                    type="text"
                    value={formData.alertName}
                    onChange={(e) => setFormData({ ...formData, alertName: e.target.value })}
                    placeholder="e.g. Alert Long"
                    className="input input-md w-full bg-white dark:bg-coal-600 text-slate-900 dark:text-white border-gray-250 dark:border-coal-200"
                  />
                </div>
              </div>

              {/* Alert Message */}
              <div className="flex flex-col gap-1.5">
                <label className="form-label text-slate-500 dark:text-slate-400 font-bold text-2xs uppercase tracking-wider">TradingView Alert Message</label>
                <textarea
                  value={formData.alertMessage}
                  onChange={(e) => setFormData({ ...formData, alertMessage: e.target.value })}
                  placeholder="Paste raw alert message text here"
                  className="textarea w-full min-h-[100px] bg-white dark:bg-coal-600 text-slate-900 dark:text-white border-gray-250 dark:border-coal-200 font-mono text-[13px]"
                  rows={4}
                />
              </div>

              {/* Custom Variables (JSON Textarea) */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="form-label text-slate-500 dark:text-slate-400 font-bold text-2xs uppercase tracking-wider">
                    Custom Variables (JSON Object)
                  </label>
                  <span className="text-[10px] text-slate-400">e.g. tp2, tp3, tp4, lotSize</span>
                </div>
                <textarea
                  value={formData.customVariablesStr}
                  onChange={(e) => setFormData({ ...formData, customVariablesStr: e.target.value })}
                  placeholder='{\n  "tp2": 51500,\n  "tp3": 52000,\n  "lotSize": "0.1"\n}'
                  className="textarea w-full min-h-[120px] bg-white dark:bg-coal-600 text-slate-900 dark:text-white border-gray-250 dark:border-coal-200 font-mono text-[13px]"
                  rows={5}
                />
              </div>
            </div>
          ) : (
            <>
              {/* Core Price Levels Grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <PriceBlock
                  label="Entry Target"
                  value={signal.entryPrice}
                  colorClass="text-slate-900 dark:text-white"
                  bgClass="bg-gray-50/70 dark:bg-coal-300"
                  icon={Crosshair}
                />
                <PriceBlock
                  label="Stop Loss (Invalidation)"
                  value={signal.stopLoss}
                  colorClass="text-red-500 dark:text-[#ff3b30]"
                  bgClass="bg-red-50/30 dark:bg-red-950/10"
                  icon={ShieldAlert}
                />
              </div>

              {/* TP Target exits */}
              {tpLevels.length > 0 && (
                <div className="mb-5">
                  <div className="text-[10px] text-slate-400 font-bold mb-2.5 uppercase tracking-wider px-1">Take Profit Targets</div>
                  <div className="grid grid-cols-2 gap-2">
                    {tpLevels.map((tp, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          if (tp.value != null) {
                            navigator.clipboard.writeText(formatPrice(tp.value).toString());
                            toast.success(`${tp.label} copied!`);
                          }
                        }}
                        className="flex justify-between items-center p-3 rounded-xl bg-green-50/20 dark:bg-green-950/10 border border-green-100/30 dark:border-green-900/20 hover:border-green-300 dark:hover:border-green-800 transition-all cursor-pointer group"
                        title={`Click to copy ${tp.label}`}
                      >
                        <div className="flex items-center gap-2">
                          <Target size={12} className="text-green-500" />
                          <span className="text-[12px] font-bold text-slate-600 dark:text-slate-400">{tp.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[13px] font-black text-emerald-600 dark:text-emerald-400">
                            {tp.value != null ? formatPrice(tp.value) : "—"}
                          </span>
                          {tp.value != null && (
                            <Copy size={10} className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity ml-0.5" />
                          )}
                        </div>
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

              {/* Alert Message terminal block */}
              {signal.alertMessage && (
                <div className="mb-5 overflow-hidden rounded-xl border border-slate-200 dark:border-[#202038]">
                  <div className="flex justify-between items-center px-4 py-2 bg-slate-100/80 dark:bg-[#161626]/80 border-b border-slate-200 dark:border-[#202038] select-none">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">TradingView Alert Message</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(signal.alertMessage);
                        toast.success("Alert message copied!");
                      }}
                      className="p-1 hover:bg-slate-255 dark:hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      title="Copy message"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                  <div className="p-4 bg-slate-50/40 dark:bg-[#0E0E18]">
                    <p className="m-0 text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed font-mono whitespace-pre-wrap select-all">
                      {signal.alertMessage}
                    </p>
                  </div>
                </div>
              )}


              {/* Other Variables */}
              {Object.keys(otherVars).length > 0 && (
                <div className="mb-5">
                  <div className="text-[10px] text-slate-400 font-bold mb-2 uppercase tracking-wider px-1">Other Variables</div>
                  <div className="bg-gray-50/50 dark:bg-coal-300/50 rounded-xl border border-gray-100 dark:border-coal-100 px-4 py-1">
                    {Object.entries(otherVars).map(([key, val]) => (
                      <InfoRow key={key} label={formatKey(key)} value={typeof val === "object" ? JSON.stringify(val) : String(val)} />
                    ))}
                  </div>
                </div>
              )}

              {/* Extra Processed Fields */}
              {Object.keys(extraProcessed).length > 0 && (
                <div className="mb-5">
                  <div className="text-[10px] text-slate-400 font-bold mb-2 uppercase tracking-wider px-1">Extra Fields</div>
                  <div className="bg-gray-50/50 dark:bg-coal-300/50 rounded-xl border border-gray-100 dark:border-coal-100 px-4 py-1">
                    {Object.entries(extraProcessed).map(([key, val]) => (
                      <InfoRow key={key} label={formatKey(key)} value={typeof val === "object" ? JSON.stringify(val) : String(val)} />
                    ))}
                  </div>
                </div>
              )}

              {/* Collapsible Raw JSON payload */}
              {signal.rawPayload && (
                <div className="mb-5">
                  <button
                    onClick={() => setShowRaw(!showRaw)}
                    className="flex items-center gap-1.5 w-full text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 py-1.5 hover:bg-gray-150 dark:hover:bg-coal-200 rounded-lg transition-colors cursor-pointer justify-between"
                  >
                    <div className="flex items-center gap-1.5">
                      <Activity size={10} />
                      <span>Raw JSON Payload</span>
                    </div>
                    <span className="text-[10px]">{showRaw ? "Collapse [-]" : "Expand [+]"}</span>
                  </button>
                  {showRaw && (
                    <div className="relative mt-2 overflow-hidden rounded-xl border border-gray-200 dark:border-coal-100">
                      <div className="flex justify-between items-center px-4 py-1.5 bg-gray-50 dark:bg-coal-300 border-b border-gray-200 dark:border-coal-100">
                        <span className="text-[9px] font-mono text-gray-400">payload.json</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(signal.rawPayload, null, 2));
                            toast.success("Raw JSON copied!");
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                          title="Copy JSON"
                        >
                          <Copy size={11} />
                        </button>
                      </div>
                      <div className="p-3.5 bg-gray-900 text-gray-300 overflow-x-auto max-h-[200px]">
                        <pre className="m-0 text-[11px] leading-normal font-mono text-green-400/95 whitespace-pre-wrap break-all">
                          {JSON.stringify(signal.rawPayload, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Standard Metadata Grid */}
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-coal-100">
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 bg-gray-50/40 dark:bg-coal-300/40 p-4 rounded-xl border border-gray-100 dark:border-coal-200">
                  {signal.exchange && <MetaItem label="Exchange" value={signal.exchange} />}
                  {signal.market && <MetaItem label="Market" value={signal.market} />}
                  {signal.timeframe && <MetaItem label="Timeframe" value={signal.timeframe} />}
                  {signal.strategyName && <MetaItem label="Strategy" value={signal.strategyName} />}
                  {signal.webhookConfig?.name && <MetaItem label="Webhook Config" value={signal.webhookConfig.name} />}
                  {signal.alertName && <MetaItem label="Alert Name" value={signal.alertName} />}
                  <MetaItem label="Delivery Status" value={signal.deliveryStatus} />
                  <MetaItem label="Notification Status" value={signal.notificationStatus} />
                  <MetaItem label="Received At" value={signal.receivedAt ? new Date(signal.receivedAt).toLocaleString() : null} />
                  <MetaItem label="Processed At" value={signal.processedAt ? new Date(signal.processedAt).toLocaleString() : null} />
                  <MetaItem label="Created At" value={new Date(signal.createdAt).toLocaleString()} colSpan={2} />
                </div>
              </div>
            </>
          )}
        </DialogBody>
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
