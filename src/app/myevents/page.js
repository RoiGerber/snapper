"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { db } from "../../lib/firebaseConfig";
import { 
  collection, 
  query, 
  where, 
  getDocs,
  getDoc,
  doc 
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import useUserRole from '@/hooks/useUserRole';

export default function MyEvents() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { role, isLoading: roleLoading } = useUserRole();
  const [isValidRole, setIsValidRole] = useState(false);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }

    if (!roleLoading && role) {
      if (['photographer', 'client'].includes(role)) {
        setIsValidRole(true);
      } else {
        router.replace('/getStarted');
      }
    }
  }, [user, loading, role, roleLoading, router]);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user?.email) return;

      try {
        const userEventsQuery = query(
          collection(db, "user2event"),
          where("userId", "==", user.email)
        );

        const querySnapshot = await getDocs(userEventsQuery);
        const eventsData = [];

        for (const docRef of querySnapshot.docs) {
          const eventDoc = await getDoc(doc(db, "events", docRef.data().eventId));
          if (eventDoc.exists()) {
            eventsData.push({
              id: eventDoc.id,
              ...eventDoc.data(),
              date: eventDoc.data().date?.toDate() // Convert Firestore timestamp to Date
            });
          }
        }

        setEvents(eventsData);
      } catch (error) {
        console.error("Error fetching events:", error);
        alert("Failed to load events");
      } finally {
        setLoadingEvents(false);
      }
    };

    if (user && isValidRole) {
      fetchEvents();
    }
  }, [user, isValidRole]);

  if (loading || roleLoading || loadingEvents) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user || !isValidRole) {
    return null;
  }

  return (
    <div className=" bg-gradient-to-br from-purple-100 via-white to-purple-200 p-20 mt-20 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8"
      >
        <h1 className="text-3xl font-bold text-indigo-800 mb-8">My Events</h1>
        
        {events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No events found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {events.map((event) => (
              <div 
                key={event.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">{event.name}</h2>
                  <span className="text-sm bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full">
                    {event.type}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-gray-600">
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2 text-indigo-600" />
                    {event.date ? format(event.date, "PPP") : "No date set"}
                  </div>
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-indigo-600"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {event.city}, {event.region}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Contact Details</h3>
                  <p className="text-gray-600">{event.contactName}</p>
                  <p className="text-gray-600">{event.address}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}