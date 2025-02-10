"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { DirectionProvider } from '@radix-ui/react-direction';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { db } from "../../lib/firebaseConfig";
import { collection, query, getDocs } from "firebase/firestore";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { PhoneIcon } from 'lucide-react';

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('stats');
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [messages, setMessages] = useState([]);
  const [userStats, setUserStats] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!loading && (user.email !== 'roidavid@admin.com')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchData = async () => {
      const usersSnapshot = await getDocs(collection(db, 'usersDB'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      }));
      setUsers(usersData);
      processUserStats(usersData);

      const eventsSnapshot = await getDocs(collection(db, 'events'));
      setEvents(eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate()
      })));

      const messagesSnapshot = await getDocs(query(collection(db, 'contactMessages')));
      setMessages(messagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      })));
    };
    
    if (user?.email === 'roidavid@admin.com') fetchData();
  }, [user]);

  const processUserStats = (users) => {
    const statsMap = users.reduce((acc, user) => {
      if (!user.timestamp) return acc;
      const date = user.timestamp.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, total: 0, photographer: 0, client: 0 };
      }
      acc[date].total++;
      if (user.role === 'photographer') acc[date].photographer++;
      if (user.role === 'client') acc[date].client++;
      return acc;
    }, {});
    setUserStats(Object.values(statsMap).sort((a, b) => new Date(a.date) - new Date(b.date)));
  };

  const renderUserDetails = (user) => (
    <TableRow key={user.id}>
      <TableCell className="text-xs sm:text-sm">{user.email}</TableCell>
      <TableCell>
        <Badge variant={user.role === 'photographer' ? 'default' : 'secondary'} className="text-xs">
          {user.role}
        </Badge>
      </TableCell>
      <TableCell className="text-xs sm:text-sm">{user.phoneNumber}</TableCell>
      <TableCell className="text-xs sm:text-sm">
        {user.role === 'photographer' ? (
          <>
            <div>גיל: {user.age}</div>
            <div>ניסיון: {user.professionalExperience}</div>
            <div>ציוד: {user.cameraModel} ({user.lensDetails})</div>
          </>
        ) : '-'}
      </TableCell>
      <TableCell className="text-xs sm:text-sm">
        {user.timestamp ? user.timestamp.toLocaleDateString('he-IL') : 'לא זמין'}
      </TableCell>
    </TableRow>
  );

  const renderEventDetails = (event) => (
    <TableRow key={event.id}>
      <TableCell className="font-medium text-xs sm:text-sm">{event.name}</TableCell>
      <TableCell>
        <Badge variant={event.status === 'paid' ? 'default' : 'secondary'} className="text-xs">
          {event.status}
        </Badge>
      </TableCell>
      <TableCell className="text-xs sm:text-sm">
        {event.date ? event.date.toLocaleDateString('he-IL') : 'לא זמין'}
      </TableCell>
      <TableCell className="text-xs sm:text-sm">{event.type}</TableCell>
      <TableCell className="text-xs sm:text-sm">{event.city}, {event.region}</TableCell>
      <TableCell className="text-xs sm:text-sm">{event.contactName}</TableCell>
    </TableRow>
  );

  const renderMessage = (message) => (
    <Card key={message.id} className="mb-3 sm:mb-4">
      <CardHeader className="pb-1 sm:pb-2">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
          <div>
            <h3 className="font-semibold text-base sm:text-lg">{message.name}</h3>
            <p className="text-xs sm:text-sm text-gray-500">{message.email}</p>
          </div>
          <time className="text-xs sm:text-sm text-gray-500">
            {message.timestamp ? message.timestamp.toLocaleString('he-IL') : 'לא זמין'}
          </time>
        </div>
      </CardHeader>
      <CardContent className="text-sm sm:text-base">
        <p className="text-gray-700 mb-1 sm:mb-2">{message.message}</p>
        <div className="flex items-center text-xs sm:text-sm text-gray-500">
          <PhoneIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          {message.phone}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center">טוען...</div>;

  return (
    <DirectionProvider dir="rtl">
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Navigation */}
          <nav className="flex gap-2 sm:gap-4 overflow-x-auto pb-2 hide-scrollbar">
            <Button
              variant={activeTab === 'stats' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('stats')}
              className="text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2 whitespace-nowrap"
            >
              סטטיסטיקות
            </Button>
            <Button
              variant={activeTab === 'users' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('users')}
              className="text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2 whitespace-nowrap"
            >
              משתמשים
            </Button>
            <Button
              variant={activeTab === 'events' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('events')}
              className="text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2 whitespace-nowrap"
            >
              אירועים
            </Button>
            <Button
              variant={activeTab === 'messages' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('messages')}
              className="text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2 whitespace-nowrap"
            >
              הודעות
            </Button>
          </nav>

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid gap-4 sm:gap-6"
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg sm:text-xl">גידול משתמשים</CardTitle>
                </CardHeader>
                <CardContent className="h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={userStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#4f46e5"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="photographer"
                        stroke="#10b981"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="client"
                        stroke="#ef4444"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm sm:text-lg">סה"כ משתמשים</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl font-bold text-indigo-600">
                      {users.length}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm sm:text-lg">צלמים</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl font-bold text-green-600">
                      {users.filter(u => u.role === 'photographer').length}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm sm:text-lg">לקוחות</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl font-bold text-red-600">
                      {users.filter(u => u.role === 'client').length}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">כל המשתמשים</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <Table className="min-w-[800px] sm:min-w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[150px] text-xs sm:text-sm">אימייל</TableHead>
                        <TableHead className="text-xs sm:text-sm">תפקיד</TableHead>
                        <TableHead className="text-xs sm:text-sm">טלפון</TableHead>
                        <TableHead className="text-xs sm:text-sm">פרטים נוספים</TableHead>
                        <TableHead className="text-xs sm:text-sm">תאריך הרשמה</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users
                        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                        .map(renderUserDetails)}
                    </TableBody>
                  </Table>
                  <Pagination className="mt-4">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          className="text-xs sm:text-sm"
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <span className="text-xs sm:text-sm">עמוד {currentPage}</span>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext
                          className="text-xs sm:text-sm"
                          onClick={() => setCurrentPage(p => 
                            Math.min(p + 1, Math.ceil(users.length / itemsPerPage))
                          )}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">כל האירועים</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <Table className="min-w-[800px] sm:min-w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs sm:text-sm">שם</TableHead>
                        <TableHead className="text-xs sm:text-sm">סטטוס</TableHead>
                        <TableHead className="text-xs sm:text-sm">תאריך</TableHead>
                        <TableHead className="text-xs sm:text-sm">סוג</TableHead>
                        <TableHead className="text-xs sm:text-sm">מיקום</TableHead>
                        <TableHead className="text-xs sm:text-sm">איש קשר</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {events
                        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                        .map(renderEventDetails)}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3 sm:space-y-4"
            >
              {messages.map(renderMessage)}
            </motion.div>
          )}
        </div>
      </div>
    </DirectionProvider>
  );
};

export default AdminDashboard;
