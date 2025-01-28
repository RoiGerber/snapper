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

const TagListModal = ({ isOpen, onClose, folder, onUpdateSharing }) => {
  const [newEmail, setNewEmail] = useState('');
  const [taggedUsers, setTaggedUsers] = useState(folder.taggedUsers || []);
  const [error, setError] = useState('');

  const handleAddUser = async () => {
    if (!newEmail.trim()) {
      setError('Please enter an email address');
      return;
    }

    try {
      // Add the email to the taggedUsers list
      const updatedUsers = [...taggedUsers, newEmail];
      setTaggedUsers(updatedUsers);
      setNewEmail('');
      setError('');

      // Update the folder's taggedUsers in Firestore
      const folderRef = doc(db, 'folders', folder.id);
      await updateDoc(folderRef, { taggedUsers: updatedUsers });

      // Update the user2folders collection for the tagged user
      const user2foldersRef = doc(db, 'user2folders', newEmail);
      const user2foldersSnap = await getDoc(user2foldersRef);

      if (user2foldersSnap.exists()) {
        await updateDoc(user2foldersRef, {
          folderIds: arrayUnion(folder.id),
        });
      } else {
        await setDoc(user2foldersRef, {
          folderIds: [folder.id],
        });
      }

      // Notify the parent component
      onUpdateSharing(folder.id, updatedUsers);
    } catch (error) {
      setError('Failed to add user');
    }
  };

  const handleRemoveUser = async (email) => {
    const updatedUsers = taggedUsers.filter(user => user !== email);
    setTaggedUsers(updatedUsers);

    // Update the folder's taggedUsers in Firestore
    const folderRef = doc(db, 'folders', folder.id);
    await updateDoc(folderRef, { taggedUsers: updatedUsers });

    // Remove the folder from the user2folders collection for the removed user
    const user2foldersRef = doc(db, 'user2folders', email);
    await updateDoc(user2foldersRef, {
      folderIds: arrayRemove(folder.id),
    });

    // Notify the parent component
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
          <h2 className="text-xl font-bold text-gray-800">Tag List for "{folder.name}"</h2>
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
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter email address"
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

          {/* Tagged Users List */}
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Tagged Users:</h3>
            <div className="space-y-2">
              {taggedUsers.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No users tagged yet</p>
              ) : (
                taggedUsers.map((email, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center justify-between bg-gray-50 p-2 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <UsersIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{email}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveUser(email)}
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

const ExpandableFolder = ({ folder, onUpload, currentFileProgress, uploadStatus, isExpanded, onToggleExpand, onUpdateSharing }) => {
  const [isTagListModalOpen, setIsTagListModalOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newFolderName, setNewFolderName] = useState(folder.name);

  const renderFolderHeader = () => (
    <div className="flex justify-between items-center mb-4">
      <motion.h2 
        layout="position"
        className={`font-bold text-indigo-800 truncate ${
          isExpanded ? 'text-2xl' : 'text-lg'
        }`}
      >
        {isRenaming ? (
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onBlur={() => {
              setIsRenaming(false);
              onUpdateSharing(folder.id, { name: newFolderName });
            }}
            className="border rounded px-2 py-1"
            autoFocus
          />
        ) : (
          <span onClick={() => setIsRenaming(true)}>{folder.name}</span>
        )}
      </motion.h2>
      <div className="flex items-center gap-4">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            setIsTagListModalOpen(true);
          }}
          className="bg-indigo-100 hover:bg-indigo-200 text-indigo-600 p-2 rounded-full"
        >
          <UsersIcon className="w-4 h-4" />
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

      <AnimatePresence>
        {isTagListModalOpen && (
          <TagListModal
            isOpen={isTagListModalOpen}
            onClose={() => setIsTagListModalOpen(false)}
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

  const handleUpdateSharing = async (folderId, updatedData) => {
    try {
      const folderRef = doc(db, 'folders', folderId);
      await updateDoc(folderRef, updatedData);

      // Update local state
      setFolders((prev) =>
        prev.map((folder) =>
          folder.id === folderId ? { ...folder, ...updatedData } : folder
        )
      );
    } catch (error) {
      console.error('Error updating folder:', error);
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
              const folderRef = doc(db, 'folders', folderId);
              await updateDoc(folderRef, {
                files: arrayUnion({ name: file.name, url: downloadURL }),
              });

              // Update the local state
              setFolders((prev) =>
                prev.map((folder) =>
                  folder.id === folderId
                    ? { ...folder, files: [...folder.files, { name: file.name, url: downloadURL }] }
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

  const handleCreateFolder = async (folderName) => {
    const newFolder = {
      name: folderName,
      files: [],
      taggedUsers: [],
    };

    try {
      // Add folder to the folders collection
      const folderRef = await addDoc(collection(db, 'folders'), newFolder);

      // Update user2folders collection (using email as the key)
      const user2foldersRef = doc(db, 'user2folders', user.email);
      const user2foldersSnap = await getDoc(user2foldersRef);

      if (user2foldersSnap.exists()) {
        await updateDoc(user2foldersRef, {
          folderIds: arrayUnion(folderRef.id),
        });
      } else {
        await setDoc(user2foldersRef, {
          folderIds: [folderRef.id],
        });
      }

      // Update local state
      setFolders((prev) => [...prev, { id: folderRef.id, ...newFolder }]);
    } catch (error) {
      console.error('Firestore Write Error:', error);
    }
  };

  const handleRenameFolder = async (folderId, newName) => {
    try {
      const folderRef = doc(db, 'folders', folderId);
      await updateDoc(folderRef, { name: newName });

      // Update local state
      setFolders((prev) =>
        prev.map((folder) =>
          folder.id === folderId ? { ...folder, name: newName } : folder
        )
      );
    } catch (error) {
      console.error('Error renaming folder:', error);
    }
  };

  const handleRemoveFolder = async (folderId) => {
    const updatedFolders = folders.filter((folder) => folder.id !== folderId);

    setFolders(updatedFolders);

    // Remove folder from folders collection
    const folderRef = doc(db, 'folders', folderId);
    await deleteDoc(folderRef);

    // Remove folder from user2folders collection
    const user2foldersRef = doc(db, 'user2folders', user.email);
    await updateDoc(user2foldersRef, {
      folderIds: arrayRemove(folderId),
    });
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
          onClick={() => setIsCreateFolderModalOpen(true)}
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

      {/* Create Folder Modal */}
      <AnimatePresence>
        {isCreateFolderModalOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Create Folder</h2>
                <button
                  onClick={() => setIsCreateFolderModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <XIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Enter folder name"
                  className="w-full border rounded px-3 py-2"
                />
                <Button
                  onClick={() => {
                    handleCreateFolder(newFolderName);
                    setIsCreateFolderModalOpen(false);
                    setNewFolderName('');
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white w-full"
                >
                  Create
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}