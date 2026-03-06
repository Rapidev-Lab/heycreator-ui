/**
 * Seed sample campaigns into Firestore for a specific brand user.
 * Usage: npx tsx scripts/seed-sample-campaigns.ts
 */
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

// ── Target brand user ──
const BRAND_UID = 'uHxGqSu22IZUDz6J79O0zmw3uLh1';
const BRAND_EMAIL = 'wieslaw@rapidevlabs.com';
const BRAND_NAME = 'RapiDev Labs';

// ── Load .env ──
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  const envLocalPath = path.join(process.cwd(), '.env.local');
  for (const p of [envLocalPath, envPath]) {
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf8');
      for (const line of content.split('\n')) {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*"?(.*?)"?\s*$/);
        if (match && !process.env[match[1]]) {
          process.env[match[1]] = match[2];
        }
      }
    }
  }
}
loadEnv();

function initFirebase(): admin.firestore.Firestore {
  if (admin.apps.length > 0) return admin.firestore(admin.apps[0]!);
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    const sa = JSON.parse(
      Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8')
    );
    admin.initializeApp({ credential: admin.credential.cert(sa) });
    const db = admin.firestore();
    db.settings({ ignoreUndefinedProperties: true });
    return db;
  }
  const saPath = path.join(process.cwd(), 'scripts', 'heycreator-service-account.json');
  if (fs.existsSync(saPath)) {
    const sa = JSON.parse(fs.readFileSync(saPath, 'utf8'));
    admin.initializeApp({ credential: admin.credential.cert(sa) });
    const db = admin.firestore();
    db.settings({ ignoreUndefinedProperties: true });
    return db;
  }
  throw new Error('No Firebase credentials found. Set FIREBASE_SERVICE_ACCOUNT_BASE64 or place heycreator-service-account.json in /scripts.');
}

// Helper: date N days from now
function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(0, 0, 0, 0);
  return d;
}

const now = new Date();

