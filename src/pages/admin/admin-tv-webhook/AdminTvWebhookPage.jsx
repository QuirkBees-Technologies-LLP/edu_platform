import React, { useState, useCallback, Fragment } from "react";
import {
  useGetAdminTvWebhooksQuery,
  useCreateAdminTvWebhookMutation,
  useUpdateAdminTvWebhookMutation,
  useDeleteAdminTvWebhookMutation,
  useRegenerateWebhookSecretMutation,
  useGetWebhookSignalsQuery,
  useGetDeliveryHistoryQuery,
  useRetrySignalNotificationMutation,
} from "../../../store/api/admin/adminTvWebhookApiSlice";
import { toast } from "sonner";
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  RefreshCw,
  Eye,
  ChevronLeft,
  Search,
  Check,
  X,
  RotateCcw,
  ExternalLink,
  Activity,
  Bell,
  ChartLine,
  Clock,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

// ── Signal Type Colors ──────────────────────────────────────────────
const signalTypeColors = {
  BUY: { bg: "#10b98120", text: "#10b981", label: "BUY" },
  SELL: { bg: "#ef444420", text: "#ef4444", label: "SELL" },
  LONG: { bg: "#3b82f620", text: "#3b82f6", label: "LONG" },
  SHORT: { bg: "#f9731620", text: "#f97316", label: "SHORT" },
  CLOSE: { bg: "#6b728020", text: "#6b7280", label: "CLOSE" },
  INFO: { bg: "#8b5cf620", text: "#8b5cf6", label: "INFO" },
  OTHER: { bg: "#64748b20", text: "#64748b", label: "OTHER" },
};

const statusColors = {
  sent: { bg: "#10b98120", text: "#10b981" },
  partial: { bg: "#f9731620", text: "#f97316" },
  failed: { bg: "#ef444420", text: "#ef4444" },
  pending: { bg: "#3b82f620", text: "#3b82f6" },
  processing: { bg: "#8b5cf620", text: "#8b5cf6" },
  delivered: { bg: "#10b98120", text: "#10b981" },
  skipped: { bg: "#64748b20", text: "#64748b" },
};

const StatusBadge = ({ status }) => {
  const color = statusColors[status] || statusColors.pending;
  return (
    <span
      style={{
        background: color.bg,
        color: color.text,
        padding: "2px 10px",
        borderRadius: "9999px",
        fontSize: "12px",
        fontWeight: 600,
        textTransform: "uppercase",
      }}
    >
      {status}
    </span>
  );
};

const SignalTypeBadge = ({ type }) => {
  const color = signalTypeColors[type] || signalTypeColors.OTHER;
  return (
    <span
      style={{
        background: color.bg,
        color: color.text,
        padding: "2px 10px",
        borderRadius: "9999px",
        fontSize: "12px",
        fontWeight: 600,
      }}
    >
      {color.label}
    </span>
  );
};

// ── Main Admin Page ─────────────────────────────────────────────────

