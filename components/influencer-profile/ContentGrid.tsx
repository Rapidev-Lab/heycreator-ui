'use client';

import { useState } from 'react';
import { ContentPost } from '@/types/profile';
import { Play, Heart, MessageCircle, Image as ImageIcon, ExternalLink } from 'lucide-react';
import SocialIcons from '@/components/SocialIcons';
import { ProfileTransformer } from '@/lib/services/profile-transformer.service';
import { proxyImage } from '@/lib/utils';

interface ContentGridProps {
  posts: ContentPost[];
  maxPosts?: number;
  onViewAll?: () => void;
}

interface ContentCardProps {
  post: ContentPost;
}

function ContentCard({ post }: ContentCardProps) {
  const [imageError, setImageError] = useState(false);
  const hasUrl = post.url && post.url !== '#';
  const Wrapper = hasUrl ? 'a' : 'div';
  const wrapperProps = hasUrl
    ? { href: post.url, target: '_blank' as const, rel: 'noopener noreferrer' }
    : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={`group relative aspect-square bg-gray-100 rounded-lg overflow-hidden ${hasUrl ? 'cursor-pointer' : 'cursor-default'}`}
    >
      {/* Thumbnail Image */}
      {!imageError ? (
        <img
          src={proxyImage(post.thumbnail)}
          alt={post.caption ? post.caption.substring(0, 50) : 'Post'}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
          <ImageIcon className="w-12 h-12 text-gray-400" />
        </div>
      )}

      {/* Platform Badge - Top Left */}
      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5">
        <SocialIcons platforms={[post.platform as any]} size="sm" />
      </div>

      {/* External Link Icon - Top Right (only when URL exists) */}
      {hasUrl && (
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <ExternalLink className="w-3.5 h-3.5 text-gray-700" />
        </div>
      )}

      {/* Video Play Button - Center (only for videos) */}
      {post.type === 'video' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Play className="w-6 h-6 text-gray-900 fill-gray-900" />
          </div>
        </div>
      )}

      {/* Hover Overlay with Engagement Stats */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6">
        {/* Likes */}
        <div className="flex items-center gap-2 text-white">
          <Heart className="w-5 h-5 fill-white" />
          <span className="font-semibold text-lg">
            {ProfileTransformer.formatNumber(post.likesCount)}
          </span>
        </div>

        {/* Comments */}
        <div className="flex items-center gap-2 text-white">
          <MessageCircle className="w-5 h-5 fill-white" />
          <span className="font-semibold text-lg">
            {ProfileTransformer.formatNumber(post.commentsCount)}
          </span>
        </div>
      </div>

      {/* Views Count (for videos) - Bottom Right */}
      {post.type === 'video' && post.viewsCount && (
        <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm rounded px-2 py-1">
          <span className="text-white text-xs font-medium">
            {ProfileTransformer.formatNumber(post.viewsCount)} views
          </span>
        </div>
      )}
    </Wrapper>
  );
}

export function ContentGrid({ posts, maxPosts = 12, onViewAll }: ContentGridProps) {
  const displayPosts = posts.slice(0, maxPosts);

  if (displayPosts.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Top Performing Content</h2>
        <button
          onClick={onViewAll}
          className="text-sm text-brand-navy hover:text-brand-navy-light font-medium transition-colors"
        >
          View All
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {displayPosts.map((post) => (
          <ContentCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
