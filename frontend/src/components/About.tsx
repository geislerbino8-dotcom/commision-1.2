import React from 'react';
import { Coffee, MapPin, Mail, Instagram, Facebook } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

export const About: React.FC = () => {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-10 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <h2 className="font-display text-3xl font-bold tracking-tight text-brand-brown sm:text-4xl">
          About Mr. Boy SpecialTea
        </h2>
        <p className="text-sm text-muted-foreground">
          Serving premium taste at an affordable everyday price.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mission / Goal Card */}
        <Card className="rounded-2xl border-brand-brown/10 shadow-md bg-white">
          <CardHeader>
            <div className="flex items-center gap-2.5 text-brand-coffee">
              <Coffee className="h-6 w-6 text-brand-orange" />
              <CardTitle className="text-xl font-bold text-brand-brown">Our Mission</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              To provide high-quality milk tea, fruit teas, and handcrafted coffee while delivering fast, friendly, and satisfying service to our community in Montalban.
            </p>
            <p>
              We believe that great taste shouldn't come with a high price tag. Every drink is made fresh with premium teas and authentic ingredients.
            </p>
          </CardContent>
        </Card>

        {/* Store Info Card */}
        <Card className="rounded-2xl border-brand-brown/10 shadow-md bg-white">
          <CardHeader>
            <div className="flex items-center gap-2.5 text-brand-coffee">
              <MapPin className="h-6 w-6 text-brand-orange" />
              <CardTitle className="text-xl font-bold text-brand-brown">Visit Us</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-brand-coffee shrink-0 mt-0.5" />
              <span>Blk 14 Lot 4 Phase 1 Dela Costa Homes V Burgos, Rodriguez Rizal, Philippines 1860</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-brand-coffee shrink-0" />
              <a href="mailto:mrboyspecialteadelacosta@gmail.com" className="hover:underline text-brand-coffee font-medium">
                mrboyspecialteadelacosta@gmail.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Social Media Links */}
      <Card className="rounded-2xl border-brand-brown/10 bg-brand-cream/50 shadow-sm p-6 text-center">
        <h3 className="text-lg font-bold text-brand-brown mb-4">Connect With Us Online</h3>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href="https://www.facebook.com/mrboyspecialteadelacostav"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow transition-transform hover:scale-105"
          >
            <Facebook className="h-4 w-4" />
            <span>Facebook Page</span>
          </a>

          <a
            href="https://instagram.com/mrboyspecialtea"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow transition-transform hover:scale-105"
          >
            <Instagram className="h-4 w-4" />
            <span>@mrboyspecialtea</span>
          </a>
        </div>
      </Card>
    </div>
  );
};