const AdminTvWebhookPage = () => {
  const [view, setView] = useState("configs"); // "configs" | "signals" | "delivery"
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [deletingConfig, setDeletingConfig] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  return (
    <div className="p-6 max-w-[1400px] mx-auto text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {view !== "configs" && (
            <button
              onClick={() => {
                setView("configs");
                setSelectedConfig(null);
              }}
              className="bg-white dark:bg-[#131324] hover:bg-slate-50 dark:hover:bg-[#1C1C30] border border-slate-200 dark:border-[#1F1F35] rounded-xl p-2 cursor-pointer flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <ChartLine
                size={24}
                className="text-blue-500 mr-1.5 align-middle inline-block"
              />
              {view === "configs" && "TradingView Webhooks"}
              {view === "signals" && `Signals — ${selectedConfig?.name}`}
              {view === "delivery" && `Delivery — ${selectedConfig?.name}`}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {view === "configs" &&
                "Manage webhook configurations for TradingView alerts"}
              {view === "signals" && "View received trading signals"}
              {view === "delivery" && "FCM notification delivery history"}
            </p>
          </div>
        </div>
        {view === "configs" && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl px-4 py-2.5 shadow-md shadow-blue-500/20 transition-colors border-none cursor-pointer"
          >
            <Plus size={18} /> New Webhook
          </button>
        )}
      </div>

      {/* Views */}
      {view === "configs" && (
        <ConfigsView
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          page={page}
          setPage={setPage}
          onViewSignals={(config) => {
            setSelectedConfig(config);
            setView("signals");
          }}
          onViewDelivery={(config) => {
            setSelectedConfig(config);
            setView("delivery");
          }}
          onEdit={(config) => {
            setEditingConfig(config);
            setShowEditModal(true);
          }}
          onDelete={(config) => {
            setDeletingConfig(config);
          }}
        />
      )}
      {view === "signals" && selectedConfig && (
        <SignalsView configId={selectedConfig._id} />
      )}
      {view === "delivery" && selectedConfig && (
        <DeliveryView configId={selectedConfig._id} />
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateWebhookModal onClose={() => setShowCreateModal(false)} />
      )}
      {showEditModal && editingConfig && (
        <EditWebhookModal
          config={editingConfig}
          onClose={() => {
            setShowEditModal(false);
            setEditingConfig(null);
          }}
        />
      )}
      {deletingConfig && (
        <DeleteWebhookModal
          config={deletingConfig}
          onClose={() => setDeletingConfig(null)}
        />
      )}
    </div>
  );
};

// ── Configs List View ───────────────────────────────────────────────