// ── Sample Campaigns ──
const campaigns = [
  {
    campaignTitle: 'Summer Glow Skincare Launch',
    description: 'We are launching our new summer skincare range and looking for beauty creators to showcase the products through authentic, glowing content. Show your audience how our products fit into a daily routine.',
    campaignVisibility: 'public',
    status: 'PUBLISHED',
    campaignObjectives: ['Brand Awareness', 'Product Launch', 'User Generated Content'],
    campaignCategories: ['Beauty & Skincare', 'Health & Wellness'],
    kpi: 'Engagement Rate',
    campaignStart: daysFromNow(5),
    campaignEnd: daysFromNow(35),
    campaignProduct: {
      productType: 'Skincare',
      productName: 'Summer Glow SPF50 Kit',
      productImagesUrls: [],
      productValue: 850,
      productLink: 'https://example.com/summer-glow',
      willReimburse_or_productShipped: false,
      keepsProduct: true,
      reimburseAmount: 0,
      accessInstructions: 'Product will be shipped to your address within 3 business days.',
    },
    audience: {
      ageMin: 18,
      ageMax: 35,
      gender: 'female',
      targetLocation: 'South Africa',
      interests_and_affiliates: ['skincare', 'beauty', 'self-care', 'wellness'],
      minFollowers: 5000,
      minEngagements: 3,
    },
    budget: {
      compensationModel: 'range',
      currency: 'ZAR',
      fixedAmount: 0,
      minRangeAmount: 2000,
      maxRangeAmount: 5000,
      paymentTerms: 'Payment within 14 days of content approval',
      allowBidsMarketPlace: true,
      applicationDeadline: daysFromNow(14),
      contentCreationStart: daysFromNow(15),
      contentCreationEnd: daysFromNow(30),
    },
    tasks: {
      requiredDeliverables: [
        { platform: 'instagram', type: 'Reel', contentType: 'reel', details: 'A 30-60s Reel showing morning skincare routine with the product', dueDate: daysFromNow(25).toISOString(), quantity: 2 },
        { platform: 'instagram', type: 'Story', contentType: 'story', details: 'Unboxing story series (3-5 slides)', dueDate: daysFromNow(20).toISOString(), quantity: 1 },
        { platform: 'tiktok', type: 'Video', contentType: 'video', details: 'Get ready with me TikTok using the products', dueDate: daysFromNow(28).toISOString(), quantity: 1 },
      ],
      dos: [
        'Show the product packaging clearly',
        'Mention the SPF50 benefit',
        'Use natural lighting',
        'Tag @summerglow in all posts',
      ],
      donts: [
        'Do not compare to competitor brands',
        'Do not use heavy filters that obscure the product',
        'Do not make medical claims',
      ],
      metaData: {
        requiredHashTags: ['#SummerGlow', '#SPF50', '#SkincareRoutine', '#Ad'],
        mentions_or_tags: ['@summerglow', '@rapidevlabs'],
      },
      questions: [
        { question: 'What is your current skincare routine?', answers: ['Minimal (cleanser + moisturiser)', 'Moderate (5+ products)', 'Extensive (10+ products)'] },
        { question: 'Have you worked with skincare brands before?', answers: ['Yes', 'No'] },
      ],
    },
    stats: { views: 124, applications: 8, acceptedApplications: 2, rejectedApplications: 1, pendingApplications: 5, completedDeliverables: 0, totalDeliverables: 4 },
  },

  {
    campaignTitle: 'Street Food Festival Content Creators Wanted',
    description: 'Cape Town\'s biggest street food festival is back! We need food and lifestyle creators to cover the event, taste the dishes, interview vendors, and create mouth-watering content that makes everyone wish they were there.',
    campaignVisibility: 'public',
    status: 'PUBLISHED',
    campaignObjectives: ['Event Coverage', 'Brand Awareness', 'Ticket Sales'],
    campaignCategories: ['Food & Beverage', 'Lifestyle', 'Events'],
    kpi: 'Reach',
    campaignStart: daysFromNow(10),
    campaignEnd: daysFromNow(12),
    campaignProduct: {
      productType: 'Event Access',
      productName: 'VIP Festival Pass + R500 Food Voucher',
      productImagesUrls: [],
      productValue: 1500,
      productLink: 'https://example.com/streetfoodfest',
      willReimburse_or_productShipped: false,
      keepsProduct: true,
      reimburseAmount: 0,
      accessInstructions: 'VIP passes will be emailed 48 hours before the event. Collect your food voucher at the VIP tent.',
    },
    audience: {
      ageMin: 18,
      ageMax: 45,
      gender: 'any',
      targetLocation: 'Cape Town',
      interests_and_affiliates: ['food', 'street food', 'lifestyle', 'events', 'Cape Town'],
      minFollowers: 3000,
      minEngagements: 2,
    },
    budget: {
      compensationModel: 'fixed',
      currency: 'ZAR',
      fixedAmount: 3500,
      minRangeAmount: 0,
      maxRangeAmount: 0,
      paymentTerms: 'Payment within 7 days of content going live',
      allowBidsMarketPlace: true,
      applicationDeadline: daysFromNow(8),
      contentCreationStart: daysFromNow(10),
      contentCreationEnd: daysFromNow(14),
    },
    tasks: {
      requiredDeliverables: [
        { platform: 'instagram', type: 'Reel', contentType: 'reel', details: 'Festival highlight reel (60-90s) showcasing at least 3 vendors', dueDate: daysFromNow(13).toISOString(), quantity: 1 },
        { platform: 'tiktok', type: 'Video', contentType: 'video', details: 'Food tasting TikTok with reactions', dueDate: daysFromNow(12).toISOString(), quantity: 2 },
        { platform: 'instagram', type: 'Story', contentType: 'story', details: 'Live event coverage stories throughout the day', dueDate: daysFromNow(11).toISOString(), quantity: 1 },
      ],
      dos: [
        'Capture the atmosphere and energy of the festival',
        'Show close-ups of the food',
        'Interview at least one vendor',
        'Use the event geotag',
      ],
      donts: [
        'Do not film in restricted backstage areas',
        'Do not include alcohol in content aimed at minors',
      ],
      metaData: {
        requiredHashTags: ['#CTStreetFood', '#FoodFestival2026', '#CapeTownEats', '#Ad'],
        mentions_or_tags: ['@ctstreetfoodfest'],
      },
      questions: [
        { question: 'What type of food content do you usually create?', answers: ['Restaurant reviews', 'Cooking tutorials', 'Food events', 'All of the above'] },
      ],
    },
    stats: { views: 89, applications: 15, acceptedApplications: 4, rejectedApplications: 3, pendingApplications: 8, completedDeliverables: 0, totalDeliverables: 4 },
  },

  {
    campaignTitle: 'Tech Gadget Unboxing & Review',
    description: 'We are launching a new wireless earbud and need tech-savvy creators to do authentic unboxing and review content. Compare sound quality, comfort, and battery life in real-world scenarios.',
    campaignVisibility: 'public',
    status: 'PUBLISHED',
    campaignObjectives: ['Product Launch', 'Reviews', 'Sales Conversion'],
    campaignCategories: ['Technology', 'Gadgets'],
    kpi: 'Conversions',
    campaignStart: daysFromNow(3),
    campaignEnd: daysFromNow(21),
    campaignProduct: {
      productType: 'Electronics',
      productName: 'SoundPulse Pro Wireless Earbuds',
      productImagesUrls: [],
      productValue: 2499,
      productLink: 'https://example.com/soundpulse-pro',
      willReimburse_or_productShipped: false,
      keepsProduct: true,
      reimburseAmount: 0,
      accessInstructions: 'Product will be couriered to you. Please confirm your shipping address after acceptance.',
    },
    audience: {
      ageMin: 18,
      ageMax: 40,
      gender: 'any',
      targetLocation: 'South Africa',
      interests_and_affiliates: ['tech', 'gadgets', 'earbuds', 'reviews', 'unboxing'],
      minFollowers: 10000,
      minEngagements: 4,
    },
    budget: {
      compensationModel: 'fixed',
      currency: 'ZAR',
      fixedAmount: 8000,
      minRangeAmount: 0,
      maxRangeAmount: 0,
      paymentTerms: 'Payment on content approval + affiliate commission',
      allowBidsMarketPlace: true,
      applicationDeadline: daysFromNow(7),
      contentCreationStart: daysFromNow(8),
      contentCreationEnd: daysFromNow(20),
    },
    tasks: {
      requiredDeliverables: [
        { platform: 'youtube', type: 'Video', contentType: 'video', details: 'Full unboxing and review video (8-15 min)', dueDate: daysFromNow(18).toISOString(), quantity: 1 },
        { platform: 'instagram', type: 'Reel', contentType: 'reel', details: 'Quick 30s highlight reel showing best features', dueDate: daysFromNow(16).toISOString(), quantity: 1 },
        { platform: 'tiktok', type: 'Video', contentType: 'video', details: 'Sound test comparison TikTok', dueDate: daysFromNow(17).toISOString(), quantity: 1 },
      ],
      dos: [
        'Include a sound quality test',
        'Show the product from multiple angles',
        'Mention battery life performance',
        'Include affiliate link in bio/description',
      ],
      donts: [
        'Do not make false performance claims',
        'Do not compare with competitor names in a disparaging way',
      ],
      metaData: {
        requiredHashTags: ['#SoundPulsePro', '#TechReview', '#WirelessEarbuds', '#Ad'],
        mentions_or_tags: ['@soundpulseaudio'],
      },
      questions: [
        { question: 'What platform is your primary audience on?', answers: ['YouTube', 'TikTok', 'Instagram', 'Multiple platforms'] },
        { question: 'Have you reviewed tech products before?', answers: ['Yes, regularly', 'A few times', 'This would be my first'] },
      ],
    },
    stats: { views: 210, applications: 22, acceptedApplications: 3, rejectedApplications: 5, pendingApplications: 14, completedDeliverables: 0, totalDeliverables: 3 },
  },

  {
    campaignTitle: 'Fitness App 30-Day Challenge',
    description: 'Join our 30-day fitness challenge using the FitTrack Pro app! We want fitness and wellness creators to document their journey — workouts, progress, and honest results. Show your audience what consistency looks like.',
    campaignVisibility: 'public',
    status: 'PUBLISHED',
    campaignObjectives: ['App Downloads', 'User Generated Content', 'Community Building'],
    campaignCategories: ['Fitness', 'Health & Wellness', 'Lifestyle'],
    kpi: 'App Downloads',
    campaignStart: daysFromNow(1),
    campaignEnd: daysFromNow(45),
    campaignProduct: {
      productType: 'App Subscription',
      productName: 'FitTrack Pro - 6 Month Premium',
      productImagesUrls: [],
      productValue: 599,
      productLink: 'https://example.com/fittrackpro',
      willReimburse_or_productShipped: false,
      keepsProduct: true,
      reimburseAmount: 0,
      accessInstructions: 'A premium access code will be sent to your email within 24 hours of acceptance.',
    },
    audience: {
      ageMin: 18,
      ageMax: 45,
      gender: 'any',
      targetLocation: 'South Africa',
      interests_and_affiliates: ['fitness', 'gym', 'health', 'wellness', 'workout'],
      minFollowers: 2000,
      minEngagements: 5,
    },
    budget: {
      compensationModel: 'range',
      currency: 'ZAR',
      fixedAmount: 0,
      minRangeAmount: 4000,
      maxRangeAmount: 12000,
      paymentTerms: '50% upfront, 50% on completion of all deliverables',
      allowBidsMarketPlace: true,
      applicationDeadline: daysFromNow(5),
      contentCreationStart: daysFromNow(6),
      contentCreationEnd: daysFromNow(40),
    },
    tasks: {
      requiredDeliverables: [
        { platform: 'instagram', type: 'Reel', contentType: 'reel', details: 'Weekly check-in Reels showing progress and app features (4 Reels total)', dueDate: daysFromNow(35).toISOString(), quantity: 4 },
        { platform: 'instagram', type: 'Story', contentType: 'story', details: 'Daily workout story updates (minimum 3x per week)', dueDate: daysFromNow(35).toISOString(), quantity: 12 },
        { platform: 'tiktok', type: 'Video', contentType: 'video', details: 'Before/after transformation video at the end of 30 days', dueDate: daysFromNow(38).toISOString(), quantity: 1 },
      ],
      dos: [
        'Show the app interface in use during workouts',
        'Be honest about the difficulty and your experience',
        'Share your personal fitness goals',
        'Encourage audience to join the challenge',
      ],
      donts: [
        'Do not promote unrealistic body image expectations',
        'Do not give medical or nutritional advice',
        'Do not share your premium access code',
      ],
      metaData: {
        requiredHashTags: ['#FitTrackPro', '#30DayChallenge', '#FitnessJourney', '#Ad'],
        mentions_or_tags: ['@fittrackpro'],
      },
      questions: [
        { question: 'How often do you currently work out?', answers: ['Daily', '3-5 times a week', '1-2 times a week', 'Just starting'] },
        { question: 'What type of fitness content do you create?', answers: ['Gym workouts', 'Home workouts', 'Running / Cardio', 'Yoga / Pilates', 'Mixed'] },
      ],
    },
    stats: { views: 340, applications: 45, acceptedApplications: 10, rejectedApplications: 8, pendingApplications: 27, completedDeliverables: 0, totalDeliverables: 17 },
  },

  {
    campaignTitle: 'Amapiano Streetwear Drop — Content Creators',
    description: 'Our new amapiano-inspired streetwear collection drops next month. We need fashion and culture creators who live and breathe the scene to style the pieces, hit the streets, and create fire content that captures the vibe.',
    campaignVisibility: 'public',
    status: 'PUBLISHED',
    campaignObjectives: ['Product Launch', 'Brand Awareness', 'Sales Conversion'],
    campaignCategories: ['Fashion & Apparel', 'Music', 'Culture'],
    kpi: 'Engagement Rate',
    campaignStart: daysFromNow(7),
    campaignEnd: daysFromNow(28),
    campaignProduct: {
      productType: 'Clothing',
      productName: 'Amapiano Essentials Collection (3-piece set)',
      productImagesUrls: [],
      productValue: 1800,
      productLink: 'https://example.com/amapiano-drop',
      willReimburse_or_productShipped: false,
      keepsProduct: true,
      reimburseAmount: 0,
      accessInstructions: 'Choose your sizes after acceptance. Items ship within 5 business days.',
    },
    audience: {
      ageMin: 18,
      ageMax: 30,
      gender: 'any',
      targetLocation: 'Johannesburg',
      interests_and_affiliates: ['fashion', 'streetwear', 'amapiano', 'music', 'culture', 'Johannesburg'],
      minFollowers: 5000,
      minEngagements: 4,
    },
    budget: {
      compensationModel: 'range',
      currency: 'ZAR',
      fixedAmount: 0,
      minRangeAmount: 3000,
      maxRangeAmount: 7000,
      paymentTerms: 'Payment within 7 days of content going live',
      allowBidsMarketPlace: true,
      applicationDeadline: daysFromNow(10),
      contentCreationStart: daysFromNow(12),
      contentCreationEnd: daysFromNow(25),
    },
    tasks: {
      requiredDeliverables: [
        { platform: 'instagram', type: 'Post', contentType: 'post', details: 'Styled outfit photos (carousel of 3-5 images) in an urban setting', dueDate: daysFromNow(20).toISOString(), quantity: 1 },
        { platform: 'instagram', type: 'Reel', contentType: 'reel', details: 'Outfit transition Reel with amapiano track (15-30s)', dueDate: daysFromNow(22).toISOString(), quantity: 1 },
        { platform: 'tiktok', type: 'Video', contentType: 'video', details: 'Style the collection your way — GRWM or lookbook TikTok', dueDate: daysFromNow(24).toISOString(), quantity: 1 },
      ],
      dos: [
        'Show the full outfit including brand tags',
        'Use amapiano music in Reels/TikToks',
        'Shoot in vibrant, urban South African locations',
        'Be creative — make it your own style',
      ],
      donts: [
        'Do not alter or crop out brand logos',
        'Do not use competitor brand items in the same shoot',
        'Do not use copyrighted music without clearance (we will provide tracks)',
      ],
      metaData: {
        requiredHashTags: ['#AmapianoEssentials', '#StreetStyle', '#SAFashion', '#Ad'],
        mentions_or_tags: ['@amapiano_essentials'],
      },
      questions: [
        { question: 'Describe your personal style in one word', answers: [] },
        { question: 'Which size do you typically wear?', answers: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
      ],
    },
    stats: { views: 178, applications: 32, acceptedApplications: 5, rejectedApplications: 10, pendingApplications: 17, completedDeliverables: 0, totalDeliverables: 3 },
  },
];

async function main() {
  const db = initFirebase();

  console.log(`\nSeeding ${campaigns.length} sample campaigns for ${BRAND_EMAIL} (${BRAND_UID})...\n`);

  // Ensure the brand user doc exists with displayName for marketplace display
  const userRef = db.collection('users').doc(BRAND_UID);
  const userDoc = await userRef.get();
  if (!userDoc.exists) {
    console.log(`Creating user document for ${BRAND_EMAIL}...`);
    await userRef.set({
      email: BRAND_EMAIL,
      displayName: BRAND_NAME,
      role: 'brand',
      photoURL: '',
      verified: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: admin.firestore.FieldValue.serverTimestamp(),
    });
  } else {
    const userData = userDoc.data();
    console.log(`User doc exists: ${userData?.displayName || userData?.email}`);
    // Ensure verified flag is set for marketplace display
    if (!userData?.verified) {
      await userRef.update({ verified: true });
    }
  }

  const createdIds: string[] = [];

  for (const campaign of campaigns) {
    const docRef = db.collection('campaigns').doc();
    await docRef.set({
      ...campaign,
      brandId: BRAND_UID,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      publishedAt: admin.firestore.FieldValue.serverTimestamp(),
      campaignAssets: [],
      campaignMoodBoard: [],
      campaignBrief: [],
      campaignContract: [],
    });
    createdIds.push(docRef.id);
    console.log(`  ✓ ${campaign.campaignTitle} → ${docRef.id}`);
  }

  console.log(`\n✅ Created ${createdIds.length} campaigns successfully.`);
  console.log('\nCampaign IDs:');
  createdIds.forEach((id, i) => console.log(`  ${i + 1}. ${id}`));
  console.log('\nThey should now appear in the marketplace at /influencers/marketplace');
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
