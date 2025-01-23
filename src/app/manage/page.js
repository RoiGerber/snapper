'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PencilIcon,PlusIcon,XIcon, ShareIcon ,TrashIcon,FileIcon, UserPlusIcon,UsersIcon,
  FileTextIcon, 
  FileCodeIcon, 
  FileVideoIcon, 
  FileAudioIcon,} from 'lucide-react';

import { useAuth } from '@/lib/auth'; // Use your AuthContext
import { useRouter } from 'next/navigation'; // For navigation
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { ref, uploadBytes,uploadBytesResumable, getDownloadURL } from 'firebase/storage';
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

const ShareModal = ({ isOpen, onClose, folder, onUpdateSharing }) => {
  const [newUsername, setNewUsername] = useState('');
  const [sharedUsers, setSharedUsers] = useState(folder.sharedWith || []);
  const [error, setError] = useState('');

  const handleAddUser = async () => {
    if (!newUsername.trim()) {
      setError('Please enter a username');
      return;
    }

    // Here you would typically validate if the user exists in your system
    try {
      // Add validation logic here
      const updatedUsers = [...sharedUsers, newUsername];
      setSharedUsers(updatedUsers);
      setNewUsername('');
      setError('');
      onUpdateSharing(folder.id, updatedUsers);
    } catch (error) {
      setError('Failed to add user');
    }
  };

  const handleRemoveUser = (username) => {
    const updatedUsers = sharedUsers.filter(user => user !== username);
    setSharedUsers(updatedUsers);
    onUpdateSharing(folder.id, updatedUsers);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Share "{folder.name}"</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Add User Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Enter username"
              className="flex-1"
            />
            <Button
              onClick={handleAddUser}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <UserPlusIcon className="w-4 h-4" />
            </Button>
          </div>
          
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {/* Shared Users List */}
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Shared with:</h3>
            <div className="space-y-2">
              {sharedUsers.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No users added yet</p>
              ) : (
                sharedUsers.map((username, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center justify-between bg-gray-50 p-2 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <UsersIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{username}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveUser(username)}
                      className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <TrashIcon className="w-4 h-4 text-red-500" />
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            Done
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

const ExpandableFolder = ({ folder, onUpload, currentFileProgress, uploadStatus, isExpanded, onToggleExpand,onUpdateSharing }) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const renderFolderHeader = () => (
    <div className="flex justify-between items-center mb-4">
      <motion.h2 
        layout="position"
        className={`font-bold text-indigo-800 truncate ${
          isExpanded ? 'text-2xl' : 'text-lg'
        }`}
      >
        {folder.name}
      </motion.h2>
      <div className="flex items-center gap-4">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            setIsShareModalOpen(true);
          }}
          className="bg-indigo-100 hover:bg-indigo-200 text-indigo-600 p-2 rounded-full"
        >
          <ShareIcon className="w-4 h-4" />
        </Button>
        <div>
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
            Upload Files
          </label>
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

<AnimatePresence>
{isShareModalOpen && (
  <ShareModal
    isOpen={isShareModalOpen}
    onClose={() => setIsShareModalOpen(false)}
    folder={folder}
    onUpdateSharing={onUpdateSharing}
  />
)}
</AnimatePresence>
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



  // Redirect unauthenticated users
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login'); // Redirect to login if not authenticated
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchFolders = async () => {
      if (!user) return;
  
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
  
      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        setFolders(data.folders || []);
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

  const handleUpdateSharing = async (folderId, sharedUsers) => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const updatedFolders = folders.map(folder =>
        folder.id === folderId
          ? { ...folder, sharedWith: sharedUsers }
          : folder
      );

      await updateDoc(userDocRef, { folders: updatedFolders });
      setFolders(updatedFolders);
    } catch (error) {
      console.error('Error updating sharing:', error);
    }
  };
  

const handleMultipleFileUpload = async (folderId, files) => {
  try {
    const userDocRef = doc(db, 'users', user.uid);
    const uploadedFiles = [];

    // Initialize upload status for the folder
    setUploadStatus((prev) => ({
      ...prev,
      [folderId]: { uploaded: 0, total: files.length },
    }));

    // Loop through each file and upload
    for (const file of files) {
      const filePath = `${user.uid}/${folderId}/${file.name}`;
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
            resolve();
          }
        );
      });
    }

    // Update Firestore with the new files
    const updatedFolders = folders.map((folder) =>
      folder.id === folderId
        ? {
            ...folder,
            files: [...folder.files, ...uploadedFiles],
          }
        : folder
    );

    await updateDoc(userDocRef, { folders: updatedFolders });

    // Update the local state and reset upload status
    setFolders(updatedFolders);
    setUploadStatus((prev) => ({
      ...prev,
      [folderId]: { uploaded: 0, total: 0 },
    }));

  } catch (error) {
    console.error('File upload error:', error);
    alert('Failed to upload files.');
  }
};

  

  const handleFileUpload = async (folderId, file) => {
    try {
      const userDocRef = doc(db, 'users', user.uid); // Reference to the user's document
  
      // Create a unique path in Firebase Storage for the file
      const filePath = `${user.uid}/${folderId}/${file.name}`;
      const storageRef = ref(storage, filePath);
  
      // Upload the file to Firebase Storage
      const uploadResult = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(uploadResult.ref); // Get the file's public URL
  
      // Update local folders state with the new file
      const updatedFolders = folders.map((folder) =>
        folder.id === folderId
          ? {
              ...folder,
              files: [...folder.files, { name: file.name, url: downloadURL }],
            }
          : folder
      );
  
      // Update the local state immediately to reflect changes in the UI
      setFolders(updatedFolders);
  
      // Save the updated folders array to Firestore
      await updateDoc(userDocRef, { folders: updatedFolders });
  

    } catch (error) {
      console.error('File upload error:', error);
      alert('Failed to upload file.');
    }
  };
  
