"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { db } from "../../lib/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import useUserRole from '@/hooks/useUserRole';
import { stat } from "fs";

const regions = [
  "מרכז",
  "צפון",
  "שרון",
  "יהודה ושומרון",
  "דרום",
  "תל אביב",
  "חיפה",
  "ירושלים",
];

const eventTypes = [
  "יום הולדת",
  "חתונה",
  "אירוסין",
  "ספורט",
  "אירוע עסקי",
  "הופעה",
  "אחר",
];

export default function PostEvent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { role, isLoading: roleLoading } = useUserRole();
  const [isValidRole, setIsValidRole] = useState(false);
  const [eventData, setEventData] = useState({
    name: "",
    address: "",
    city: "",
    contactName: "",
    date: null,
    region: "",
    type: "",
    user: user?.email || "",
    status: "submitted",
  });
  const [showCustomType, setShowCustomType] = useState(false);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventData({ ...eventData, [name]: value });
  };

  const handleDateSelect = (date) => {
    setEventData({ ...eventData, date });
  };

  const handleTypeSelect = (value) => {
    if (value === "אחר") {
      setShowCustomType(true);
      setEventData({ ...eventData, type: "" });
    } else {
      setShowCustomType(false);
      setEventData({ ...eventData, type: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("You must be logged in to post an event.");
      return;
    }

    try {
      // Create event document
      const eventRef = await addDoc(collection(db, "events"), {
        ...eventData,
        user: user.email,
      });

      // Create user2event relationship
      await addDoc(collection(db, "user2event"), {
        userId: user.email,
        eventId: eventRef.id,
        createdAt: new Date()
      });


      // Call the Cloud Function
      const cloudFunctionURL = "https://me-west1-leafy-metrics-260112.cloudfunctions.net/yaad-pay-function";
      const requestBody = {
        Order: eventRef.id,
        Amount: eventData.amount || "400",
        ClientName: eventData.contactName || "",
        email: user.email,
      };

      const functionResponse = await fetch(cloudFunctionURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!functionResponse.ok) {
        throw new Error(`Cloud Function Error: ${functionResponse.statusText}`);
      }

      // Get the raw response text
      const responseText = await functionResponse.text();
      console.log("Cloud Function response:", responseText);

      // Construct the redirect URL
      const redirectURL = `https://pay.hyp.co.il/p/?action=pay&${responseText}`;
      console.log("Redirecting to:", redirectURL);

      // Redirect the user
      window.location.href = redirectURL;

      //alert("Event posted successfully!");
    } catch (error) {
      console.error("Error posting event:", error);
      alert("Failed to post event. Please try again.");
    }
  };

  if (loading || roleLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user || !isValidRole) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-purple-100 via-white to-purple-200 p-20 mt-20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8"
      >
        <h1 className="text-3xl font-bold text-indigo-800 mb-8">Post an Event</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Name
            </label>
            <Input
              type="text"
              name="name"
              value={eventData.name}
              onChange={handleInputChange}
              placeholder="Enter event name"
              required
              className="w-full"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <Input
              type="text"
              name="address"
              value={eventData.address}
              onChange={handleInputChange}
              placeholder="Enter event address"
              required
              className="w-full"
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <Input
              type="text"
              name="city"
              value={eventData.city}
              onChange={handleInputChange}
              placeholder="Enter city"
              required
              className="w-full"
            />
          </div>

          {/* Contact Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Name
            </label>
            <Input
              type="text"
              name="contactName"
              value={eventData.contactName}
              onChange={handleInputChange}
              placeholder="Enter contact name"
              required
              className="w-full"
            />
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {eventData.date ? (
                    format(eventData.date, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={eventData.date}
                  onSelect={handleDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Region Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Region
            </label>
            <Select
              value={eventData.region}
              onValueChange={(value) =>
                setEventData({ ...eventData, region: value })
              }
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {regions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Event Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Type
            </label>
            <Select
              value={eventData.type}
              onValueChange={handleTypeSelect}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {eventTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {showCustomType && (
              <Input
                type="text"
                name="type"
                value={eventData.type}
                onChange={handleInputChange}
                placeholder="Enter custom event type"
                className="mt-2 w-full"
                required
              />
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Post Event
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}