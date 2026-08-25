import { useState } from "react";
import { toast } from "sonner";
import { KeenIcon } from "@/components";
import { Container } from "@/components/container";
import {
  Toolbar,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from "@/partials/toolbar";
import {
  useGetTvWebhookStatusQuery,
  useEnableTvWebhookMutation,
  useRotateTvWebhookMutation,
  useDisableTvWebhookMutation,
} from "../../../store/api/educator/educatorTvWebhookApiSlice";

const BASIC_TEMPLATE = `{
  "ticker": "{{ticker}}",
  "action": "BUY",
  "price": {{close}},
  "timeframe": "{{interval}}",
  "message": "Breakout above resistance"
}`;

const SCANNER_TEMPLATE = `{
  "ticker": "{{ticker}}",
  "action": "BUY",
  "price": {{close}},
  "timeframe": "{{interval}}",
  "scanner": "oversold_breakout",
  "message": "RSI < 30 + volume spike + golden cross"
}`;

const TvWebhookSettings = () => {
  const [webhookUrl, setWebhookUrl] = useState(null);
  const [showUrl, setShowUrl] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState("basic");
  const [confirmDisable, setConfirmDisable] = useState(false);

  // ── RTK Query hooks ────────────────────────────────────────────
  const { data: statusData, isLoading: isStatusLoading } =
    useGetTvWebhookStatusQuery();
  const [enableWebhook, { isLoading: isEnabling }] =
    useEnableTvWebhookMutation();
  const [rotateWebhook, { isLoading: isRotating }] =
    useRotateTvWebhookMutation();
  const [disableWebhook, { isLoading: isDisabling }] =
    useDisableTvWebhookMutation();

  const status = statusData?.data || { enabled: false, createdAt: null };
  const loading = isEnabling || isRotating || isDisabling;

  const handleEnable = async () => {
    try {
      const res = await enableWebhook().unwrap();
      setWebhookUrl(res.data.webhookUrl);
      setShowUrl(true);
      toast.success("Webhook enabled! Copy the URL below.");
    } catch (err) {
      const msg = err?.data?.message || "Failed to enable webhook";
      toast.error(msg);
    }
  };

  const handleRotate = async () => {
    try {
      const res = await rotateWebhook().unwrap();
      setWebhookUrl(res.data.webhookUrl);
      setShowUrl(true);
      toast.success(
        "Secret rotated! Update your TradingView alert with the new URL."
      );
    } catch (err) {
      const msg = err?.data?.message || "Failed to rotate secret";
      toast.error(msg);
    }
  };

  const handleDisable = async () => {
    try {
      await disableWebhook().unwrap();
      setWebhookUrl(null);
      setShowUrl(false);
      setConfirmDisable(false);
      toast.success("Webhook disabled successfully.");
    } catch (err) {
      const msg = err?.data?.message || "Failed to disable webhook";
      toast.error(msg);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (isStatusLoading) {
    return (
      <div className="container-fluid">
        <div className="flex items-center justify-center py-20">
          <i className="ki-filled ki-loading animate-spin text-2xl text-primary"></i>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text="TradingView Webhook" />
          <ToolbarDescription>
            Connect your TradingView alerts to automatically publish IQ Ideas
          </ToolbarDescription>
        </ToolbarHeading>
      </Toolbar>

      <Container>
        <div className="grid gap-5 lg:gap-7.5">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Webhook Status</h3>
              <span
                className={`badge badge-sm ${status.enabled
                  ? "badge-success"
                  : "badge-outline badge-secondary"
                  }`}
              >
                {status.enabled ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="card-body">
              {!status.enabled ? (
                <div className="flex flex-col items-center gap-5 py-10">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                    <KeenIcon
                      icon="rocket"
                      className="text-3xl text-primary"
                    />
                  </div>
                  <div className="text-center max-w-md">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Enable TradingView Webhooks
                    </h4>
                    <p className="text-sm text-gray-600">
                      Generate a unique webhook URL that you can paste into
                      TradingView. When an alert fires, it will automatically
                      create an IQ Idea.
                    </p>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={handleEnable}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <i className="ki-filled ki-loading animate-spin"></i>
                        Generating...
                      </span>
                    ) : (
                      "Enable Webhook"
                    )}
                  </button>
                </div>
              ) : (
                <div className="grid gap-5">
                  {showUrl && webhookUrl ? (
                    <div className="rounded-lg border border-success bg-success/5 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <KeenIcon
                          icon="shield-tick"
                          className="text-success text-lg"
                        />
                        <span className="text-sm font-semibold text-success">
                          Webhook URL — Copy now, it won't be shown again
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={webhookUrl}
                          className="input input-sm w-full font-mono text-xs"
                          onClick={(e) => e.target.select()}
                        />
                        <button
                          className="btn btn-sm btn-icon btn-success"
                          onClick={() => copyToClipboard(webhookUrl)}
                          title="Copy URL"
                        >
                          <KeenIcon icon="copy" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-gray-300 p-4">
                      <div className="flex items-center gap-2">
                        <KeenIcon icon="lock" className="text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Webhook URL is hidden for security. Use{" "}
                          <strong>Rotate</strong> to generate a new one.
                        </span>
                      </div>
                    </div>
                  )}

                  {status.createdAt && (
                    <p className="text-xs text-gray-500">
                      Created:{" "}
                      {new Date(status.createdAt).toLocaleString()}
                    </p>
                  )}

                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={handleRotate}
                      disabled={loading}
                    >
                      <KeenIcon icon="arrows-circle" className="me-1" />
                      Rotate Secret
                    </button>
                    {!confirmDisable ? (
                      <button
                        className="btn btn-sm btn-outline btn-danger"
                        onClick={() => setConfirmDisable(true)}
                        disabled={loading}
                      >
                        <KeenIcon icon="trash" className="me-1" />
                        Disable
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-danger">
                          Are you sure?
                        </span>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={handleDisable}
                          disabled={loading}
                        >
                          Yes, Disable
                        </button>
                        <button
                          className="btn btn-sm btn-light"
                          onClick={() => setConfirmDisable(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">TradingView Setup Guide</h3>
            </div>
            <div className="card-body">
              <div className="grid gap-4">
                {[
                  {
                    step: 1,
                    title: "Open your chart in TradingView",
                    desc: "Navigate to the chart you want to set up alerts for",
                  },
                  {
                    step: 2,
                    title: "Create an Alert",
                    desc: 'Click the "Alert" button or press Alt+A. Set your conditions.',
                  },
                  {
                    step: 3,
                    title: "Enable Webhook in Notifications",
                    desc: 'Go to the "Notifications" tab and toggle "Webhook URL"',
                  },
                  {
                    step: 4,
                    title: "Paste your Webhook URL",
                    desc: "Paste the URL generated above into the webhook URL field",
                  },
                  {
                    step: 5,
                    title: 'Paste JSON Template in "Message"',
                    desc: "Copy one of the templates below into the alert message body",
                  },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-white text-sm font-bold shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 p-3 rounded-lg border border-primary/30 bg-primary/5">
                <div className="flex items-center gap-2 text-sm text-primary">
                  <KeenIcon icon="information-2" />
                  <span>
                    <strong>Requires</strong> TradingView Essential plan or
                    higher. Free plan does not support webhooks.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Alert JSON Templates</h3>
              <div className="inline-flex bg-gray-200 dark:bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setActiveTemplate("basic")}
                  className={`px-3 py-1.5 text-xs rounded-md font-semibold transition-all duration-200 ${activeTemplate === "basic"
                    ? "bg-white dark:bg-gray-200 text-gray-900 shadow-sm"
                    : "text-gray-600"
                    }`}
                >
                  Basic
                </button>
                <button
                  onClick={() => setActiveTemplate("scanner")}
                  className={`px-3 py-1.5 text-xs rounded-md font-semibold transition-all duration-200 ${activeTemplate === "scanner"
                    ? "bg-white dark:bg-gray-200 text-gray-900 shadow-sm"
                    : "text-gray-600"
                    }`}
                >
                  Scanner
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="relative">
                <pre className="rounded-lg border border-gray-300 p-4 text-xs overflow-x-auto font-mono text-gray-800 bg-gray-100">
                  {activeTemplate === "basic"
                    ? BASIC_TEMPLATE
                    : SCANNER_TEMPLATE}
                </pre>
                <button
                  className="absolute top-2 right-2 btn btn-xs btn-icon btn-primary"
                  onClick={() =>
                    copyToClipboard(
                      activeTemplate === "basic"
                        ? BASIC_TEMPLATE
                        : SCANNER_TEMPLATE
                    )
                  }
                  title="Copy template"
                >
                  <KeenIcon icon="copy" />
                </button>
              </div>

              <div className="mt-5">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  Available Placeholders
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {[
                    { key: "{{ticker}}", desc: "Symbol (e.g., BTCUSD)" },
                    { key: "{{close}}", desc: "Current price" },
                    { key: "{{interval}}", desc: "Timeframe (e.g., 15)" },
                    { key: "{{volume}}", desc: "Current volume" },
                    { key: "{{time}}", desc: "Bar timestamp" },
                    { key: "{{exchange}}", desc: "Exchange name" },
                  ].map((ph) => (
                    <div
                      key={ph.key}
                      className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2"
                    >
                      <code className="text-xs text-primary font-mono font-semibold whitespace-nowrap">
                        {ph.key}
                      </code>
                      <span className="text-xs text-gray-500">{ph.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Auto Category Detection</h3>
            </div>
            <div className="card-body">
              <p className="text-sm text-gray-600 mb-4">
                When a webhook fires, the ticker symbol is automatically mapped
                to the correct category:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    name: "Crypto",
                    icon: "bitcoin",
                    color: "warning",
                    examples: "BTCUSD, ETHUSD, SOLUSDT",
                  },
                  {
                    name: "Forex",
                    icon: "dollar",
                    color: "success",
                    examples: "EURUSD, GBPJPY, USDINR",
                  },
                  {
                    name: "Indices",
                    icon: "chart-line-up",
                    color: "primary",
                    examples: "NIFTY, SPX500, US30",
                  },
                  {
                    name: "Commodities",
                    icon: "gift",
                    color: "danger",
                    examples: "XAUUSD, XAGUSD, USOIL",
                  },
                ].map((cat) => (
                  <div
                    key={cat.name}
                    className="rounded-lg border border-gray-200 p-4 text-center"
                  >
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full bg-${cat.color}/10 mx-auto mb-2`}
                    >
                      <KeenIcon
                        icon={cat.icon}
                        className={`text-lg text-${cat.color}`}
                      />
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {cat.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {cat.examples}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default TvWebhookSettings;
