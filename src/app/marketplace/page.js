"use client";

import { db } from '../../lib/firebaseConfig';
import { collection, doc, updateDoc, getDocs, getDoc, setDoc, query, where, arrayUnion } from 'firebase/firestore';
import React, { useState, useEffect, useMemo } from 'react';
import { DirectionProvider } from '@radix-ui/react-direction';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

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

const EventCard = ({ event, onAcceptJob }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative border rounded-lg p-4 bg-white shadow-md hover:scale-[1.02] transition-all"
  >
    <div className="flex flex-col md:flex-row justify-between items-start gap-3 mb-4">
      <div className="flex-1">
        <h2 className="font-bold text-lg md:text-xl text-indigo-800">{event.name}</h2>
        <p className="text-gray-600 text-sm md:text-base">{event.type}</p>
      </div>
      <Button
        className="bg-indigo-600 hover:bg-indigo-700 text-white w-full md:w-auto"
        size="sm"
        onClick={() => onAcceptJob(event)}
      >
        <CameraIcon className="w-4 h-4 md:mr-2" />
        <span className="inline md:inline">הרשם כצלם</span>
      </Button>
    </div>

    <div className="space-y-2 text-sm">
      <div className="flex items-center text-gray-600">
        <CalendarIcon className="w-4 h-4 me-2 flex-shrink-0" />
        <span className="break-words">
          {new Date(event.date?.toDate()).toLocaleDateString('he-IL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </span>
      </div>
      <div className="flex items-center text-gray-600">
        <MapPinIcon className="w-4 h-4 me-2 flex-shrink-0" />
        <span className="break-words">
          {event.address}, {event.city}, {event.region}
        </span>
      </div>
      <div className="mt-2 text-sm">
        <span className="font-medium">איש קשר: </span>
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
    dateRange: { from: null, to: null },
  });

  const [activeFilters, setActiveFilters] = useState([]);
  const [sortOrder, setSortOrder] = useState('date-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [cities, setCities] = useState([]);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [contactDetails, setContactDetails] = useState({
    name: '',
    phone: ''
  });
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
        const q = query(collection(db, 'events'), where('status', '==', 'paid'),  where('photographerId', '==', null));
        const snapshot = await getDocs(q);
        console.log('snapshot:', snapshot.docs);
        setEvents(snapshot.docs.map(doc => ({ id: doc.id, date: doc.data().date?.toDate(), ...doc.data() })));
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, []);

