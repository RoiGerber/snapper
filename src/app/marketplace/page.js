"use client";

import { db } from '../../lib/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarIcon,
  SearchIcon,
  MapPinIcon,
  CameraIcon,
  ListIcon,
  XIcon,
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

const api_url = 'https://data.gov.il/api/3/action/datastore_search';
const cities_resource_id = '5c78e9fa-c2e2-4771-93ff-7f400a12f7ba';
const city_name_key = 'שם_ישוב';

const fetchCities = async () => {
  const response = await axios.get(api_url, {
    params: { resource_id: cities_resource_id, limit: 32000 },
  });
  const records = response.data.result.records;
  return records.map((record) => record[city_name_key].trim());
};

const EventCard = ({ event }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative border rounded-lg p-6 bg-white shadow-md hover:scale-105 transition-all"
  >
    <div className="flex justify-between items-start mb-4">
      <div>
        <h2 className="font-bold text-xl text-indigo-800">{event.name}</h2>
        <p className="text-gray-600">{event.type}</p>
      </div>
      <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
        <CameraIcon className="w-4 h-4 mr-2" />
        Accept Job
      </Button>
    </div>

    <div className="space-y-2">
      <div className="flex items-center text-gray-600">
        <CalendarIcon className="w-4 h-4 mr-2" />
        {new Date(event.date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </div>
      <div className="flex items-center text-gray-600">
        <MapPinIcon className="w-4 h-4 mr-2" />
        {event.address}, {event.city}, {event.region}
      </div>
      <div className="mt-4">
        <span className="font-medium">Contact: </span>
        {event.contactName}
      </div>
    </div>
  </motion.div>
);

const SkeletonCard = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative border rounded-lg p-6 bg-white shadow-md"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="space-y-2">
        <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
      </div>
      <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
    </div>
    <div className="space-y-2">
      <div className="flex items-center">
        <div className="h-4 bg-gray-200 rounded w-4 mr-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
      </div>
      <div className="flex items-center">
        <div className="h-4 bg-gray-200 rounded w-4 mr-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
      </div>
      <div className="mt-4">
        <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
      </div>
    </div>
  </motion.div>
);

export default function EventMarketplace() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [filters, setFilters] = useState({
    search: '',
    region: 'all',
    city: '',
    type: '',
    dateRange: { from: null, to: null },
  });

  const [activeFilters, setActiveFilters] = useState([]);
  const [sortOrder, setSortOrder] = useState('date-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [cities, setCities] = useState([]);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const eventTypes = ['Wedding', 'Corporate', 'Birthday', 'Concert', 'Sports'];

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    const loadCities = async () => {
      try {
        setCities(await fetchCities());
      } catch (error) {
        console.error('Error fetching cities:', error);
      }
    };
    loadCities();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'events'));
        setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, []);

  const handleFilterChange = (type, value) => {
    setFilters(prev => ({ ...prev, [type]: value }));
    setCurrentPage(1);
    setActiveFilters(prev => value ? [...prev, type] : prev.filter(f => f !== type));
  };

  const removeFilter = (type) => {
    handleFilterChange(type, type === 'dateRange' ? { from: null, to: null } : '');
  };

  const filteredEvents = useMemo(() => 
    events.filter(event => {
      const searchMatch = !filters.search || 
        event.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        event.city.toLowerCase().includes(filters.search.toLowerCase());

      const cityMatch = !filters.city ||
        event.city.toLowerCase().includes(filters.city.toLowerCase());

      const regionMatch = filters.region === "all" || event.region === filters.region;

      const dateFrom = filters.dateRange.from ? new Date(filters.dateRange.from) : null;
      const dateTo = filters.dateRange.to ? new Date(filters.dateRange.to) : null;
      const eventDate = new Date(event.date);

      return searchMatch && cityMatch && regionMatch && 
        (!dateFrom && !dateTo || eventDate >= dateFrom && eventDate <= dateTo);
    }).sort((a, b) => sortOrder === 'date-asc' ? 
      new Date(a.date) - new Date(b.date) : 
      new Date(b.date) - new Date(a.date))
  , [events, filters, sortOrder]);

  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 p-24">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-extrabold text-indigo-800 mb-3">
          Photography Events
        </h1>
        <p className="text-gray-600">
          Browse and accept photography opportunities in your area
        </p>
      </motion.div>

      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search events..."
                className="pl-10"
                value={filters.search}
                onChange={e => handleFilterChange('search', e.target.value)}
              />
            </div>

            <div className="relative">
              <SearchIcon className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search city..."
                className="pl-10"
                value={filters.city}
                onChange={e => handleFilterChange('city', e.target.value)}
              />
            </div>

            <Select onValueChange={v => handleFilterChange('type', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.region}
              onValueChange={v => setFilters(prev => ({ ...prev, region: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="North">North</SelectItem>
                  <SelectItem value="Haifa">Haifa</SelectItem>
                  <SelectItem value="Center">Center</SelectItem>
                  <SelectItem value="Tel Aviv">Tel Aviv</SelectItem>
                  <SelectItem value="South">South</SelectItem>
                  <SelectItem value="Judea and Samaria">Judea and Samaria</SelectItem>
                  <SelectItem value="Jerusalem">Jerusalem</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange?.from ? 
                    filters.dateRange.to ?
                      `${filters.dateRange.from.toLocaleDateString()} - ${filters.dateRange.to.toLocaleDateString()}` :
                      filters.dateRange.from.toLocaleDateString() :
                    'Select dates'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto z-[1000] p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={filters.dateRange?.from || new Date()}
                  selected={filters.dateRange}
                  onSelect={range => handleFilterChange('dateRange', range || { from: null, to: null })}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map(filter => (
                <Badge key={filter} variant="secondary" className="px-3 py-1">
                  {filter === 'dateRange' ? 
                    `${filters.dateRange.from?.toLocaleDateString()} - ${filters.dateRange.to?.toLocaleDateString()}` :
                    filters[filter]}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-4 w-4 p-0"
                    onClick={() => removeFilter(filter)}
                  >
                    <XIcon className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilters({
                    search: '',
                    region: 'all',
                    city: '',
                    type: '',
                    dateRange: { from: null, to: null },
                  });
                  setActiveFilters([]);
                  setCurrentPage(1);
                }}
              >
                Clear all
              </Button>
            </div>
          )}
        </div>

        <div className="flex justify-end mb-6">
          <Select defaultValue="date-asc" onValueChange={setSortOrder}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-asc">Date: Earliest first</SelectItem>
              <SelectItem value="date-desc">Date: Latest first</SelectItem>
              <SelectItem value="name-asc">Name: A-Z</SelectItem>
              <SelectItem value="name-desc">Name: Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loadingEvents ? 
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />) :
            paginatedEvents.map(event => <EventCard key={event.id} event={event} />)
          }
        </div>

        {filteredEvents.length > itemsPerPage && (
          <div className="flex justify-center gap-2 mt-8">
            <Button
              onClick={() => setCurrentPage(p => p - 1)}
              disabled={currentPage === 1}
              variant="outline"
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600 my-auto">
              Page {currentPage} of {Math.ceil(filteredEvents.length / itemsPerPage)}
            </span>
            <Button
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage === Math.ceil(filteredEvents.length / itemsPerPage)}
              variant="outline"
            >
              Next
            </Button>
          </div>
        )}

        {filteredEvents.length === 0 && !loadingEvents && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No events match your filters</p>
            <Button
              variant="link"
              onClick={() => {
                setFilters({
                  search: '',
                  region: 'all',
                  city: '',
                  type: '',
                  dateRange: { from: null, to: null },
                });
                setActiveFilters([]);
                setCurrentPage(1);
              }}
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
