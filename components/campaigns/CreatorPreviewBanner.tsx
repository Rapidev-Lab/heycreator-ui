'use client';

interface CreatorPreviewBannerProps {
  title?: string;
  description?: string;
}

export default function CreatorPreviewBanner({ 
  title = "Creator Preview",
  description = "This is how your campaign will appear to influencers. Review all details before submitting."
}: CreatorPreviewBannerProps) {
  return (
    <div className="h-[74px] self-stretch rounded-[14px] border border-[rgba(99,102,241,0.30)] bg-[#F0F4FF] p-4 flex items-start gap-3">
      <img 
        src="/Warnng_icon.svg" 
        alt="Warning" 
        className="w-5 h-5 flex-shrink-0 mt-0.5"
      />
      <div>
        <p className="text-sm font-semibold leading-5 tracking-tight text-brand-navy-dark">{title}</p>
        <p className="text-xs font-normal leading-4 text-[#666]">{description}</p>
      </div>
    </div>
  );
}
