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
  updateDoc,
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
  FileIcon,
  ArrowLeft,
  ArrowRight
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
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const documentTypes = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
  const codeTypes = ['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'py', 'java'];
  const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'webm'];
  const audioTypes = ['mp3', 'wav', 'ogg', 'm4a'];

  if (imageTypes.includes(extension)) return 'image';
  if (documentTypes.includes(extension)) return 'document';
  if (codeTypes.includes(extension)) return 'code';
  if (videoTypes.includes(extension)) return 'video';
  if (audioTypes.includes(extension)) return 'audio';
  return 'other';
};

const FileCard = ({ file, onClick }) => {
  const fileType = getFileType(file.name);
  const truncatedName = file.name.length > 15
    ? file.name.slice(0, 12) + '...' + file.name.slice(file.name.lastIndexOf('.'))
    : file.name;

  const getFileIcon = () => {
    switch (fileType) {
      case 'document': return <FileTextIcon className="w-8 h-8 text-blue-500" />;
      case 'code': return <FileCodeIcon className="w-8 h-8 text-green-500" />;
      case 'video': return <FileVideoIcon className="w-8 h-8 text-purple-500" />;
      case 'audio': return <FileAudioIcon className="w-8 h-8 text-pink-500" />;
      default: return <FileIcon className="w-8 h-8 text-gray-500" />;
    }
  };

  return (
    <motion.div
      layout
      className="p-4 border rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center cursor-pointer"
      onClick={onClick}
    >
      <div className="group relative w-full aspect-square mb-2 flex items-center justify-center">
        {fileType === 'image' ? (
          <div className="relative w-full h-full">
            <img
              src={file.url}
              alt={file.name}
              className="w-full h-full object-cover rounded-md"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity rounded-md" />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-md group-hover:bg-gray-100 transition-colors">
            {getFileIcon()}
          </div>
        )}
      </div>
      <span className="text-sm text-gray-700 text-center">
        {truncatedName}
      </span>
    </motion.div>
  );
};

