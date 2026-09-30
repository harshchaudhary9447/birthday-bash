export const MONTH_QUOTES = {
  January: "January brings the magic of fresh beginnings and new chapters — we love celebrating the first smiles and milestones of the year with this special gift!",
  February: "February is the season of love, sweet surprises, and warm hearts — we adore making hearts flutter, which is why this special offer is just for you!",
  March: "March brings the bloom of spring and lively sunshine — we love fresh starts and vibrant memories, celebrated with this lovely gift!",
  April: "April is filled with gentle breezes and sweet blossoming dreams — we cherish celebrating pure joy with our springtime promotion!",
  May: "May sparkles with bright sunshine, flowers, and cheerful moments — we love how warm and sunny life feels right now, so enjoy our special gift!",
  June: "June brings long golden days and unforgettable summer memories — we love the laughter of warm sunny days, so we’re sharing this summer offer!",
  July: "July is all about mid-year milestones, sparklers, and joyful warmth — we love cheering for the milestones you’ve reached together!",
  August: "August is the month of friendships, warm evenings, and deep bonds — we love celebrating the souls that light up your life!",
  September: "September brings the gentle whisper of autumn, soft golden breezes, and cozy new chapters — we love the tender warmth of this transition, which is why we’re giving this special offer!",
  October: "October brings golden sunsets, cozy sweater weather, and celebration magic — we love the cozy warmth of this season, which is why we’re gifting you this offer!",
  November: "November is the season of gratitude, togetherness, and heartfelt thanks — we cherish the gift of counting our blessings, which is why we’re celebrating with this offer!",
  December: "December glows with holiday cheer, starry nights, and year-end wonder — we love the festive magic that brings loved ones closer, so enjoy our holiday gift!"
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const MONTH_SHORTS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
];

export const CURRENCY_CONFIG = {
  INR: {
    currency: "INR",
    symbol: "₹",
    originalPrice: "350",
    price: "199",
    displayOriginal: "₹350",
    displayPrice: "₹199",
    discountPct: "43% OFF",
    savingsText: "Save ₹151 (43% OFF)",
    amount: 19900, // paise
    regionName: "India (INR)",
  },
  USD: {
    currency: "USD",
    symbol: "$",
    originalPrice: "8.00",
    price: "4.99",
    displayOriginal: "$8.00",
    displayPrice: "$4.99",
    discountPct: "38% OFF",
    savingsText: "Save $3.01 (38% OFF)",
    amount: 499, // cents
    regionName: "United States & Global (USD)",
  },
  EUR: {
    currency: "EUR",
    symbol: "€",
    originalPrice: "7.50",
    price: "4.49",
    displayOriginal: "€7.50",
    displayPrice: "€4.49",
    discountPct: "40% OFF",
    savingsText: "Save €3.01 (40% OFF)",
    amount: 449, // cents
    regionName: "Europe (EUR)",
  },
  GBP: {
    currency: "GBP",
    symbol: "£",
    originalPrice: "6.50",
    price: "3.99",
    displayOriginal: "£6.50",
    displayPrice: "£3.99",
    discountPct: "39% OFF",
    savingsText: "Save £2.51 (39% OFF)",
    amount: 399, // pence
    regionName: "United Kingdom (GBP)",
  },
  CAD: {
    currency: "CAD",
    symbol: "CA$",
    originalPrice: "10.00",
    price: "6.49",
    displayOriginal: "CA$10.00",
    displayPrice: "CA$6.49",
    discountPct: "35% OFF",
    savingsText: "Save CA$3.51 (35% OFF)",
    amount: 649, // cents
    regionName: "Canada (CAD)",
  },
  AUD: {
    currency: "AUD",
    symbol: "AU$",
    originalPrice: "11.50",
    price: "6.99",
    displayOriginal: "AU$11.50",
    displayPrice: "AU$6.99",
    discountPct: "39% OFF",
    savingsText: "Save AU$4.51 (39% OFF)",
    amount: 699, // cents
    regionName: "Australia (AUD)",
  },
  AED: {
    currency: "AED",
    symbol: "AED ",
    originalPrice: "30",
    price: "18",
    displayOriginal: "AED 30",
    displayPrice: "AED 18",
    discountPct: "40% OFF",
    savingsText: "Save AED 12 (40% OFF)",
    amount: 1800, // fils
    regionName: "United Arab Emirates (AED)",
  },
};

export function getCurrentMonthOffer(customDate = null, currency = "INR") {
  const now = customDate ? new Date(customDate) : new Date();
  const monthIdx = now.getMonth();
  const monthName = MONTH_NAMES[monthIdx];
  const monthShort = MONTH_SHORTS[monthIdx];
  const year = now.getFullYear();
  const quote = MONTH_QUOTES[monthName] || MONTH_QUOTES.September;

  const activePricing = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.INR;

  return {
    month: monthName,
    monthShort,
    year,
    fullMonthYear: `${monthName} ${year}`,
    couponCode: `MM-${monthShort}${year % 100}`,
    quote,
    pricing: activePricing,
    inr: CURRENCY_CONFIG.INR,
    usd: CURRENCY_CONFIG.USD,
    allCurrencies: CURRENCY_CONFIG,
  };
}
