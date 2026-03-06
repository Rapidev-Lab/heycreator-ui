# Hey Creator - Influencer Discovery Platform

A modern influencer discovery and management platform built with Next.js, TypeScript, and Tailwind CSS.

## 🎉 Status: Frontend Implementation Complete!

All features from design mockups have been fully implemented. See [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) for details.

## 📚 Documentation

- **[QUICK_START.md](QUICK_START.md)** - Get started in 3 steps
- **[IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md)** - Complete feature overview
- **[FEATURES_CHECKLIST.md](FEATURES_CHECKLIST.md)** - Detailed checklist (150+ features)
- **[CHANGELOG.md](CHANGELOG.md)** - Change history
- **[SETUP.md](SETUP.md)** - Detailed setup instructions
- **[CLAUDE.md](CLAUDE.md)** - AI context documentation
- **[API Reference](http://localhost:3000/api-docs)** - Interactive API documentation (Scalar)

## 🔌 API Documentation

The HeyCreator API is fully documented using the **OpenAPI 3.0.3** specification and served through an interactive **Scalar** API reference.

### Accessing the API Docs

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open the interactive API reference in your browser:

   ```text
   http://localhost:3000/api-docs
   ```

The Scalar interface provides a modern, searchable API explorer where you can browse endpoints, view request/response schemas, and test API calls directly from the browser.

### What's Documented

The API reference covers **38+ endpoints** across **12 categories**:

| Category | Description |
| --- | --- |
| **Authentication** | Sign up, login, email verification, password reset |
| **Search & Discovery** | Hybrid search (database + live APIs), streaming results |
| **Profiles** | Create, read, update, and enrich influencer profiles |
| **Campaigns** | Campaign CRUD, status management |
| **Applications** | Creator applications to campaigns |
| **Invitations** | Brand invitations to creators |
| **Documents** | Campaign document management |
| **Deliverables** | Content deliverable tracking |
| **Creator Lists** | Saved creator collections |
| **Users & Creators** | User management, creator profiles |
| **Enrichment** | Background profile data enrichment |
| **Utility** | Image proxy, metrics, pricing, dashboard |

### Authentication

All authenticated endpoints require a **Firebase ID Token** passed as a Bearer token:

```text
Authorization: Bearer <firebase-id-token>
```

### OpenAPI Spec

The raw OpenAPI specification is available at:

```text
http://localhost:3000/openapi.json
```

This JSON file can be imported into tools like Postman, Insomnia, or any OpenAPI-compatible client for testing.

## Features

### Discovery & Search
- Multi-platform search with dynamic placeholder text
- Support for Instagram, TikTok, X/Twitter, YouTube, Facebook, and Snapchat
- Multi-select platform filtering
- Browse and search influencers

### Influencer Profiles
- Comprehensive influencer profiles with detailed analytics
- Profile snapshot with key metrics (Influence Score, Engagement Rate, True Reach, Total Followers)
- Average metrics table across all platforms
- Content gallery with platform indicators
- Audience demographics (Age, Gender, Location, Interests, Brand Affinity)
- Similar influencers recommendations

### UI/UX Features
- Grid and list view modes
- Filter and sort capabilities
- Responsive design
- Tooltips for metric explanations
- Social media platform integration
- Interactive content previews

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Auth & Database**: Firebase (Authentication + Firestore)
- **API Docs**: Scalar + OpenAPI 3.0.3
- **Search APIs**: RapidAPI, Apify Client

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Development Workflow

### Git Flow Standards

This repository enforces strict Git Flow conventions to maintain code quality and consistency across the development team.

#### Commit Message Convention

All commits must adhere to the conventional commit format:

```
<type>: <description>
```

**Valid Types:**
- `feat` - Introduction of new features
- `fix` - Bug fixes and patches  
- `chore` - Maintenance and tooling updates
- `docs` - Documentation updates
- `refactor` - Code restructuring without functionality changes
- `test` - Test additions and modifications

**Requirements:**
- Use lowercase for the entire message
- Keep descriptions concise and descriptive
- Start description with a verb in imperative mood

**Examples:**
```bash
feat: implement user authentication system
fix: resolve memory leak in profile aggregator
chore: upgrade firebase dependencies to v12.6.0
docs: update api documentation for campaigns endpoint
refactor: extract common validation logic into utils
test: add unit tests for auth middleware
```

#### Branch Naming Convention

All feature branches must follow Git Flow naming patterns:

```
<type>/<descriptive-name>
```

**Branch Types:**
- `feature/` - New features and enhancements
- `bugfix/` - Bug fixes and patches
- `release/` - Release preparation branches
- `hotfix/` - Critical production fixes

**Naming Rules:**
- Use lowercase letters only
- Separate words with hyphens
- Keep names descriptive but concise
- Avoid special characters and spaces

**Examples:**
```bash
feature/social-media-integration
bugfix/authentication-redirect-loop  
release/v2.1.0
hotfix/csrf-vulnerability-patch
```

#### Repository Protection Rules

**Protected Branches:**
- Direct pushes to `development` branch are prohibited
- All changes must go through pull requests
- Branch protection enforced via pre-push hooks

**Override Capability:**
- Administrators can bypass restrictions using `git push --no-verify`
- Use override capability sparingly and document reasoning

#### Pull Request Process

1. **Branch Creation:** Create feature branch from latest `development`
2. **Development:** Implement changes with proper commit messages
3. **Testing:** Ensure all tests pass locally
4. **Pull Request:** Create PR targeting `development` branch
5. **Review:** Code review required before merge
6. **Merge:** Squash merge recommended for clean history

#### Hook Validation

The repository includes automated Git hooks that validate:

- Commit message format and conventions
- Branch naming standards  
- Protection against direct pushes to protected branches

Hooks are managed via Husky and automatically installed during `npm install`.

## Project Structure

```
discovery-influencers/
├── app/                      # Next.js App Router
│   ├── influencers/         # Influencers list page
│   │   └── [id]/           # Individual influencer profile
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page (redirects)
│   └── globals.css         # Global styles
├── components/              # React components
│   ├── Header.tsx          # Navigation header
│   ├── InfluencerCard.tsx  # Influencer card component
│   ├── InfluencersToolbar.tsx  # Toolbar with filters
│   └── SocialIcons.tsx     # Social media icons
├── data/                    # Mock data
│   └── mockInfluencers.ts  # Influencer mock data
├── types/                   # TypeScript types
│   └── influencer.ts       # Influencer type definitions
└── public/                  # Static assets
```

## Features to Implement (Backend)

The following features are planned for backend implementation:

- User authentication
- Database integration (PostgreSQL/Firebase)
- Real influencer data from social media APIs
- Advanced search and filtering
- Campaign management
- Analytics and reporting

## License

MIT