const handleCreateFolder = async () => {
  const newFolder = {
    id: folders.length + 1,
    name: `Untitled Folder`,
    files: [],
  };

  try {
    const userDocRef = doc(db, 'users', user.uid); // Reference to the user's document

    // Check if the document exists
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      // Document exists: Update the folders array
      await updateDoc(userDocRef, {
        folders: arrayUnion(newFolder),
      });
    } else {
      // Document does not exist: Create it with the initial folder
      await setDoc(userDocRef, { folders: [newFolder] });
    }

    // Update local state
    setFolders((prev) => [...prev, newFolder]);
  } catch (error) {
    console.error('Firestore Write Error:', error);
  }
};

  const handleRenameFolder = async (folderId) => {
    if (!newFolderName.trim()) return;
  
    const updatedFolders = folders.map((folder) =>
      folder.id === folderId ? { ...folder, name: newFolderName } : folder
    );
  
    setFolders(updatedFolders);
  
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, { folders: updatedFolders });
  
    setEditingFolderId(null);
    setNewFolderName('');
  };
  
  const handleRemoveFolder = async (folderId) => {
    const updatedFolders = folders.filter((folder) => folder.id !== folderId);
  
    setFolders(updatedFolders);
  
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, { folders: updatedFolders });
  };

  const handleDrop = (event, folderId) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === folderId
          ? { ...folder, files: [...folder.files, ...files] }
          : folder
      )
    );
    setDragging(false);
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
          Manage Your Folders
        </h1>
        <p className="text-gray-600 mt-2">Organize your files effortlessly with modern tools.</p>
      </motion.div>

      {/* Create Folder Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex justify-center mb-6"
      >
        <Button
          onClick={handleCreateFolder}
          className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 px-6 py-3 rounded-lg shadow-md"
        >
          <PlusIcon className="w-5 h-5" />
          Create Folder
        </Button>
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
          onUpdateSharing={handleUpdateSharing}
        />
      ))}
    </motion.div>
    </div>
  );
}
  