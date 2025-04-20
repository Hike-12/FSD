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
} from "recharts";
import { DJANGO_BASE_URL } from "@/lib/utils";

const AnalyticsPage = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`${DJANGO_BASE_URL}/api/analytics/?days=30`, {
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
  }, []);

  if (loading) return <p>Loading analytics...</p>;
  if (!analyticsData) return <p>No analytics data available.</p>;

  const { user_analytics, competition_analytics, team_analytics, submission_analytics, engagement_analytics } =
    analyticsData;

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1"];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Platform Analytics</h1>

      {/* User Analytics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">User Growth</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={user_analytics.growth_data.months.map((month, index) => ({
              month,
              students: user_analytics.growth_data.student_growth[index],
              mentors: user_analytics.growth_data.mentor_growth[index],
            }))}
          >
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="students" stroke="#8884d8" />
            <Line type="monotone" dataKey="mentors" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Competition Analytics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Competition Participation</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={competition_analytics.competition_participation}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="team_count" fill="#8884d8" />
            <Bar dataKey="student_count" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Team Analytics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Team Size Distribution</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={team_analytics.size_distribution}
              dataKey="count"
              nameKey="size"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {team_analytics.size_distribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Submission Analytics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Submission Status</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={submission_analytics.status_distribution}
              dataKey="count"
              nameKey="status"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#82ca9d"
              label
            >
              {submission_analytics.status_distribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Engagement Analytics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Mentor-Student Engagement</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={engagement_analytics.top_mentors}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="consultation_count" fill="#ffc658" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsPage;