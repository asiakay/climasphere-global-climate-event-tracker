export interface ClimateEvent {
  id?: string;
  title: string;
  date_local?: string;
  time_local?: string;
  city?: string;
  country?: string;
  region?: string;
  host?: string;
  venue?: string;
  address?: string;
  link?: string;
  source?: string;
  tags?: string[];
}
