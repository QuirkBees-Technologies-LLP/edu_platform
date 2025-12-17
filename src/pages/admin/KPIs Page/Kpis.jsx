import React from "react";
import { Archive } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from "@/partials/toolbar";
import { Users, Eye, Clock, UserCheck, UserPlus, Star } from "lucide-react";
import { useEducatorKpisQuery } from "../../../store/api/admin/adminEducatorsApiSlice";
import { useNavigate, useParams } from "react-router";
import { icon } from "leaflet";
import Spinner from "@/components/common/LoadingSpinner";

const KpisDashboard = () => {
  const navigate = useNavigate();

  const { callId } = useParams();

  const { data, isLoading, isError, isFetching } = useEducatorKpisQuery(
    { callId },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const timelineData = Array.isArray(data?.timeline)
    ? data.timeline.map((item) => ({
      time: new Date(item.time).toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      }),
      max: item.max,
      last: item.last,
      first: item.first,
      min: item.min,
    }))
    : [];

  const countryNames = {
    AF: "Afghanistan",
    AL: "Albania",
    DZ: "Algeria",
    AS: "American Samoa",
    AD: "Andorra",
    AO: "Angola",
    AI: "Anguilla",
    AQ: "Antarctica",
    AG: "Antigua and Barbuda",
    AR: "Argentina",
    AM: "Armenia",
    AW: "Aruba",
    AU: "Australia",
    AT: "Austria",
    AZ: "Azerbaijan",
    BS: "Bahamas",
    BH: "Bahrain",
    BD: "Bangladesh",
    BB: "Barbados",
    BY: "Belarus",
    BE: "Belgium",
    BZ: "Belize",
    BJ: "Benin",
    BM: "Bermuda",
    BT: "Bhutan",
    BO: "Bolivia",
    BA: "Bosnia and Herzegovina",
    BW: "Botswana",
    BR: "Brazil",
    BN: "Brunei",
    BG: "Bulgaria",
    BF: "Burkina Faso",
    BI: "Burundi",
    KH: "Cambodia",
    CM: "Cameroon",
    CA: "Canada",
    CV: "Cape Verde",
    KY: "Cayman Islands",
    CF: "Central African Republic",
    TD: "Chad",
    CL: "Chile",
    CN: "China",
    CO: "Colombia",
    KM: "Comoros",
    CD: "Congo (DRC)",
    CG: "Congo (Republic)",
    CR: "Costa Rica",
    CI: "Côte d’Ivoire",
    HR: "Croatia",
    CU: "Cuba",
    CY: "Cyprus",
    CZ: "Czech Republic",
    DK: "Denmark",
    DJ: "Djibouti",
    DM: "Dominica",
    DO: "Dominican Republic",
    EC: "Ecuador",
    EG: "Egypt",
    SV: "El Salvador",
    GQ: "Equatorial Guinea",
    ER: "Eritrea",
    EE: "Estonia",
    ET: "Ethiopia",
    FJ: "Fiji",
    FI: "Finland",
    FR: "France",
    GA: "Gabon",
    GM: "Gambia",
    GE: "Georgia",
    DE: "Germany",
    GH: "Ghana",
    GR: "Greece",
    GD: "Grenada",
    GU: "Guam",
    GT: "Guatemala",
    GN: "Guinea",
    GW: "Guinea-Bissau",
    GY: "Guyana",
    HT: "Haiti",
    HN: "Honduras",
    HU: "Hungary",
    IS: "Iceland",
    IN: "India",
    ID: "Indonesia",
    IR: "Iran",
    IQ: "Iraq",
    IE: "Ireland",
    IL: "Israel",
    IT: "Italy",
    JM: "Jamaica",
    JP: "Japan",
    JO: "Jordan",
    KZ: "Kazakhstan",
    KE: "Kenya",
    KI: "Kiribati",
    KP: "North Korea",
    KR: "South Korea",
    KW: "Kuwait",
    KG: "Kyrgyzstan",
    LA: "Laos",
    LV: "Latvia",
    LB: "Lebanon",
    LS: "Lesotho",
    LR: "Liberia",
    LY: "Libya",
    LI: "Liechtenstein",
    LT: "Lithuania",
    LU: "Luxembourg",
    MG: "Madagascar",
    MW: "Malawi",
    MY: "Malaysia",
    MV: "Maldives",
    ML: "Mali",
    MT: "Malta",
    MH: "Marshall Islands",
    MR: "Mauritania",
    MU: "Mauritius",
    MX: "Mexico",
    FM: "Micronesia",
    MD: "Moldova",
    MC: "Monaco",
    MN: "Mongolia",
    ME: "Montenegro",
    MA: "Morocco",
    MZ: "Mozambique",
    MM: "Myanmar",
    NA: "Namibia",
    NR: "Nauru",
    NP: "Nepal",
    NL: "Netherlands",
    NZ: "New Zealand",
    NI: "Nicaragua",
    NE: "Niger",
    NG: "Nigeria",
    NO: "Norway",
    OM: "Oman",
    PK: "Pakistan",
    PW: "Palau",
    PA: "Panama",
    PG: "Papua New Guinea",
    PY: "Paraguay",
    PE: "Peru",
    PH: "Philippines",
    PL: "Poland",
    PT: "Portugal",
    QA: "Qatar",
    RO: "Romania",
    RU: "Russia",
    RW: "Rwanda",
    KN: "Saint Kitts and Nevis",
    LC: "Saint Lucia",
    VC: "Saint Vincent and the Grenadines",
    WS: "Samoa",
    SM: "San Marino",
    ST: "São Tomé and Príncipe",
    SA: "Saudi Arabia",
    SN: "Senegal",
    RS: "Serbia",
    SC: "Seychelles",
    SL: "Sierra Leone",
    SG: "Singapore",
    SK: "Slovakia",
    SI: "Slovenia",
    SB: "Solomon Islands",
    SO: "Somalia",
    ZA: "South Africa",
    ES: "Spain",
    LK: "Sri Lanka",
    SD: "Sudan",
    SR: "Suriname",
    SE: "Sweden",
    CH: "Switzerland",
    SY: "Syria",
    TW: "Taiwan",
    TJ: "Tajikistan",
    TZ: "Tanzania",
    TH: "Thailand",
    TL: "Timor-Leste",
    TG: "Togo",
    TO: "Tonga",
    TT: "Trinidad and Tobago",
    TN: "Tunisia",
    TR: "Turkey",
    TM: "Turkmenistan",
    TV: "Tuvalu",
    UG: "Uganda",
    UA: "Ukraine",
    AE: "United Arab Emirates",
    GB: "United Kingdom",
    US: "United States",
    UY: "Uruguay",
    UZ: "Uzbekistan",
    VU: "Vanuatu",
    VE: "Venezuela",
    VN: "Vietnam",
    YE: "Yemen",
    ZM: "Zambia",
    ZW: "Zimbabwe",
  };

  const countryData = Array.isArray(data?.countryBreakdown)
    ? [...data?.countryBreakdown]
      .sort((a, b) => b.unique - a.unique)
      .map((country) => ({
        name: countryNames[country.name] || country.name,
        code: country.name,
        users: country.unique,
        percentage: ((country.unique / (data?.uniqueUsers || 1)) * 100).toFixed(1),
      }))
    : [];

  // Browser breakdown
  const browserData = Array.isArray(data?.browserBreakdown)
    ? [...data?.browserBreakdown]
      .sort((a, b) => b.unique - a.unique)
      .map((browser) => ({
        name: browser.name,
        users: browser.unique,
      }))
    : [];

  // OS breakdown
  const osDataRaw = Array.isArray(data?.osBreakdown)
    ? data?.osBreakdown.reduce((acc, os) => {
      const osName = os.name.toLowerCase() === "linux" ? "Linux" : os.name;
      const existing = acc.find((item) => item.name === osName);
      if (existing) existing.users += os.unique;
      else acc.push({ name: osName, users: os.unique });
      return acc;
    }, [])
    : [];

  const osData = osDataRaw.sort((a, b) => b.users - a.users);

  const COLORS = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
  ];

  const MetricCard = ({
    icon: Icon = Users,
    title,
    value,
    subtitle,
    color = "blue",
  }) => {
    const colorMap = {
      blue: { bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
      green: { bg: "bg-green-50 dark:bg-green-500/10", text: "text-green-600 dark:text-green-400" },
      purple: { bg: "bg-purple-50 dark:bg-purple-500/10", text: "text-purple-600 dark:text-purple-400" },
      red: { bg: "bg-red-50 dark:bg-red-500/10", text: "text-red-600 dark:text-red-400" },
      yellow: { bg: "bg-yellow-50 dark:bg-yellow-500/10", text: "text-yellow-600 dark:text-yellow-400" },
      indigo: { bg: "bg-indigo-50 dark:bg-indigo-500/10", text: "text-indigo-600 dark:text-indigo-400" },
      gray: { bg: "bg-gray-50 dark:bg-gray-500/10", text: "text-gray-600 dark:text-gray-400" },
    };

    const selected = colorMap[color] || colorMap.blue;

    return (
      <div className="bg-white dark:bg-coal-300 rounded-lg shadow-sm border dark:border-coal-100 p-6 flex items-center">
        {/* Icon */}
        <div className={`p-3 rounded-xl ${selected.bg}`}>
          {Icon && <Icon className={`h-6 w-6 ${selected.text}`} />}
        </div>

        {/* Content */}
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 dark:text-gray-500">{subtitle}</p>}
        </div>
      </div>
    );
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 max-w-md shadow-sm">
          <Archive className="w-10 h-10 text-gray-400 mb-3" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            Archived Session
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            This session is from an earlier date, so KPI insights are not
            available. You can still view other session details.
          </p>
        </div>
        <div>
          <button
            onClick={() => navigate(`/admin/kpis`)}
            className="mt-4 bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded"
          >
            View Session Details
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid pb-8">
      {/* Toolbar */}
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text="📊 - KPIs Dashboard " />
          <ToolbarDescription>
            Educator Schedule Metrics Dashboard
          </ToolbarDescription>
        </ToolbarHeading>
      </Toolbar>
      {/* Header */}
      {isFetching ? (
        <div className="flex justify-center py-8 text-gray-500 dark:text-gray-400">
          <Spinner />
        </div>
      ) : (
        <>
          <div className="mb-8">
            <div className="bg-white dark:bg-coal-300 shadow-sm border dark:border-coal-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              {/* Left section - IDs */}
              <div className="space-y-2 sm:space-y-0 sm:space-x-6 flex flex-col sm:flex-row text-sm text-gray-700 dark:text-gray-300">
                <div className="flex items-center">
                  <span className="font-semibold text-gray-900 dark:text-white mr-2">
                    Session ID:
                  </span>
                  <span className="truncate text-gray-500">{data?.sessionId || "—"}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-gray-900 dark:text-white mr-2">Call ID:</span>
                  <span className="truncate text-gray-500">{data?.callId || "—"}</span>
                </div>
              </div>

              {/* Right section - Status */}
              <div className="mt-3 sm:mt-0">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${data?.ended
                    ? "bg-red-100 text-red-700 border border-red-200"
                    : "bg-green-100 text-green-700 border border-green-200"
                    }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full mr-2 ${data?.ended ? "bg-red-500" : "bg-green-500 animate-pulse"
                      }`}
                  />
                  {data?.ended ? "Ended" : "Live"}
                </span>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              icon={Users}
              title="Active Users"
              value={data?.uniqueUsers}
              // subtitle="Last 7 days"
              color="green"
            />
            <MetricCard
              icon={Eye}
              title="Peak Concurrent"
              value={data?.peakConcurrent}
              // subtitle="Compared to last week"
              color="purple"
            />
            <MetricCard
              icon={UserCheck}
              title="Total Sessions"
              value={data?.totalSessions}
              color="purple"
            />
            <MetricCard
              icon={UserPlus}
              title="Subscribers"
              value={data?.subscribers}
              color="indigo"
            />
            <MetricCard
              icon={Clock}
              title="Total Watch Time"
              value={data?.totalWatchTime}
              // subtitle="This month"
              color="blue"
            />
            <MetricCard
              icon={Star}
              title="User Ratings"
              value={data?.userRatings}
              color="yellow"
            />
          </div>

          {/* Timeline Chart */}
          <div className="bg-white dark:bg-coal-300 rounded-lg shadow-sm border dark:border-coal-100 p-6 mb-8 mt-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              👥 Concurrent Users Timeline
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} interval={10} />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => `Time: ${value}`}
                    formatter={(value, name) => {
                      const labels = {
                        max: "Max Users",
                        last: "End Users",
                        first: "Start Users",
                        min: "Min Users",
                      };
                      return [value, labels[name] || name];
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="max"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    name="max"
                    dot={{ fill: "#3B82F6", strokeWidth: 2, r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="last"
                    stroke="#10B981"
                    strokeWidth={2}
                    name="last"
                    dot={{ fill: "#10B981", strokeWidth: 2, r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="min"
                    stroke="#F59E0B"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    name="min"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center space-x-6 mt-4 text-sm dark:text-gray-300">
              <div className="flex items-center">
                <div className="w-4 h-0.5 bg-blue-500 mr-2"></div>
                <span>Peak Users</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-0.5 bg-green-500 mr-2"></div>
                <span>End Users</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-0.5 bg-yellow-500 border-dashed border-t mr-2"></div>
                <span>Min Users</span>
              </div>
            </div>
          </div>

          {/* Breakdown Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Geographic Distribution */}
            <div className="bg-white dark:bg-coal-300 rounded-lg shadow-sm border dark:border-coal-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                🌍 Geographic Distribution
              </h2>
              <div className="h-64 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={countryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      //   label={({ name, percentage }) => `${name} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="users"
                    >
                      {countryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, "Users"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {countryData.map((country, index) => (
                  <div
                    key={country.code}
                    className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300"
                  >
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span>{country.name}</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{country.users} users</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Browser Distribution */}
            <div className="bg-white dark:bg-coal-300 rounded-lg shadow-sm border dark:border-coal-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                🖥️ Browser Distribution
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={browserData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 50 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      interval={0}
                      angle={-30}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} Users`, ""]} />
                    <Bar dataKey="users" radius={[6, 6, 0, 0]}>
                      {browserData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            [
                              "#6366F1",
                              "#10B981",
                              "#F59E0B",
                              "#EF4444",
                              "#3B82F6",
                              "#8B5CF6",
                            ][index % 6]
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* OS Distribution */}
          <div className="bg-white dark:bg-coal-300 rounded-lg shadow-sm border dark:border-coal-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              💻 Operating System Distribution
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={osData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip formatter={(value) => [value, "Users"]} />
                  <Bar dataKey="users" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default KpisDashboard;
