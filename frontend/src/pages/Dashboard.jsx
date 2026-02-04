import { Link } from 'react-router-dom';
import { useDashboard, useFleetTagStats } from '../hooks/useDashboard';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { formatDate, getDaysUntil } from '../utils/helpers';

const Dashboard = () => {
  const { data, loading, error } = useDashboard();
  const { data: fleetStats } = useFleetTagStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-padres-gold"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary">
          Retry
        </button>
      </div>
    );
  }

  const { stats, upcomingReminders, trucksDueSoon } = data || {};

  if (!stats || stats.total === 0) {
    return (
      <div className="card">
        <EmptyState
          icon={
            <svg className="w-8 h-8 text-padres-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          }
          title="Add your first truck"
          description="Start by adding trucks to your fleet. You'll be able to track their compliance status and receive reminders."
          action={
            <Link to="/trucks" className="btn-primary">
              Add Truck
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Fleet compliance overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Trucks"
          value={stats.total}
          color="gray"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          }
        />
        <StatCard
          title="Compliant"
          value={stats.compliant}
          color="green"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Due Soon"
          value={stats.dueSoon}
          subtitle="Within 30 days"
          color="yellow"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Overdue"
          value={stats.overdue}
          color="red"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
        <StatCard
          title="Needs Retest"
          value={stats.needsRetest}
          color="purple"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          }
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Trucks Due Soon */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Attention Required</h2>
            <Link to="/trucks?status=DUE_SOON" className="text-sm text-padres-brown hover:text-padres-gold">
              View all
            </Link>
          </div>

          {trucksDueSoon?.length > 0 ? (
            <div className="space-y-3">
              {trucksDueSoon.map((truck) => {
                const days = getDaysUntil(truck.nextDueDate);
                return (
                  <Link
                    key={truck.id}
                    to={`/trucks/${truck.id}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        truck.status === 'OVERDUE' ? 'bg-red-100' : 'bg-yellow-100'
                      }`}>
                        <svg className={`w-5 h-5 ${truck.status === 'OVERDUE' ? 'text-red-600' : 'text-yellow-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{truck.unitNumber}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(truck.nextDueDate)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={truck.status} />
                      <p className={`text-xs mt-1 ${days < 0 ? 'text-red-600' : 'text-yellow-600'}`}>
                        {days < 0 ? `${Math.abs(days)} days overdue` : `${days} days left`}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">All trucks are compliant!</p>
          )}
        </div>

        {/* Upcoming Reminders */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Reminders</h2>
            <Link to="/reminders" className="text-sm text-padres-brown hover:text-padres-gold">
              View all
            </Link>
          </div>

          {upcomingReminders?.length > 0 ? (
            <div className="space-y-3">
              {upcomingReminders.slice(0, 5).map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-padres-gold/10 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-padres-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{reminder.truck.unitNumber}</p>
                      <p className="text-sm text-gray-500">
                        Reminder on {formatDate(reminder.reminderDate)}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                    {reminder.reminderType}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No upcoming reminders</p>
          )}
        </div>
      </div>

      {/* Fleet Tag Breakdown */}
      {fleetStats && Object.keys(fleetStats).length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Compliance by Fleet Tag</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(fleetStats).map(([tag, stats]) => (
              <div key={tag} className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">{tag}</h3>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${(stats.compliant / stats.total) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">
                    {stats.compliant}/{stats.total}
                  </span>
                </div>
                <div className="flex gap-4 mt-2 text-xs">
                  {stats.dueSoon > 0 && (
                    <span className="text-yellow-600">{stats.dueSoon} due soon</span>
                  )}
                  {stats.overdue > 0 && (
                    <span className="text-red-600">{stats.overdue} overdue</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
