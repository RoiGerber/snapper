"use client";

import { db } from '../../lib/firebaseConfig'; // Adjust the import path as necessary
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
  MapIcon,
  XIcon,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { useAuth } from '@/lib/auth'; // Import the authentication hook
import { useRouter } from 'next/navigation'; // For navigation

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// API configuration
const api_url = 'https://data.gov.il/api/3/action/datastore_search';
const cities_resource_id = '5c78e9fa-c2e2-4771-93ff-7f400a12f7ba';
const city_name_key = 'שם_ישוב';

// Helper function to fetch cities
const fetchCities = async () => {
  const response = await axios.get(api_url, {
    params: { resource_id: cities_resource_id, limit: 32000 },
  });
  const records = response.data.result.records;
  const cityNames = records.map((record) => record[city_name_key].trim());
  return cityNames;
};

// Israel Map Component
const IsraelMap = ({ events, onEventSelect }) => {
  const israelCenter = [31.0461, 34.8516]; // Approximate center of Israel
  const zoomLevel = 7;

  return (
    <MapContainer
      center={israelCenter}
      zoom={zoomLevel}
      style={{ height: '70vh', width: '100%', borderRadius: '0.5rem', zIndex: "5" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {events.map((event) => {
        const eventCoordinates = getCoordinatesForCity(event.city);
        return (
          <Marker
            key={event.id}
            position={eventCoordinates}
            eventHandlers={{
              click: () => onEventSelect(event),
            }}
          >
            <Popup>
              <div>
                <h3 className="font-bold">{event.name}</h3>
                <p>{event.type}</p>
                <p>{event.city}, {event.region}</p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

// Helper function to get coordinates for cities in Israel
const getCoordinatesForCity = (city) => {
  const cityCoordinates = {
    'Jerusalem': [31.7683, 35.2137],
    'Tel Aviv': [32.0853, 34.7818],
    'Haifa': [32.7940, 34.9896],
    'Beer Sheva': [31.2518, 34.7913],
    'Eilat': [29.5577, 34.9519],
    // Add more cities as needed
  };
  return cityCoordinates[city] || [31.0461, 34.8516]; // Default to Israel center
};

// EventCard Component
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

const SkeletonCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative border rounded-lg p-6 bg-white shadow-md"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2">
          {/* Placeholder for event name */}
          <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          {/* Placeholder for event type */}
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        </div>
        {/* Placeholder for button */}
        <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
      </div>

      <div className="space-y-2">
        {/* Placeholder for date */}
        <div className="flex items-center">
          <div className="h-4 bg-gray-200 rounded w-4 mr-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        </div>
        {/* Placeholder for location */}
        <div className="flex items-center">
          <div className="h-4 bg-gray-200 rounded w-4 mr-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
        </div>
        {/* Placeholder for contact */}
        <div className="mt-4">
          <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        </div>
      </div>
    </motion.div>
  );
};

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <Button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        variant="outline"
      >
        Previous
      </Button>
      <span className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        variant="outline"
      >
        Next
      </Button>
    </div>
  );
};

// Main Component
export default function EventMarketplace() {
  const { user, loading } = useAuth(); // Get user and loading state
  const router = useRouter();

  const [filters, setFilters] = useState({
    search: '',
    region: 'all',
    city: '',
    type: '',
    dateRange: {
      from: null,
      to: null,
    },
  });

  const [viewMode, setViewMode] = useState('grid');
  const [activeFilters, setActiveFilters] = useState([]);
  const [sortOrder, setSortOrder] = useState('date-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(true);

  const eventTypes = ['Wedding', 'Corporate', 'Birthday', 'Concert', 'Sports'];

  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login'); // Redirect to login if not authenticated
    }
  }, [user, loading, router]);

  // Fetch cities on component mount
  useEffect(() => {
    const loadCities = async () => {
      try {
        const cityNames = await fetchCities();
        setCities(cityNames);
      } catch (error) {
        console.error('Error fetching cities:', error);
      } finally {
        setLoadingCities(false);
      }
    };

    loadCities();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsCollection = collection(db, 'events');
        const eventsSnapshot = await getDocs(eventsCollection);
        const eventsList = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setEvents(eventsList);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, []);

  // Handle filter changes
  const handleFilterChange = (type, value) => {
    setFilters((prev) => ({ ...prev, [type]: value }));
    setCurrentPage(1); // Reset to the first page when filters change

    // Handle active filters
    if (type === 'dateRange') {
      const isActive = value.from && value.to;
      setActiveFilters((prev) => {
        if (isActive && !prev.includes(type)) {
          return [...prev, type];
        } else if (!isActive && prev.includes(type)) {
          return prev.filter((f) => f !== type);
        }
        return prev;
      });
    } else {
      setActiveFilters((prev) => {
        if (value && !prev.includes(type)) {
          return [...prev, type];
        } else if (!value && prev.includes(type)) {
          return prev.filter((f) => f !== type);
        }
        return prev;
      });
    }
  };

  // Remove a filter
  const removeFilter = (type) => {
    if (type === 'dateRange') {
      handleFilterChange(type, { from: null, to: null });
    } else {
      handleFilterChange(type, '');
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const searchMatch = !filters.search ||
        event.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        event.city.toLowerCase().includes(filters.search.toLowerCase());

      const cityMatch = !filters.city ||
        event.city.toLowerCase().includes(filters.city.toLowerCase());

      const regionMatch = filters.region === "all" || // Show all events if region is "all"
        event.region === filters.region;

      const dateFrom = filters.dateRange.from ? new Date(filters.dateRange.from) : null;
      const dateTo = filters.dateRange.to ? new Date(filters.dateRange.to) : null;
      const eventDate = new Date(event.date);

      const dateMatch = (!dateFrom && !dateTo) ||
        (eventDate >= dateFrom && eventDate <= dateTo);

      return searchMatch && cityMatch && regionMatch && dateMatch;
    }).sort((a, b) => {
      if (sortOrder === 'date-asc') {
        return new Date(a.date) - new Date(b.date);
      } else if (sortOrder === 'date-desc') {
        return new Date(b.date) - new Date(a.date);
      }
      return 0;
    });
  }, [events, filters, sortOrder]);

  const indexOfLastEvent = currentPage * itemsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - itemsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (filteredEvents.length > itemsPerPage) {
      return (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      );
    }
    return null;
  };

  const filterLabels = {
    search: 'Search',
    region: 'Region',
    city: 'City',
    type: 'Event Type',
    dateRange: 'Date Range',
  };

  // Render a loading state if still verifying authentication
  if (loading) {
    return <div>Loading...</div>;
  }

  // Render an empty page if unauthenticated (router.push will handle navigation)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 p-24">
      {/* Header */}
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

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search events..."
                className="pl-10"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            {/* City Search */}
            <div className="relative">
              <SearchIcon className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search city..."
                className="pl-10"
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
              />
            </div>

            {/* Event Type Selector */}
            <Select onValueChange={(value) => handleFilterChange('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.region}
              onValueChange={(value) => setFilters({ ...filters, region: value })}
            >
              <SelectTrigger className="w-[180px]">
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

            {/* Date Range Selector */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange?.from
                    ? filters.dateRange?.to
                      ? `${filters.dateRange.from.toLocaleDateString()} - ${filters.dateRange.to.toLocaleDateString()}`
                      : filters.dateRange.from.toLocaleDateString()
                    : 'Select dates'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto z-[1000] p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={filters.dateRange?.from || new Date()}
                  selected={{
                    from: filters.dateRange.from,
                    to: filters.dateRange.to,
                  }}
                  onSelect={(range) => {
                    const validatedRange = {
                      from: range?.from || null,
                      to: range?.to || null,
                    };
                    handleFilterChange('dateRange', validatedRange);
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter) => {
                let valueText;
                if (filter === 'dateRange') {
                  const from = filters.dateRange.from?.toLocaleDateString();
                  const to = filters.dateRange.to?.toLocaleDateString();
                  valueText = from && to ? `${from} - ${to}` : '';
                } else {
                  valueText = filters[filter];
                }

                return (
                  <Badge key={filter} variant="secondary" className="px-3 py-1">
                    {filterLabels[filter]}: {valueText}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-4 w-4 p-0"
                      onClick={() => removeFilter(filter)}
                    >
                      <XIcon className="h-3 w-3" />
                    </Button>
                  </Badge>
                );
              })}
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
                  setCurrentPage(1); // Reset to the first page
                }}
              >
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* View Toggle and Sort */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <Button
              onClick={() => setViewMode('grid')}
              className={`${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600'}`}
            >
              <ListIcon className="w-4 h-4 mr-2" />
              Grid View
            </Button>
            <Button
              onClick={() => setViewMode('map')}
              className={`${viewMode === 'map' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600'}`}
            >
              <MapIcon className="w-4 h-4 mr-2" />
              Map View
            </Button>
          </div>
          <Select defaultValue="date-asc" onValueChange={(value) => setSortOrder(value)}>
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

        {/* Content Views */}
        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            <motion.div
              layout
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {loadingEvents ? (
                // Show skeleton cards while loading
                Array.from({ length: 6 }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))
              ) : (
                // Show actual event cards when data is loaded
                currentEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))
              )}
            </motion.div>
          ) : (
            <motion.div
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-xl overflow-hidden shadow-lg"
            >
              <IsraelMap
                events={currentEvents}
                onEventSelect={(event) => console.log('Selected:', event)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {renderPagination()}

        {/* No Results */}
        {filteredEvents.length === 0 && !loadingEvents && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
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
                setCurrentPage(1); // Reset to the first page
              }}
            >
              Clear all filters
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}