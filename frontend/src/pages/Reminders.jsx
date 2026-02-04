import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { remindersApi } from '../utils/api';
import EmptyState from '../components/EmptyState';
import { formatDate, getDaysUntil } from '../utils/helpers';
import toast from 'react-hot-toast';

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const params = filter === 'upcoming' ? { upcoming: true } : { sent: filter === 'sent' };
      const response = await remindersApi.getAll(params);
      setReminders(response.data);
    } catch (error) {
      toast.error('Failed to fetch reminders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [filter]);

  const handleMarkSent = async (id) => {
    try {
      await remindersApi.markSent(id);
      toast.success('Reminder marked as sent');
      fetchReminders();
    } catch (error) {
      toast.error('Failed to mark reminder');
    }
  };

  const handleDelete = async (id) => {
    try {
      await remindersApi.delete(id);
      toast.success('Reminder deleted');
      fetchReminders();
    } catch (error) {
      toast.error('Failed to delete reminder');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reminders</h1>
        <p className="text-gray-500">Manage compliance test reminders</p>
      </div>

      {/* Filter Tabs */}
      <div className="card">
        <div className="flex gap-2">
          {[
            { value: 'upcoming', label: 'Upcoming' },
            { value: 'sent', label: 'Sent' },
            { value: 'all', label: 'All' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === option.value
                  ? 'bg-padres-brown text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reminders List */}
      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-padres-gold"></div>
          </div>
        ) : reminders.length === 0 ? (
          <EmptyState
            icon={
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            }
            title={filter === 'upcoming' ? 'No upcoming reminders' : 'No reminders found'}
            description={
              filter === 'upcoming'
                ? 'Reminders are auto-generated when you add test records'
                : 'No reminders match the current filter'
            }
          />
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder) => {
              const daysUntil = getDaysUntil(reminder.reminderDate);
              const isOverdue = daysUntil < 0 && !reminder.sent;
              const isToday = daysUntil === 0 && !reminder.sent;

              return (
                <div
                  key={reminder.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    reminder.sent
                      ? 'bg-gray-50 border-gray-200'
                      : isOverdue
                      ? 'bg-red-50 border-red-200'
                      : isToday
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      reminder.sent
                        ? 'bg-gray-200'
                        : isOverdue
                        ? 'bg-red-100'
                        : 'bg-padres-gold/10'
                    }`}>
                      {reminder.sent ? (
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className={`w-5 h-5 ${isOverdue ? 'text-red-600' : 'text-padres-gold'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/trucks/${reminder.truck.id}`}
                          className="font-medium text-gray-900 hover:text-padres-brown"
                        >
                          {reminder.truck.unitNumber}
                        </Link>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {reminder.reminderType}
                        </span>
                        {reminder.sent && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                            Sent
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {reminder.sent
                          ? `Sent on ${formatDate(reminder.sentAt)}`
                          : `Scheduled for ${formatDate(reminder.reminderDate)}`}
                      </p>
                      {reminder.truck.nextDueDate && (
                        <p className="text-xs text-gray-400">
                          Test due: {formatDate(reminder.truck.nextDueDate)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!reminder.sent && (
                      <>
                        {isToday && (
                          <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                            Due today
                          </span>
                        )}
                        {isOverdue && (
                          <span className="text-xs text-red-700 bg-red-100 px-2 py-1 rounded">
                            Overdue
                          </span>
                        )}
                        {!isToday && !isOverdue && (
                          <span className="text-xs text-gray-500">
                            in {daysUntil} days
                          </span>
                        )}
                        <button
                          onClick={() => handleMarkSent(reminder.id)}
                          className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                          title="Mark as sent"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(reminder.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete reminder"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-blue-900">About Reminders</p>
            <p className="text-sm text-blue-700 mt-1">
              Reminders are automatically generated at 30, 14, and 3 days before each truck's test due date.
              You can customize these intervals in Settings. Email/SMS delivery is currently logged but not sent.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reminders;
