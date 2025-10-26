'use client';

import { useState } from 'react';
import { Edit, Trash2, Eye, Search, Filter, Download, RefreshCw } from 'lucide-react';

interface DataItem {
  id: string | number;
  [key: string]: any;
}

interface Column {
  key: string;
  label: string;
  type?: 'text' | 'badge' | 'date' | 'number' | 'image';
  badgeColors?: { [key: string]: string };
}

interface CMSListProps {
  data: DataItem[];
  columns: Column[];
  onEdit: (item: DataItem) => void;
  onDelete: (id: string | number) => void;
  onView?: (item: DataItem) => void;
  onToggleStatus?: (item: DataItem) => void;
  searchFields?: string[];
  filterOptions?: { value: string; label: string }[];
  title: string;
  loading?: boolean;
  onRefresh?: () => void;
  badgeColors?: { [key: string]: string };
}

const CMSList = ({
  data,
  columns,
  onEdit,
  onDelete,
  onView,
  onToggleStatus,
  searchFields = [],
  filterOptions = [],
  title,
  loading = false,
  onRefresh,
  badgeColors = {}
}: CMSListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValue, setFilterValue] = useState('all');
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const filteredData = data.filter(item => {
    const matchesSearch = searchFields.length === 0 || searchFields.some(field => 
      item[field]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesFilter = filterValue === 'all' || item.status === filterValue;
    
    return matchesSearch && matchesFilter;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0;
    
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderCell = (item: DataItem, column: Column) => {
    const value = item[column.key];
    
    switch (column.type) {
      case 'badge':
        const badgeColor = badgeColors[value] || column.badgeColors?.[value] || 'bg-gray-100 text-gray-800';
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeColor}`}>
            {value}
          </span>
        );
      
      case 'date':
        return new Date(value).toLocaleDateString();
      
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value;
      
      case 'image':
        return (
          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
            {value ? (
              <img src={value} alt="" className="w-full h-full object-cover rounded-lg" />
            ) : (
              <span className="text-gray-400 text-xs">No Image</span>
            )}
          </div>
        );
      
      default:
        return value;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className="flex items-center space-x-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            )}
            <button className="p-2 text-gray-600 hover:text-gray-800">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center space-x-4">
          {searchFields.length > 0 && (
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Search..."
              />
            </div>
          )}
          
          {filterOptions.length > 0 && (
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All</option>
                {filterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {sortField === column.key && (
                      <span className="text-orange-600">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {renderCell(item, column)}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    {onView && (
                      <button
                        onClick={() => onView(item)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    {onToggleStatus && item.status && (
                      <button
                        onClick={() => onToggleStatus(item)}
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          item.status === 'published'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {item.status === 'published' ? 'Published' : 'Draft'}
                      </button>
                    )}
                    <button
                      onClick={() => onEdit(item)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {sortedData.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data found</h3>
          <p className="text-gray-600">
            {searchTerm || filterValue !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'No items available yet'
            }
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-700">
          <span>Showing {sortedData.length} of {data.length} items</span>
          <div className="flex items-center space-x-2">
            <span>Page 1 of 1</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CMSList;
