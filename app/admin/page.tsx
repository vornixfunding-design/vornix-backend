import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminPage() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }
  
  // Get stats
  const { count: userCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'trader');
  
  const { count: accountCount } = await supabase
    .from('account_stock')
    .select('*', { count: 'exact', head: true });
  
  const { count: challengeCount } = await supabase
    .from('challenges')
    .select('*', { count: 'exact', head: true });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-[#0047AB]">Vornix Admin</h1>
            <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
              Admin Panel
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 text-sm">{user.email}</span>
            <Link 
              href="/dashboard" 
              className="text-sm text-[#0047AB] hover:text-[#003580] font-medium"
            >
              View Dashboard
            </Link>
            <form action="/auth/signout" method="POST">
              <button className="text-sm text-red-600 hover:text-red-800 font-medium">
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900">Admin Overview</h2>
          <p className="text-gray-600 mt-1">Manage your prop firm from here.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500">
            <h3 className="text-sm font-medium text-gray-500">Total Traders</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{userCount || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-green-500">
            <h3 className="text-sm font-medium text-gray-500">Stock Accounts</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{accountCount || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-purple-500">
            <h3 className="text-sm font-medium text-gray-500">Active Challenges</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{challengeCount || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-orange-500">
            <h3 className="text-sm font-medium text-gray-500">Revenue</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">$0</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/admin/stock" className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition cursor-pointer">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📦 Manage Stock Accounts</h3>
            <p className="text-gray-600 text-sm">Add, edit, or assign XM demo accounts to traders.</p>
          </Link>
          <Link href="/admin/coupons" className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition cursor-pointer">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">🎟️ Coupon Codes</h3>
            <p className="text-gray-600 text-sm">Create discount codes for challenges.</p>
          </Link>
          <Link href="/admin/settings" className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition cursor-pointer">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">⚙️ Firm Settings</h3>
            <p className="text-gray-600 text-sm">Configure drawdown rules, profit targets, and more.</p>
          </Link>
          <Link href="/admin/users" className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition cursor-pointer">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">👥 Manage Users</h3>
            <p className="text-gray-600 text-sm">View all traders, confirm accounts, manage roles.</p>
          </Link>
          <Link href="/admin/challenges" className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition cursor-pointer">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📊 Challenge Analytics</h3>
            <p className="text-gray-600 text-sm">Track pass/fail rates, trader performance.</p>
          </Link>
          <div className="bg-white rounded-xl shadow p-6 border-2 border-dashed border-gray-300 flex items-center justify-center">
            <p className="text-gray-500 text-sm">More features coming soon...</p>
          </div>
        </div>
      </main>
    </div>
  );
}
