const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
  _singleton: { type: String, default: 'site-settings', unique: true },

  branding: {
    logoUrl: { type: String, default: 'images/logo.png' },
    logoSize: { type: Number, default: 44 },
    logoBorderRadius: { type: Number, default: 50 },
    companyName: { type: String, default: 'Syed Productions' },
    companyShortName: { type: String, default: 'Syed Productions' },
    faviconUrl: { type: String, default: 'images/logo.png' },
    faviconBorderRadius: { type: Number, default: 50 }
  },

  hero: {
    slides: [{ imageUrl: String, alt: String }],
    subtitle: { type: String, default: "Professional Film & Media Production" },
    title: { type: String, default: 'Bringing Your Vision<br>to Life' },
    description: { type: String, default: "From cinematic wedding films to corporate videos and event coverage — we craft compelling visual stories that captivate audiences and elevate your brand." }
  },

  sectionHeaders: {
    gallery: {
      tag: { type: String, default: 'Our Work' },
      title: { type: String, default: 'Production Portfolio' },
      description: { type: String, default: 'A showcase of our finest work — from cinematic wedding films to corporate productions and creative campaigns.' }
    },
    videos: {
      tag: { type: String, default: 'Showreel' },
      title: { type: String, default: 'Our Productions' },
      description: { type: String, default: 'Watch our latest films, behind-the-scenes footage, and client testimonials showcasing our creative vision.' }
    },
    team: {
      tag: { type: String, default: 'Meet the Crew' },
      title: { type: String, default: 'The Production Team' },
      description: { type: String, default: 'Creative professionals, technical experts, and passionate storytellers — the crew behind every Syed Productions project.' }
    },
    topDestinations: {
      tag: { type: String, default: 'Spotlight' },
      title: { type: String, default: 'Featured Services' },
      description: { type: String, default: 'Our most popular production services — handpicked to showcase what Syed Productions does best.' }
    },
    destinations: {
      tag: { type: String, default: 'What We Do' },
      title: { type: String, default: 'Our Services' },
      description: { type: String, default: 'From wedding films to corporate videos, event coverage to branding — explore the full range of Syed Productions services.' }
    },
    map: {
      tag: { type: String, default: 'Locations' },
      title: { type: String, default: 'Our Coverage Area' },
      description: { type: String, default: 'We cover events and productions across Pakistan. Click any service to learn more and book.' }
    },
    tripPlanner: {
      tag: { type: String, default: 'AI-Powered' },
      title: { type: String, default: 'Project Planner' },
      description: { type: String, default: 'Tell us about your project and our AI will help estimate scope, timeline, and recommend the right production package.' }
    },
    booking: {
      tag: { type: String, default: 'Book a Service' },
      title: { type: String, default: 'Book Your Production' },
      description: { type: String, default: 'Simple, transparent booking in just a few steps. No hidden fees — honest pricing from a professional team.' }
    },
    reviews: {
      tag: { type: String, default: 'Client Stories' },
      title: { type: String, default: 'What Our Clients Say' },
      description: { type: String, default: 'Real feedback from real clients. See why hundreds trust Syed Productions for their most important moments.' }
    },
    deals: {
      tag: { type: String, default: 'Special Offers' },
      title: { type: String, default: 'Production Packages' },
      description: { type: String, default: 'Grab these exclusive production packages at special rates — limited availability, book now to secure your dates.' }
    }
  },

  navigation: {
    links: [{
      label: String,
      href: String,
      isCta: { type: Boolean, default: false }
    }]
  },

  filterCategories: [{
    label: String,
    value: String
  }],

  footer: {
    description: { type: String, default: "Professional media production house. Specializing in cinematic films, photography, videography, and event coverage across Pakistan." },
    socialLinks: [{
      platform: String,
      url: String
    }],
    trustBadges: [{
      text: String
    }],
    copyrightText: { type: String, default: '© 2026 Syed Productions. All rights reserved. Based in Pakistan.' },
    linkColumns: [{
      heading: String,
      links: [{ label: String, href: String }]
    }]
  },

  newsletter: {
    heading: { type: String, default: 'Get Production Updates & Exclusive Offers' },
    description: { type: String, default: 'Subscribe for exclusive production packages, behind-the-scenes content, and creative insights delivered to your inbox.' },
    subscriberNote: { type: String, default: 'No spam, unsubscribe anytime. Join 5,000+ creative professionals.' }
  },

  contact: {
    whatsappNumber: { type: String, default: '' },
    whatsappUrl: { type: String, default: '' },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
    phone: { type: String, default: '' }
  },

  bookingConfig: {
    serviceFee: { type: Number, default: 2000 },
    porterFeePerNight: { type: Number, default: 3000 },
    childDiscount: { type: Number, default: 0.5 }
  },

  aiTripPlanner: {
    welcomeMessage: { type: String, default: "Welcome! I'm your AI project planning assistant. Set your preferences on the left and click <strong>Plan My Project</strong> to get a personalized production estimate and recommendation!" },
    aiResponses: { type: mongoose.Schema.Types.Mixed, default: {} },
    chatResponses: { type: mongoose.Schema.Types.Mixed, default: {} }
  },

  loadingScreen: {
    title: { type: String, default: 'Syed Productions' },
    text: { type: String, default: 'Setting the stage...' }
  }

}, { timestamps: true });

// Static method to get the singleton
siteSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne({ _singleton: 'site-settings' });
  if (!settings) {
    settings = await this.create({ _singleton: 'site-settings' });
  }
  return settings;
};

// Static method to update settings
siteSettingsSchema.statics.updateSettings = async function (data) {
  const settings = await this.findOneAndUpdate(
    { _singleton: 'site-settings' },
    { $set: data },
    { new: true, upsert: true, runValidators: true }
  );
  return settings;
};

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
