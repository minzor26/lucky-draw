/**
 * PRIZE & CAMPAIGN CONFIGURATION
 * Separated from UI logic for easy customization and backend integration.
 * 100% Tangible Electronics & Premium Mobile Accessories — Zero generic vouchers!
 */

const CAMPAIGN_CONFIG = {
    campaignName: "RS Mobile Seoni",
    campaignTitle: "RS Mobile Seoni Lucky Draw Campaign",
    // Campaign end date for countdown (set to 7 days from now by default)
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    // Allow participation only once per verified mobile number
    singleEntryPerUser: true,
    supportEmail: "support@rsmobileseoni.com",
    hotline: "+91 RS Mobile Seoni"
};

const PRIZE_CONFIG = [
    {
        id: "grand_prize",
        name: "Grand Prize: iPhone 16 Pro Max",
        shortName: "iPhone 16 Pro",
        category: "Grand Prize",
        tier: "grand",
        badge: "Tier 1 • Ultimate",
        value: "₹1,44,900",
        description: "Titanium aerospace chassis, 48MP Fusion camera system, A18 Pro Bionic processor, and Super Retina XDR OLED display.",
        accentColor: "#FFB800",
        glowColor: "rgba(255, 184, 0, 0.45)",
        gradient: "linear-gradient(135deg, #FFB800 0%, #FF8A00 50%, #E52E71 100%)",
        icon: "trophy",
        isWinner: true,
        weight: 3,
        congratulationText: "You have won the ultimate Grand Prize: iPhone 16 Pro Max!"
    },
    {
        id: "anc_headphones",
        name: "Wireless ANC Studio Headphones",
        shortName: "ANC Headphones",
        category: "Premium Gift",
        tier: "premium",
        badge: "Tier 2 • Hi-Fi",
        value: "₹9,999",
        description: "Studio-tuned active noise cancellation wireless headphones with spatial audio, memory foam earcups, and 60-hour battery life.",
        accentColor: "#00F2FE",
        glowColor: "rgba(0, 242, 254, 0.45)",
        gradient: "linear-gradient(135deg, #00F2FE 0%, #4FACFE 100%)",
        icon: "headphones",
        isWinner: true,
        weight: 8,
        congratulationText: "Enjoy crystal-clear sound with your new Wireless ANC Studio Headphones!"
    },
    {
        id: "smart_watch",
        name: "AMOLED Smart Fitness Watch",
        shortName: "Smart Watch",
        category: "Special Gift",
        tier: "special",
        badge: "Tier 3 • Lifestyle",
        value: "₹4,999",
        description: "Ultra HD AMOLED curved display, Bluetooth calling, continuous heart rate & SpO2 health tracking, and 12-day battery life.",
        accentColor: "#B537F2",
        glowColor: "rgba(181, 55, 242, 0.45)",
        gradient: "linear-gradient(135deg, #B537F2 0%, #7928CA 100%)",
        icon: "watch",
        isWinner: true,
        weight: 12,
        congratulationText: "Track your health and style with your new AMOLED Smart Fitness Watch!"
    },
    {
        id: "bt_speaker",
        name: "Portable Bluetooth Party Speaker",
        shortName: "BT Speaker",
        category: "Special Gift",
        tier: "special",
        badge: "Audio Gear",
        value: "₹2,999",
        description: "Deep punchy 360° stereo bass sound, IPX7 waterproof body, ambient RGB beat lighting, and 14-hour continuous playtime.",
        accentColor: "#00F5A0",
        glowColor: "rgba(0, 245, 160, 0.45)",
        gradient: "linear-gradient(135deg, #00F5A0 0%, #00CEC9 100%)",
        icon: "speaker",
        isWinner: true,
        weight: 15,
        congratulationText: "You have won a high-powered Portable Bluetooth Party Speaker!"
    },
    {
        id: "power_bank",
        name: "20,000mAh Fast Power Bank",
        shortName: "Power Bank",
        category: "Daily Reward",
        tier: "reward",
        badge: "Power Gear",
        value: "₹1,999",
        description: "High-capacity 22.5W dual-port Quick Charge power bank with digital LED battery percentage display and multi-device protection.",
        accentColor: "#FFA502",
        glowColor: "rgba(255, 165, 2, 0.45)",
        gradient: "linear-gradient(135deg, #FFA502 0%, #FF7F50 100%)",
        icon: "powerbank",
        isWinner: true,
        weight: 18,
        congratulationText: "Never run out of battery with your new 20,000mAh Fast Power Bank!"
    },
    {
        id: "earphones",
        name: "High-Bass Stereo Earphones",
        shortName: "Stereo Earphones",
        category: "Daily Reward",
        tier: "reward",
        badge: "Assured Gift",
        value: "₹699",
        description: "High-definition sound with rich deep bass response, gold-plated audio jack, inline HD microphone, and tangle-resistant braided cord.",
        accentColor: "#FF7675",
        glowColor: "rgba(255, 118, 117, 0.45)",
        gradient: "linear-gradient(135deg, #FF7675 0%, #D63031 100%)",
        icon: "earphones",
        isWinner: true,
        weight: 22,
        congratulationText: "You have won a brand-new pair of High-Bass Stereo Earphones!"
    },
    {
        id: "phone_cover",
        name: "Premium Designer Phone Cover",
        shortName: "Phone Cover",
        category: "Daily Reward",
        tier: "reward",
        badge: "Assured Gift",
        value: "₹499",
        description: "Custom shock-absorbing dual-layer bumper case with elevated camera lens bezel, metallic buttons, and anti-yellowing matte texture.",
        accentColor: "#E84393",
        glowColor: "rgba(232, 67, 147, 0.45)",
        gradient: "linear-gradient(135deg, #FD79A8 0%, #E84393 100%)",
        icon: "case",
        isWinner: true,
        weight: 24,
        congratulationText: "You have won an exclusive Designer Shockproof Phone Cover!"
    },
    {
        id: "fast_cable",
        name: "65W Fast Charging Braided Cable",
        shortName: "Fast Cable",
        category: "Daily Reward",
        tier: "reward",
        badge: "Assured Gift",
        value: "₹349",
        description: "Heavy-duty 65W fast-charging Type-C braided cable engineered with Kevlar-reinforced wiring and premium zinc alloy connectors.",
        accentColor: "#0984E3",
        glowColor: "rgba(9, 132, 227, 0.45)",
        gradient: "linear-gradient(135deg, #74B9FF 0%, #0984E3 100%)",
        icon: "cable",
        isWinner: true,
        weight: 26,
        congratulationText: "You have won an Ultra-Durable 65W Fast Charging Braided Cable!"
    }
];

