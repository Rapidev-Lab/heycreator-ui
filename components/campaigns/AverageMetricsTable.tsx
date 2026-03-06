"use client";

import React from "react";
import { Instagram, Music2, Youtube, X, Facebook } from "lucide-react";

const platformIcons = {
  Instagram: <Instagram className="w-5 h-5 text-brand-navy-dark" />,
  TikTok: <Music2 className="w-5 h-5 text-brand-navy-dark" />,
  YouTube: <Youtube className="w-5 h-5 text-brand-navy-dark" />,
  X: <span className="font-bold text-lg text-brand-navy-dark">X</span>,
  Facebook: <Facebook className="w-5 h-5 text-brand-navy-dark" />,
};

export interface NetworkMetric {
  network: "Instagram" | "TikTok" | "YouTube" | "X" | "Facebook";
  followers: string;
  engagements: string;
  engagementRate: string;
}

interface AverageMetricsTableProps {
  data: NetworkMetric[];
}

export default function AverageMetricsTable({ data }: AverageMetricsTableProps) {
  return (
    <div className="w-full mt-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="py-4 px-2 text-[11px] font-black text-gray-400 tracking-widest uppercase">
                Network
              </th>
              <th className="py-4 px-2 text-[11px] font-black text-gray-400 tracking-widest uppercase text-center">
                Followers
              </th>
              <th className="py-4 px-2 text-[11px] font-black text-gray-400 tracking-widest uppercase text-center">
                Engagements
              </th>
              <th className="py-4 px-2 text-[11px] font-black text-gray-400 tracking-widest uppercase text-right">
                Eng. Rate
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((item, index) => (
              <tr key={index} className="group hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                      {platformIcons[item.network]}
                    </div>
                    <span className="text-sm font-bold text-brand-navy">
                      {item.network}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-2 text-sm font-medium text-brand-navy text-center">
                  {item.followers}
                </td>
                <td className="py-4 px-2 text-sm font-medium text-brand-navy text-center">
                  {item.engagements}
                </td>
                <td className="py-4 px-2 text-sm font-medium text-brand-navy text-right">
                  {item.engagementRate}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}