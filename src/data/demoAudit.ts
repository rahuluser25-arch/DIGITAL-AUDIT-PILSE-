import type { AuditResult } from '../types/audit';

export const DEMO_AUDIT_CURRENT: AuditResult = {
  id: 'demo-northstar-current',
  timestamp: '2026-11-18T09:15:00.000Z',
  isDemo: true,
  input: {
    url: 'https://northstaroutdoor.example',
    businessName: 'Northstar Outdoor Supply',
    industry: 'E-Commerce & Retail',
    mainGoal: 'More Leads',
  },
  overallScore: 73,
  executiveSummary:
    'Northstar Outdoor Supply has a strong brand voice and solid HTTPS baseline, but high-impact gaps in mobile page speed, structured product SEO, and keyboard accessibility are holding back lead conversion. Addressing the top five quick wins can raise overall digital health into the 85+ healthy tier within four weeks.',
  observedSignals: {
    reachable: true,
    https: true,
    title: 'Northstar Outdoor Supply — Alpine Gear & Trail Essentials',
    hasMetaDescription: true,
    hasViewport: true,
    hasLangAttr: true,
    responseTimeMs: 640,
  },
  categories: [
    {
      id: 'performance',
      name: 'Website Performance',
      score: 64,
      status: 'Needs Attention',
      summary: 'Hero imagery and unbundled scripts slow mobile first-paint times.',
      highlights: [
        'Mobile Largest Contentful Paint estimated above 3.2s due to oversized hero media',
        'Render-blocking third-party analytics scripts delay interactive checkout buttons',
      ],
    },
    {
      id: 'seo',
      name: 'SEO',
      score: 71,
      status: 'Needs Attention',
      summary: 'Core meta tags exist, but product schema and category targeting lag.',
      highlights: [
        'Missing JSON-LD Product & Review schema on catalog pages',
        'Duplicate H1 patterns across seasonal collection landing pages',
      ],
    },
    {
      id: 'social',
      name: 'Social Media Presence',
      score: 76,
      status: 'Healthy',
      summary: 'Consistent visual identity with minor gaps in Open Graph previews.',
      highlights: [
        'Open Graph summary cards active on homepage, missing on blog guides',
        'Strong Instagram/YouTube link integration from trail gear guides',
      ],
    },
    {
      id: 'security',
      name: 'Security & Privacy',
      score: 84,
      status: 'Healthy',
      summary: 'Valid HTTPS transport and clear checkout trust posture.',
      highlights: [
        'HTTPS enforced across primary storefront and account routes',
        'Cookie consent banner needs granular preference controls for GDPR compliance',
      ],
    },
    {
      id: 'content',
      name: 'Content & Brand Consistency',
      score: 82,
      status: 'Healthy',
      summary: 'Distinctive outdoor voice, though lead capture CTAs vary in clarity.',
      highlights: [
        'Cohesive editorial tone across product stories and sizing guides',
        'Newsletter and warranty registration forms lack clear value incentives',
      ],
    },
    {
      id: 'accessibility',
      name: 'Accessibility',
      score: 58,
      status: 'Needs Attention',
      summary: 'Low-contrast filter labels and missing focus states impede keyboard users.',
      highlights: [
        'Product filter chips fall below 4.5:1 WCAG AA text contrast ratio',
        'Mobile navigation drawer lacks visible focus trap and escape-key support',
      ],
    },
  ],
  findings: [
    {
      id: 'f-perf-1',
      categoryId: 'performance',
      title: 'Uncompressed hero photography delays mobile load',
      severity: 'High',
      explanation:
        'Large JPEG hero banners on your landing and collection pages force mobile shoppers on cellular connections to wait over three seconds before seeing the primary call to action.',
      recommendation:
        'Convert hero and catalog imagery to WebP or AVIF, serve responsive srcset sizes, and add fetchpriority="high" only to the single above-the-fold hero image.',
    },
    {
      id: 'f-perf-2',
      categoryId: 'performance',
      title: 'Third-party scripts block main-thread interactivity',
      severity: 'Medium',
      explanation:
        'Chat widgets and marketing pixels load synchronously in the document head, delaying tap responsiveness on product variant selectors.',
      recommendation:
        'Defer non-essential scripts until after initial hydration or load marketing tags asynchronously after the first user interaction.',
    },
    {
      id: 'f-seo-1',
      categoryId: 'seo',
      title: 'Missing Product and FAQ structured data',
      severity: 'High',
      explanation:
        'Without JSON-LD schema markup, search engines cannot display pricing, stock status, or customer ratings directly in search snippets—reducing click-through rates.',
      recommendation:
        'Add Schema.org Product, Offer, and AggregateRating JSON-LD blocks to every product template and validate with a rich-results tester.',
    },
    {
      id: 'f-seo-2',
      categoryId: 'seo',
      title: 'Generic meta descriptions on top category pages',
      severity: 'Medium',
      explanation:
        'Several category pages share truncated or boilerplate meta descriptions, weakening keyword relevance for high-intent outdoor equipment queries.',
      recommendation:
        'Write unique 145–155 character meta descriptions highlighting free shipping thresholds, warranty coverage, and seasonal gear benefits.',
    },
    {
      id: 'f-social-1',
      categoryId: 'social',
      title: 'Trail guides lack custom Open Graph images',
      severity: 'Low',
      explanation:
        'When readers share your buying guides on LinkedIn or X, links fall back to a cropped logo instead of an engaging article preview.',
      recommendation:
        'Generate 1200x630 Open Graph og:image tags per editorial guide alongside concise og:title and twitter:card metadata.',
    },
    {
      id: 'f-sec-1',
      categoryId: 'security',
      title: 'Cookie consent banner lacks granular opt-out',
      severity: 'Medium',
      explanation:
        'Visitors currently see an informational notice rather than an actionable choice to decline non-essential analytics cookies before tracking fires.',
      recommendation:
        'Implement a lightweight consent manager that blocks non-essential marketing cookies until explicit opt-in for EU/UK visitors.',
    },
    {
      id: 'f-sec-2',
      categoryId: 'security',
      title: 'Missing HTTP security headers (CSP & Permissions-Policy)',
      severity: 'Low',
      explanation:
        'While HTTPS is active, adding Content-Security-Policy and X-Content-Type-Options headers further shields customer forms from third-party script tampering.',
      recommendation:
        'Configure baseline security headers at your CDN or edge proxy starting with Content-Security-Policy in report-only mode.',
    },
    {
      id: 'f-content-1',
      categoryId: 'content',
      title: 'Lead capture forms lack clear post-signup benefit',
      severity: 'Medium',
      explanation:
        'Footer and pop-up email signups ask visitors to "Join our list" without stating what subscribers receive, lowering lead conversion.',
      recommendation:
        'Test benefit-led copy such as "Get seasonal trail checklists and 10% off your first pack" above a single-field email form.',
    },
    {
      id: 'f-a11y-1',
      categoryId: 'accessibility',
      title: 'Muted filter labels fail WCAG AA contrast (3.1:1)',
      severity: 'High',
      explanation:
        'Light slate text on pale gray filter buttons makes sizing and price selectors hard to read outdoors or on lower-brightness mobile screens.',
      recommendation:
        'Darken secondary label ink to at least #475569 on light surfaces (4.5:1+ contrast) and ensure active states have clear borders.',
    },
    {
      id: 'f-a11y-2',
      categoryId: 'accessibility',
      title: 'Missing keyboard focus indicators on navigation drawer',
      severity: 'High',
      explanation:
        'Keyboard and screen-reader shoppers cannot clearly track focus inside the mobile menu or close it reliably with the Escape key.',
      recommendation:
        'Restore visible focus-visible outlines, bind Escape to close drawers, and return focus to the menu trigger button on close.',
    },
  ],
  actionPlan: [
    {
      id: 'qw-1',
      rank: 1,
      title: 'Compress hero & catalog images to WebP/AVIF',
      categoryId: 'performance',
      categoryName: 'Website Performance',
      impact: 'High',
      effort: 'Low',
      description:
        'Shaves over 1.2s off mobile load times on your highest-traffic landing pages with zero layout changes.',
      actionSteps: [
        'Export top 10 landing/category hero images in WebP at 80% quality',
        'Add explicit width/height attributes to prevent layout shift',
        'Enable lazy loading on below-the-fold catalog thumbnails',
      ],
      estimatedLift: '+7 to +10 pts in Performance',
    },
    {
      id: 'qw-2',
      rank: 2,
      title: 'Upgrade WCAG AA contrast & keyboard focus rings',
      categoryId: 'accessibility',
      categoryName: 'Accessibility',
      impact: 'High',
      effort: 'Low',
      description:
        'Immediately eliminates readability barriers on product filters and checkout buttons across all devices.',
      actionSteps: [
        'Update muted slate text tokens to achieve >= 4.5:1 contrast',
        'Add consistent 2px teal focus-visible rings on interactive controls',
        'Add aria-label attributes to icon-only cart and search buttons',
      ],
      estimatedLift: '+12 to +16 pts in Accessibility',
    },
    {
      id: 'qw-3',
      rank: 3,
      title: 'Deploy Product & Review JSON-LD structured data',
      categoryId: 'seo',
      categoryName: 'SEO',
      impact: 'High',
      effort: 'Medium',
      description:
        'Unlocks rich search snippets with price, availability, and star ratings to attract qualified buyer clicks.',
      actionSteps: [
        'Add dynamic Schema.org Product JSON-LD to the product detail layout',
        'Include AggregateRating and Offer availability fields',
        'Validate sample URLs via Google Rich Results Test',
      ],
      estimatedLift: '+6 to +9 pts in SEO',
    },
    {
      id: 'qw-4',
      rank: 4,
      title: 'Rewrite lead-capture CTA copy with clear offer',
      categoryId: 'content',
      categoryName: 'Content & Brand Consistency',
      impact: 'Medium',
      effort: 'Low',
      description:
        'Turns passive blog and storefront traffic into qualified email leads by pairing forms with an explicit gear guide or discount.',
      actionSteps: [
        'Replace generic "Subscribe" headlines with a specific trail guide incentive',
        'Reduce signup form to email-only to cut friction',
        'Add a concise privacy reassurance note below the submit button',
      ],
      estimatedLift: '+4 to +6 pts in Content & Brand',
    },
    {
      id: 'qw-5',
      rank: 5,
      title: 'Add granular opt-in controls to cookie notice',
      categoryId: 'security',
      categoryName: 'Security & Privacy',
      impact: 'Medium',
      effort: 'Medium',
      description:
        'Strengthens privacy compliance and builds customer confidence before checkout.',
      actionSteps: [
        'Separate Essential vs. Analytics/Marketing cookie toggles',
        'Defer analytics initialization until user consent is recorded',
        'Link directly to a plain-English Privacy & Data summary',
      ],
      estimatedLift: '+5 to +7 pts in Security & Privacy',
    },
  ],
};

export const DEMO_HISTORY: AuditResult[] = [
  {
    ...DEMO_AUDIT_CURRENT,
    id: 'demo-northstar-sep',
    timestamp: '2026-09-10T14:20:00.000Z',
    overallScore: 58,
    categories: DEMO_AUDIT_CURRENT.categories.map((c) => ({
      ...c,
      score: Math.max(38, c.score - 15),
    })),
  },
  {
    ...DEMO_AUDIT_CURRENT,
    id: 'demo-northstar-oct',
    timestamp: '2026-10-14T11:05:00.000Z',
    overallScore: 66,
    categories: DEMO_AUDIT_CURRENT.categories.map((c) => ({
      ...c,
      score: Math.max(45, c.score - 7),
    })),
  },
  DEMO_AUDIT_CURRENT,
];
