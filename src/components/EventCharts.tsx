import { Globe, CalendarCheck, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEventsStore, selectStats, selectEventsByMonth, selectEventsByCity, selectEventsByTag, selectFilteredEvents } from '@/store/eventsStore';

const GREEN = '#16a34a';
const TEAL = '#0d9488';
const BLUE = '#2563eb';

export function StatsHeader() {
  const events = useEventsStore(s => selectFilteredEvents(s.events, s.filters));
  const { total, upcomingThisMonth, countries } = selectStats(events);

  const tiles = [
    { label: 'Total Events', value: total, icon: BarChart2, color: 'text-green-600 dark:text-green-400' },
    { label: 'This Month', value: upcomingThisMonth, icon: CalendarCheck, color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Locations', value: countries, icon: Globe, color: 'text-teal-600 dark:text-teal-400' },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {tiles.map(({ label, value, icon: Icon, color }) => (
        <Card key={label} className="text-center">
          <CardContent className="pt-5 pb-4">
            <Icon className={`w-6 h-6 mx-auto mb-2 ${color}`} />
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function EventsByMonthChart() {
  const events = useEventsStore(s => selectFilteredEvents(s.events, s.filters));
  const data = selectEventsByMonth(events);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Events by Month
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
              labelStyle={{ fontWeight: 600 }}
            />
            <Bar dataKey="count" name="Events" fill={GREEN} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function EventsByCityChart() {
  const events = useEventsStore(s => selectFilteredEvents(s.events, s.filters));
  const data = selectEventsByCity(events);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Top Locations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
            <YAxis dataKey="city" type="category" tick={{ fontSize: 11 }} width={80} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
              labelStyle={{ fontWeight: 600 }}
            />
            <Bar dataKey="count" name="Events" fill={TEAL} radius={[0, 4, 4, 0]}>
              {data.map((_, i) => (
                <Cell key={i} opacity={1 - i * 0.07} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function EventsByTagChart() {
  const events = useEventsStore(s => selectFilteredEvents(s.events, s.filters));
  const data = selectEventsByTag(events);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Top Tags
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[180px]">
          <p className="text-sm text-muted-foreground">No tag data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Top Tags
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="tag" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
              labelStyle={{ fontWeight: 600 }}
            />
            <Bar dataKey="count" name="Events" fill={BLUE} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
