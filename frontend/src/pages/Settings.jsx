import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { settingsApi } from '../utils/api';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('company');

  const [companyData, setCompanyData] = useState({
    companyName: '',
    phone: '',
  });

  const [scheduleData, setScheduleData] = useState({
    testingSchedule: 'SEMI_ANNUAL',
  });

  const [reminderData, setReminderData] = useState({
    defaultReminderDays: [30, 14, 3],
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setCompanyData({
        companyName: user.companyName || '',
        phone: user.phone || '',
      });
      setScheduleData({
        testingSchedule: user.testingSchedule || 'SEMI_ANNUAL',
      });
      setReminderData({
        defaultReminderDays: user.defaultReminderDays || [30, 14, 3],
      });
    }
  }, [user]);

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await settingsApi.updateCompany(companyData);
      updateUser(response.data);
      toast.success('Company info updated');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await settingsApi.updateSchedule(scheduleData);
      updateUser(response.data);
      toast.success('Testing schedule updated');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const handleReminderSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await settingsApi.updateReminders(reminderData);
      updateUser(response.data);
      toast.success('Reminder preferences updated');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await settingsApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const toggleReminderDay = (day) => {
    setReminderData((prev) => {
      const days = prev.defaultReminderDays;
      if (days.includes(day)) {
        return { defaultReminderDays: days.filter((d) => d !== day) };
      } else {
        return { defaultReminderDays: [...days, day].sort((a, b) => b - a) };
      }
    });
  };

  const tabs = [
    { id: 'company', label: 'Company' },
    { id: 'schedule', label: 'Testing Schedule' },
    { id: 'reminders', label: 'Reminders' },
    { id: 'password', label: 'Password' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs */}
        <div className="lg:w-48 flex lg:flex-col gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-left rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-padres-brown text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 card">
          {/* Company Tab */}
          {activeTab === 'company' && (
            <form onSubmit={handleCompanySubmit} className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Update your company details. This information will be used for your account.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyData.companyName}
                  onChange={(e) => setCompanyData({ ...companyData, companyName: e.target.value })}
                  className="input-field max-w-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="input-field max-w-md bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={companyData.phone}
                  onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                  className="input-field max-w-md"
                  placeholder="(619) 555-0123"
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}

          {/* Testing Schedule Tab */}
          {activeTab === 'schedule' && (
            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Testing Schedule</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Choose your default testing frequency. This affects the calculation of next due dates when recording tests.
                </p>
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="schedule"
                    value="SEMI_ANNUAL"
                    checked={scheduleData.testingSchedule === 'SEMI_ANNUAL'}
                    onChange={(e) => setScheduleData({ testingSchedule: e.target.value })}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Semi-Annual (every 6 months)</p>
                    <p className="text-sm text-gray-500">Current CARB requirement for most vehicles</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="schedule"
                    value="QUARTERLY"
                    checked={scheduleData.testingSchedule === 'QUARTERLY'}
                    onChange={(e) => setScheduleData({ testingSchedule: e.target.value })}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Quarterly (every 3 months)</p>
                    <p className="text-sm text-gray-500">
                      New requirement starting 2027 for certain vehicles
                    </p>
                    <span className="inline-block mt-1 text-xs bg-padres-gold/20 text-padres-brown px-2 py-0.5 rounded">
                      2027 Rule
                    </span>
                  </div>
                </label>
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}

          {/* Reminders Tab */}
          {activeTab === 'reminders' && (
            <form onSubmit={handleReminderSubmit} className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Reminder Preferences</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Choose when you want to receive reminders before test due dates.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Send reminders at these intervals:
                </label>
                <div className="flex flex-wrap gap-2">
                  {[60, 45, 30, 21, 14, 7, 3, 1].map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleReminderDay(day)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        reminderData.defaultReminderDays.includes(day)
                          ? 'bg-padres-gold text-padres-brown'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {day} day{day !== 1 ? 's' : ''}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Selected: {reminderData.defaultReminderDays.length > 0
                    ? reminderData.defaultReminderDays.join(', ') + ' days before due date'
                    : 'None'}
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  Email and SMS notifications are currently logged but not sent.
                  This feature will be available in a future update.
                </p>
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Update your password to keep your account secure.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="input-field max-w-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="input-field max-w-md"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="input-field max-w-md"
                  required
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
