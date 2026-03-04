// Firebase configuration and initialization
export { 
  getFirebaseApp, 
  getFirebaseAuth, 
  getFirebaseFirestore, 
  getFirebaseStorage, 
  getFirebaseRealtimeDB,
  isFirebaseConfigured,
  firebaseConfig 
} from './config'

// Firebase Auth - Also export as AuthProvider for compatibility
export { 
  FirebaseAuthProvider, 
  useFirebaseAuth,
  useAuth,
  AuthContext 
} from './auth'

// Firebase Database (Firestore + Realtime DB)
export { 
  getFirestoreDB, 
  getRealtimeDB, 
  FirestoreDB, 
  RealtimeDB 
} from './database'

// Firebase Notifications (Email + SMS)
export { 
  sendVerificationCode, 
  verifyCode, 
  linkPhoneToAccount,
  updateUserPhone,
  savePhoneVerification,
  isPhoneVerified,
  initializeRecaptcha,
  initializeInvisibleRecaptcha,
  FirebaseEmailService,
  FirebaseNotificationService,
  getFirebaseEmailService,
  getFirebaseNotificationService
} from './notifications'

// Firebase Storage
export {
  FirebaseStorageService,
  getStorageService,
  type UploadResult
} from './storage'

// Firebase Analytics
export {
  getFirebaseAnalytics,
  logAnalyticsEvent,
  setAnalyticsUserId,
  setAnalyticsUserProperties,
  logSignUp,
  logLogin,
  logPropertyView,
  logPropertySearch,
  logBookingStart,
  logBookingComplete,
  logAddToWishlist,
  logError,
  logPageView,
  AnalyticsEvents
} from './analytics'

// Firebase Push Notifications
export {
  getPushNotifications,
  usePushNotifications,
  type PushNotification,
  type NotificationPermission
} from './push'

// Firebase Chat
export {
  getChatService,
  useChat,
  useTypingStatus,
  type ChatMessage,
  type ChatRoom,
  type TypingStatus
} from './chat'

// Firebase Host Dashboard
export {
  getHostService,
  useHostData,
  type HostProperty,
  type HostBooking,
  type HostStats,
  type HostAnalytics
} from './host'

// Types
export type { UserRole, BookingStatus, PaymentStatus, PropertyType } from './database'
