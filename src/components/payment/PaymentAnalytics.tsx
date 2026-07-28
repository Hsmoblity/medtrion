"use client";

import React, { useState, useEffect } from 'react';
import { getPaymentAnalytics, getOrderTracking } from '../../lib/stripe/cmsHooks';

interface PaymentAnalyticsData {
  paymentIntentId: string;
  orderId?: string;
  customerId?: string;
  amount: number;
  currency: string;
  status: 'success' | 'failed' | 'pending' | 'canceled';
  paymentMethod: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface OrderTrackingData {
  orderId: string;
  paymentIntentId: string;
  status: string;
  paymentStatus: string;
  customerEmail?: string;
  customerName?: string;
  amount: number;
  currency: string;
  lineItems: Array<{
    productId: string;
    title: string;
    quantity: number;
    price: number;
  }>;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

interface PaymentAnalyticsProps {
  className?: string;
}

const PaymentAnalytics: React.FC<PaymentAnalyticsProps> = ({ className = '' }) => {
  const [analytics, setAnalytics] = useState<PaymentAnalyticsData[]>([]);
  const [orders, setOrders] = useState<OrderTrackingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
    limit: 50,
  });

  // Load analytics data
  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const analyticsData = await getPaymentAnalytics(filters);
      setAnalytics(analyticsData);

      // Load recent orders
      const recentOrders = await Promise.all(
        analyticsData
          .filter(a => a.orderId)
          .slice(0, 10)
          .map(async (a) => {
            const order = await getOrderTracking(a.orderId!);
            return order;
          })
      );

      setOrders(recentOrders.filter(Boolean) as OrderTrackingData[]);

    } catch (err: any) {
      console.error('Error loading payment analytics:', err);
      setError(err.message || 'Failed to load payment analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [filters]);

  // Calculate analytics metrics
  const metrics = React.useMemo(() => {
    const totalPayments = analytics.length;
    const successfulPayments = analytics.filter(a => a.status === 'success').length;
    const failedPayments = analytics.filter(a => a.status === 'failed').length;
    const totalRevenue = analytics
      .filter(a => a.status === 'success')
      .reduce((sum, a) => sum + a.amount, 0);
    const averageOrderValue = successfulPayments > 0 ? totalRevenue / successfulPayments : 0;
    const successRate = totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0;

    return {
      totalPayments,
      successfulPayments,
      failedPayments,
      totalRevenue,
      averageOrderValue,
      successRate,
    };
  }, [analytics]);

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'CAD') => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-red-700">{error}</span>
          </div>
          <button
            onClick={loadAnalytics}
            className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Analytics</h2>
        <p className="text-gray-600">Monitor payment performance and order tracking</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">Total Payments</div>
          <div className="text-2xl font-bold text-gray-900">{metrics.totalPayments}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">Successful</div>
          <div className="text-2xl font-bold text-green-600">{metrics.successfulPayments}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">Failed</div>
          <div className="text-2xl font-bold text-red-600">{metrics.failedPayments}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">Success Rate</div>
          <div className="text-2xl font-bold text-brand-primary">{metrics.successRate.toFixed(1)}%</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">Total Revenue</div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalRevenue)}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">Avg Order Value</div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.averageOrderValue)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-orange-500"
            >
              <option value="">All Statuses</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-orange-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-orange-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Limit</label>
            <select
              value={filters.limit}
              onChange={(e) => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-orange-500"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </div>
        </div>
      </div>

      {/* Recent Payments Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Payments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.slice(0, filters.limit).map((payment) => (
                <tr key={payment.paymentIntentId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {payment.paymentIntentId.substring(0, 20)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.orderId || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(payment.amount, payment.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      payment.status === 'success' 
                        ? 'bg-green-100 text-green-800'
                        : payment.status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : payment.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.paymentMethod}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(payment.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentAnalytics;