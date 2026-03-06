import { TopicCategory } from '@/types/discovery';
import {
  Shirt, Eye, Plane, Sparkles, UtensilsCrossed, Trophy, Baby, Palette,
  Dumbbell, Car, Gamepad2, Briefcase, Smartphone, Music, Megaphone, Hammer,
  Mountain, HandHeart, DollarSign, Microscope, GraduationCap, PawPrint, Theater, ShoppingBag
} from 'lucide-react';

// Top Topics Data (24 categories from screenshots)
export const topTopics: TopicCategory[] = [
  {
    id: 'fashion',
    name: 'Fashion',
    icon: Shirt,
    color: '#FF6B9D',
    suggestions: [
      { type: 'topic', label: 'Fashion', query: 'fashion' },
      { type: 'subtopic', label: 'Modeling', query: 'fashion modeling' },
      { type: 'brand', label: '@Vogue', query: '@vogue' },
      { type: 'brand', label: '@Zara', query: '@zara' },
      { type: 'hashtag', label: '#springstyle', query: '#springstyle' },
      { type: 'hashtag', label: '#ootd', query: '#ootd' }
    ]
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle',
    icon: Eye,
    color: '#4F46E5',
    suggestions: [
      { type: 'topic', label: 'Lifestyle', query: 'lifestyle' },
      { type: 'subtopic', label: 'Blogger', query: 'lifestyle blogger' },
      { type: 'brand', label: '@louisvuitton', query: '@louisvuitton' },
      { type: 'brand', label: '@desenio', query: '@desenio' },
      { type: 'hashtag', label: '#shoesaddict', query: '#shoesaddict' },
      { type: 'hashtag', label: '#americanstyle', query: '#americanstyle' }
    ]
  },
  {
    id: 'travel',
    name: 'Travel',
    icon: Plane,
    color: '#06B6D4',
    suggestions: [
      { type: 'topic', label: 'Travel', query: 'travel' },
      { type: 'subtopic', label: 'Photographers', query: 'travel photographers' },
      { type: 'brand', label: '@airbnb', query: '@airbnb' },
      { type: 'brand', label: '@visitscotland', query: '@visitscotland' },
      { type: 'hashtag', label: '#girlswhotravel', query: '#girlswhotravel' },
      { type: 'hashtag', label: '#letsgoeverywhere', query: '#letsgoeverywhere' }
    ]
  },
  {
    id: 'beauty',
    name: 'Beauty',
    icon: Sparkles,
    color: '#EC4899',
    suggestions: [
      { type: 'topic', label: 'Beauty', query: 'beauty' },
      { type: 'subtopic', label: 'Nails', query: 'beauty nails' },
      { type: 'brand', label: '@revlon', query: '@revlon' },
      { type: 'brand', label: '@covergirl', query: '@covergirl' },
      { type: 'hashtag', label: '#makeupvideoss', query: '#makeupvideoss' },
      { type: 'hashtag', label: '#glowkit', query: '#glowkit' }
    ]
  },
  {
    id: 'food',
    name: 'Food',
    icon: UtensilsCrossed,
    color: '#F59E0B',
    suggestions: [
      { type: 'topic', label: 'Food', query: 'food' },
      { type: 'subtopic', label: 'Beer', query: 'food beer' },
      { type: 'brand', label: '@hellofresh', query: '@hellofresh' },
      { type: 'brand', label: '@nutella', query: '@nutella' },
      { type: 'hashtag', label: '#onmytable', query: '#onmytable' },
      { type: 'hashtag', label: '#dailyfoodfeed', query: '#dailyfoodfeed' }
    ]
  },
  {
    id: 'sports',
    name: 'Sports',
    icon: Trophy,
    color: '#10B981',
    suggestions: [
      { type: 'topic', label: 'Sports', query: 'sports' },
      { type: 'subtopic', label: 'Football', query: 'sports football' },
      { type: 'brand', label: '@underarmour', query: '@underarmour' },
      { type: 'brand', label: '@garmin', query: '@garmin' },
      { type: 'hashtag', label: '#soccer', query: '#soccer' },
      { type: 'hashtag', label: '#running', query: '#running' }
    ]
  },
  {
    id: 'parenting',
    name: 'Parenting',
    icon: Baby,
    color: '#8B5CF6',
    suggestions: [
      { type: 'topic', label: 'Parenting', query: 'parenting' },
      { type: 'subtopic', label: 'Moms', query: 'parenting moms' },
      { type: 'brand', label: '@pampers', query: '@pampers' },
      { type: 'brand', label: '@fisher_price', query: '@fisher_price' },
      { type: 'hashtag', label: '#momlife', query: '#momlife' },
      { type: 'hashtag', label: '#parenthood', query: '#parenthood' }
    ]
  },
  {
    id: 'art',
    name: 'Art',
    icon: Palette,
    color: '#EF4444',
    suggestions: [
      { type: 'topic', label: 'Art', query: 'art' },
      { type: 'subtopic', label: 'Design', query: 'art design' },
      { type: 'brand', label: '@saatchi_gallery', query: '@saatchi_gallery' },
      { type: 'brand', label: '@guggenheim', query: '@guggenheim' },
      { type: 'hashtag', label: '#sketch_daily', query: '#sketch_daily' },
      { type: 'hashtag', label: '#worldofartists', query: '#worldofartists' }
    ]
  },
  {
    id: 'fitness',
    name: 'Fitness',
    icon: Dumbbell,
    color: '#14B8A6',
    suggestions: [
      { type: 'topic', label: 'Fitness', query: 'fitness' },
      { type: 'subtopic', label: 'Health', query: 'fitness health' },
      { type: 'brand', label: '@lululemon', query: '@lululemon' },
      { type: 'brand', label: '@nike', query: '@nike' },
      { type: 'hashtag', label: '#motivation', query: '#motivation' },
      { type: 'hashtag', label: '#gymselfie', query: '#gymselfie' }
    ]
  },
  {
    id: 'racing',
    name: 'Racing',
    icon: Car,
    color: '#F97316',
    suggestions: [
      { type: 'topic', label: 'Racing', query: 'racing' },
      { type: 'subtopic', label: 'Racing', query: 'racing motorsport' },
      { type: 'brand', label: '@audi', query: '@audi' },
      { type: 'brand', label: '@ford', query: '@ford' },
      { type: 'hashtag', label: '#motorsport', query: '#motorsport' },
      { type: 'hashtag', label: '#electricvehicle', query: '#electricvehicle' }
    ]
  },
  {
    id: 'geek',
    name: 'Geek',
    icon: Gamepad2,
    color: '#6366F1',
    suggestions: [
      { type: 'topic', label: 'Geek', query: 'geek' },
      { type: 'subtopic', label: 'Video Games', query: 'geek video games' },
      { type: 'brand', label: '@marvel', query: '@marvel' },
      { type: 'brand', label: '@xbox', query: '@xbox' },
      { type: 'hashtag', label: '#cosplay', query: '#cosplay' },
      { type: 'hashtag', label: '#nightwing', query: '#nightwing' }
    ]
  },
  {
    id: 'business',
    name: 'Business',
    icon: Briefcase,
    color: '#0891B2',
    suggestions: [
      { type: 'topic', label: 'Business', query: 'business' },
      { type: 'subtopic', label: 'Management', query: 'business management' },
      { type: 'brand', label: '@glamifybeauty', query: '@glamifybeauty' },
      { type: 'brand', label: '@beautybaycom', query: '@beautybaycom' },
      { type: 'hashtag', label: '#millionairemindset', query: '#millionairemindset' },
      { type: 'hashtag', label: '#entrepreneurmindset', query: '#entrepreneurmindset' }
    ]
  },
  {
    id: 'technology',
    name: 'Technology',
    icon: Smartphone,
    color: '#64748B',
    suggestions: [
      { type: 'topic', label: 'Technology', query: 'technology' },
      { type: 'subtopic', label: 'Developers', query: 'technology developers' },
      { type: 'brand', label: '@nvidia', query: '@nvidia' },
      { type: 'brand', label: '@samsung', query: '@samsung' },
      { type: 'hashtag', label: '#smarthome', query: '#smarthome' },
      { type: 'hashtag', label: '#airpods', query: '#airpods' }
    ]
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: Music,
    color: '#DC2626',
    suggestions: [
      { type: 'topic', label: 'Entertainment', query: 'entertainment' },
      { type: 'subtopic', label: 'Music', query: 'entertainment music' },
      { type: 'brand', label: '@netflix', query: '@netflix' },
      { type: 'brand', label: '@spotify', query: '@spotify' },
      { type: 'hashtag', label: '#beyonce', query: '#beyonce' },
      { type: 'hashtag', label: '#comedyclub', query: '#comedyclub' }
    ]
  },
  {
    id: 'marketing',
    name: 'Marketing',
    icon: Megaphone,
    color: '#7C3AED',
    suggestions: [
      { type: 'topic', label: 'Marketing', query: 'marketing' },
      { type: 'subtopic', label: 'Community', query: 'marketing community' },
      { type: 'brand', label: '@forbes', query: '@forbes' },
      { type: 'brand', label: '@facebook', query: '@facebook' },
      { type: 'hashtag', label: '#seo', query: '#seo' },
      { type: 'hashtag', label: '#marketingtips', query: '#marketingtips' }
    ]
  },
  {
    id: 'diy',
    name: 'DIY',
    icon: Hammer,
    color: '#D97706',
    suggestions: [
      { type: 'topic', label: 'DIY', query: 'diy' },
      { type: 'subtopic', label: 'Decoration', query: 'diy decoration' },
      { type: 'brand', label: '@homedepot', query: '@homedepot' },
      { type: 'brand', label: '@homegoods', query: '@homegoods' },
      { type: 'hashtag', label: '#seasonaldecor', query: '#seasonaldecor' },
      { type: 'hashtag', label: '#makehomeyours', query: '#makehomeyours' }
    ]
  },
  {
    id: 'nature',
    name: 'Nature',
    icon: Mountain,
    color: '#059669',
    suggestions: [
      { type: 'topic', label: 'Nature', query: 'nature' },
      { type: 'subtopic', label: 'Wildlife', query: 'nature wildlife' },
      { type: 'brand', label: '@natgeo', query: '@natgeo' },
      { type: 'brand', label: '@patagonia', query: '@patagonia' },
      { type: 'hashtag', label: '#outdoors', query: '#outdoors' },
      { type: 'hashtag', label: '#wilderness', query: '#wilderness' }
    ]
  },
  {
    id: 'activist',
    name: 'Activist',
    icon: HandHeart,
    color: '#B91C1C',
    suggestions: [
      { type: 'topic', label: 'Activist', query: 'activist' },
      { type: 'subtopic', label: 'Social Justice', query: 'activist social justice' },
      { type: 'brand', label: '@amnesty', query: '@amnesty' },
      { type: 'brand', label: '@greenpeace', query: '@greenpeace' },
      { type: 'hashtag', label: '#activism', query: '#activism' },
      { type: 'hashtag', label: '#changemaker', query: '#changemaker' }
    ]
  },
  {
    id: 'finance',
    name: 'Finance',
    icon: DollarSign,
    color: '#047857',
    suggestions: [
      { type: 'topic', label: 'Finance', query: 'finance' },
      { type: 'subtopic', label: 'Investing', query: 'finance investing' },
      { type: 'brand', label: '@wealthsimple', query: '@wealthsimple' },
      { type: 'brand', label: '@robinhood', query: '@robinhood' },
      { type: 'hashtag', label: '#financialfreedom', query: '#financialfreedom' },
      { type: 'hashtag', label: '#investing', query: '#investing' }
    ]
  },
  {
    id: 'science',
    name: 'Science',
    icon: Microscope,
    color: '#0284C7',
    suggestions: [
      { type: 'topic', label: 'Science', query: 'science' },
      { type: 'subtopic', label: 'Research', query: 'science research' },
      { type: 'brand', label: '@nasa', query: '@nasa' },
      { type: 'brand', label: '@spacex', query: '@spacex' },
      { type: 'hashtag', label: '#stem', query: '#stem' },
      { type: 'hashtag', label: '#physics', query: '#physics' }
    ]
  },
  {
    id: 'education',
    name: 'Education',
    icon: GraduationCap,
    color: '#7C2D12',
    suggestions: [
      { type: 'topic', label: 'Education', query: 'education' },
      { type: 'subtopic', label: 'Teachers', query: 'education teachers' },
      { type: 'brand', label: '@khanacademy', query: '@khanacademy' },
      { type: 'brand', label: '@coursera', query: '@coursera' },
      { type: 'hashtag', label: '#learning', query: '#learning' },
      { type: 'hashtag', label: '#teacherlife', query: '#teacherlife' }
    ]
  },
  {
    id: 'pets',
    name: 'Pets',
    icon: PawPrint,
    color: '#A855F7',
    suggestions: [
      { type: 'topic', label: 'Pets', query: 'pets' },
      { type: 'subtopic', label: 'Dogs', query: 'pets dogs' },
      { type: 'brand', label: '@petsmart', query: '@petsmart' },
      { type: 'brand', label: '@chewy', query: '@chewy' },
      { type: 'hashtag', label: '#dogsofinstagram', query: '#dogsofinstagram' },
      { type: 'hashtag', label: '#catsofinstagram', query: '#catsofinstagram' }
    ]
  },
  {
    id: 'culture',
    name: 'Culture',
    icon: Theater,
    color: '#BE185D',
    suggestions: [
      { type: 'topic', label: 'Culture', query: 'culture' },
      { type: 'subtopic', label: 'Heritage', query: 'culture heritage' },
      { type: 'brand', label: '@smithsonian', query: '@smithsonian' },
      { type: 'brand', label: '@britishmuseum', query: '@britishmuseum' },
      { type: 'hashtag', label: '#culturalheritage', query: '#culturalheritage' },
      { type: 'hashtag', label: '#traditions', query: '#traditions' }
    ]
  },
  {
    id: 'shopping',
    name: 'Shopping',
    icon: ShoppingBag,
    color: '#DB2777',
    suggestions: [
      { type: 'topic', label: 'Shopping', query: 'shopping' },
      { type: 'subtopic', label: 'Fashion', query: 'shopping fashion' },
      { type: 'brand', label: '@amazon', query: '@amazon' },
      { type: 'brand', label: '@target', query: '@target' },
      { type: 'hashtag', label: '#haul', query: '#haul' },
      { type: 'hashtag', label: '#shopaholic', query: '#shopaholic' }
    ]
  }
];

// Visual Prompts (AI Discovery)
export const visualPrompts = [
  {
    id: 'vp1',
    prompt: 'Hikers walking a scenic mountain view'
  },
  {
    id: 'vp2',
    prompt: 'A beautifully decorated bohemian bedroom'
  },
  {
    id: 'vp3',
    prompt: 'Happy LGBTQ couple sharing a moment'
  },
  {
    id: 'vp4',
    prompt: 'A flat lay of skin care products along with candles'
  },
  {
    id: 'vp5',
    prompt: 'Artistic charcuterie board with goods'
  }
];
