import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { DJANGO_BASE_URL } from "@/lib/utils";

// Enhanced color palette with better contrast and hover states
const colors = {
  primary: '#3b82f6',
  primaryHover: '#2563eb',
  primaryDark: '#1d4ed8',
  secondary: '#60a5fa',
  secondaryHover: '#3b82f6',
  accent: '#7c3aed',
  accentHover: '#6d28d9',
  accentLight: '#a78bfa',
  background: '#050A15',
  backgroundLight: '#0F172A',
  backgroundLighter: '#1E293B',
  text: '#f8fafc',
  textMuted: '#94a3b8',
  border: '#1E293B',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444'
};

// Custom tooltip style
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: colors.backgroundLighter,
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        padding: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <p style={{ 
          color: colors.text, 
          fontWeight: '600',
          marginBottom: '8px',
          borderBottom: `1px solid ${colors.border}`,
          paddingBottom: '4px'
        }}>
          {label}
        </p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ 
            color: entry.color,
            margin: '4px 0',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span style={{
              display: 'inline-block',
              width: '12px',
              height: '12px',
              background: entry.color,
              marginRight: '8px',
              borderRadius: '2px'
            }}></span>
            {entry.name}: <span style={{ 
              fontWeight: '600',
              marginLeft: '4px'
            }}>{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Custom active shape for pie charts
const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;

  return (
    <g>
      <text x={cx} y={cy - 10} textAnchor="middle" fill={colors.text} style={{ fontWeight: '600' }}>
        {payload.name}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill={colors.textMuted}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
      <path
        d={`
          M${cx},${cy - outerRadius}
          A${outerRadius},${outerRadius},0,1,1,${cx - 0.01},${cy - outerRadius}
        `}
        fill="none"
        stroke={fill}
        strokeWidth={2}
      />
      <circle cx={cx} cy={cy} r={innerRadius} fill={colors.backgroundLight} />
      <circle
        cx={cx}
        cy={cy}
        r={outerRadius + 5}
        fill="none"
        stroke={fill}
        strokeWidth={2}
        opacity={0.3}
      />
    </g>
  );
};

