'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PencilIcon, PlusIcon, XIcon, TrashIcon, FileIcon, UserPlusIcon, UsersIcon, FileTextIcon, FileCodeIcon, FileVideoIcon, FileAudioIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { motion, AnimatePresence } from 'framer-motion';
import { storage, db } from '@/lib/firebaseConfig';
import { 
  collection, 
  query, 
  where, 
  getDoc,
  getDocs 
} from 'firebase/firestore';

const MIN_PHOTOS_REQUIRED = 100;

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


const ExpandableFolder = ({ 
  folder, 
  onUpload, 
  currentFileProgress, 
  uploadStatus, 
  isExpanded, 
  onToggleExpand,
  onMarkComplete,
  onMarkIncomplete,
  onCancelAssignment
}) => {
  const handleContainerClick = (e) => {
    const interactiveElements = ['BUTTON', 'A', 'INPUT', 'LABEL'];
    if (interactiveElements.includes(e.target.tagName) || e.target.closest(interactiveElements.join(', '))) {
      return;
    }
    
    onToggleExpand(isExpanded ? null : folder.id);
  };

  const handleCancelAssignment = async (e) => {
    e.stopPropagation();
    const confirmation = window.confirm("האם אתה בטוח שברצונך לבטל את הרשמתך כצלם לאירוע זה?");
    if (confirmation) {
      onCancelAssignment(folder.id);
    }
  };

  const renderFolderHeader = () => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4 relative">
      {isExpanded && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -top-6 right-0 p-1 md:p-2 rounded-full bg-gray-100 hover:bg-gray-200 z-10"
          onClick={() => onToggleExpand(null)}
        >
          <XIcon className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
        </motion.button>
      )}
      
      <motion.h2 
        layout="position"
        className="font-bold text-indigo-800 text-lg md:text-xl truncate w-full pr-4"
      >
        <span>{folder.name} - {folder.userDetails.phoneNumber}</span>
      </motion.h2>

      {folder.status === 'accepted' && (
        <Button
          onClick={handleCancelAssignment}
          variant="destructive"
          className="ml-2 text-xs md:text-sm"
          size="sm"
        >
          <TrashIcon className="w-4 h-4 mr-1" />
          בטל הרשמה
        </Button>
      )}
      <div className="w-full md:w-auto flex items-center justify-end gap-2">
        {folder.status === 'uploaded' ? (
          <span className="text-gray-400 text-sm">
            העלאת תמונות מושבתת (האירוע סגור)
          </span>
        ) : (
          <>
            <input
              type="file"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files);
                if (files.length > 0) {
                  onUpload(folder.id, files);
                }
              }}
              className="hidden"
              id={`upload-${folder.id}`}
            />
            <label
              htmlFor={`upload-${folder.id}`}
              className="text-indigo-600 text-sm md:text-base cursor-pointer hover:underline px-2 py-1 bg-indigo-50 rounded-md"
            >
              העלאת תמונות
            </label>
          </>
        )}
      </div>
    </div>
  );

  return (
    <motion.div
      layout
      initial={false}
      animate={{
        gridColumn: isExpanded ? "1 / -1" : "auto",
        transition: { duration: 0.3 }
      }}
      className={`relative border rounded-lg p-4 md:p-6 bg-white shadow-md transition-all cursor-pointer ${
        isExpanded 
          ? 'h-[80vh] overflow-y-auto' 
          : 'h-[180px] md:h-[200px] hover:scale-[1.02] overflow-hidden'
      }`}
      onClick={handleContainerClick}
    >
      {renderFolderHeader()}

        <div className="mb-4">
          {folder.status === 'uploaded' ? (
            <div className="flex flex-col gap-2">
              <div className="text-sm text-green-700 mb-1">
                האירוע הושלם וכל התמונות הועלו.
              </div>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkIncomplete(folder.id);
                }}
                className="w-full md:w-auto text-xs md:text-sm bg-red-100 hover:bg-red-200 text-red-600 p-1 md:p-2 rounded"
              >
                יש לי תמונות נוספות להעלות
              </Button>
            </div>
          ) : (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onMarkComplete(folder.id);
              }}
              className="w-full md:w-auto text-xs md:text-sm bg-green-100 hover:bg-green-200 text-green-600 p-1 md:p-2 rounded"
            >
              סיים העלאת קבצים
            </Button>
          )}
        </div>

        {currentFileProgress[folder.id] > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2 md:h-2.5 mt-2">
            <div
              className="bg-green-500 h-full rounded-full transition-all"
              style={{ width: `${currentFileProgress[folder.id]}%` }}
            ></div>
          </div>
        )}

        {uploadStatus[folder.id]?.total > 0 && (
          <div className="text-xs md:text-sm text-gray-600 mt-2">
            הועלו {uploadStatus[folder.id]?.uploaded} מתוך {uploadStatus[folder.id]?.total} קבצים
          </div>
        )}

