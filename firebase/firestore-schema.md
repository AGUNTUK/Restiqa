# Firebase Firestore Schema for Restiqa

This document describes the Firestore collections and data structure for migrating from Supabase to Firebase.

## Collections

### users
```
users/{userId}
├── email: string
├── fullName: string | null
├── avatarUrl: string | null
├── phone: string | null
├── address: string | null
├── bio: string | null
├── role: "guest" | "host" | "admin"
├── isVerified: boolean
├── hostRequestedAt: timestamp | null
├── hostApprovedAt: timestamp | null
├── createdAt: timestamp
└── updatedAt: timestamp
```

### properties
```
properties/{propertyId}
├── hostId: string
├── title: string
├── description: string
├── propertyType: "apartment" | "hotel" | "tour"
├── category: string
├── pricePerNight: number
├── pricePerTour: number | null
├── location: string
├── address: string
├── city: string
├── country: string
├── latitude: number | null
├── longitude: number | null
├── bedrooms: number | null
├── bathrooms: number | null
├── maxGuests: number
├── rating: number (0-5)
├── reviewCount: number
├── isAvailable: boolean
├── isApproved: boolean
├── amenities: string[]
├── images: string[]
├── createdAt: timestamp
└── updatedAt: timestamp
```

### propertyImages
```
propertyImages/{imageId}
├── propertyId: string
├── url: string
├── caption: string | null
├── isPrimary: boolean
└── createdAt: timestamp
```

### tours
```
tours/{tourId}
├── propertyId: string
├── duration: string
├── included: string[]
├── excluded: string[]
├── itinerary: object | null
├── meetingPoint: string
├── startTime: string
├── maxParticipants: number
└── createdAt: timestamp
```

### bookings
```
bookings/{bookingId}
├── propertyId: string
├── guestId: string
├── checkIn: timestamp (date)
├── checkOut: timestamp (date)
├── guests: number
├── totalPrice: number
├── status: "pending" | "confirmed" | "cancelled" | "completed"
├── paymentStatus: "pending" | "paid" | "refunded"
├── specialRequests: string | null
├── createdAt: timestamp
└── updatedAt: timestamp
```

### reviews
```
reviews/{reviewId}
├── propertyId: string
├── userId: string
├── bookingId: string
├── rating: number (1-5)
├── comment: string
├── isApproved: boolean
├── createdAt: timestamp
└── updatedAt: timestamp
```

### wishlists
```
wishlists/{wishlistId}
├── userId: string
├── propertyId: string
└── createdAt: timestamp
```

### hostEarnings
```
hostEarnings/{earningId}
├── hostId: string
├── bookingId: string
├── amount: number
├── platformFee: number
├── netAmount: number
├── status: "pending" | "paid" | "refunded"
└── createdAt: timestamp
```

### propertyAvailability
```
propertyAvailability/{availabilityId}
├── propertyId: string
├── date: timestamp (date)
├── isAvailable: boolean
├── priceOverride: number | null
└── createdAt: timestamp
```

### phoneVerifications
```
phoneVerifications/{userId}
├── phoneNumber: string
├── isVerified: boolean
├── verifiedAt: timestamp | null
├── createdAt: timestamp
└── updatedAt: timestamp
```

### emailLogs
```
emailLogs/{logId}
├── toEmail: string
├── subject: string
├── type: string
├── status: "pending" | "sent" | "failed"
├── errorMessage: string | null
├── sentAt: timestamp | null
└── createdAt: timestamp
```

### searchHistory
```
searchHistory/{historyId}
├── userId: string | null
├── searchQuery: string
├── filters: object
├── resultsCount: number
├── clickedPropertyIds: string[]
├── sessionId: string | null
└── createdAt: timestamp
```

### recommendationCache
```
recommendationCache/{cacheId}
├── userId: string
├── propertyIds: string[]
├── recommendationType: string
├── score: number | null
├── createdAt: timestamp
└── expiresAt: timestamp | null
```

## Realtime Database Structure

For chat and notifications, we use Firebase Realtime Database:

### /chats/{chatId}/messages/{messageId}
```
├── senderId: string
├── senderName: string
├── senderAvatar: string | null
├── content: string
├── type: "text" | "image" | "system"
└── timestamp: number
```

### /notifications/{userId}/{notificationId}
```
├── type: string
├── title: string
├── body: string
├── data: object | null
├── read: boolean
└── timestamp: number
```

### /presence/{userId}
```
├── status: "online" | "offline"
└── lastSeen: number
```

### /typing/{chatId}/{userId}
```
(value: true)
```

## Indexes Required

Create these indexes in Firestore Console for optimal queries:

1. **properties**
   - propertyType + isApproved + isAvailable + rating
   - city + isApproved + isAvailable
   - hostId + isApproved

2. **bookings**
   - guestId + status
   - propertyId + status

3. **reviews**
   - propertyId + createdAt
   - userId + propertyId

4. **wishlists**
   - userId + propertyId (unique)

## Migration Notes

1. **User IDs**: Firebase uses UID from Authentication, not a separate ID
2. **Timestamps**: Always use Firestore timestamps, not ISO strings
3. **Arrays**: Firestore doesn't support array queries - use `array-contains`
4. **Counters**: Use Firestore distributed counters for high-volume counts
5. **Security Rules**: Configure Firestore Security Rules separately
