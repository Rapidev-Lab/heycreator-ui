import { 
  ChevronLeft, HelpCircle, Edit, Check, FileText, 
  Instagram, TrendingUp, Users, UserCheck, DollarSign, BarChart3 
} from "lucide-react";
export default function PerformanceSummary() {
  const performanceStats = [
    { label: "Posts", value: "25", icon: Instagram },
    { label: "Engagements", value: "192K", icon: TrendingUp },
    { label: "People Reach", value: "123K", icon: Users },
    { label: "Women Audience", value: "85%", icon: UserCheck },
    { label: "EMV", value: "R 2.2m", icon: DollarSign },
    { label: "Engagement Rate", value: "4.8%", icon: BarChart3 },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-brand-navy-dark mb-6">
        Performance Summary
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {performanceStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-[#F8F9FD] rounded-lg p-6 border border-[#E0E0E0]">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Icon className="w-4 h-4" />
                <span className="text-xs font-medium">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold text-brand-navy-dark">
                {stat.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
