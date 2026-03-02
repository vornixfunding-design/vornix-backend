import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminStockPage() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect('/login');
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (profile?.role !== 'admin') redirect('/dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-[#0047AB]">📦 Stock Accounts</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Account Form */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New XM Demo Account</h2>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="MT5 Login ID" className="px-4 py-2 border rounded-lg" />
            <input type="password" placeholder="Main Password" className="px-4 py-2 border rounded-lg" />
            <input type="password" placeholder="Investor Password" className="px-4 py-2 border rounded-lg" />
            <input type="text" placeholder="Server Name (e.g., XMGlobal-MT5 5)" className="px-4 py-2 border rounded-lg" />
            <button className="md:col-span-2 bg-[#0047AB] text-white py-2 px-4 rounded-lg hover:bg-[#003580]">
              Add to Stock
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-3">
            ⚠️ Passwords will be encrypted before saving. Never share investor passwords with traders.
          </p>
        </div>

        {/* Stock List Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Available Accounts</h3>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Login ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Server</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Added</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                  No stock accounts yet. Add your first XM demo account above.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