const ExpandableEvent = ({ event, isExpanded, onToggleExpand, onDelete }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [photographer, setPhotographer] = useState(null);
  const [loadingPhotographer, setLoadingPhotographer] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(-1);

  const ITEMS_PER_PAGE = 20;
  const COLLAPSED_ITEMS = 10;
  const eventDate = event.date?.toDate();
  const isEventPast = eventDate ? eventDate < new Date() : false;

  const visibleFiles = isExpanded 
    ? event.files.slice(0, currentPage * ITEMS_PER_PAGE)
    : event.files.slice(0, COLLAPSED_ITEMS);

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
  };

  const handleLoadMore = () => setCurrentPage(prev => prev + 1);
  
  const handleShowLess = () => {
    setCurrentPage(1);
    onToggleExpand(null);
  };

  const navigateImage = (direction) => {
    setSelectedImageIndex(prev => {
      if (direction === 'prev') return Math.max(0, prev - 1);
      return Math.min(event.files.length - 1, prev + 1);
    });
  };

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

  const handleDelete = async () => {
    const confirmDelete = confirm("האם אתה בטוח שברצונך למחוק את האירוע?");
    if (!confirmDelete) return;

    try {
      await updateDoc(doc(db, 'events', event.id), {
        status: 'deleted'
      });
      onDelete(event.id);
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('מחיקת האירוע נכשלה. אנא נסה שוב.');
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
  try {
    setIsDownloading(true);
    setDownloadProgress(0);

    const zip = new JSZip();
    const folderZip = zip.folder(event.name);
    let totalSize = 0;
    let processedSize = 0;
    let failedFiles = [];

    // First pass: Calculate total size and validate files
    for (const file of event.files) {
      try {
        const fileRef = ref(storage, file.url);
        const metadata = await getMetadata(fileRef);
        totalSize += metadata.size;
      } catch (error) {
        console.error(`Error validating file ${file.name}:`, error);
        failedFiles.push(file.name);
      }
    }

    if (failedFiles.length > 0) {
      alert(`Could not prepare ${failedFiles.length} files for download`);
      return;
    }

    // Second pass: Actually download files
    for (const [index, file] of event.files.entries()) {
      try {
        const fileRef = ref(storage, file.url);
        const blob = await getBlob(fileRef);
        
        folderZip.file(file.name, blob);
        processedSize += blob.size;
        
        const calculatedProgress = Math.round(
          (processedSize / totalSize) * 100
        );
        setDownloadProgress(Math.min(calculatedProgress, 99)); // Keep at 99% until final generation
      } catch (error) {
        console.error(`Error downloading file ${file.name}:`, error);
        failedFiles.push(file.name);
      }
    }

    if (failedFiles.length > 0) {
      alert(`Failed to download ${failedFiles.length} files: ${failedFiles.join(', ')}`);
      return;
    }

    // Generate ZIP
    const content = await zip.generateAsync(
      { type: "blob" },
      metadata => {
        const genProgress = Math.round(metadata.percent);
        setDownloadProgress(99 + genProgress * 0.01); // Distribute final 1% for generation
      }
    );

    // Check blob validity
    if (!content || content.size === 0) {
      throw new Error('Generated ZIP file is empty');
    }

    // Final save
    saveAs(content, `${event.name}.zip`);
    setDownloadProgress(100);
    setTimeout(() => setDownloadProgress(0), 2000); // Reset after success

  } catch (error) {
    console.error("Download failed:", error);
    alert(`Download failed: ${error.message}`);
  } finally {
    setIsDownloading(false);
  }
};
  
  return (
    <motion.div
      layout
      initial={false}
      animate={{ transition: { duration: 0.3 } }}
      className={`relative border rounded-lg p-4 md:p-6 bg-white shadow-md transition-all ${
        isExpanded ? "h-[80vh] md:h-[70vh] overflow-y-auto" : "h-auto"
      }`}
    >
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

      {event.files?.length > 0 && (
        <div className="sticky top-0 bg-white z-50 p-2">
          {isDownloading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-t-2 border-indigo-600 rounded-full animate-spin" />
              <span className="text-sm">הורדה: {Math.round(downloadProgress)}%</span>
            </div>
          ) : (
            <Button
              onClick={(e) => { e.stopPropagation(); handleDownloadAll(); }}
              className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white"
              size="sm"
            >
              הורד הכל
            </Button>
          )}
        </div>
      )}

      <div>
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
          ) : null}
        </div>

        {event.files?.length > 0 && (
          <>
            <motion.div
              layout
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4"
            >
              {visibleFiles.map((file, index) => (
                <FileCard
                  key={index}
                  file={file}
                  onClick={() => handleImageClick(isExpanded ? index : index + COLLAPSED_ITEMS)}
                />
              ))}
            </motion.div>

            {!isExpanded && event.files.length > COLLAPSED_ITEMS && (
              <Button
                onClick={() => onToggleExpand(event.id)}
                className="mt-4 w-full"
                variant="outline"
              >
                הצג עוד ({event.files.length - COLLAPSED_ITEMS} תמונות)
              </Button>
            )}

            {isExpanded && (
              <div className="mt-4 flex gap-2 justify-center">
                {event.files.length > visibleFiles.length && (
                  <Button onClick={handleLoadMore} variant="outline">
                    טען עוד ({event.files.length - visibleFiles.length} נותרו)
                  </Button>
                )}
                <Button onClick={handleShowLess} variant="ghost">
                  הצג פחות
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {selectedImageIndex >= 0 && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <button
            className="absolute top-4 right-4 text-white p-2"
            onClick={() => setSelectedImageIndex(-1)}
          >
            <XIcon className="w-8 h-8" />
          </button>

          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img
              src={event.files[selectedImageIndex]?.url}
              className="object-contain max-h-[80vh]"
              alt={`Event content ${selectedImageIndex + 1}`}
            />

            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 p-4 text-white hover:bg-white/10 rounded-full disabled:opacity-50"
              onClick={() => navigateImage('prev')}
              disabled={selectedImageIndex === 0}
            >
              <ArrowLeft className="w-8 h-8" />
            </button>

            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 p-4 text-white hover:bg-white/10 rounded-full disabled:opacity-50"
              onClick={() => navigateImage('next')}
              disabled={selectedImageIndex === event.files.length - 1}
            >
              <ArrowRight className="w-8 h-8" />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-full">
              {selectedImageIndex + 1} / {event.files.length}
            </div>
          </div>
        </div>
      )}

      {!isEventPast && (
        <div className="mt-4 flex gap-2">
          <Button
            onClick={handleDelete}
            variant="destructive"
            size="sm"
            className="w-full md:w-auto"
          >
            ביטול אירוע
          </Button>
        </div>
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

  const handleEventDeleted = (eventId) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
  };

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
        let eventsQuery;
        if (role === 'admin') {
          eventsQuery = query(collection(db, "events"));
        } else {
          eventsQuery = query(
            collection(db, "events"),
            where("user", "==", user.email),
            where("status", "!=", "deleted")
          );
        }
        const querySnapshot = await getDocs(eventsQuery);
        const eventsData = querySnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        }));
        setEvents(eventsData);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoadingEvents(false);
      }
    };

    if (user && isValidRole) {
      fetchEvents();
    }
  }, [user, isValidRole, role]);

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
                onDelete={handleEventDeleted}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
