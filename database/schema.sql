-- Hey Creator Database Schema
-- Profile Aggregation System
-- Version: 1.0

-- =============================================================================
-- UNIFIED PROFILES TABLE
-- Stores aggregated influencer profiles that combine multiple platform accounts
-- =============================================================================

CREATE TABLE unified_profiles (
    id VARCHAR(255) PRIMARY KEY,
    display_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    location VARCHAR(255),
    flag VARCHAR(10),
    categories TEXT[], -- Array of category strings
    influence_score INTEGER DEFAULT 0 CHECK (influence_score >= 0 AND influence_score <= 100),

    -- Combined metrics (denormalized for performance)
    total_followers BIGINT DEFAULT 0,
    average_engagement_rate DECIMAL(5, 2) DEFAULT 0,
    total_reach BIGINT DEFAULT 0,
    total_engagements BIGINT DEFAULT 0,

    -- Insights
    estimated_price VARCHAR(50),
    main_topics TEXT[],
    brand_safety VARCHAR(20) CHECK (brand_safety IN ('Safe', 'Moderate', 'Risky')),
    audience_age_group VARCHAR(50),
    audience_authenticity VARCHAR(20) CHECK (audience_authenticity IN ('Great', 'Good', 'Fair', 'Poor')),
    audience_location TEXT[],
    portfolio TEXT[],
    sponsored_content_frequency VARCHAR(50),

    -- Metadata
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
    created_by VARCHAR(255), -- User ID reference (for future auth)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries
CREATE INDEX idx_unified_profiles_status ON unified_profiles(status);
CREATE INDEX idx_unified_profiles_influence_score ON unified_profiles(influence_score DESC);
CREATE INDEX idx_unified_profiles_total_followers ON unified_profiles(total_followers DESC);
CREATE INDEX idx_unified_profiles_created_by ON unified_profiles(created_by);
CREATE INDEX idx_unified_profiles_created_at ON unified_profiles(created_at DESC);

-- Full-text search index
CREATE INDEX idx_unified_profiles_search ON unified_profiles
    USING GIN (to_tsvector('english', display_name || ' ' || COALESCE(bio, '')));

-- =============================================================================
-- LINKED ACCOUNTS TABLE
-- Stores individual social media accounts linked to unified profiles
-- =============================================================================

CREATE TABLE linked_accounts (
    id VARCHAR(255) PRIMARY KEY,
    unified_profile_id VARCHAR(255) NOT NULL REFERENCES unified_profiles(id) ON DELETE CASCADE,

    -- Platform information
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'youtube', 'twitter', 'facebook')),
    username VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    follower_count BIGINT DEFAULT 0,
    profile_url TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,

    -- Contact information
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    contact_website TEXT,

    -- Verification status
    verified BOOLEAN DEFAULT FALSE,

    -- Timestamps
    linked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Ensure unique platform-username combination per profile
    UNIQUE (unified_profile_id, platform, username)
);

-- Indexes for linked accounts
CREATE INDEX idx_linked_accounts_profile_id ON linked_accounts(unified_profile_id);
CREATE INDEX idx_linked_accounts_platform ON linked_accounts(platform);
CREATE INDEX idx_linked_accounts_username ON linked_accounts(username);

-- Prevent duplicate accounts across profiles
CREATE UNIQUE INDEX idx_linked_accounts_unique_account ON linked_accounts(platform, LOWER(username));

-- =============================================================================
-- PLATFORM METRICS TABLE
-- Stores detailed metrics for each platform (optional, for detailed analytics)
-- =============================================================================

