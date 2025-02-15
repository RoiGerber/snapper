"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  XIcon,
  FileVideoIcon,
  FileAudioIcon,
  FileCodeIcon,
  FileTextIcon,
  FileIcon
} from "lucide-react";
import useUserRole from '@/hooks/useUserRole';
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { ref, getBlob } from 'firebase/storage';
import { motion, AnimatePresence } from 'framer-motion';
import { storage, db } from '@/lib/firebaseConfig';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

const getFileType = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();

  // Image types
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  if (imageTypes.includes(extension)) return 'image';

  // Document types
  const documentTypes = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
  if (documentTypes.includes(extension)) return 'document';

  // Code types
  const codeTypes = ['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'py', 'java'];
  if (codeTypes.includes(extension)) return 'code';

  // Video types
  const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'webm'];
  if (videoTypes.includes(extension)) return 'video';

  // Audio types
  const audioTypes = ['mp3', 'wav', 'ogg', 'm4a'];
  if (audioTypes.includes(extension)) return 'audio';

  return 'other';
};

const FileCard = ({ file }) => {
  const fileType = getFileType(file.name);
  const truncatedName = file.name.length > 15
    ? file.name.slice(0, 12) + '...' + file.name.slice(file.name.lastIndexOf('.'))
    : file.name;

  const getFileIcon = () => {
    switch (fileType) {
      case 'document':
        return <FileTextIcon className="w-8 h-8 text-blue-500" />;
      case 'code':
        return <FileCodeIcon className="w-8 h-8 text-green-500" />;
      case 'video':
        return <FileVideoIcon className="w-8 h-8 text-purple-500" />;
      case 'audio':
        return <FileAudioIcon className="w-8 h-8 text-pink-500" />;
      case 'other':
        return <FileIcon className="w-8 h-8 text-gray-500" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      layout
      className="p-4 border rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center"
    >
      <a
        href={file.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative w-full aspect-square mb-2 flex items-center justify-center"
      >
        {fileType === 'image' ? (
          <div className="relative w-full h-full">
            <img
              src={file.url}
              alt={file.name}
              className="w-full h-full object-cover rounded-md"
            />
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity rounded-md" />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-md group-hover:bg-gray-100 transition-colors">
            {getFileIcon()}
          </div>
        )}
      </a>
      <span className="text-sm text-gray-700 text-center">
        {truncatedName}
      </span>
    </motion.div>
  );
};

const ExpandableEvent = ({
  event,
  isExpanded,
  onToggleExpand
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [photographer, setPhotographer] = useState(null);
  const [loadingPhotographer, setLoadingPhotographer] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("");

  const eventDate = event.date?.toDate();
  const isEventPast = eventDate ? eventDate < new Date() : false;

  const handleEnterPayment = async () => {
    try {
      const cloudFunctionURL = "https://me-west1-leafy-metrics-260112.cloudfunctions.net/yaad-pay-function";
      const requestBody = {
        Order: event.id,
        ClientName: event.contactName || "",
        email: event.user || user.email,
      };

      const response = await fetch(cloudFunctionURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error('Failed to get payment URL');

      const responseText = await response.text();
      const redirectURL = `https://pay.hyp.co.il/p/?action=pay&${responseText}`;
      setRedirectUrl(redirectURL);
      setShowPaymentDialog(true);
    } catch (error) {
      console.error('Error:', error);
      alert('Payment processing error. Please try again.');
    }
  };

  useEffect(() => {
    const fetchPhotographer = async () => {
      if (event.status === 'accepted' && event.photographerId) {
        setLoadingPhotographer(true);
        try {
          const photographerDoc = await getDoc(doc(db, 'usersDB', event.photographerId));
          if (photographerDoc.exists()) {
            setPhotographer(photographerDoc.data());
          }
        } catch (error) {
          console.error('Error fetching photographer:', error);
        } finally {
          setLoadingPhotographer(false);
        }
      }
    };

    fetchPhotographer();
  }, [event.photographerId, event.status]);

  const handleDownloadAll = async () => {
    const zip = new JSZip();
    const folderZip = zip.folder(event.name);

    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      const totalFiles = event.files.length;
      let processedFiles = 0;

      // Loop through each file in the event and add it to the zip
      for (const file of event.files) {
        const fileRef = ref(storage, file.url);
        const blob = await getBlob(fileRef);

        folderZip.file(file.name, blob);
        processedFiles += 1;

        // Update progress
        setDownloadProgress((processedFiles / totalFiles) * 100);
      }

      // Generate the zip file and trigger the download
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${event.name}.zip`);
    } catch (error) {
      console.error("Error downloading files:", error);
      alert("Failed to download files. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };



  return (
    <motion.div
      layout
      initial={false}
      animate={{
        transition: { duration: 0.3 }
      }}
      className={`relative border rounded-lg p-4 md:p-6 bg-white shadow-md transition-all ${isExpanded ? "h-[80vh] md:h-[70vh] overflow-y-auto" : "h-auto"
        }`}
    >
      {/* Event Header */}
      <div className="mb-4">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-800 truncate">{event.name}</h2>
        <div className="flex flex-col md:grid md:grid-cols-2 gap-2 md:gap-4 text-gray-600 mt-2">
          <div className="flex items-center truncate">
            <CalendarIcon className="h-5 w-5 mr-2 text-indigo-600 flex-shrink-0" />
            <span className="break-words">
              {new Date(event.date?.toDate()).toLocaleDateString('he-IL', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
          <div className="flex items-center truncate">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-indigo-600 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="truncate">{event.city}, {event.region}</span>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div>
        {/* Status Section */}
        <div className="mb-4">
          {event.status === "uploaded" ? (
            <div className="text-sm text-green-700 bg-green-50 p-3 rounded-lg">
              האירוע הושלם, כל התמונות הועלו על ידי הצלם.
            </div>
          ) : event.status === "accepted" ? (
            isEventPast ? (
              <div className="text-sm text-yellow-700 bg-yellow-50 p-3 rounded-lg">
                האירוע הסתיים. ממתין להעלאת תמונות מהצלם.
              </div>
            ) : (
              <div className="text-sm text-blue-700 bg-blue-50 p-3 rounded-lg">
                {loadingPhotographer ? (
                  <span>טוען פרטי צלם...</span>
                ) : photographer ? (
                  <>
                    המערכת אישרה צלם לאירוע שלך!🎉
                    <br />
                    {photographer.phoneNumber && ` ניתן ליצור קשר בטלפון ${photographer.phoneNumber}.`}
                    {photographer.email && ` או במייל ${photographer.email}.`}
                  </>
                ) : (
                  <span>צלם נמצא! פרטים נוספים יועברו בהמשך.</span>
                )}
              </div>
            )
          ) : event.status === "paid" ? (
            <div className="text-sm text-purple-700 bg-purple-50 p-3 rounded-lg">
              🕒 האירוע אושר! המערכת מחפשת עבורך צלם מתאים.
            </div>
          ) : event.status === "submitted" ? (
            <div className="text-sm text-orange-700 bg-orange-50 p-3 rounded-lg">
              ממתין לפרטי תשלום. נא להזין פרטי אשראי.
              <br />
              <Button
                onClick={handleEnterPayment}
                className="mt-2 bg-orange-600 hover:bg-orange-700 text-white"
              >
                הזן פרטי תשלום
              </Button>
            </div>
          ) :
            null}
        </div>


        {/* File Grid */}
        {event.files && event.files.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4"
          >
            {event.files.map((file, index) => (
              <FileCard key={index} file={file} />
            ))}
          </motion.div>
        ) : (<span />)}
      </div>

      {/* Download Section */}
      {event.files && event.files.length > 0 && (
        <div className="mt-4">
          {isDownloading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-t-2 border-indigo-600 rounded-full animate-spin" />
              <span className="text-sm">הורדה: {Math.round(downloadProgress)}%</span>
            </div>
          ) : (
            <Button
              onClick={handleDownloadAll}
              className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white"
              size="sm"
            >
              הורד הכל
            </Button>
          )}
        </div>
      )}

      {/* Expand/Collapse Controls */}
      {!isExpanded && (
        <div
          className="absolute inset-0 cursor-pointer"
          onClick={() => onToggleExpand(event.id)}
        />
      )}
      {isExpanded && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-2 right-2 p-1 md:p-2 rounded-full bg-gray-100 hover:bg-gray-200"
          onClick={() => onToggleExpand(null)}
        >
          <XIcon className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
        </motion.button>
      )}

      {showPaymentDialog && (
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>פרטי תשלום</DialogTitle>
              <DialogDescription>
                <div className="space-y-4 text-right">
                  <p className="font-semibold text-lg">תודה על יצירת האירוע במערכת</p>
                  <ul className="list-disc pr-4 space-y-2">
                    <li>התשלום יתבצע רק לאחר שתאשר את הסכם הצילום והמערכת תבחר צלם מקטלוג הצלמים שלנו</li>
                    <li>לצורך הבטחת ההתחייבות, נבקש כעת להשלים את ההזמנה ולהזין את פרטי התשלום</li>
                  </ul>
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => window.location.href = redirectUrl}>
                מעבד לעמוד התשלום
              </Button>
              <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                ביטול
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </motion.div>
  );
};

export default function MyEvents() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { role, isLoading: roleLoading } = useUserRole();
  const [isValidRole, setIsValidRole] = useState(false);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [expandedEventId, setExpandedEventId] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }

    if (!roleLoading && role) {
      if (['photographer', 'client', 'admin'].includes(role)) {
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
        // Example: for photographers, query by photographerId.
        // (You can adjust this if you need to support clients as well.)
        let eventsQuery;
        console.log("role", role);
        if (role === 'admin') {
          eventsQuery = query(collection(db, "events")); // Admin sees all events
        } else {
          eventsQuery = query(
            collection(db, "events"),
            where("user", "==", user.email)
          );
        }
        console.log("eventsQuery", eventsQuery);
        const querySnapshot = await getDocs(eventsQuery);
        const eventsData = querySnapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data
          };
        });
        setEvents(eventsData);
      } catch (error) {
        console.error("Error fetching events:", error);
        //alert("Failed to load events");
      } finally {
        setLoadingEvents(false);
      }
    };

    if (user && isValidRole) {
      fetchEvents();
    }
  }, [user, isValidRole]);

  if (loading || roleLoading || loadingEvents) {
    return <div className="min-h-screen flex items-center justify-center">טוען...</div>;
  }

  if (!user || !isValidRole) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-purple-100 via-white to-purple-200 p-4 md:p-20 mt-16 md:mt-20 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto w-full bg-white rounded-xl shadow-lg p-4 md:p-8"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-indigo-800 mb-6">האירועים שלי</h1>

        {events.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">לא נמצאו אירועים</p>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-8">
            {events.map((event) => (
              <ExpandableEvent
                key={event.id}
                event={event}
                isExpanded={expandedEventId === event.id}
                onToggleExpand={setExpandedEventId}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
