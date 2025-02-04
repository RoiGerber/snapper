'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PencilIcon, PlusIcon, XIcon, TrashIcon, FileIcon, UserPlusIcon, UsersIcon, FileTextIcon, FileCodeIcon, FileVideoIcon, FileAudioIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth'; // Use your AuthContext
import { useRouter } from 'next/navigation'; // For navigation
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { ref, uploadBytes, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { motion, AnimatePresence } from 'framer-motion';
import { storage, db } from '@/lib/firebaseConfig';

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
  onMarkIncomplete
}) => {
  console.log('Folder:', folder);
  const renderFolderHeader = () => (
    <div className="flex justify-between items-center mb-4">
      <motion.h2 
        layout="position"
        className={`font-bold text-indigo-800 truncate ${isExpanded ? 'text-2xl' : 'text-lg'}`}
      >
        <span>{folder.name} - {folder.userDetails.phoneNumber}</span>
      </motion.h2>
      <div className="flex items-center gap-4">
        <div>
          {folder.status === 'uploaded' ? (
            <span className="text-gray-400">
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
                className="text-indigo-600 cursor-pointer hover:underline"
              >
                העלאת תמונות
              </label>
            </>
          )}
        </div>
      </div>
    </div>
  );
  
  return (
    <>
      <motion.div
        layout
        initial={false}
        animate={{
          gridColumn: isExpanded ? "1 / -1" : "auto",
          transition: { duration: 0.3 }
        }}
        className={`relative border rounded-lg p-6 bg-white shadow-md transition-all ${
          isExpanded ? 'h-[70vh] overflow-y-auto' : 'h-[200px] hover:scale-105'
        }`}
      >
        {/* Close button when expanded */}
        {isExpanded && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200"
            onClick={() => onToggleExpand(null)}
          >
            <XIcon className="w-5 h-5 text-gray-600" />
          </motion.button>
        )}

        {/* Folder Header */}
        {renderFolderHeader()}

        {(
        <div className="mb-4">
          {folder.status === 'uploaded' ? (
            <>
              <div className="text-sm text-green-700 mb-2">
                האירוע הושלם וכל התמונות הועלו.
              </div>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkIncomplete(folder.id);
                }}
                className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded"
              >
                אני מתחרט, יש לי תמונות נוספות להעלות
              </Button>
            </>
          ) : (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onMarkComplete(folder.id);
              }}
              className="bg-green-100 hover:bg-green-200 text-green-600 p-2 rounded"
            >
              סיים העלאת קבצים
            </Button>
          )}
        </div>
      )}


        {/* Progress Indicators */}
        {currentFileProgress[folder.id] > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div
              className="bg-green-500 h-2.5 rounded-full transition-all"
              style={{ width: `${currentFileProgress[folder.id]}%` }}
            ></div>
          </div>
        )}

        {uploadStatus[folder.id]?.total > 0 && (
          <div className="text-sm text-gray-600 mt-2">
            Uploaded {uploadStatus[folder.id]?.uploaded} of {uploadStatus[folder.id]?.total} files
          </div>
        )}

        {/* Files Grid/List */}
        <motion.div 
          layout
          className={`mt-4 ${
            isExpanded 
              ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4' 
              : 'space-y-2 overflow-hidden'
          }`}
        >
          {(folder.files || []).map((file, index) => (
            <AnimatePresence mode="wait" key={index}>
              {isExpanded ? (
                <FileCard file={file} />
              ) : (
                <motion.div className="text-sm text-gray-700 truncate">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline"
                  >
                    {file.name.length > 15 
                      ? file.name.slice(0, 12) + '...' + file.name.slice(file.name.lastIndexOf('.'))
                      : file.name}
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          ))}
        </motion.div>

        {/* Clickable overlay when not expanded */}
        {!isExpanded && (
          <div
            className="absolute inset-0 cursor-pointer"
            onClick={() => onToggleExpand(folder.id)}
          />
        )}
      </motion.div>
    </>
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
    await updateDoc(folderRef, { status: 'pending' }); // or remove/adjust the status as needed
    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === folderId ? { ...folder, status: 'pending' } : folder
      )
    );
    console.log('סטטוס האירוע עודכן ל-"pending" בהצלחה!');
  } catch (error) {
    console.error('Error marking folder as incomplete:', error);
  }
};


return (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 p-8">
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center mb-8"
    >
      <h1 className="text-4xl font-extrabold text-indigo-800" style={{ marginTop: '10vh' }}>
        ניהול האירועים שלי
      </h1>
      <p className="text-gray-600 mt-2">העלאת התמונות לאחר האירוע, פרטים ליצירת קשר, ושיתוף התמונות</p>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex justify-center mb-6"
    >
    </motion.div>

    {/* Folder Grid */}
    <motion.div layout className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

const fetchEventsByPhotographer = async (email) => {
  const eventsRef = collection(db, 'events');
  const q = query(eventsRef, where('photographerId', '==', email));
  const querySnapshot = await getDocs(q);
  
  // Build an array of promises
  const eventsPromises = querySnapshot.docs.map(async (docSnap) => {
    const data = docSnap.data();
    console.log('doc:', data);
    const userDetails = await fetchUserDetails(data.user);
    console.log('userDetails:', userDetails);
    return { id: docSnap.id, userDetails, ...data };
  });
  
  // Wait for all promises to resolve
  const events = await Promise.all(eventsPromises);
  return events;
};