<motion.div 
        layout
        className={`mt-4 ${
          isExpanded 
            ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4' 
            : 'flex flex-col space-y-1 md:space-y-2 h-[calc(100%-140px)] overflow-y-auto'
        }`}
      >
        {(folder.files || []).map((file, index) => (
          <AnimatePresence mode="wait" key={index}>
            {isExpanded ? (
              <FileCard file={file} />
            ) : (
              <motion.div 
                className="text-xs md:text-sm text-gray-700 truncate px-1"
                title={file.name}
              >
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline block truncate"
                >
                  {file.name.length > 20 
                    ? file.name.slice(0, 15) + '...' + file.name.slice(file.name.lastIndexOf('.'))
                    : file.name}
                </a>
                {/* File count badge in collapsed state */}
      {!isExpanded && (folder.files || []).length > 0 && (
        <div className="absolute bottom-2 right-2 bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-600">
          {(folder.files || []).length} תמונות
        </div>
      )}
              </motion.div>
              
            )}
          </AnimatePresence>
        ))}
      </motion.div>
    </motion.div>
    
  );
};

export default function Manage() {
  const { user, loading } = useAuth(); // Get user and loading state
  const router = useRouter();

  // Ensure hooks are called consistently
  const [folders, setFolders] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [currentFileProgress, setCurrentFileProgress] = useState({});
  const [uploadStatus, setUploadStatus] = useState({});
  const [expandedFolderId, setExpandedFolderId] = useState(null);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login'); // Redirect to login if not authenticated
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchFolders = async () => {
      if (!user) return;

      try {
        const events = await fetchEventsByPhotographer(user.email);
        console.log('Events:', events);
        setFolders(events);
        
        // Handle the fetched events as needed
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchFolders();
  }, [user]);

  // Render a loading state if still verifying authentication
  if (loading) {
    return <div>טוען...</div>;
  }

  // Render an empty page if unauthenticated (router.push will handle navigation)
  if (!user) {
    return null;
  }

  const handleCancelAssignment = async (eventId) => {
    try {
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        status: 'paid',
        photographerId: null
      });
      
      // Remove the event from local state
      setFolders(prev => prev.filter(folder => folder.id !== eventId));
      
      alert('בוטלה ההרשמה כצלם עבור האירוע');
    } catch (error) {
      console.error('Error canceling assignment:', error);
      alert('שגיאה בביטול ההרשמה');
    }
  };

const handleMultipleFileUpload = async (folderId, files) => {
    try {
      const uploadedFiles = [];

      // Initialize upload status for the folder
      setUploadStatus((prev) => ({
        ...prev,
        [folderId]: { uploaded: 0, total: files.length },
      }));

      // Loop through each file and upload
      for (const file of files) {
        const filePath = `${user.email}/${folderId}/${file.name}`;
        const storageRef = ref(storage, filePath);

        const uploadTask = uploadBytesResumable(storageRef, file);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              // Update current file upload progress
              const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              setCurrentFileProgress((prev) => ({
                ...prev,
                [folderId]: progress,
              }));
            },
            reject,
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              uploadedFiles.push({ name: file.name, url: downloadURL });

              // Update uploaded count
              setUploadStatus((prev) => ({
                ...prev,
                [folderId]: {
                  ...prev[folderId],
                  uploaded: prev[folderId].uploaded + 1,
                },
              }));

              // Reset current file progress for this folder
              setCurrentFileProgress((prev) => ({
                ...prev,
                [folderId]: 0,
              }));

              // Update the folder's files in Firestore
              const folderRef = doc(db, 'events', folderId);
              await updateDoc(folderRef, {
                files: arrayUnion({ name: file.name, url: downloadURL }),
              });

              setFolders((prev) =>
                prev.map((folder) =>
                  folder.id === folderId
                    ? { 
                        ...folder, 
                        files: Array.isArray(folder.files) ? [...folder.files, { name: file.name, url: downloadURL }] : [{ name: file.name, url: downloadURL }] 
                      }
                    : folder
                )
              );

              resolve();
            }
          );
        });
      }

      // Reset upload status
      setUploadStatus((prev) => ({
        ...prev,
        [folderId]: { uploaded: 0, total: 0 },
      }));

    } catch (error) {
      console.error('File upload error:', error);
      alert('Failed to upload files.');
    }
};

