import { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Select from 'react-select';
import { ChevronDown, ChevronUp, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { filterSchema, type FilterValues } from '@/lib/filterSchema';
import { useEventsStore } from '@/store/eventsStore';
import type { ClimateEvent } from '@/types';

function toOptions(values: string[]) {
  return values.map(v => ({ value: v, label: v }));
}

function uniqueSorted(arr: (string | undefined)[]): string[] {
  return [...new Set(arr.filter(Boolean) as string[])].sort();
}

function deriveOptions(events: ClimateEvent[]) {
  const cities = uniqueSorted(events.map(e => e.city));
  const tags = uniqueSorted(events.flatMap(e => e.tags ?? []));
  return { cityOptions: toOptions(cities), tagOptions: toOptions(tags) };
}

export function FilterPanel() {
  const [open, setOpen] = useState(false);
  const events = useEventsStore(s => s.events);
  const setFilters = useEventsStore(s => s.setFilters);
  const filters = useEventsStore(s => s.filters);
  const { cityOptions, tagOptions } = deriveOptions(events);

  const hasActiveFilters = !!(
    filters.search ||
    filters.dateFrom ||
    filters.dateTo ||
    (filters.cities?.length ?? 0) > 0 ||
    (filters.tags?.length ?? 0) > 0
  );

  const { register, control, watch, reset } = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {},
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const sub = watch((values) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setFilters(values as FilterValues);
      }, 300);
    });
    return () => {
      sub.unsubscribe();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [watch, setFilters]);

  const handleReset = () => {
    reset({});
    setFilters({});
  };

  const selectStyles = {
    control: (base: Record<string, unknown>) => ({
      ...base,
      minHeight: '36px',
      fontSize: '14px',
      borderColor: 'hsl(var(--border))',
      backgroundColor: 'hsl(var(--background))',
      color: 'hsl(var(--foreground))',
    }),
    menu: (base: Record<string, unknown>) => ({
      ...base,
      backgroundColor: 'hsl(var(--background))',
      border: '1px solid hsl(var(--border))',
      zIndex: 50,
    }),
    option: (base: Record<string, unknown>, state: { isFocused: boolean }) => ({
      ...base,
      fontSize: '14px',
      backgroundColor: state.isFocused ? 'hsl(var(--accent))' : 'transparent',
      color: 'hsl(var(--foreground))',
    }),
    multiValue: (base: Record<string, unknown>) => ({
      ...base,
      backgroundColor: 'hsl(var(--accent))',
    }),
    multiValueLabel: (base: Record<string, unknown>) => ({
      ...base,
      color: 'hsl(var(--foreground))',
      fontSize: '12px',
    }),
    input: (base: Record<string, unknown>) => ({
      ...base,
      color: 'hsl(var(--foreground))',
    }),
    placeholder: (base: Record<string, unknown>) => ({
      ...base,
      color: 'hsl(var(--muted-foreground))',
    }),
    singleValue: (base: Record<string, unknown>) => ({
      ...base,
      color: 'hsl(var(--foreground))',
    }),
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen(o => !o)}
          className="gap-2"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 bg-green-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              ●
            </span>
          )}
          {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1 text-muted-foreground hover:text-foreground">
            <X className="w-3 h-3" /> Clear filters
          </Button>
        )}
      </div>

      {open && (
        <Card className="animate-fade-in">
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Search</Label>
                <Input
                  {...register('search')}
                  placeholder="Title, host, location…"
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">From date</Label>
                <Input {...register('dateFrom')} type="date" className="h-9 text-sm" />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">To date</Label>
                <Input {...register('dateTo')} type="date" className="h-9 text-sm" />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Cities</Label>
                <Controller
                  name="cities"
                  control={control}
                  render={({ field }) => (
                    <Select
                      isMulti
                      options={cityOptions}
                      value={toOptions(field.value ?? [])}
                      onChange={opts => field.onChange(opts.map(o => o.value))}
                      placeholder="All cities…"
                      styles={selectStyles}
                      classNamePrefix="rs"
                    />
                  )}
                />
              </div>

              {tagOptions.length > 0 && (
                <div className="space-y-1 sm:col-span-2 lg:col-span-4">
                  <Label className="text-xs text-muted-foreground">Tags</Label>
                  <Controller
                    name="tags"
                    control={control}
                    render={({ field }) => (
                      <Select
                        isMulti
                        options={tagOptions}
                        value={toOptions(field.value ?? [])}
                        onChange={opts => field.onChange(opts.map(o => o.value))}
                        placeholder="Filter by tags…"
                        styles={selectStyles}
                        classNamePrefix="rs"
                      />
                    )}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