// Modified handleAcceptJob function
const handleAcceptJob = async (event) => {
  if (event.status === 'accepted') return;

  try {
    const eventRef = doc(db, 'events', event.id);
    const eventSnap = await getDoc(eventRef);
    const eventData = eventSnap.data();

    const clientRef = doc(db, 'usersDB', event.user);
    const clientSnap = await getDoc(clientRef);
    const clientData = clientSnap.data();

    await updateDoc(eventRef, {
      status: 'accepted',
      photographerId: user.email,
      updatedAt: new Date(),
    });

    // Set contact details for dialog
    setContactDetails({
      name: eventData.contactName,
      phone: clientData.phoneNumber
    });
    setShowContactDialog(true);

    setEvents(prevEvents =>
      prevEvents.map(e =>
        e.id === event.id
          ? { ...e, status: 'accepted', photographerId: user.id }
          : e
      )
    );

  } catch (error) {
    console.error('Error accepting job:', error);
  }
};

  const handleFilterChange = (type, value) => {
    setFilters(prev => ({ ...prev, [type]: value }));
    setCurrentPage(1);

    // Update active filters with proper date range check
    setActiveFilters(prev => {
      if (type === 'dateRange') {
        const hasValue = value?.from || value?.to;
        return hasValue
          ? [...new Set([...prev, type])] // Ensure unique
          : prev.filter(f => f !== type);
      }
      return value
        ? [...new Set([...prev, type])]
        : prev.filter(f => f !== type);
    });
  };


  const removeFilter = (type) => {
    handleFilterChange(type, type === 'dateRange' ? { from: null, to: null } : '');
  };

  // Update the date filtering logic in useMemo
  const filteredEvents = useMemo(() =>
    events.filter(event => {
      // Existing filters
      const searchMatch = !filters.search ||
        event.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        event.city.toLowerCase().includes(filters.search.toLowerCase());

      const cityMatch = !filters.city ||
        event.city.toLowerCase().includes(filters.city.toLowerCase());

      const regionMatch = filters.region === "all" || event.region === filters.region;

      // Improved date filtering
      const dateFrom = filters.dateRange?.from ? new Date(filters.dateRange.from) : null;
      const dateTo = filters.dateRange?.to ? new Date(filters.dateRange.to) : null;
      const eventDate = new Date(event.date?.toDate());

      let dateMatch = true;
      if (dateFrom || dateTo) {
        dateMatch = false;
        if (dateFrom && dateTo) {
          dateMatch = eventDate >= dateFrom && eventDate <= dateTo;
        } else if (dateFrom) {
          dateMatch = eventDate >= dateFrom;
        } else if (dateTo) {
          dateMatch = eventDate <= dateTo;
        }
      }

      return searchMatch && cityMatch && regionMatch && dateMatch;
    }).sort((a, b) => sortOrder === 'date-asc' ?
      new Date(a.date) - new Date(b.date) :
      new Date(b.date) - new Date(a.date))
    , [events, filters, sortOrder]);

  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return <div>טוען...</div>;
  if (!user) return null;

  return (
    <DirectionProvider dir="rtl">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 p-4 md:p-24">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 md:mb-12"
        >
          <h1 className="text-2xl md:text-4xl font-extrabold text-indigo-800 mb-2 md:mb-3">
            אירועים זמינים
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            בנה את תיק העבודות שלך, מצא בעל אירועי שמחפש צלם
          </p>
        </motion.div>

        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4">
              <div className="relative">
                <SearchIcon className="absolute right-3 top-3 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="חיפוש לפי שם האירוע"
                  className="pr-10 text-sm md:text-base"
                  value={filters.search}
                  onChange={e => handleFilterChange('search', e.target.value)}
                />
              </div>

              <div className="relative">
                <SearchIcon className="absolute right-3 top-3 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="חיפוש לפי עיר"
                  className="pr-10 text-sm md:text-base"
                  value={filters.city}
                  onChange={e => handleFilterChange('city', e.target.value)}
                />
              </div>

              <Select
                value={filters.region}
                onValueChange={v => setFilters(prev => ({ ...prev, region: v }))}
              >
                <SelectTrigger className="text-sm md:text-base">
                  <SelectValue placeholder="איזור" />
                </SelectTrigger>
                <SelectContent className="min-w-[150px]">
                  <SelectGroup>
                    <SelectItem value="all" className="text-sm">הכל</SelectItem>
                    <SelectItem value="North" className="text-sm">צפון</SelectItem>
                    <SelectItem value="Haifa" className="text-sm">חיפה</SelectItem>
                    <SelectItem value="Center" className="text-sm">מרכז</SelectItem>
                    <SelectItem value="Tel Aviv" className="text-sm">תל אביב</SelectItem>
                    <SelectItem value="South" className="text-sm">דרום</SelectItem>
                    <SelectItem value="Judea and Samaria" className="text-sm">יו"ש</SelectItem>
                    <SelectItem value="Jerusalem" className="text-sm">ירושלים</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal text-sm md:text-base"
                    size="sm"
                  >
                    <CalendarIcon className="me-2 h-4 w-4" />
                    {filters.dateRange?.from ?
                      filters.dateRange.to ?
                        `${filters.dateRange.from.toLocaleDateString()} - ${filters.dateRange.to.toLocaleDateString()}` :
                        filters.dateRange.from.toLocaleDateString() :
                      'בחר טווח תאריכים'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[90vw] md:w-auto z-[1000] p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={filters.dateRange?.from || new Date()}
                    selected={filters.dateRange}
                    onSelect={range => handleFilterChange('dateRange', range || { from: null, to: null })}
                    numberOfMonths={1}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 text-sm">
                {activeFilters.map(filter => (
                  <Badge key={filter} variant="secondary" className="px-2 py-1 max-w-full truncate">
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
                  className="text-sm"
                  onClick={() => {
                    setFilters({
                      search: '',
                      region: 'all',
                      city: '',
                      dateRange: { from: null, to: null },
                    });
                    setActiveFilters([]);
                    setCurrentPage(1);
                  }}
                >
                  נקה הכל
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-end mb-4 md:mb-6">
            <Select defaultValue="date-asc" onValueChange={setSortOrder}>
              <SelectTrigger className="w-[200px] text-sm md:text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="min-w-[200px]">
                <SelectItem value="date-asc" className="text-sm">מיין לפי תאריף - הישן ביותר</SelectItem>
                <SelectItem value="date-desc" className="text-sm">מיין לפי תאריך - החדש ביותר</SelectItem>
                <SelectItem value="name-asc" className="text-sm">שם האירוע</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {loadingEvents ?
              Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />) :
              paginatedEvents.map(event => <EventCard key={event.id} event={event} onAcceptJob={handleAcceptJob} />)
            }
          </div>

          {filteredEvents.length > itemsPerPage && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                onClick={() => setCurrentPage(p => p - 1)}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                הקודם
              </Button>
              <span className="text-sm text-gray-600 my-auto">
                עמוד {currentPage} מתוך {Math.ceil(filteredEvents.length / itemsPerPage)}
              </span>
              <Button
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage === Math.ceil(filteredEvents.length / itemsPerPage)}
                variant="outline"
                size="sm"
              >
                הבא
              </Button>
            </div>
          )}

          {filteredEvents.length === 0 && !loadingEvents && (
            <div className="text-center py-8 md:py-16">
              <p className="text-gray-500 text-lg">לא נמצאו אירועים זמינים, נשמח שתבדוק אצלנו שוב מחר</p>
              <Button
                variant="link"
                className="text-sm md:text-base"
                onClick={() => {
                  setFilters({
                    search: '',
                    region: 'all',
                    city: '',
                    dateRange: { from: null, to: null },
                  });
                  setActiveFilters([]);
                  setCurrentPage(1);
                }}
              >
                מחק את כל הפילטרים
              </Button>
            </div>
          )}
        </div>
      </div>
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='flex' dir='rtl' >פרטי קשר לאירוע</DialogTitle>
            <DialogDescription className="text-right">
              <div className="space-y-4 mt-4">
                <p className="font-medium">
                  שם מלא: <span className="text-gray-700">{contactDetails.name}</span>
                </p>
                <p className="font-medium">
                  מספר טלפון: <span className="text-gray-700">{contactDetails.phone}</span>
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  פרטי הקשר נשמרו גם באזור הניהול שלך.
                </p>
                <p className="font-medium">
                  <span className="text-gray-700">אנא צור קשר עם בעל האירוע כעת.</span>
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              onClick={() => {
                setShowContactDialog(false);
                window.location.href = '/manage';
              }}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              מעבר לאזור הניהול
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DirectionProvider>
  );
}