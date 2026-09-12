import React from 'react';
import { RiGasStationFill } from 'react-icons/ri';
import { formatSum, formatDate } from '../../utils/formatters';

const TransactionListItem = ({ item, defaultStationName, onClick }) => {
  const isChiqim =
    Number(item.cashback_amount ?? item.cashbackAmount) < 0 ||
    (item.type || '').toLowerCase() === 'withdraw' ||
    (item.type || '').toUpperCase() === 'WITHDRAW';

  const cashbackVal = Math.abs(Number(item.cashback_amount ?? item.cashbackAmount ?? 0));
  const paymentVal = Math.abs(Number(item.amount ?? item.totalAmount ?? 0));

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-[16px] p-4 flex items-center justify-between border border-gray-100 ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''}`}
      style={{ boxShadow: '0px 4px 12px rgba(0,0,0,0.05)' }}
    >
      <div className="flex items-center gap-3.5">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
          isChiqim
            ? 'bg-rose-50 text-rose-500 border border-rose-100'
            : 'bg-emerald-50 text-[#0f7b4c] border border-emerald-100'
        }`}>
          <RiGasStationFill size={19} />
        </div>
        <div>
          <p className="font-bold text-[14px] text-[#1a1a1a]">
            {item.station_name || defaultStationName || 'Shoxobcha'}
          </p>
          <p className="text-gray-400 text-[12px] mt-0.5">
            {formatDate(item.created_at || item.createdAt)}
          </p>
        </div>
      </div>
      <div className="text-right">
        {paymentVal > 0 && (
          <p className="text-gray-500 text-[12px] font-medium">
            To'lov: {formatSum(paymentVal)}
          </p>
        )}
        <p className={`font-black text-[14px] mt-0.5 ${isChiqim ? 'text-rose-500' : 'text-[#0f7b4c]'}`}>
          {isChiqim ? `- ${formatSum(cashbackVal)}` : `+ ${formatSum(cashbackVal)}`}
        </p>
      </div>
    </div>
  );
};

export default TransactionListItem;
