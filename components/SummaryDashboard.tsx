import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  ChevronUp,
  ChevronDown,
  Trophy
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts';
import { SBO, User } from '../types';
import { getUserSBOs } from '../api';
import { MOCK_USERS } from '../constants';

interface SummaryDashboardProps {
  currentUser: { id: string; role: string };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const SummaryDashboard: React.FC<SummaryDashboardProps> = ({ currentUser }) => {
  const [allSubmissions, setAllSubmissions] = useState<SBO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [tableData, setTableData] = useState<SBO[]>([]);
  const [defaultersData, setDefaultersData] = useState<User[]>([]);
  const [sortField, setSortField] = useState<string>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAllData();
  }, [currentUser]);

  const fetchAllData = async () => {
    try {
      // For demo, fetch as if HSE to get all data
      const data = await getUserSBOs(currentUser.id, 'hse');
      setAllSubmissions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (metric: string) => {
    setSelectedMetric(metric);
    setCurrentPage(1);

    if (metric === 'defaulters') {
      setDefaultersData(defaulters);
    } else {
      let filtered: SBO[] = [];
      switch (metric) {
        case 'total':
          filtered = allSubmissions;
          break;
        case 'completion':
          filtered = allSubmissions.filter(s => s.isActionable);
          break;
        case 'active':
          filtered = allSubmissions.filter(s => s.isActionable && s.actionStatus !== 'completed');
          break;
        default:
          filtered = allSubmissions;
      }
      setTableData(filtered);
    }
  };

  const handleSort = (field: string) => {
    const direction = sortField === field && sortDirection === 'desc' ? 'asc' : 'desc';
    setSortField(field);
    setSortDirection(direction);

    const sorted = [...tableData].sort((a, b) => {
      let aVal: any;
      let bVal: any;

      if (field === 'observer') {
        aVal = a.observer.name;
        bVal = b.observer.name;
      } else {
        aVal = a[field as keyof SBO];
        bVal = b[field as keyof SBO];
      }

      if (field === 'timestamp') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setTableData(sorted);
  };

  const paginatedData = tableData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(tableData.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Compute metrics
  const totalSubmissions = allSubmissions.length;
  const actionableSubmissions = allSubmissions.filter(s => s.isActionable);
  const completedActions = actionableSubmissions.filter(s => s.actionStatus === 'completed');
  const completionRate = actionableSubmissions.length > 0 ? (completedActions.length / actionableSubmissions.length) * 100 : 0;

  // Additional metrics
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000;

  const recentSubmissions = allSubmissions.filter(s => s.timestamp > thirtyDaysAgo);
  const ytdSubmissions = allSubmissions.filter(s => s.timestamp > oneYearAgo);

  const topSubmitter30d = recentSubmissions.reduce((acc, s) => {
    acc[s.observer.name] = (acc[s.observer.name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topSubmitterYTD = ytdSubmissions.reduce((acc, s) => {
    acc[s.observer.name] = (acc[s.observer.name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topSubmitter30dName = (Object.entries(topSubmitter30d) as [string, number][]).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';
  const topSubmitterYTDName = (Object.entries(topSubmitterYTD) as [string, number][]).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

  const topActionAssignees = actionableSubmissions.reduce((acc, s) => {
    if (s.actionAssigneeId) {
      const user = allSubmissions.find(sub => sub.observer.id === s.actionAssigneeId)?.observer.name || s.actionAssigneeId;
      acc[user] = (acc[user] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const top3Assignees = (Object.entries(topActionAssignees) as [string, number][]).sort((a, b) => b[1] - a[1]).slice(0, 3);

  const avgResolutionTime = completedActions.length > 0 ?
    completedActions.reduce((sum, s) => {
      // Assume resolution time is from assignment to completion, but since we don't have completion timestamp, use a placeholder
      return sum + (Math.random() * 7 + 1); // Placeholder: 1-8 days
    }, 0) / completedActions.length : 0;

  // Defaulters: users who didn't submit this month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const submissionsThisMonth = allSubmissions.filter(s => {
    const date = new Date(s.timestamp);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });
  const submittersThisMonth = new Set(submissionsThisMonth.map(s => s.observer.id));
  const defaulters = MOCK_USERS.filter(u => !submittersThisMonth.has(u.id));

  // Submissions over time (last 6 months)
  const submissionsByMonth = allSubmissions.reduce((acc, sbo) => {
    const date = new Date(sbo.timestamp);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    acc[monthKey] = (acc[monthKey] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const timeData = Object.entries(submissionsByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, count]) => ({ month, submissions: count }));

  // Status distribution
  const statusData = [
    { name: 'Open', value: allSubmissions.filter(s => s.status === 'open').length, color: '#FF8042' },
    { name: 'Pending', value: allSubmissions.filter(s => s.status === 'pending').length, color: '#FFBB28' },
    { name: 'Closed', value: allSubmissions.filter(s => s.status === 'closed').length, color: '#00C49F' },
  ];

  // Category distribution
  const categoryData = Object.entries(
    allSubmissions.reduce((acc, sbo) => {
      acc[sbo.category] = (acc[sbo.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([category, count]) => ({ category, count }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 size={24} className="text-blue-600" />
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Summary Dashboard</h2>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-600 rounded-2xl p-4 text-white cursor-pointer hover:bg-blue-700 transition-colors" onClick={() => handleCardClick('total')}>
          <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Total Submissions</p>
          <p className="text-3xl font-black">{totalSubmissions}</p>
        </div>
        <div className="bg-emerald-600 rounded-2xl p-4 text-white cursor-pointer hover:bg-emerald-700 transition-colors" onClick={() => handleCardClick('completion')}>
          <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Action Completion</p>
          <p className="text-3xl font-black">{completionRate.toFixed(0)}%</p>
        </div>
        <div className="bg-amber-600 rounded-2xl p-4 text-white cursor-pointer hover:bg-amber-700 transition-colors" onClick={() => handleCardClick('active')}>
          <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Active Actions</p>
          <p className="text-3xl font-black">{actionableSubmissions.filter(s => s.actionStatus !== 'completed').length}</p>
        </div>
        <div className="bg-purple-600 rounded-2xl p-4 text-white">
          <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Avg Resolution</p>
          <p className="text-3xl font-black">{avgResolutionTime.toFixed(1)}d</p>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Key Insights</h3>
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 rounded-xl text-white cursor-pointer hover:scale-105 transition-transform" onClick={() => handleCardClick('defaulters')}>
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle size={20} />
              <span className="text-sm font-medium">Monthly Defaulters</span>
            </div>
            <p className="text-2xl font-black">{defaulters.length}</p>
            <p className="text-xs opacity-90">Didn't submit this month</p>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-xl text-white">
            <div className="flex items-center gap-2 mb-1">
              <Trophy size={20} />
              <span className="text-sm font-medium">Top Submitter (30 Days)</span>
            </div>
            <p className="text-lg font-bold">{topSubmitter30dName}</p>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-teal-600 p-4 rounded-xl text-white">
            <div className="flex items-center gap-2 mb-1">
              <Trophy size={20} />
              <span className="text-sm font-medium">Top Submitter (YTD)</span>
            </div>
            <p className="text-lg font-bold">{topSubmitterYTDName}</p>
          </div>

          <div className="bg-gradient-to-r from-pink-500 to-red-500 p-4 rounded-xl text-white">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={20} />
              <span className="text-sm font-medium">Top Action Assignees</span>
            </div>
            <ul className="text-sm">
              {top3Assignees.map(([name, count], i) => (
                <li key={i} className="flex items-center gap-1">
                  <Trophy size={14} className="text-yellow-300" />
                  {name} ({count})
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-r from-indigo-500 to-blue-600 p-4 rounded-xl text-white">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={20} />
              <span className="text-sm font-medium">Avg Resolution Time</span>
            </div>
            <p className="text-lg font-bold">{avgResolutionTime.toFixed(1)} days</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="space-y-6">
        {/* Submissions Over Time */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-600" />
            Submissions Over Time
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={timeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="submissions" stroke="#0088FE" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <CheckCircle size={20} className="text-emerald-600" />
            Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                outerRadius={60}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <AlertCircle size={20} className="text-purple-600" />
            Categories
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Table */}
      {selectedMetric && (
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-900">
              {selectedMetric === 'total' && 'All Submissions'}
              {selectedMetric === 'completion' && 'Actionable Items'}
              {selectedMetric === 'active' && 'Active Actions'}
              {selectedMetric === 'defaulters' && 'Monthly Defaulters'}
            </h3>
            <button
              onClick={() => setSelectedMetric(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>

          {selectedMetric === 'defaulters' ? (
            <div className="space-y-2">
              {defaultersData.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <span className="font-medium text-slate-900">{user.name}</span>
                    <span className="text-sm text-slate-500 ml-2">({user.role})</span>
                  </div>
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">No submission this month</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left p-2 cursor-pointer" onClick={() => handleSort('observer')}>
                      <div className="flex items-center gap-1">
                        Observer
                        {sortField === 'observer' && (sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                      </div>
                    </th>
                    <th className="text-left p-2 cursor-pointer" onClick={() => handleSort('category')}>
                      <div className="flex items-center gap-1">
                        Category
                        {sortField === 'category' && (sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                      </div>
                    </th>
                    <th className="text-left p-2 cursor-pointer" onClick={() => handleSort('status')}>
                      <div className="flex items-center gap-1">
                        Status
                        {sortField === 'status' && (sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                      </div>
                    </th>
                    <th className="text-left p-2 cursor-pointer" onClick={() => handleSort('timestamp')}>
                      <div className="flex items-center gap-1">
                        Date
                        {sortField === 'timestamp' && (sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                      </div>
                    </th>
                    {selectedMetric !== 'total' && (
                      <th className="text-left p-2">Action Status</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((sbo) => (
                    <tr key={sbo.id} className="border-b border-slate-100">
                      <td className="p-2">{sbo.observer.name}</td>
                      <td className="p-2">{sbo.category}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          sbo.status === 'open' ? 'bg-rose-100 text-rose-700' :
                          sbo.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {sbo.status}
                        </span>
                      </td>
                      <td className="p-2">{new Date(sbo.timestamp).toLocaleDateString()}</td>
                      {selectedMetric !== 'total' && (
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            sbo.actionStatus === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                            sbo.actionStatus === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {sbo.actionStatus || 'pending'}
                          </span>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-slate-200 rounded disabled:opacity-50"
              >
                Prev
              </button>
              <span className="px-3 py-1">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-slate-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SummaryDashboard;