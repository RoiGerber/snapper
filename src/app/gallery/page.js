'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DownloadIcon, FileIcon, FileTextIcon, FileCodeIcon, FileVideoIcon, FileAudioIcon,XIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth'; // Use your AuthContext
import { useRouter } from 'next/navigation'; // For navigation
import { doc, getDoc } from 'firebase/firestore';
import { ref, getBlob,getDownloadURL } from 'firebase/storage';
import { motion, AnimatePresence } from 'framer-motion';
import { storage, db } from '@/lib/firebaseConfig';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

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

const ExpandableFolder = ({ folder, isExpanded, onToggleExpand }) => {
 
    
    const handleDownloadAll = async () => {
        const zip = new JSZip();
        const folderZip = zip.folder(folder.name);
      
        try {
          // Loop through each file and add it to the zip
          for (const file of folder.files) {
            const fileRef = ref(storage, file.url);
            const blob = await getBlob(fileRef); // Use Firebase SDK to get the file
            folderZip.file(file.name, blob);
          }
      
          // Generate the zip file and trigger download
          const content = await zip.generateAsync({ type: 'blob' });
          saveAs(content, `${folder.name}.zip`);
        } catch (error) {
          console.error('Error downloading files:', error);
          alert('Failed to download files. Please try again.');
        }
      };

  return (
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
      <div className="flex justify-between items-center mb-4">
        <motion.h2 
          layout="position"
          className={`font-bold text-indigo-800 truncate ${
            isExpanded ? 'text-2xl' : 'text-lg'
          }`}
        >
          {folder.name}
        </motion.h2>
        <Button
          onClick={handleDownloadAll}
          className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
        >
          <DownloadIcon className="w-4 h-4" />
          Download All
        </Button>
      </div>

      {/* Files Grid/List */}
      <motion.div 
        layout
        className={`mt-4 ${
          isExpanded 
            ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4' 
            : 'space-y-2 overflow-hidden'
        }`}
      >
        {folder.files.map((file, index) => (
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
  );
};

export default function Gallery() {
  const { user, loading } = useAuth(); // Get user and loading state
  const router = useRouter();

  // Ensure hooks are called consistently
  const [folders, setFolders] = useState([]);
  const [expandedFolderId, setExpandedFolderId] = useState(null);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login'); // Redirect to login if not authenticated
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchFolders = async () => {
      if (!user) return;

      // Fetch user2folders document for the current user (using email as the key)
      const user2foldersRef = doc(db, 'user2folders', user.email);
      const user2foldersSnap = await getDoc(user2foldersRef);

      if (user2foldersSnap.exists()) {
        const folderIds = user2foldersSnap.data().folderIds || [];
        const foldersData = [];

        // Fetch each folder from the folders collection
        for (const folderId of folderIds) {
          const folderRef = doc(db, 'folders', folderId);
          const folderSnap = await getDoc(folderRef);
          if (folderSnap.exists()) {
            foldersData.push({ id: folderId, ...folderSnap.data() });
          }
        }

        setFolders(foldersData);
      } else {
        console.log('No folders found for this user.');
      }
    };

    fetchFolders();
  }, [user]);

  // Render a loading state if still verifying authentication
  if (loading) {
    return <div>Loading...</div>;
  }

  // Render an empty page if unauthenticated (router.push will handle navigation)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-extrabold text-indigo-800" style={{ marginTop: '10vh' }}>
          Gallery
        </h1>
        <p className="text-gray-600 mt-2">View and download your files effortlessly.</p>
      </motion.div>

      {/* Folder Grid */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {folders.map((folder) => (
          <ExpandableFolder
            key={folder.id}
            folder={folder}
            isExpanded={expandedFolderId === folder.id}
            onToggleExpand={setExpandedFolderId}
          />
        ))}
      </motion.div>
    </div>
  );
}