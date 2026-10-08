import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { UserProfile, FriendRequest, Complaint, FeedbackItem } from '../types/social';
import { useAuth } from './useAuth';
import { useToast } from './useToast';

interface SocialContextType {
  allUsers: UserProfile[];
  friends: UserProfile[];
  pendingRequests: FriendRequest[];
  sentRequests: FriendRequest[];
  complaints: Complaint[];
  feedbacks: FeedbackItem[];
  sendFriendRequest: (targetUserId: string) => void;
  acceptFriendRequest: (requestId: string) => void;
  rejectFriendRequest: (requestId: string) => void;
  submitComplaint: (text: string) => void;
  replyToComplaint: (complaintId: string, replyText: string) => void;
  submitFeedback: (text: string) => void;
  updateCurrentUserProfile: (profile: Partial<UserProfile>) => void;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

// Initial records matching project tables (Pages 30 & 31)
const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-12',
    name: 'Sangeetha',
    email: 'sangee@gmail.com',
    phone: '6278335383',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    role: 'user',
    status: 'online',
    bio: 'ASL & ISL learner and advocate',
    createdAt: Date.now() - 10000000,
  },
  {
    id: 'usr-13',
    name: 'Vimalraj',
    email: 'raj68vim@gmail.com',
    phone: '9605713626',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    role: 'user',
    status: 'in-call',
    bio: 'Software engineer & accessibility researcher',
    createdAt: Date.now() - 9000000,
  },
  {
    id: 'usr-14',
    name: 'Cinema Club',
    email: 'cinema@gmail.com',
    phone: '9895789012',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    role: 'user',
    status: 'offline',
    bio: 'Inclusive cinema discussions with captions',
    createdAt: Date.now() - 8000000,
  },
  {
    id: 'usr-15',
    name: 'Anu Malleo',
    email: 'anuamalleo1@gmail.com',
    phone: '8989898989',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    role: 'user',
    status: 'online',
    bio: 'Deaf community teacher',
    createdAt: Date.now() - 7000000,
  },
];

const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'cmp-1',
    userId: 'usr-15',
    userName: 'Anu Malleo',
    complaint: 'Video call detection latency in low light conditions',
    complaintDate: '2025-09-16',
    reply: 'Understood. We are enhancing the camera lighting normalization filter.',
    replyDate: '2025-09-18',
  },
  {
    id: 'cmp-2',
    userId: 'usr-12',
    userName: 'Sangeetha',
    complaint: 'Need option to export recognized sign transcripts after meeting ends',
    complaintDate: '2025-09-26',
    reply: 'Feature added! You can now copy and speak transcripts directly.',
    replyDate: '2025-09-30',
  },
  {
    id: 'cmp-3',
    userId: 'usr-13',
    userName: 'Vimalraj',
    complaint: 'Offline detection audio speech playback was muted by default',
    complaintDate: '2026-02-25',
    reply: 'Resolved in current build with audio synthesization control.',
    replyDate: '2026-02-28',
  },
];

const INITIAL_FEEDBACKS: FeedbackItem[] = [
  {
    id: 'fb-1',
    userId: 'usr-15',
    userName: 'Anu Malleo',
    feedback: 'The real-time bidirectional translation during calls is truly life-changing!',
    date: '2025-11-07',
  },
  {
    id: 'fb-2',
    userId: 'usr-13',
    userName: 'Vimalraj',
    feedback: 'Clean intuitive interface and responsive controls. Great work!',
    date: '2025-08-28',
  },
  {
    id: 'fb-3',
    userId: 'usr-12',
    userName: 'Sangeetha',
    feedback: 'Very good website for connecting hearing and deaf friends seamlessly.',
    date: '2026-03-18',
  },
];

