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
};

// ── Main Admin Page ─────────────────────────────────────────────────

const formatPrice = (value) => {
  if (value == null) return "—";
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  return num.toFixed(4);
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
      className="relative group inline-flex items-center gap-2.5 px-3 py-1.5 rounded-md hover:bg-secondary-active dark:hover:bg-coal-300 border border-transparent hover:border-gray-200 dark:hover:border-coal-100 transition-all duration-200 cursor-pointer"
    >
      <span
        data-testid="webhook-url-text"
        className="font-mono text-sm text-gray-800 group-hover:text-black dark:group-hover:text-white whitespace-nowrap select-all"
        onDoubleClick={handleCopy}
      >
        {url}
      </span>
      <div className="flex items-center">
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
            <TooltipContent side="top" align="center" className="z-[9999] bg-gray-50 dark:bg-gray-200 text-gray-800 dark:text-white border-gray-800 px-2.5 py-1 text-xs rounded shadow-lg">
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
        meta: { headerClassName: "min-w-[550px]", cellClassName: "min-w-[550px]" },
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
            onViewDelivery={onViewDelivery}
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
  onViewDelivery,
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
      <MenuItem onClick={() => onViewDelivery(config)}>
        <MenuLink>
          <MenuIcon>
            <KeenIcon icon="notification-on" />
          </MenuIcon>
          <MenuTitle>Delivery History</MenuTitle>
        </MenuLink>
      </MenuItem>
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

// ── Signals View ────────────────────────────────────────────────────

const SignalsView = ({ config, onBack }) => {
  const [fetchSignals, { isLoading }] = useLazyGetWebhookSignalsQuery();

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
            <span className="font-medium text-sm text-gray-900">
              {row.original.symbol || "—"}
            </span>
            {row.original.exchange && (
              <span className="text-2xs text-gray-500">
                {row.original.exchange}
              </span>
            )}
          </div>
        ),
        meta: { headerClassName: "min-w-[120px]", cellClassName: "min-w-[120px]" },
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
        meta: { headerClassName: "w-[90px]", cellClassName: "w-[90px]" },
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
        meta: { headerClassName: "min-w-[100px]", cellClassName: "min-w-[100px]" },
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
        meta: { headerClassName: "w-[80px]", cellClassName: "w-[80px]" },
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
        meta: { headerClassName: "w-[80px]", cellClassName: "w-[80px]" },
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
        meta: { headerClassName: "w-[100px]", cellClassName: "w-[100px]" },
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
        meta: { headerClassName: "w-[100px]", cellClassName: "w-[100px]" },
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
        meta: { headerClassName: "w-[110px]", cellClassName: "w-[110px]" },
      },
      {
        accessorFn: (row) => row.createdAt,
        id: "received",
        header: ({ column }) => (
          <DataGridColumnHeader title="Received" column={column} />
        ),
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-gray-600 text-2sm">
            {new Date(row.original.createdAt).toLocaleString()}
          </span>
        ),
        meta: { headerClassName: "min-w-[150px]", cellClassName: "min-w-[150px]" },
      },
    ],
    []
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
                className="form-control input input-md w-full"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description..."
                className="form-control input input-md w-full min-h-[80px]"
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
                className="form-control input input-md w-full"
                required
              />
            </div>
            <div className="flex flex-col gap-1 mb-4">
              <label className="form-label text-gray-900">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-control input input-md w-full min-h-[80px]"
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

export default AdminTvWebhookPage;