const ConfigsView = ({
  searchTerm,
  setSearchTerm,
  page,
  setPage,
  onViewSignals,
  onViewDelivery,
  onEdit,
  onDelete,
}) => {
  const { data, isLoading, isFetching } = useGetAdminTvWebhooksQuery({
    page,
    limit: 20,
    search: searchTerm,
  });
  const [regenerateSecret] = useRegenerateWebhookSecretMutation();

  const handleRegenerate = async (id) => {
    if (!window.confirm("Regenerate secret? The old webhook URL will stop working."))
      return;
    try {
      await regenerateSecret(id).unwrap();
      toast.success("Secret regenerated");
    } catch {
      toast.error("Failed to regenerate");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const configs = data?.data || [];
  const pagination = data?.pagination;

  return (
    <>
      {/* Search */}
      <div className="mb-4 flex items-center gap-2 bg-slate-50 dark:bg-[#131324] border border-slate-200 dark:border-[#202038] rounded-xl px-4 py-2 max-w-[400px] shadow-sm">
        <Search size={18} className="text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          placeholder="Search webhooks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-none outline-none bg-transparent text-sm w-full text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500">
          Loading...
        </div>
      ) : configs.length === 0 ? (
        <div className="text-center py-20 px-5 bg-slate-50 dark:bg-[#131324]/20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-[#202038]">
          <ChartLine size={48} className="text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="text-slate-600 dark:text-slate-400 font-bold mb-2 text-base">No Webhooks Yet</h3>
          <p className="text-slate-400 dark:text-slate-500 text-sm">
            Create your first webhook to start receiving TradingView signals
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {configs.map((config) => (
            <div
              key={config._id}
              className="bg-white dark:bg-[#0F0F1A] border border-slate-200 dark:border-[#1F1F35] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex justify-between items-start flex-wrap gap-3">
                {/* Left */}
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {config.name}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        config.isEnabled
                          ? "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20"
                          : "bg-red-500/10 text-red-500 dark:bg-red-500/20"
                      }`}
                    >
                      {config.isEnabled ? "ACTIVE" : "DISABLED"}
                    </span>
                  </div>
                  {config.description && (
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 mb-2.5">
                      {config.description}
                    </p>
                  )}
                  {/* Webhook URL */}
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#131324] border border-slate-100 dark:border-[#1F1F35]/50 rounded-xl px-3 py-2.5 mb-3">
                    <code className="font-mono text-xs text-slate-600 dark:text-slate-300 truncate flex-1">
                      {config.webhookUrl || `POST /api/v1/common/tv-webhook/${config.webhookSecret}`}
                    </code>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          config.webhookUrl ||
                            `/api/v1/common/tv-webhook/${config.webhookSecret}`
                        )
                      }
                      className="bg-transparent border-none cursor-pointer p-1 flex hover:opacity-80"
                      title="Copy URL"
                    >
                      <Copy size={14} className="text-slate-400 dark:text-slate-500" />
                    </button>
                  </div>
                  {/* Stats */}
                  <div className="flex gap-4 text-xs text-slate-400 dark:text-slate-500 mt-2">
                    <span className="flex items-center gap-1.5">
                      <Activity size={14} /> {config.signalCount || 0} signals
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} />{" "}
                      {new Date(config.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap items-center">
                  <button
                    onClick={() => onViewSignals(config)}
                    className="bg-slate-50 dark:bg-[#131324] hover:bg-slate-100 dark:hover:bg-[#1C1C30] border border-slate-200 dark:border-[#1F1F35] rounded-xl p-2 cursor-pointer flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors"
                    title="View Signals"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => onViewDelivery(config)}
                    className="bg-slate-50 dark:bg-[#131324] hover:bg-slate-100 dark:hover:bg-[#1C1C30] border border-slate-200 dark:border-[#1F1F35] rounded-xl p-2 cursor-pointer flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors"
                    title="Delivery History"
                  >
                    <Bell size={16} />
                  </button>
                  <button
                    onClick={() => handleRegenerate(config._id)}
                    className="bg-slate-50 dark:bg-[#131324] hover:bg-slate-100 dark:hover:bg-[#1C1C30] border border-slate-200 dark:border-[#1F1F35] rounded-xl p-2 cursor-pointer flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors"
                    title="Regenerate Secret"
                  >
                    <RefreshCw size={16} />
                  </button>
                  <button
                    onClick={() => onEdit(config)}
                    className="bg-slate-50 dark:bg-[#131324] hover:bg-slate-100 dark:hover:bg-[#1C1C30] border border-slate-200 dark:border-[#1F1F35] rounded-xl p-2 cursor-pointer flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(config)}
                    className="bg-slate-50 dark:bg-[#131324] hover:bg-red-50 dark:hover:bg-red-500/10 border border-slate-200 dark:border-[#1F1F35] rounded-xl p-2 cursor-pointer flex items-center justify-center text-slate-500 dark:text-red-400 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: pagination.totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                page === i + 1
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white dark:bg-[#0F0F1A] border-slate-200 dark:border-[#1F1F35] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#131324]"
              } cursor-pointer`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </>
  );
};

// ── Signals View ────────────────────────────────────────────────────

const SignalsView = ({ configId }) => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetWebhookSignalsQuery({
    id: configId,
    page,
    limit: 20,
  });

  const signals = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="bg-white dark:bg-[#0F0F1A] border border-slate-200 dark:border-[#1F1F35] rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-[#131324] border-b border-slate-200 dark:border-[#1F1F35]">
              {["Symbol", "Type", "Entry Price", "SL", "TP", "Timeframe", "Delivery", "Notification", "Received"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3.5 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-xs text-slate-400 dark:text-slate-500">
                  Loading...
                </td>
              </tr>
            ) : signals.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-xs text-slate-400 dark:text-slate-500">
                  No signals received yet
                </td>
              </tr>
            ) : (
              signals.map((signal) => (
                <tr
                  key={signal._id}
                  className="border-b border-slate-100 dark:border-[#1F1F35]/30 hover:bg-slate-50/50 dark:hover:bg-[#131324]/20 transition-colors"
                >
                  <td className="px-4 py-3 text-xs text-slate-800 dark:text-slate-200">
                    <strong className="text-slate-900 dark:text-white block">{signal.symbol || "—"}</strong>
                    {signal.exchange && (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                        {signal.exchange}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <SignalTypeBadge type={signal.signalType} />
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-800 dark:text-slate-200">{signal.entryPrice || "—"}</td>
                  <td className="px-4 py-3 text-xs text-slate-800 dark:text-slate-200">{signal.stopLoss || "—"}</td>
                  <td className="px-4 py-3 text-xs text-slate-800 dark:text-slate-200">{signal.takeProfit || "—"}</td>
                  <td className="px-4 py-3 text-xs text-slate-800 dark:text-slate-200">{signal.timeframe || "—"}</td>
                  <td className="px-4 py-3 text-xs">
                    <StatusBadge status={signal.deliveryStatus} />
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <StatusBadge status={signal.notificationStatus} />
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400 dark:text-slate-500">
                    {new Date(signal.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 p-4 border-t border-slate-200 dark:border-[#1F1F35]">
          {Array.from({ length: pagination.totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-all ${
                page === i + 1
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white dark:bg-[#0F0F1A] border-slate-200 dark:border-[#1F1F35] text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#131324]"
              } cursor-pointer`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Delivery History View ───────────────────────────────────────────

const DeliveryView = ({ configId }) => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetDeliveryHistoryQuery({
    id: configId,
    page,
    limit: 20,
  });
  const [retryNotification, { isLoading: retrying }] =
    useRetrySignalNotificationMutation();

  const logs = data?.data || [];
  const pagination = data?.pagination;

  const handleRetry = async (signalId) => {
    try {
      const result = await retryNotification(signalId).unwrap();
      toast.success(`Retry complete: ${result.data?.totalSuccess || 0} succeeded`);
    } catch {
      toast.error("Retry failed");
    }
  };

  return (
    <div className="bg-white dark:bg-[#0F0F1A] border border-slate-200 dark:border-[#1F1F35] rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-[#131324] border-b border-slate-200 dark:border-[#1F1F35]">
              {["Signal", "Batch", "Tokens", "Success", "Failed", "Status", "Retries", "Date", "Actions"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3.5 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-xs text-slate-400 dark:text-slate-500">
                  Loading...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-xs text-slate-400 dark:text-slate-500">
                  No delivery logs yet
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id} className="border-b border-slate-100 dark:border-[#1F1F35]/30 hover:bg-slate-50/50 dark:hover:bg-[#131324]/20 transition-colors">
                  <td className="px-4 py-3 text-xs text-slate-800 dark:text-slate-200">
                    <div>
                      <strong className="text-slate-900 dark:text-white">{log.signal?.symbol || "—"}</strong>
                      {log.signal?.signalType && (
                        <span className="ml-1.5">
                          <SignalTypeBadge type={log.signal.signalType} />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-800 dark:text-slate-200">#{log.batchIndex + 1}</td>
                  <td className="px-4 py-3 text-xs text-slate-800 dark:text-slate-200">{log.tokenCount}</td>
                  <td className="px-4 py-3 text-xs text-emerald-500 font-semibold">{log.successCount}</td>
                  <td className={`px-4 py-3 text-xs font-semibold ${log.failureCount > 0 ? "text-red-500" : "text-slate-400 dark:text-slate-500"}`}>{log.failureCount}</td>
                  <td className="px-4 py-3 text-xs">
                    <StatusBadge status={log.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-800 dark:text-slate-200">{log.retryCount}</td>
                  <td className="px-4 py-3 text-xs text-slate-400 dark:text-slate-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {(log.status === "failed" || log.status === "partial") && (
                      <button
                        onClick={() => handleRetry(log.signal?._id)}
                        disabled={retrying}
                        className="flex items-center gap-1.5 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-none rounded-lg px-3 py-1.5 cursor-pointer text-xs font-bold hover:bg-amber-200 dark:hover:bg-amber-500/30 transition-colors"
                      >
                        <RotateCcw size={12} /> Retry
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 p-4 border-t border-slate-200 dark:border-[#1F1F35]">
          {Array.from({ length: pagination.totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-all ${
                page === i + 1
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white dark:bg-[#0F0F1A] border-slate-200 dark:border-[#1F1F35] text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#131324]"
              } cursor-pointer`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Create Webhook Modal ────────────────────────────────────────────

const CreateWebhookModal = ({ onClose }) => {
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
      await createWebhook({ name: name.trim(), description: description.trim() }).unwrap();
      toast.success("Webhook created!");
      onClose();
    } catch {
      toast.error("Failed to create webhook");
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4">
          Create Webhook
        </h2>
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. BTC Scalping Strategy"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#202038] text-sm bg-white dark:bg-[#0F0F1A] text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            required
          />
        </div>
        <div className="mb-5">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#202038] text-sm bg-white dark:bg-[#0F0F1A] text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all min-h-[80px] resize-y"
          />
        </div>
        <div className="flex gap-2.5 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#1F1F35] bg-white dark:bg-[#0F0F1A] text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-[#131324] cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl border-none bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm cursor-pointer shadow-md shadow-blue-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating..." : "Create Webhook"}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
};

// ── Edit Webhook Modal ──────────────────────────────────────────────

const EditWebhookModal = ({ config, onClose }) => {
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
      onClose();
    } catch {
      toast.error("Failed to update webhook");
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4">
          Edit Webhook
        </h2>
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#202038] text-sm bg-white dark:bg-[#0F0F1A] text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#202038] text-sm bg-white dark:bg-[#0F0F1A] text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all min-h-[80px] resize-y"
          />
        </div>
        <div className="mb-5">
          <label className="flex items-center gap-2.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
              className="w-4.5 h-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            Enabled
          </label>
        </div>
        <div className="flex gap-2.5 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#1F1F35] bg-white dark:bg-[#0F0F1A] text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-[#131324] cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl border-none bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm cursor-pointer shadow-md shadow-blue-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
};

// ── Delete Webhook Modal ────────────────────────────────────────────

const DeleteWebhookModal = ({ config, onClose }) => {
  const [deleteWebhook, { isLoading }] = useDeleteAdminTvWebhookMutation();

  const handleDelete = async () => {
    try {
      await deleteWebhook(config._id).unwrap();
      toast.success("Webhook deleted");
      onClose();
    } catch {
      toast.error("Failed to delete webhook");
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="text-center py-4">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-500/10 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">
          Delete Webhook
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Are you sure you want to delete <strong className="text-slate-800 dark:text-slate-200">"{config.name}"</strong>?
          This action cannot be undone, and any TradingView alerts pointing to this webhook URL will stop working.
        </p>
        <div className="flex gap-2.5 justify-center">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#1F1F35] bg-white dark:bg-[#0F0F1A] text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-[#131324] cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl border-none bg-red-600 hover:bg-red-700 text-white font-bold text-sm cursor-pointer shadow-md shadow-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Deleting..." : "Delete Webhook"}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
};

// ── Modal Overlay ───────────────────────────────────────────────────

const ModalOverlay = ({ onClose, children }) => (
  <div
    onClick={onClose}
    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[1000] p-5"
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="bg-white dark:bg-[#0F0F1A] rounded-[24px] p-6 max-w-[500px] w-full border border-slate-100 dark:border-[#1F1F35] shadow-2xl"
    >
      {children}
    </div>
  </div>
);

// ── Shared Styles ───────────────────────────────────────────────────

const actionBtnStyle = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "8px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  color: "#64748b",
  transition: "all 0.15s",
};

const cellStyle = {
  padding: "12px 16px",
  fontSize: "13px",
  color: "#334155",
};

const labelStyle = {
  display: "block",
  fontSize: "13px",
  fontWeight: 600,
  color: "#374151",
  marginBottom: "6px",
};

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
};

const cancelBtnStyle = {
  padding: "10px 20px",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  background: "white",
  color: "#64748b",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: "14px",
};

const submitBtnStyle = {
  padding: "10px 20px",
  borderRadius: "8px",
  border: "none",
  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
  color: "white",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: "14px",
  boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)",
};

export default AdminTvWebhookPage;