export const SocialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('signmate_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [friends, setFriends] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('signmate_friends');
    return saved ? JSON.parse(saved) : [INITIAL_USERS[0], INITIAL_USERS[1]];
  });

  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>(() => {
    const saved = localStorage.getItem('signmate_pending_requests');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'req-1',
            senderId: 'usr-14',
            senderName: 'Cinema Club',
            senderEmail: 'cinema@gmail.com',
            receiverId: user?.uid || 'current-user',
            receiverName: user?.displayName || 'You',
            status: 'pending',
            createdAt: '2026-03-20',
          },
        ];
  });

  const [sentRequests, setSentRequests] = useState<FriendRequest[]>(() => {
    const saved = localStorage.getItem('signmate_sent_requests');
    return saved ? JSON.parse(saved) : [];
  });

  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem('signmate_complaints');
    return saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
  });

  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(() => {
    const saved = localStorage.getItem('signmate_feedbacks');
    return saved ? JSON.parse(saved) : INITIAL_FEEDBACKS;
  });

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem('signmate_users', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem('signmate_friends', JSON.stringify(friends));
  }, [friends]);

  useEffect(() => {
    localStorage.setItem('signmate_pending_requests', JSON.stringify(pendingRequests));
  }, [pendingRequests]);

  useEffect(() => {
    localStorage.setItem('signmate_sent_requests', JSON.stringify(sentRequests));
  }, [sentRequests]);

  useEffect(() => {
    localStorage.setItem('signmate_complaints', JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem('signmate_feedbacks', JSON.stringify(feedbacks));
  }, [feedbacks]);

  const sendFriendRequest = useCallback(
    (targetUserId: string) => {
      const target = allUsers.find((u) => u.id === targetUserId);
      if (!target) return;

      const newReq: FriendRequest = {
        id: `req-${Date.now()}`,
        senderId: user?.uid || 'current-user',
        senderName: user?.displayName || 'You',
        senderEmail: user?.email || 'user@example.com',
        receiverId: target.id,
        receiverName: target.name,
        status: 'pending',
        createdAt: new Date().toISOString().split('T')[0],
      };

      setSentRequests((prev) => [...prev, newReq]);
      showToast({
        type: 'success',
        title: 'Friend Request Sent',
        message: `Sent request to ${target.name}.`,
      });
    },
    [allUsers, user, showToast]
  );

  const acceptFriendRequest = useCallback(
    (requestId: string) => {
      const req = pendingRequests.find((r) => r.id === requestId);
      if (!req) return;

      const newFriend = allUsers.find((u) => u.id === req.senderId) || {
        id: req.senderId,
        name: req.senderName,
        email: req.senderEmail,
        role: 'user' as const,
        status: 'online' as const,
        createdAt: Date.now(),
      };

      setFriends((prev) => [...prev, newFriend]);
      setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
      showToast({
        type: 'success',
        title: 'Request Accepted',
        message: `You are now connected with ${req.senderName}.`,
      });
    },
    [pendingRequests, allUsers, showToast]
  );

  const rejectFriendRequest = useCallback(
    (requestId: string) => {
      setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
      showToast({
        type: 'info',
        title: 'Request Declined',
        message: 'The connection request was declined.',
      });
    },
    [showToast]
  );

  const submitComplaint = useCallback(
    (text: string) => {
      const newComplaint: Complaint = {
        id: `cmp-${Date.now()}`,
        userId: user?.uid || 'guest-user',
        userName: user?.displayName || user?.email || 'Registered User',
        complaint: text.trim(),
        complaintDate: new Date().toISOString().split('T')[0],
      };

      setComplaints((prev) => [newComplaint, ...prev]);
      showToast({
        type: 'success',
        title: 'Complaint Submitted',
        message: 'Your report has been logged. Support team will review and issue a reply.',
      });
    },
    [user, showToast]
  );

  const replyToComplaint = useCallback(
    (complaintId: string, replyText: string) => {
      setComplaints((prev) =>
        prev.map((c) =>
          c.id === complaintId
            ? {
                ...c,
                reply: replyText.trim(),
                replyDate: new Date().toISOString().split('T')[0],
              }
            : c
        )
      );
      showToast({
        type: 'success',
        title: 'Reply Sent',
        message: 'Formal reply issued to the user.',
      });
    },
    [showToast]
  );

  const submitFeedback = useCallback(
    (text: string) => {
      const newFeedback: FeedbackItem = {
        id: `fb-${Date.now()}`,
        userId: user?.uid || 'guest-user',
        userName: user?.displayName || user?.email || 'Registered User',
        feedback: text.trim(),
        date: new Date().toISOString().split('T')[0],
      };

      setFeedbacks((prev) => [newFeedback, ...prev]);
      showToast({
        type: 'success',
        title: 'Feedback Sent',
        message: 'Thank you for your valuable feedback!',
      });
    },
    [user, showToast]
  );

  const updateCurrentUserProfile = useCallback(
    (profile: Partial<UserProfile>) => {
      setAllUsers((prev) =>
        prev.map((u) =>
          u.id === (user?.uid || 'current-user') ? { ...u, ...profile } : u
        )
      );
      showToast({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile changes have been saved.',
      });
    },
    [user, showToast]
  );

  return (
    <SocialContext.Provider
      value={{
        allUsers,
        friends,
        pendingRequests,
        sentRequests,
        complaints,
        feedbacks,
        sendFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest,
        submitComplaint,
        replyToComplaint,
        submitFeedback,
        updateCurrentUserProfile,
      }}
    >
      {children}
    </SocialContext.Provider>
  );
};

export function useSocial(): SocialContextType {
  const context = useContext(SocialContext);
  if (!context) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
}