CREATE TABLE platform_metrics (
    id SERIAL PRIMARY KEY,
    unified_profile_id VARCHAR(255) NOT NULL REFERENCES unified_profiles(id) ON DELETE CASCADE,

    network VARCHAR(50) NOT NULL,
    followers VARCHAR(20),
    engagements BIGINT DEFAULT 0,
    engagement_rate VARCHAR(20),
    reach VARCHAR(20),
    emv VARCHAR(50),

    -- Timestamps
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_platform_metrics_profile_id ON platform_metrics(unified_profile_id);

-- =============================================================================
-- CONTENT POSTS TABLE
-- Stores content posts for the gallery section
-- =============================================================================

CREATE TABLE content_posts (
    id VARCHAR(255) PRIMARY KEY,
    unified_profile_id VARCHAR(255) NOT NULL REFERENCES unified_profiles(id) ON DELETE CASCADE,

    thumbnail TEXT NOT NULL,
    platform VARCHAR(50) NOT NULL,
    likes VARCHAR(50),
    comments VARCHAR(50),
    post_date DATE,
    caption TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_content_posts_profile_id ON content_posts(unified_profile_id);

-- =============================================================================
-- DEMOGRAPHICS TABLE
-- Stores audience demographic data
-- =============================================================================

CREATE TABLE demographics (
    id SERIAL PRIMARY KEY,
    unified_profile_id VARCHAR(255) UNIQUE NOT NULL REFERENCES unified_profiles(id) ON DELETE CASCADE,

    average_age INTEGER,
    top_gender VARCHAR(50),
    top_gender_percentage VARCHAR(10),

    -- JSONB for flexible data storage
    top_countries JSONB DEFAULT '[]',
    audience_interests JSONB DEFAULT '[]',
    brand_affinity JSONB DEFAULT '[]',

    -- Timestamps
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_demographics_profile_id ON demographics(unified_profile_id);

-- =============================================================================
-- FOLLOWER DISTRIBUTION TABLE
-- Stores follower breakdown by platform
-- =============================================================================

CREATE TABLE follower_distribution (
    id SERIAL PRIMARY KEY,
    unified_profile_id VARCHAR(255) NOT NULL REFERENCES unified_profiles(id) ON DELETE CASCADE,

    platform VARCHAR(50) NOT NULL,
    count BIGINT DEFAULT 0,
    percentage DECIMAL(5, 2) DEFAULT 0,

    UNIQUE (unified_profile_id, platform)
);

CREATE INDEX idx_follower_distribution_profile_id ON follower_distribution(unified_profile_id);

-- =============================================================================
-- SIMILAR INFLUENCERS TABLE
-- Stores relationships between similar influencers
-- =============================================================================

CREATE TABLE similar_influencers (
    id SERIAL PRIMARY KEY,
    unified_profile_id VARCHAR(255) NOT NULL REFERENCES unified_profiles(id) ON DELETE CASCADE,
    similar_profile_id VARCHAR(255), -- Can be null if from external source

    name VARCHAR(255) NOT NULL,
    avatar TEXT,
    influence_score INTEGER DEFAULT 0,
    platforms TEXT[],
    followers VARCHAR(50),
    location VARCHAR(255),
    flag VARCHAR(10),
    local_audience VARCHAR(10),
    engagement VARCHAR(10),
    posts INTEGER,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_similar_influencers_profile_id ON similar_influencers(unified_profile_id);

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for unified_profiles
CREATE TRIGGER update_unified_profiles_updated_at
    BEFORE UPDATE ON unified_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- VIEWS
-- =============================================================================

-- View for unified profiles with account count
CREATE VIEW unified_profiles_summary AS
SELECT
    up.id,
    up.display_name,
    up.avatar_url,
    up.influence_score,
    up.total_followers,
    up.status,
    up.created_at,
    COUNT(la.id) as linked_accounts_count,
    ARRAY_AGG(DISTINCT la.platform) as platforms
FROM unified_profiles up
LEFT JOIN linked_accounts la ON up.id = la.unified_profile_id
WHERE up.status != 'deleted'
GROUP BY up.id;

-- =============================================================================
-- SAMPLE QUERIES
-- =============================================================================

-- Get unified profile with all linked accounts
-- SELECT up.*,
--        json_agg(la.*) as linked_accounts
-- FROM unified_profiles up
-- LEFT JOIN linked_accounts la ON up.id = la.unified_profile_id
-- WHERE up.id = 'unified-xxx'
-- GROUP BY up.id;

-- Search profiles by keyword
-- SELECT * FROM unified_profiles
-- WHERE to_tsvector('english', display_name || ' ' || COALESCE(bio, ''))
--       @@ plainto_tsquery('english', 'search term')
-- AND status = 'active';

-- Get profiles with specific platforms
-- SELECT DISTINCT up.*
-- FROM unified_profiles up
-- JOIN linked_accounts la ON up.id = la.unified_profile_id
-- WHERE la.platform IN ('instagram', 'tiktok')
-- AND up.status = 'active';
