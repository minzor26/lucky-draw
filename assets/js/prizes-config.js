/**
 * PRIZE & CAMPAIGN CONFIGURATION
 * Separated from UI logic for easy customization and backend integration.
 * Each prize has an ID, display name, tier, visual accents, description,
 * icon (SVG markup), estimated value, and probability weight.
 */

const CAMPAIGN_CONFIG = {
    campaignName: "AURA 2026",
    campaignTitle: "Global Lucky Draw Campaign",
    // Campaign end date for countdown (set to 7 days from now by default)
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    // Allow participation only once per verified mobile number
    singleEntryPerUser: true,
    // Whether entry code is mandatory (false = optional)
    requireEntryCode: false,
    // Valid promotional codes for bonus entries or special validation
    validEntryCodes: ["AURA2026", "FORTUNA99", "VIPGIFT", "LUCKYWIN", "MEGA2026"],
    supportEmail: "support@auradraw2026.com",
    hotline: "+1 (800) 555-AURA"
};

const PRIZE_CONFIG = [
    {
        id: "grand_prize",
        name: "Grand Prize: Ultra Tech Suite",
        shortName: "Grand Prize",
        category: "Grand Prize",
        tier: "grand",
        badge: "Tier 1 • Ultimate",
        value: "$3,499",
        description: "The complete next-gen ecosystem: Titanium Pro Max Flagship, 4K OLED Studio Display, Spatial Studio Pods, and Smart Home Command Hub.",
        accentColor: "#FFB800",
        glowColor: "rgba(255, 184, 0, 0.45)",
        gradient: "linear-gradient(135deg, #FFB800 0%, #FF8A00 50%, #E52E71 100%)",
        icon: "trophy",
        isWinner: true,
        // Configurable winning probability weight (out of total sum)
        weight: 5,
        congratulationText: "You have won the most prestigious reward of the entire campaign!"
    },
    {
        id: "premium_gift",
        name: "Premium Gift: Studio Acoustic Pro",
        shortName: "Premium Gift",
        category: "Premium Gift",
        tier: "premium",
        badge: "Tier 2 • High-Fi",
        value: "$649",
        description: "Master-tuned planar magnetic wireless headphones with 80-hour battery, active noise cancellation, and spatial audio calibration.",
        accentColor: "#00F2FE",
        glowColor: "rgba(0, 242, 254, 0.45)",
        gradient: "linear-gradient(135deg, #00F2FE 0%, #4FACFE 100%)",
        icon: "headphones",
        isWinner: true,
        weight: 15,
        congratulationText: "Enjoy unmatched spatial studio audio with your new Studio Acoustic Pro!"
    },
    {
        id: "special_gift",
        name: "Special Gift: Neo Watch Pro",
        shortName: "Special Gift",
        category: "Special Gift",
        tier: "special",
        badge: "Tier 3 • Lifestyle",
        value: "$399",
        description: "Titanium aerospace chassis, sapphire crystal micro-LED display, multi-band GPS, and continuous health telemetry.",
        accentColor: "#B537F2",
        glowColor: "rgba(181, 55, 242, 0.45)",
        gradient: "linear-gradient(135deg, #B537F2 0%, #7928CA 100%)",
        icon: "watch",
        isWinner: true,
        weight: 20,
        congratulationText: "Elevate your lifestyle with the cutting-edge Neo Watch Pro!"
    },
    {
        id: "surprise_gift",
        name: "Surprise Gift: $250 Digital Pass",
        shortName: "Surprise Gift",
        category: "Surprise Gift",
        tier: "surprise",
        badge: "Tier 4 • Instant Pass",
        value: "$250",
        description: "Instant redeemable digital voucher valid across premier tech retailers, global travel experiences, and digital subscriptions.",
        accentColor: "#00F5A0",
        glowColor: "rgba(0, 245, 160, 0.45)",
        gradient: "linear-gradient(135deg, #00F5A0 0%, #00D9E9 100%)",
        icon: "gift",
        isWinner: true,
        weight: 25,
        congratulationText: "Your instant $250 Digital Experience Voucher is ready for redemption!"
    },
    {
        id: "exclusive_voucher",
        name: "Exclusive Voucher: 50% VIP Pass",
        shortName: "VIP Voucher",
        category: "Special Gift",
        tier: "surprise",
        badge: "Special Bonus",
        value: "$150",
        description: "Exclusive 50% discount certificate valid for any flagship accessory or future reservation with priority concierge service.",
        accentColor: "#FF416C",
        glowColor: "rgba(255, 65, 108, 0.45)",
        gradient: "linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)",
        icon: "tag",
        isWinner: true,
        weight: 15,
        congratulationText: "Unlock exclusive VIP discounts on premium tech collections!"
    },
    {
        id: "better_luck_1",
        name: "Better Luck Next Time",
        shortName: "Try Again",
        category: "Participant Entry",
        tier: "none",
        badge: "Appreciation Entry",
        value: "Grand Finale Ticket",
        description: "Thank you for participating! Your entry code has been automatically transferred into the Grand Finale Mega Draw pool.",
        accentColor: "#718096",
        glowColor: "rgba(113, 128, 150, 0.3)",
        gradient: "linear-gradient(135deg, #4A5568 0%, #2D3748 100%)",
        icon: "sparkle",
        isWinner: false,
        weight: 20,
        congratulationText: "Thank you for participating. Keep an eye out for our next exciting campaign!"
    }
];

// Seed recent winners for live showcase & fallback
const RECENT_WINNERS_DATA = [
    { name: "Aarav Sharma", city: "Mumbai", prize: "Grand Prize: Ultra Tech Suite", time: "3 mins ago", tier: "grand" },
    { name: "Priya Patel", city: "Bengaluru", prize: "Premium Gift: Studio Acoustic Pro", time: "18 mins ago", tier: "premium" },
    { name: "Rohan Deshmukh", city: "Pune", prize: "Special Gift: Neo Watch Pro", time: "42 mins ago", tier: "special" },
    { name: "Ananya Sen", city: "Kolkata", prize: "Surprise Gift: $250 Digital Pass", time: "1 hour ago", tier: "surprise" },
    { name: "Vikram Malhotra", city: "New Delhi", prize: "Premium Gift: Studio Acoustic Pro", time: "2 hours ago", tier: "premium" },
    { name: "Sneha Reddy", city: "Hyderabad", prize: "Exclusive Voucher: 50% VIP Pass", time: "3 hours ago", tier: "surprise" },
    { name: "Kabir Mehta", city: "Ahmedabad", prize: "Special Gift: Neo Watch Pro", time: "4 hours ago", tier: "special" }
];
