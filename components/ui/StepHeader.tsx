import React from 'react';

interface StepHeaderProps {
  title: string;
  subtitle: string;
}

const StepHeader: React.FC<StepHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="flex h-[101px] px-8 pt-6 pb-[1px] flex-col items-start gap-1 self-stretch flex-shrink-0 border-b border-[#E0E0E0] rounded-t-[20px]">
      <h2 className="text-lg font-semibold text-brand-navy-dark">{title}</h2>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  );
};

export default StepHeader;