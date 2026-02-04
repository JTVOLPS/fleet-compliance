import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { formatDate, getFuelTypeText, getDaysUntil } from '../utils/helpers';

const TruckTable = ({ trucks, onSort, sortBy, sortOrder }) => {
  const handleSort = (field) => {
    if (sortBy === field) {
      onSort(field, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(field, 'asc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortOrder === 'asc' ? (
      <svg className="w-4 h-4 text-padres-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-padres-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const getDueDateDisplay = (truck) => {
    if (!truck.nextDueDate) return { text: 'No test recorded', class: 'text-gray-500' };

    const days = getDaysUntil(truck.nextDueDate);
    const dateStr = formatDate(truck.nextDueDate);

    if (days < 0) {
      return { text: `${dateStr} (${Math.abs(days)} days overdue)`, class: 'text-red-600 font-medium' };
    } else if (days <= 30) {
      return { text: `${dateStr} (${days} days)`, class: 'text-yellow-600 font-medium' };
    }
    return { text: `${dateStr} (${days} days)`, class: 'text-gray-600' };
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4">
              <button
                onClick={() => handleSort('unitNumber')}
                className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-gray-900"
              >
                Unit
                <SortIcon field="unitNumber" />
              </button>
            </th>
            <th className="text-left py-3 px-4 hidden md:table-cell">
              <span className="text-sm font-semibold text-gray-700">VIN</span>
            </th>
            <th className="text-left py-3 px-4 hidden lg:table-cell">
              <button
                onClick={() => handleSort('engineYear')}
                className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-gray-900"
              >
                Year
                <SortIcon field="engineYear" />
              </button>
            </th>
            <th className="text-left py-3 px-4 hidden lg:table-cell">
              <span className="text-sm font-semibold text-gray-700">Fuel</span>
            </th>
            <th className="text-left py-3 px-4 hidden sm:table-cell">
              <span className="text-sm font-semibold text-gray-700">Last Test</span>
            </th>
            <th className="text-left py-3 px-4">
              <button
                onClick={() => handleSort('nextDueDate')}
                className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-gray-900"
              >
                Next Due
                <SortIcon field="nextDueDate" />
              </button>
            </th>
            <th className="text-left py-3 px-4">
              <button
                onClick={() => handleSort('status')}
                className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-gray-900"
              >
                Status
                <SortIcon field="status" />
              </button>
            </th>
            <th className="text-right py-3 px-4">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {trucks.map((truck) => {
            const dueDisplay = getDueDateDisplay(truck);
            const lastTest = truck.testRecords?.[0];

            return (
              <tr key={truck.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4">
                  <div>
                    <Link
                      to={`/trucks/${truck.id}`}
                      className="font-medium text-gray-900 hover:text-padres-brown"
                    >
                      {truck.unitNumber}
                    </Link>
                    {truck.fleetTag && (
                      <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {truck.fleetTag}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 hidden md:table-cell">
                  <span className="text-sm text-gray-600 font-mono">{truck.vin}</span>
                </td>
                <td className="py-3 px-4 hidden lg:table-cell">
                  <span className="text-sm text-gray-600">{truck.engineYear}</span>
                </td>
                <td className="py-3 px-4 hidden lg:table-cell">
                  <span className="text-sm text-gray-600">{getFuelTypeText(truck.fuelType)}</span>
                </td>
                <td className="py-3 px-4 hidden sm:table-cell">
                  <span className="text-sm text-gray-600">
                    {lastTest ? formatDate(lastTest.testDate) : '-'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`text-sm ${dueDisplay.class}`}>{dueDisplay.text}</span>
                </td>
                <td className="py-3 px-4">
                  <StatusBadge status={truck.status} needsRetest={truck.needsRetest} />
                </td>
                <td className="py-3 px-4 text-right">
                  <Link
                    to={`/trucks/${truck.id}`}
                    className="text-padres-brown hover:text-padres-gold transition-colors"
                  >
                    <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TruckTable;
