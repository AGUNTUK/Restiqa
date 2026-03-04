'use client'

import { getAnalytics, logEvent, setUserId, setUserProperties, Analytics } from 'firebase/analytics'
import { getFirebaseApp } from './config'

let analyticsInstance: Analytics | null = null

// Initialize Analytics
export function getFirebaseAnalytics(): Analytics {
  if (!analyticsInstance) {
    const app = getFirebaseApp()
    analyticsInstance = getAnalytics(app)
  }
  return analyticsInstance
}

// Predefined event names
export const AnalyticsEvents = {
  // User events
  SIGN_UP: 'sign_up',
  LOGIN: 'login',
  LOGOUT: 'logout',
  
  // Property events
  PROPERTY_VIEW: 'view_property',
  PROPERTY_SEARCH: 'search_property',
  PROPERTY_BOOK: 'book_property',
  PROPERTY_WISHLIST: 'add_to_wishlist',
  PROPERTY_SHARE: 'share_property',
  
  // Booking events
  BOOKING_START: 'begin_checkout',
  BOOKING_COMPLETE: 'purchase',
  BOOKING_CANCEL: 'cancel_booking',
  
  // Chat events
  CHAT_START: 'chat_started',
  CHAT_MESSAGE: 'chat_message_sent',
  
  // Review events
  REVIEW_SUBMIT: 'submit_review',
  
  // Search events
  SEARCH: 'search',
  
  // Error events
  ERROR: 'error',
} as const

// Log a custom event
export function logAnalyticsEvent(
  eventName: string,
  params?: Record<string, any>
): void {
  try {
    const analytics = getFirebaseAnalytics()
    logEvent(analytics, eventName, params)
  } catch (error) {
    console.error('Error logging analytics event:', error)
  }
}

// Set user ID for tracking
export function setAnalyticsUserId(userId: string): void {
  try {
    const analytics = getFirebaseAnalytics()
    setUserId(analytics, userId)
  } catch (error) {
    console.error('Error setting analytics user ID:', error)
  }
}

// Set user properties
export function setAnalyticsUserProperties(properties: {
  userRole?: string
  accountType?: string
  firstSeen?: string
}): void {
  try {
    const analytics = getFirebaseAnalytics()
    setUserProperties(analytics, properties)
  } catch (error) {
    console.error('Error setting analytics user properties:', error)
  }
}

// Convenience functions for common events

export function logSignUp(method: string): void {
  logAnalyticsEvent(AnalyticsEvents.SIGN_UP, { method })
}

export function logLogin(method: string): void {
  logAnalyticsEvent(AnalyticsEvents.LOGIN, { method })
}

export function logPropertyView(propertyId: string, propertyType: string, price: number): void {
  logAnalyticsEvent(AnalyticsEvents.PROPERTY_VIEW, {
    property_id: propertyId,
    property_type: propertyType,
    value: price,
    currency: 'USD'
  })
}

export function logPropertySearch(searchTerm: string, resultsCount: number): void {
  logAnalyticsEvent(AnalyticsEvents.SEARCH, {
    search_term: searchTerm,
    results_count: resultsCount
  })
}

export function logBookingStart(propertyId: string, value: number, currency: string = 'USD'): void {
  logAnalyticsEvent(AnalyticsEvents.BOOKING_START, {
    property_id: propertyId,
    value,
    currency
  })
}

export function logBookingComplete(bookingId: string, value: number, currency: string = 'USD'): void {
  logAnalyticsEvent(AnalyticsEvents.BOOKING_COMPLETE, {
    booking_id: bookingId,
    value,
    currency
  })
}

export function logAddToWishlist(propertyId: string, propertyType: string): void {
  logAnalyticsEvent(AnalyticsEvents.PROPERTY_WISHLIST, {
    property_id: propertyId,
    property_type: propertyType
  })
}

export function logError(errorCode: string, errorMessage: string): void {
  logAnalyticsEvent(AnalyticsEvents.ERROR, {
    error_code: errorCode,
    error_message: errorMessage
  })
}

// Page view tracking
export function logPageView(pageName: string, pagePath: string): void {
  logAnalyticsEvent('page_view', {
    page_name: pageName,
    page_path: pagePath
  })
}
