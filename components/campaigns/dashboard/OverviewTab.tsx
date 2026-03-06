import { Campaign } from '@/types/campaign';
import { FileText, CheckCircle2, Circle } from 'lucide-react';
import CampaignPrimaryButton from '@/components/ui/CampaignPrimaryButton';

interface OverviewTabProps {
    campaign: Campaign;
    dashboardStats: any;
    timelineEvents: any[];
}

export default function OverviewTab({ campaign, dashboardStats, timelineEvents }: OverviewTabProps) {
    return (
        <div className="space-y-6">
            {/* Campaign Brief */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                    <h2 className="text-lg font-bold text-brand-navy mb-2">Campaign Brief</h2>
                    <p className="text-gray-600 text-sm mb-4">
                        Looking for fashion influencers to showcase our new summer collection. Create engaging content that highlights the versatility and style of our latest designs.
                    </p>
                    <div className="flex gap-2">
                        <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold">2 Instagram posts</span>
                        <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold">3 Instagram stories</span>
                        <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold">1 TikTok video</span>
                    </div>
                </div>
                <CampaignPrimaryButton
                    label="View Full Brief"
                    icon={FileText}
                    className="!py-2.5 !px-5 !text-sm"
                    onClick={() => { }}
                />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-8 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-brand-navy mb-2">{dashboardStats.pending}</span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pending</span>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-8 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-[#00A63E] mb-2">{dashboardStats.accepted}</span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Accepted</span>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-8 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-brand-navy mb-2">{dashboardStats.submissions}</span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Submissions</span>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-8 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-[#FF4D4F] mb-2">{dashboardStats.toReview}</span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">To Review</span>
                </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-xl border border-gray-200 p-8">
                <h3 className="text-lg font-bold text-brand-navy mb-8">Timeline</h3>
                <div className="flex flex-col md:flex-row justify-between relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-[14px] left-0 w-full h-0.5 bg-gray-100 -z-10" />

                    {timelineEvents.map((event, index) => (
                        <div key={index} className="flex gap-4 md:block relative bg-white md:bg-transparent">
                            <div className="flex-shrink-0 md:mb-4 flex items-center justify-center">
                                {event.status === 'completed' ? (
                                    <div className="w-8 h-8 rounded-full bg-[#00A63E] flex items-center justify-center text-white">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-brand-navy flex items-center justify-center text-white border-4 border-white shadow-sm">
                                        <Circle className="w-2 h-2 fill-current" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-brand-navy md:mb-1">{event.label}</h4>
                                <p className="text-xs text-gray-500 mb-1">{event.date}</p>
                                <p className="text-xs text-gray-400">{event.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Budget Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-8">
                <h3 className="text-lg font-bold text-brand-navy mb-6">Budget</h3>

                {(() => {
                    const totalBudget = campaign.budget?.fixedAmount || campaign.budget?.maxRangeAmount || 0;
                    const spentBudget = 0; // TODO: Track actual spending
                    const spentPercentage = totalBudget > 0 ? (spentBudget / totalBudget) * 100 : 0;

                    return (
                        <>
                            <div className="flex justify-between items-end mb-2">
                                <div>
                                    <span className="text-xs text-gray-500 uppercase font-medium">TOTAL BUDGET</span>
                                    <div className="text-2xl font-bold text-brand-navy">
                                        {new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 }).format(totalBudget)}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-gray-500 uppercase font-medium">SPENT</span>
                                    <div className="text-2xl font-bold text-[#00A63E]">
                                        {new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 }).format(spentBudget)}
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#00A63E] rounded-full"
                                    style={{ width: `${spentPercentage}%` }}
                                />
                            </div>
                        </>
                    );
                })()}
            </div>

            {/* Files & Assets Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-8">
                <h3 className="text-lg font-bold text-brand-navy mb-6">Files & Assets</h3>

                <div className="space-y-4">
                    {/* File Item 1 */}
                    <div className="flex items-center gap-4 p-4 bg-[#F0F4F8] rounded-lg">
                        <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-brand-navy">Brand_Guidelines.pdf</h4>
                            <p className="text-xs text-gray-500">1.8 MB • PDF</p>
                        </div>
                    </div>

                    {/* File Item 2 */}
                    <div className="flex items-center gap-4 p-4 bg-[#F0F4F8] rounded-lg">
                        <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-brand-navy">Product_Images.zip</h4>
                            <p className="text-xs text-gray-500">24 MB • ZIP</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
