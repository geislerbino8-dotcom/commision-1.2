import React from 'react';
import { Skeleton } from './ui/skeleton';

interface PageSkeletonProps {
  tab?: string;
}

export const PageSkeleton: React.FC<PageSkeletonProps> = ({ tab = 'home' }) => {
  if (tab === 'menu') {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-200">
        {/* Header & Search Skeleton */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="space-y-2 w-full md:w-1/3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-11 w-full md:w-80 rounded-full" />
        </div>

        {/* Category Pills Skeleton */}
        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-full" />
          ))}
        </div>

        {/* Menu Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="rounded-3xl bg-white/70 p-4 border border-brand-brown/10 shadow-sm space-y-4">
              <Skeleton className="h-48 w-full rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-20 rounded-full" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-brand-brown/5">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-9 w-24 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (tab === 'history' || tab === 'orders') {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8 space-y-8 animate-in fade-in duration-200">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-5 rounded-2xl bg-white/70 border border-brand-brown/10 space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
              <Skeleton className="h-12 w-full rounded-xl" />
              <div className="flex justify-between pt-2 border-t">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-8 w-28 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (tab === 'cart') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8 animate-in fade-in duration-200">
        <div className="space-y-2">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-64" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/70 border border-brand-brown/10 flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-xl shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-6 w-16 shrink-0" />
                <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
              </div>
            ))}
          </div>

          <div className="lg:col-span-4">
            <div className="p-6 rounded-3xl bg-white/80 border border-brand-brown/10 space-y-4 shadow-sm">
              <Skeleton className="h-6 w-36" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
              <Skeleton className="h-12 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tab === 'about' || tab === 'contact' || tab === 'admin') {
    return (
      <div className="container mx-auto px-4 py-10 max-w-4xl space-y-8 animate-in fade-in duration-200">
        <div className="text-center space-y-3 max-w-md mx-auto">
          <Skeleton className="h-6 w-28 mx-auto rounded-full" />
          <Skeleton className="h-9 w-72 mx-auto" />
          <Skeleton className="h-4 w-80 mx-auto" />
        </div>

        <div className="rounded-3xl bg-white/70 p-8 border border-brand-brown/10 shadow-sm space-y-6">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  // Default: Home Page Skeleton
  return (
    <div className="flex flex-col gap-10 pb-16 mx-4 sm:mx-6 mt-3 animate-in fade-in duration-200">
      {/* Marquee Skeleton */}
      <Skeleton className="h-16 w-full rounded-2xl" />

      {/* Hero Banner Skeleton */}
      <div className="rounded-3xl bg-brand-brown/80 p-8 sm:p-12 border border-brand-brown/20 shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <Skeleton className="h-6 w-48 rounded-full bg-white/20" />
            <div className="space-y-3">
              <Skeleton className="h-10 sm:h-14 w-4/5 rounded-xl bg-white/20" />
              <Skeleton className="h-5 sm:h-6 w-full rounded-lg bg-white/15" />
              <Skeleton className="h-5 sm:h-6 w-2/3 rounded-lg bg-white/15" />
            </div>
          </div>
          <div className="lg:col-span-5 flex justify-center">
            <Skeleton className="h-72 w-full max-w-sm rounded-3xl bg-white/20" />
          </div>
        </div>
      </div>

      {/* Category Discovery Skeleton */}
      <div className="space-y-6">
        <div className="text-center space-y-2 max-w-sm mx-auto">
          <Skeleton className="h-5 w-24 mx-auto rounded-full" />
          <Skeleton className="h-8 w-60 mx-auto" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl bg-white/70 p-3 border border-brand-brown/10 space-y-3">
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
