import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig';
import { toast } from 'react-hot-toast';
import { FaWallet, FaCoins, FaHistory, FaArrowUp, FaArrowDown, FaExclamationCircle } from 'react-icons/fa';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';

const UserWalletPage = () => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const { data } = await axiosInstance.get('/wallet');
        setWallet(data);
      } catch (err) {
        setError('Failed to fetch wallet information.');
        toast.error('Failed to fetch wallet information.');
      } finally {
        setLoading(false);
      }
    };
    fetchWallet();
  }, []);

  if (loading) {
    return (
      <div className="font-[Poppins] bg-gray-50 min-h-screen">
        <div className="w-full max-w-4xl mx-auto py-8 px-3 md:px-8 mt-16 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton height="150px" />
            <Skeleton height="150px" />
          </div>
          <Skeleton height="300px" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="font-[Poppins] bg-gray-50 min-h-screen">
        <div className="w-full max-w-4xl mx-auto py-8 px-3 md:px-8 mt-16">
          <EmptyState
            title="Error Loading Wallet"
            description={error}
            icon={<FaExclamationCircle size={48} className="text-red-400" />}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="font-[Poppins] bg-gray-50 min-h-screen">
      <div className="w-full max-w-4xl mx-auto py-8 px-3 md:px-8 mt-16">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 mb-2">My Wallet</h1>
          <p className="text-gray-600">Manage your balance and transactions</p>
        </div>

        {wallet ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Balance Card */}
            <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white border-none">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <FaWallet className="text-2xl" />
                </div>
                <h2 className="text-xl font-bold opacity-90">Total Balance</h2>
              </div>
              <p className="text-4xl font-black mb-2">₹{wallet.balance.toFixed(2)}</p>
              <p className="text-sm opacity-75">Available for bookings</p>
            </Card>

            {/* YC Coins Card */}
            <Card className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white border-none">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <FaCoins className="text-2xl" />
                </div>
                <h2 className="text-xl font-bold opacity-90">YC Coins</h2>
              </div>
              <p className="text-4xl font-black mb-2">{wallet.ycCoins}</p>
              <p className="text-sm opacity-75">Redeem for discounts</p>
            </Card>

            {/* Transactions Section */}
            <div className="md:col-span-2">
              <Card>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                    <FaHistory />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
                </div>

                <div className="space-y-4">
                  {wallet.transactions && wallet.transactions.length > 0 ? (
                    wallet.transactions.slice().reverse().map((tx) => (
                      <div key={tx._id} className="flex justify-between items-center p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type.includes('credit') ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                            }`}>
                            {tx.type.includes('credit') ? <FaArrowUp /> : <FaArrowDown />}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 capitalize">{tx.note || tx.type.replace('_', ' ')}</p>
                            <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold text-lg ${tx.type.includes('credit') ? 'text-green-600' : 'text-red-600'}`}>
                            {tx.type.includes('credit') ? '+' : '-'} ₹{tx.amount.toFixed(2)}
                          </p>
                          <Badge variant={tx.status === 'failed' ? 'danger' : 'success'} size="sm">
                            {tx.status || 'Success'}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState
                      icon={<FaHistory size={48} className="text-gray-300" />}
                      title="No Transactions"
                      description="Your transaction history will appear here."
                    />
                  )}
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <EmptyState
            title="Wallet Not Found"
            description="We couldn't load your wallet details."
          />
        )}
      </div>
    </div>
  );
};

export default UserWalletPage;