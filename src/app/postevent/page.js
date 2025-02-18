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
import { DirectionProvider } from '@radix-ui/react-direction';
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { db } from "../../lib/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import useUserRole from '@/hooks/useUserRole';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";

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
    time: null,
    user: user?.email || "",
    status: "submitted",
    photographerId: null,
  });
  const [showCustomType, setShowCustomType] = useState(false);
  const [isCustomType, setIsCustomType] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("");

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

  const handleTimeChange = (e) => {
    setEventData({ ...eventData, time: e.target.value });
  };

  const handleDateSelect = (date) => {
    setEventData({ ...eventData, date });
  };

  const handleTypeSelect = (value) => {
    if (value === "אחר") {
      setShowCustomType(true);
      setIsCustomType(true);
      setEventData(prev => ({ ...prev, type: "" })); // Reset type when selecting "אחר"
    } else {
      setShowCustomType(false);
      setIsCustomType(false);
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
        createdAt: serverTimestamp(),
        user: user.email,
      });

      // Call the Cloud Function
      const cloudFunctionURL = "https://me-west1-leafy-metrics-260112.cloudfunctions.net/yaad-pay-function";
      const requestBody = {
        Order: eventRef.id,
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

      //alert("הנך עומד לעבור לעמוד התשלום. התשלום יתבצע רק לאחר שתאשר את הסכם הצילום ותבחר צלם מקטלוג הצלמים שלנו.  עם זאת, כדי להבטיח את התחייבותך, נבקש כעת להשלים את הרכישה ולהזין את פרטי התשלום.");

      const redirectURL = `https://pay.hyp.co.il/p/?action=pay&${responseText}`;
      console.log("Redirecting to:", redirectURL);

      setRedirectUrl(redirectURL);
      setShowPaymentDialog(true);

      // Redirect the user
      //window.location.href = redirectURL;

      //alert("Event posted successfully!");
    } catch (error) {
      console.error("Error posting event:", error);
      alert("Failed to post event. Please try again.");
    }
  };
  // Add this handler for the dialog confirmation
  const handlePaymentConfirmation = () => {
    setShowPaymentDialog(false); // Close the dialog
    window.location.href = redirectUrl; // Then redirect
  };

  // New confirmation content
  const paymentConfirmationContent = (
    <div className="space-y-4 text-right">
      <p className="font-semibold text-lg">תודה על יצירת האירוע במערכת!</p>

      <p>הנך עומד לעבור לעמוד התשלום. שים לב:</p>

      <ul className="list-disc pr-4 space-y-2">
        <li>התשלום יתבצע רק לאחר שתאשר את הסכם הצילום והמערכת תבחר צלם מקטלוג הצלמים שלנו</li>
        <li>לצורך הבטחת ההתחייבות, נבקש כעת להשלים את הרכישה ולהזין את פרטי התשלום</li>
      </ul>

      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mt-4">
        <p className="font-medium text-yellow-800">חשוב לדעת:</p>
        <p className="text-sm mt-2">
          בהתאם להתחייבות שלנו עבורך, נדאג לצלם שיגיע לתעד את האירוע על הצד הטוב ביותר עם מצלמת DSLR מקצועית.
          המחיר הזול מתאפשר מכיוון שמדובר בצלמים בתחילת דרכם. השירות כולל צילום בלבד ללא עריכה או סינון תמונות.
          יחד נשאף להשיג את התוצאות הטובות ביותר תוך יצירת חיבור מיטבי בין הצלם המתחיל לבינך.
        </p>
      </div>
    </div>
  );

  if (loading || roleLoading) {
    return <div className="min-h-screen flex items-center justify-center">טוען...</div>;
  }

  if (!user || !isValidRole) {
    return null;
  }

  return (
    <DirectionProvider dir="rtl">
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle >אישור מעבר לתשלום</DialogTitle>
            <DialogDescription>
              {paymentConfirmationContent}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={handlePaymentConfirmation}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              מעבר לעמוד התשלום
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowPaymentDialog(false)}
            >
              ביטול
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="bg-gradient-to-br from-purple-100 via-white to-purple-200 p-20 mt-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8"
        >
          <h1 className="text-3xl font-bold text-indigo-800 mb-8">חפש צלם - פרסום אירוע חדש במערכת האתר</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                שם לאירוע, תעזור לנו לזהות אותו בקלות
              </label>
              <Input
                type="text"
                name="name"
                value={eventData.name}
                onChange={handleInputChange}
                placeholder="הכנס שם לאירוע"
                required
                className="w-full"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                כתובת
              </label>
              <Input
                type="text"
                name="address"
                value={eventData.address}
                onChange={handleInputChange}
                placeholder="הכנס את כתובת האירוע"
                required
                className="w-full"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                עיר
              </label>
              <Input
                type="text"
                name="city"
                value={eventData.city}
                onChange={handleInputChange}
                placeholder="הכנס עיר"
                required
                className="w-full"
              />
            </div>

            {/* Contact Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                שם איש קשר
              </label>
              <Input
                type="text"
                name="contactName"
                value={eventData.contactName}
                onChange={handleInputChange}
                placeholder="הכנס שם איש קשר"
                required
                className="w-full"
              />
            </div>

            {/* Date Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                תאריך האירוע
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
                      <span>בחר תאריך</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={eventData.date}
                    onSelect={handleDateSelect}
                    disabled={(date) =>
                      date < new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label className="text-sm font-medium text-gray-700">שעת האירוע</Label>
              <Input
                type="time"
                value={eventData.time}
                onChange={handleTimeChange}
                className="w-full"
                required
                step="900" // 15-minute increments
              />
            </div>
            {/* Region Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                איזור
              </label>
              <Select
                value={eventData.region}
                onValueChange={(value) =>
                  setEventData({ ...eventData, region: value })
                }
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="בחר איזור" />
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
                סוג האירוע
              </label>
              <Select
                value={isCustomType ? "אחר" : eventData.type}
                onValueChange={handleTypeSelect}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="בחר סוג אירוע" />
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
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    נא להזין את סוג האירוע
                  </label>
                  <Input
                    type="text"
                    name="type"
                    value={eventData.type}
                    onChange={handleInputChange}
                    placeholder="הזן סוג אירוע מותאם אישית"
                    className="w-full"
                    required
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                שלח
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </DirectionProvider>
  );
}