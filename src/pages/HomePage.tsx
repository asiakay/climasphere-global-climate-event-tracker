import React, { useEffect } from 'react';
import { Leaf, RefreshCw, MapPin, Calendar, AlertTriangle, SearchX, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useEventsStore } from '@/store/eventsStore';
import { useClimateEvents } from '@/hooks/useClimateEvents';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import type { ClimateEvent } from '@/types';
import { cn } from '@/lib/utils';
const AppHeader = () => (
  <header className="text-center mb-10 md:mb-16 animate-fade-in">
    <h1 className="text-4xl sm:text-5xl font-display text-green-800 dark:text-green-300 tracking-tight flex items-center justify-center">
      <Leaf className="w-10 h-10 mr-3 text-green-500" />
      ClimaSphere
    </h1>
    <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
      A real-time dashboard tracking global climate events and initiatives.
    </p>
  </header>
);
const Controls = ({ onRefresh }: { onRefresh: () => void }) => {
  const isLoading = useEventsStore(state => state.isLoading);
  const lastUpdated = useEventsStore(state => state.lastUpdated);
  const isFallback = useEventsStore(state => state.isFallback);
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
      <p className={cn(
        "text-sm italic",
        isFallback ? "text-red-500" : "text-muted-foreground"
      )}>
        {lastUpdated ? (isFallback ? `Displaying fallback data. Last attempt: ${lastUpdated}` : `Last updated: ${lastUpdated}`) : 'Fetching data...'}
      </p>
      <Button onClick={onRefresh} disabled={isLoading} variant="outline" className="group">
        {isLoading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <RefreshCw className="w-4 h-4 mr-2 transition-transform group-hover:rotate-180" />
        )}
        {isLoading ? 'Refreshing...' : 'Refresh Data'}
      </Button>
    </div>
  );
};
const EventCard = ({ event, index }: { event: ClimateEvent; index: number }) => {
  const dateText = event.date_local
    ? format(new Date(event.date_local), 'MMM d, yyyy')
    : 'Date TBD';

  // Clean up backslashes from the API data
  const cleanText = (text: string | undefined) => text?.replace(/\\/g, '') || '';

  const venue = cleanText(event.venue);
  const city = cleanText(event.city);
  const address = cleanText(event.address);

  const location = venue && city
    ? `${venue}, ${city}`
    : address || city || 'Location Unknown';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <Card className="h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-transparent hover:border-green-200 dark:hover:border-green-800">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-lg font-bold text-foreground">{cleanText(event.title) || 'Untitled Event'}</CardTitle>
            <span className="text-xs font-semibold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/50 px-3 py-1 rounded-full flex-shrink-0">
              {dateText}
            </span>
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-between">
          <div className="space-y-3 text-muted-foreground text-sm">
            {event.host && (
              <p className="flex items-start">
                <span className="font-semibold mr-2 text-foreground">Host:</span>
                <span>{cleanText(event.host)}</span>
              </p>
            )}
            <p className="flex items-start">
              <MapPin className="w-4 h-4 mr-3 mt-0.5 text-red-500 flex-shrink-0" />
              <span>{location}</span>
            </p>
            <p className="flex items-center">
              <Calendar className="w-4 h-4 mr-3 text-blue-500 flex-shrink-0" />
              {event.date_local ? (event.time_local ? `${dateText} at ${event.time_local}` : dateText) : 'Awaiting Confirmation'}
            </p>
          </div>
          {event.link ? (
            <Button
              asChild
              className="w-full mt-6 bg-green-700 hover:bg-green-800 dark:bg-green-600 dark:hover:bg-green-700 text-white dark:text-primary-foreground"
            >
              <a href={event.link} target="_blank" rel="noopener noreferrer">
                View Details
              </a>
            </Button>
          ) : (
            <Button className="w-full mt-6 bg-green-700 hover:bg-green-800 dark:bg-green-600 dark:hover:bg-green-700 text-white dark:text-primary-foreground" disabled>
              View Details
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {Array.from({ length: 4 }).map((_, i) => (
      <Card key={i}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-20" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-10 w-full mt-4" />
        </CardContent>
      </Card>
    ))}
  </div>
);
const ErrorDisplay = () => {
  const error = useEventsStore(state => state.error);
  if (!error) return null;
  return (
    <Alert variant="destructive" className="animate-scale-in">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Data Fetch Error</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
};
const EmptyState = () => (
  <div className="text-center py-16 px-6 bg-secondary rounded-2xl border border-dashed animate-fade-in">
    <SearchX className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
    <h3 className="text-xl font-semibold text-foreground">No Events Found</h3>
    <p className="text-muted-foreground mt-2">
      We couldn't find any climate events at the moment, or the data structure was unexpected.
    </p>
  </div>
);
const EventGrid = () => {
  const events = useEventsStore(state => state.events);
  const isLoading = useEventsStore(state => state.isLoading);
  const error = useEventsStore(state => state.error);
  if (isLoading) {
    return <LoadingSkeleton />;
  }
  if (error) {
    return <ErrorDisplay />;
  }
  if (events.length === 0) {
    return <EmptyState />;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <AnimatePresence>
        {events.map((event, index) => (
          <EventCard key={`${event.title}-${index}`} event={event} index={index} />
        ))}
      </AnimatePresence>
    </div>
  );
};
export function HomePage() {
  const { fetchEvents } = useClimateEvents();
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);
  return (
    <div className="min-h-screen bg-background dark:bg-gradient-subtle bg-gradient-subtle">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <AppHeader />
          <Controls onRefresh={fetchEvents} />
          <EventGrid />
        </div>
      </main>
      <footer className="text-center py-6 text-sm text-muted-foreground">
        Built with ❤️ by <a href='https://asialakay-portfolio.asialakaygrady-6d4.workers.dev/' target="_blank" rel="noopener noreferrer">Asia Lakay Grady</a> with <a href='https://build.cloudflare.dev/'>Build.Cloudflare.Dev</a>, Cloudflare Workers & React. Data sourced from curated public APIs.
      </footer>
      <PWAInstallPrompt />
    </div>
  );
}