// Seed recent winners for live showcase & fallback
const RECENT_WINNERS_DATA = [
    { name: "Aarav Sharma", city: "Seoni", prize: "Grand Prize: iPhone 16 Pro Max", time: "3 mins ago", tier: "grand" },
    { name: "Priya Patel", city: "Jabalpur", prize: "Wireless ANC Studio Headphones", time: "18 mins ago", tier: "premium" },
    { name: "Rohan Deshmukh", city: "Nagpur", prize: "Portable Bluetooth Party Speaker", time: "32 mins ago", tier: "special" },
    { name: "Ananya Sen", city: "Seoni", prize: "20,000mAh Fast Power Bank", time: "45 mins ago", tier: "reward" },
    { name: "Vikram Malhotra", city: "Chhindwara", prize: "AMOLED Smart Fitness Watch", time: "1 hour ago", tier: "special" },
    { name: "Sneha Reddy", city: "Bhopal", prize: "High-Bass Stereo Earphones", time: "2 hours ago", tier: "reward" },
    { name: "Kabir Mehta", city: "Seoni", prize: "Premium Designer Phone Cover", time: "3 hours ago", tier: "reward" },
    { name: "Deepak Verma", city: "Jabalpur", prize: "65W Fast Charging Braided Cable", time: "4 hours ago", tier: "reward" }
];