const handleMarkComplete = async (folderId) => {
  try {
    const folder = folders.find(f => f.id === folderId);
    
    // Check if event date has passed
    const currentDate = new Date();
    const eventDate = folder.date;
    if (eventDate > currentDate) {
      alert("לא ניתן לסיים אירוע לפני תאריך האירוע");
      return;
    }

    // Check minimum photos requirement
    if (!folder.files || folder.files.length < MIN_PHOTOS_REQUIRED) {
      alert(`יש להעלות לפחות ${MIN_PHOTOS_REQUIRED} תמונות לפני סיום האירוע`);
      return;
    }
    
    const folderRef = doc(db, 'events', folderId);
    await updateDoc(folderRef, { status: 'uploaded' });
    // Optionally update local state so the UI reflects the change:
    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === folderId ? { ...folder, status: 'uploaded' } : folder
      )
    );
    console.log('הסטטוס עודכן ל-"uploaded" בהצלחה!');
  } catch (error) {
    console.error('Error marking folder as complete:', error);
  }
};

const handleMarkIncomplete = async (folderId) => {
  try {
    const folderRef = doc(db, 'events', folderId);
    await updateDoc(folderRef, { status: 'accepted' });
    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === folderId ? { ...folder, status: 'accepted' } : folder
      )
    );
    console.log('סטטוס האירוע עודכן ל-"accepted" בהצלחה!');
  } catch (error) {
    console.error('Error marking folder as incomplete:', error);
  }
};

return (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 p-4 md:p-8">
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center mb-6 md:mb-8"
    >
      <h1 className="text-2xl md:text-4xl font-extrabold text-indigo-800" style={{ marginTop: '5vh' }}>
        ניהול האירועים שלי
      </h1>
      <p className="text-gray-600 mt-2 text-sm md:text-base">
        העלאת התמונות לאחר האירוע, פרטים ליצירת קשר, ושיתוף התמונות
      </p>
    </motion.div>

    <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {folders.map((folder) => (
        <ExpandableFolder
          key={folder.id}
          folder={folder}
          onUpload={handleMultipleFileUpload}
          currentFileProgress={currentFileProgress}
          uploadStatus={uploadStatus}
          isExpanded={expandedFolderId === folder.id}
          onToggleExpand={setExpandedFolderId}
          onMarkComplete={handleMarkComplete}
          onMarkIncomplete={handleMarkIncomplete}
          onCancelAssignment={handleCancelAssignment}
        />
      ))}
    </motion.div>
  </div>
);
}

const fetchEventDetails = async (eventId) => {
  const eventRef = doc(db, "events", eventId);
  const eventSnap = await getDoc(eventRef);
  if (eventSnap.exists()) {
    return eventSnap.data();
  } else {
    throw new Error("Event not found");
  }
};

const fetchUserDetails = async (userId) => {
  const userRef = doc(db, "usersDB", userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return userSnap.data();
  } else {
    throw new Error("User not found");
  }
};

// Update the fetchEventsByPhotographer function
const fetchEventsByPhotographer = async (email) => {
  try {
    const eventsRef = collection(db, 'events');
    const q = query(
      eventsRef, 
      where('photographerId', '==', email),
      where('status', '!=', 'deleted')
    );
    const querySnapshot = await getDocs(q);
    
    const eventsPromises = querySnapshot.docs.map(async (docSnap) => {
      const data = docSnap.data();
      const userDetails = await fetchUserDetails(data.user);
      return { 
        id: docSnap.id, 
        userDetails, 
        ...data,
        // Convert Firestore Timestamp to JS Date if needed
        date: data.date?.toDate() 
      };
    });
    
    return await Promise.all(eventsPromises);
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};
