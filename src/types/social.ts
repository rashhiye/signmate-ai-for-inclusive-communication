export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  photo?: string;
  role?: 'user';
  status: 'online' | 'offline' | 'in-call';
  bio?: string;
  createdAt: number;
}

export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected';

export interface FriendRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  receiverId: string;
  receiverName: string;
  status: FriendRequestStatus;
  createdAt: string;
}

export interface Complaint {
  id: string;
  userId: string;
  userName: string;
  complaint: string;
  complaintDate: string;
  reply?: string;
  replyDate?: string;
}

export interface FeedbackItem {
  id: string;
  userId: string;
  userName: string;
  feedback: string;
  date: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isCaption?: boolean;
}
