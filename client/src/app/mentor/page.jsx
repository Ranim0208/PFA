"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getMentorDashboardStats,
  getMentorUpcomingSessions,
  getMentorRecentActivity,
  getMentorCohortDistribution,
} from "@/services/trainings/trainingTracking";
import {
  Users,
  Calendar,
  FileText,
  UserCheck,
  RefreshCw,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Minus,
  Activity,
  PieChart,
  BookOpen,
  XCircle,
  MapPin,
} from "lucide-react";
import Loader from "@/components/ui/Loader";

const MentorDashboard = () => {
  const router = useRouter();

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data state
  const [stats, setStats] = useState({
    totalParticipants: 0,
    activeParticipants: 0,
    completionRate: 0,
    upcomingSessions: 0,
    outputsPendingReview: 0,
  });
  const [sessions, setSessions] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [cohortDistribution, setCohortDistribution] = useState([]);

  // Load dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [statsRes, sessionsRes, activityRes, cohortRes] =
          await Promise.all([
            getMentorDashboardStats(),
            getMentorUpcomingSessions(),
            getMentorRecentActivity(5),
            getMentorCohortDistribution(),
          ]);

        setStats({
          totalParticipants: statsRes.totalParticipants || 0,
          activeParticipants: statsRes.activeParticipants || 0,
          completionRate: statsRes.completionRate || 0,
          upcomingSessions: statsRes.upcomingSessions || 0,
          outputsPendingReview: statsRes.outputsPendingReview || 0,
        });

        setSessions(Array.isArray(sessionsRes) ? sessionsRes : []);
        setRecentActivity(Array.isArray(activityRes) ? activityRes : []);
        setCohortDistribution(Array.isArray(cohortRes) ? cohortRes : []);
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
        setError(err.message || "Failed to fetch dashboard data");

        // Set fallback empty states
        setStats({
          totalParticipants: 0,
          activeParticipants: 0,
          completionRate: 0,
          upcomingSessions: 0,
          outputsPendingReview: 0,
        });
        setSessions([]);
        setRecentActivity([]);
        setCohortDistribution([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <XCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error loading dashboard
            </h3>
            <div className="mt-2 text-sm text-red-700">
              {error}. Please try refreshing the page.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Mentor Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <StatCard
            title="Total Participants"
            value={stats.totalParticipants}
            icon={Users}
            trend="up"
            trendValue="12%"
            color="blue"
          />
          <StatCard
            title="Active Participants"
            value={stats.activeParticipants}
            icon={UserCheck}
            trend="stable"
            color="green"
          />
          <StatCard
            title="Completion Rate"
            value={`${stats.completionRate}%`}
            icon={TrendingUp}
            trend={stats.completionRate >= 70 ? "up" : "down"}
            trendValue={`${stats.completionRate >= 70 ? "+" : ""}${Math.abs(
              stats.completionRate - 70
            )}%`}
            color="purple"
          />
          <StatCard
            title="Upcoming Sessions"
            value={stats.upcomingSessions}
            icon={Calendar}
            trend="new"
            color="orange"
          />
          <StatCard
            title="Outputs Pending"
            value={stats.outputsPendingReview}
            icon={FileText}
            trend={stats.outputsPendingReview > 5 ? "up" : "down"}
            color="red"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Cohort Distribution Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Participants by Region
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Distribution of your participants across different regions
              </p>
              {cohortDistribution.length > 0 ? (
                <div className="space-y-4">
                  {cohortDistribution.map((cohort, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-blue-500 mr-2" />
                        <span className="font-medium">
                          {cohort.name?.fr || cohort.name || "Unknown Region"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600 mr-3">
                          {cohort.count} participants
                        </span>
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${Math.min(
                                ((cohort.count /
                                  Math.max(
                                    ...cohortDistribution.map((c) => c.count)
                                  )) *
                                  100,
                                100)
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<PieChart className="h-10 w-10 text-gray-400" />}
                  title="No participants by region"
                  description="You don't have any participants assigned to regions yet"
                />
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Recent Activity
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Latest actions from your participants
              </p>
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Activity className="h-10 w-10 text-gray-400" />}
                  title="No recent activity"
                  description="Participant activity will appear here"
                />
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Upcoming Training Sessions
              </h3>
              <p className="text-sm text-gray-600">
                Your next {stats.upcomingSessions} sessions
              </p>
            </div>
            <button
              onClick={() => router.push("/sessions")}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View all sessions →
            </button>
          </div>
          {sessions.length > 0 ? (
            <div className="space-y-4">
              {sessions.slice(0, 3).map((session) => (
                <div
                  key={session.id}
                  className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0 bg-blue-100 p-3 rounded-lg">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{session.topic}</h4>
                      <span className="text-sm text-gray-500">
                        {session.cohort}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>
                        {new Date(session.date).toLocaleDateString()},{" "}
                        {session.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Calendar className="h-10 w-10 text-gray-400" />}
              title="No upcoming sessions"
              description="Your next training sessions will appear here"
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Helper Components
const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }) => {
  const colors = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    purple: "text-purple-600 bg-purple-50",
    orange: "text-orange-600 bg-orange-50",
    red: "text-red-600 bg-red-50",
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colors[color] || colors.blue}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          {trend === "up" ? (
            <ArrowUp className="h-4 w-4 text-green-500" />
          ) : trend === "down" ? (
            <ArrowDown className="h-4 w-4 text-red-500" />
          ) : (
            <Minus className="h-4 w-4 text-gray-500" />
          )}
          <span
            className={`ml-1 ${
              trend === "up"
                ? "text-green-600"
                : trend === "down"
                ? "text-red-600"
                : "text-gray-600"
            }`}
          >
            {trend === "new" ? "New" : trendValue || "No change"}
          </span>
          <span className="text-gray-500 ml-1">vs last period</span>
        </div>
      )}
    </div>
  );
};

const ActivityItem = ({ activity }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case "submission":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "attendance":
        return <UserCheck className="h-5 w-5 text-green-500" />;
      default:
        return <MessageSquare className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="flex items-start">
      <div className="flex-shrink-0 mt-0.5">
        {getActivityIcon(activity.type)}
      </div>
      <div className="ml-3">
        <p className="text-sm text-gray-800">
          <span className="font-medium">{activity.user}</span> {activity.action}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {new Date(activity.timestamp).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

const EmptyState = ({ icon, title, description, className = "" }) => {
  return (
    <div className={`text-center ${className}`}>
      <div className="mx-auto h-12 w-12 text-gray-400">{icon}</div>
      <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  );
};

export default MentorDashboard;