const AnalyticsPage = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);
  const [activePieIndex, setActivePieIndex] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${DJANGO_BASE_URL}/api/analytics/?days=${timeRange}`, {
          headers: {
            Authorization: `Token ${localStorage.getItem("authToken")}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch analytics data");
        const data = await response.json();
        setAnalyticsData(data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  const onPieEnter = (_, index) => {
    setActivePieIndex(index);
  };

  const onPieLeave = () => {
    setActivePieIndex(null);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: colors.background }}>
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-lg" style={{ color: colors.text }}>Loading analytics dashboard...</p>
        <p className="mt-1" style={{ color: colors.textMuted }}>This may take a moment</p>
      </div>
    </div>
  );

  if (!analyticsData) return (
    <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: colors.background }}>
      <div className="text-center p-6 rounded-lg" style={{ backgroundColor: colors.backgroundLight }}>
        <svg
          className="mx-auto h-12 w-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke={colors.error}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-2 text-lg font-medium" style={{ color: colors.text }}>No analytics data</h3>
        <p className="mt-1" style={{ color: colors.textMuted }}>
          We couldn't load the analytics data. Please try again later.
        </p>
      </div>
    </div>
  );

  const { user_analytics, competition_analytics, team_analytics, submission_analytics, engagement_analytics } =
    analyticsData;

  const chartColors = [colors.primary, colors.accent, colors.success, colors.warning, colors.error, colors.accentLight];

  return (
    <div className="p-4 md:p-6 min-h-screen" style={{ backgroundColor: colors.background }}>
      <div className="max-w-7xl mx-auto">
        {/* Header with time range selector */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold" style={{ color: colors.text }}>Platform Analytics</h1>
            <p className="mt-1" style={{ color: colors.textMuted }}>
              Insights and metrics from the last {timeRange} days
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[7, 30, 90].map((days) => (
              <button
                key={days}
                onClick={() => setTimeRange(days)}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  timeRange === days 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
                style={{ 
                  color: colors.text,
                  border: timeRange === days ? `1px solid ${colors.primaryHover}` : `1px solid ${colors.border}`
                }}
              >
                {days} Days
              </button>
            ))}
          </div>
        </div>

        {/* Stats Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-lg" style={{ 
            backgroundColor: colors.backgroundLight,
            borderLeft: `4px solid ${colors.primary}`
          }}>
            <p className="text-sm" style={{ color: colors.textMuted }}>Total Users</p>
            <p className="text-2xl font-bold mt-1" style={{ color: colors.text }}>
              {user_analytics.total_users}
            </p>
            <div className="flex items-center mt-2">
              <span className={`text-sm ${
                user_analytics.user_growth_percent >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {user_analytics.user_growth_percent >= 0 ? '↑' : '↓'} 
                {Math.abs(user_analytics.user_growth_percent)}%
              </span>
              <span className="text-xs ml-1" style={{ color: colors.textMuted }}>vs previous period</span>
            </div>
          </div>

          <div className="p-4 rounded-lg" style={{ 
            backgroundColor: colors.backgroundLight,
            borderLeft: `4px solid ${colors.accent}`
          }}>
            <p className="text-sm" style={{ color: colors.textMuted }}>Active Competitions</p>
            <p className="text-2xl font-bold mt-1" style={{ color: colors.text }}>
              {competition_analytics.active_competitions}
            </p>
          </div>

          <div className="p-4 rounded-lg" style={{ 
            backgroundColor: colors.backgroundLight,
            borderLeft: `4px solid ${colors.success}`
          }}>
            <p className="text-sm" style={{ color: colors.textMuted }}>Total Submissions</p>
            <p className="text-2xl font-bold mt-1" style={{ color: colors.text }}>
              {submission_analytics.total_submissions}
            </p>
          </div>

          <div className="p-4 rounded-lg" style={{ 
            backgroundColor: colors.backgroundLight,
            borderLeft: `4px solid ${colors.warning}`
          }}>
            <p className="text-sm" style={{ color: colors.textMuted }}>Mentor Engagements</p>
            <p className="text-2xl font-bold mt-1" style={{ color: colors.text }}>
              {engagement_analytics.total_consultations}
            </p>
          </div>
        </div>

        {/* User Analytics */}
        <div className="mb-8 p-4 md:p-6 rounded-lg" style={{ 
          backgroundColor: colors.backgroundLight,
          border: `1px solid ${colors.border}`,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold" style={{ color: colors.text }}>User Growth</h2>
            <div className="flex items-center">
              <div className="flex items-center mr-4">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: colors.primary }}></div>
                <span className="text-sm" style={{ color: colors.textMuted }}>Students</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: colors.accent }}></div>
                <span className="text-sm" style={{ color: colors.textMuted }}>Mentors</span>
              </div>
            </div>
          </div>
          <div style={{ height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={user_analytics.growth_data.months.map((month, index) => ({
                  month,
                  students: user_analytics.growth_data.student_growth[index],
                  mentors: user_analytics.growth_data.mentor_growth[index],
                }))}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={colors.border} opacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  stroke={colors.textMuted} 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke={colors.textMuted} 
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{ stroke: colors.border, strokeWidth: 1 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="students" 
                  stroke={colors.primary} 
                  strokeWidth={2}
                  dot={{ r: 4, fill: colors.primary }}
                  activeDot={{ 
                    r: 6, 
                    stroke: colors.primaryDark,
                    strokeWidth: 2,
                    fill: colors.primary 
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="mentors" 
                  stroke={colors.accent} 
                  strokeWidth={2}
                  dot={{ r: 4, fill: colors.accent }}
                  activeDot={{ 
                    r: 6, 
                    stroke: colors.accentHover,
                    strokeWidth: 2,
                    fill: colors.accent 
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Competition Analytics */}
        <div className="mb-8 p-4 md:p-6 rounded-lg" style={{ 
          backgroundColor: colors.backgroundLight,
          border: `1px solid ${colors.border}`,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: colors.text }}>Competition Participation</h2>
          <div style={{ height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={competition_analytics.competition_participation}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={colors.border} opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  stroke={colors.textMuted} 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke={colors.textMuted} 
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{ fill: colors.backgroundLighter }}
                />
                <Bar 
                  dataKey="team_count" 
                  fill={colors.primary} 
                  name="Teams" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                <Bar 
                  dataKey="student_count" 
                  fill={colors.accent} 
                  name="Students" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Team and Submission Analytics - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Team Analytics */}
          <div className="p-4 md:p-6 rounded-lg" style={{ 
            backgroundColor: colors.backgroundLight,
            border: `1px solid ${colors.border}`,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
          }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: colors.text }}>Team Size Distribution</h2>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    activeIndex={activePieIndex}
                    activeShape={renderActiveShape}
                    data={team_analytics.size_distribution}
                    dataKey="count"
                    nameKey="size"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    onMouseEnter={onPieEnter}
                    onMouseLeave={onPieLeave}
                  >
                    {team_analytics.size_distribution.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={chartColors[index % chartColors.length]} 
                        stroke={colors.backgroundLight}
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={<CustomTooltip />}
                  />
                  <Legend 
                    wrapperStyle={{ 
                      paddingTop: '20px',
                      fontSize: '12px'
                    }}
                    formatter={(value) => <span style={{ color: colors.textMuted }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Submission Analytics */}
          <div className="p-4 md:p-6 rounded-lg" style={{ 
            backgroundColor: colors.backgroundLight,
            border: `1px solid ${colors.border}`,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
          }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: colors.text }}>Submission Status</h2>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    activeIndex={activePieIndex}
                    activeShape={renderActiveShape}
                    data={submission_analytics.status_distribution}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    onMouseEnter={onPieEnter}
                    onMouseLeave={onPieLeave}
                  >
                    {submission_analytics.status_distribution.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={chartColors[index % chartColors.length]} 
                        stroke={colors.backgroundLight}
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={<CustomTooltip />}
                  />
                  <Legend 
                    wrapperStyle={{ 
                      paddingTop: '20px',
                      fontSize: '12px'
                    }}
                    formatter={(value) => <span style={{ color: colors.textMuted }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Engagement Analytics */}
        <div className="mb-8 p-4 md:p-6 rounded-lg" style={{ 
          backgroundColor: colors.backgroundLight,
          border: `1px solid ${colors.border}`,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: colors.text }}>Top Mentors by Engagement</h2>
          <div style={{ height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={engagement_analytics.top_mentors}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke={colors.border} opacity={0.3} horizontal={false} />
                <XAxis 
                  type="number" 
                  stroke={colors.textMuted} 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke={colors.textMuted} 
                  tick={{ fontSize: 12 }}
                  width={100}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{ fill: colors.backgroundLighter }}
                />
                <Bar 
                  dataKey="consultation_count" 
                  fill={colors.accent} 
                  name="Consultations" 
                  radius={[0, 4, 4, 0]}
                  maxBarSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;