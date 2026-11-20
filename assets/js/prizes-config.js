/**
 * PRIZE & CAMPAIGN CONFIGURATION
 * Separated from UI logic for easy customization and backend integration.
 * Every participant is guaranteed a prize — 100% winning experience!
 * High-value tech suite down to assured daily gifts (Earphones, Phone Cover, Fast Cable).
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
        weight: 5,
        congratulationText: "You have won the most prestigious reward of the entire campaign!"
    },
    {
        id: "earphones",
        name: "High-Bass Stereo Earphones",
        shortName: "Earphones",
        category: "Assured Gift",
        tier: "reward",
        badge: "Assured Gift",
        value: "$25",
        description: "High-definition sound with deep bass response, gold-plated audio jack, inline HD microphone, and tangle-resistant braided cord.",
        accentColor: "#FF7675",
        glowColor: "rgba(255, 118, 117, 0.45)",
        gradient: "linear-gradient(135deg, #FF7675 0%, #D63031 100%)",
        icon: "earphones",
        isWinner: true,
        weight: 25,
        congratulationText: "You have won a brand-new pair of High-Bass Stereo Earphones!"
    },
    {
        id: "premium_gift",
        name: "Premium Gift: Studio Acoustic Pro",
        shortName: "Studio Audio",
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
        weight: 12,
        congratulationText: "Enjoy unmatched spatial studio audio with your new Studio Acoustic Pro!"
    },
    {
        id: "phone_cover",
        name: "Premium Designer Phone Cover",
        shortName: "Phone Cover",
        category: "Assured Gift",
        tier: "reward",
        badge: "Assured Gift",
        value: "$19",
        description: "Shock-absorbing dual-layer protective case with elevated camera bezel, tactile metallic buttons, and anti-yellowing matte finish.",
        accentColor: "#E84393",
        glowColor: "rgba(232, 67, 147, 0.45)",
        gradient: "linear-gradient(135deg, #FD79A8 0%, #E84393 100%)",
        icon: "case",
        isWinner: true,
        weight: 25,
        congratulationText: "You have won an exclusive Designer Shockproof Phone Cover!"
    },
    {
        id: "special_gift",
        name: "Special Gift: Neo Watch Pro",
        shortName: "Neo Watch Pro",
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
        weight: 15,
        congratulationText: "Elevate your lifestyle with the cutting-edge Neo Watch Pro!"
    },
    {
        id: "fast_cable",
        name: "Fast Charging Braided Cable",
        shortName: "Fast Cable",
        category: "Assured Gift",
        tier: "reward",
        badge: "Assured Gift",
        value: "$15",
        description: "Ultra-durable 65W fast-charging Type-C braided cable engineered with Kevlar-reinforced wiring and zinc alloy housing.",
        accentColor: "#00CEC9",
        glowColor: "rgba(0, 206, 201, 0.45)",
        gradient: "linear-gradient(135deg, #81ECEC 0%, #00CEC9 100%)",
        icon: "cable",
        isWinner: true,
        weight: 25,
        congratulationText: "You have won an Ultra-Durable Fast Charging Cable!"
    },
    {
        id: "surprise_gift",
        name: "Surprise Gift: $250 Digital Pass",
        shortName: "$250 Pass",
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
        weight: 15,
        congratulationText: "Your instant $250 Digital Experience Voucher is ready for redemption!"
    },
    {
        id: "exclusive_voucher",
        name: "Exclusive Voucher: 50% VIP Pass",
        shortName: "50% VIP Pass",
        category: "Special Gift",
        tier: "surprise",
        badge: "Special Bonus",
        value: "$150",
        description: "Exclusive 50% discount certificate valid for any flagship accessory or future reservation with priority concierge service.",
        accentColor: "#FF9F43",
        glowColor: "rgba(255, 159, 67, 0.45)",
        gradient: "linear-gradient(135deg, #FF9F43 0%, #EE5253 100%)",
        icon: "tag",
        isWinner: true,
        weight: 18,
        congratulationText: "Unlock exclusive VIP discounts on premium tech collections!"
    }
];

// Seed recent winners for live showcase & fallback
const RECENT_WINNERS_DATA = [
    { name: "Aarav Sharma", city: "Mumbai", prize: "Grand Prize: Ultra Tech Suite", time: "3 mins ago", tier: "grand" },
    { name: "Priya Patel", city: "Bengaluru", prize: "Premium Gift: Studio Acoustic Pro", time: "18 mins ago", tier: "premium" },
    { name: "Rohan Deshmukh", city: "Pune", prize: "High-Bass Stereo Earphones", time: "32 mins ago", tier: "reward" },
    { name: "Ananya Sen", city: "Kolkata", prize: "Premium Designer Phone Cover", time: "45 mins ago", tier: "reward" },
    { name: "Vikram Malhotra", city: "New Delhi", prize: "Special Gift: Neo Watch Pro", time: "1 hour ago", tier: "special" },
    { name: "Sneha Reddy", city: "Hyderabad", prize: "Fast Charging Braided Cable", time: "2 hours ago", tier: "reward" },
    { name: "Kabir Mehta", city: "Ahmedabad", prize: "Surprise Gift: $250 Digital Pass", time: "3 hours ago", tier: "surprise" },
    { name: "Deepak Verma", city: "Jaipur", prize: "Exclusive Voucher: 50% VIP Pass", time: "4 hours ago", tier: "surprise" }
];
