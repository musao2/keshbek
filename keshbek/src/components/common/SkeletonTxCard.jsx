import React from 'react';

const SkeletonTxCard = () => (
  <div className="bg-white rounded-[16px] p-4 flex items-center gap-3 border border-gray-100 shadow-sm">
    <div className="skeleton w-11 h-11 rounded-2xl shrink-0" />
    <div className="flex-1">
      <div className="skeleton h-3.5 w-28 mb-2 rounded" />
      <div className="skeleton h-3 w-20 rounded" />
    </div>
    <div className="text-right">
      <div className="skeleton h-3.5 w-16 mb-2 rounded" />
      <div className="skeleton h-3 w-20 rounded" />
    </div>
  </div>
);

export default SkeletonTxCard;
