'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Input from './Input'
import { Search, MapPin, X } from 'lucide-react'

interface SearchSuggestion {
  id: string
  text: string
  type: 'location' | 'property' | 'recent'
  icon?: React.ReactNode
}

interface SearchAutocompleteProps {
  onSearch?: (query: string) => void
  onSelect?: (suggestion: SearchSuggestion) => void
  placeholder?: string
  className?: string
}

export function SearchAutocomplete({
  onSearch,
  onSelect,
  placeholder = 'Search destinations, properties...',
  className = ''
}: SearchAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<SearchSuggestion[]>([])
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setRecentSearches(parsed.slice(0, 5))
      } catch (e) {
        console.error('Error loading recent searches:', e)
      }
    }
  }, [])

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsLoading(true)
      
      // Generate suggestions based on query
      const newSuggestions: SearchSuggestion[] = []
      
      // Location suggestions (simulated - in real app, call your API)
      const popularLocations = [
        'Dhaka',
        'Chittagong',
        'Sylhet',
        'Cox\'s Bazar',
        'Bandarban',
        'Rangpur',
        'Barisal',
        'Khulna'
      ]
      
      const matchingLocations = popularLocations.filter(loc => 
        loc.toLowerCase().includes(query.toLowerCase())
      )
      
      matchingLocations.forEach(loc => {
        newSuggestions.push({
          id: `loc-${loc}`,
          text: loc,
          type: 'location',
          icon: <MapPin className="w-4 h-4" />
        })
      })

      // Add query as a search option
      newSuggestions.push({
        id: 'search',
        text: `Search for "${query}"`,
        type: 'property',
        icon: <Search className="w-4 h-4" />
      })

      setSuggestions(newSuggestions)
      setIsOpen(true)
      setIsLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = useCallback((suggestion: SearchSuggestion) => {
    setQuery(suggestion.type === 'recent' ? suggestion.text : suggestion.text.replace(/Search for "|"/g, ''))
    setIsOpen(false)
    
    // Save to recent searches
    if (suggestion.type === 'location' || suggestion.type === 'property') {
      const newRecent = [
        { ...suggestion, type: 'recent' as const },
        ...recentSearches.filter(s => s.text !== suggestion.text)
      ].slice(0, 5)
      
      setRecentSearches(newRecent)
      localStorage.setItem('recentSearches', JSON.stringify(newRecent))
    }

    onSelect?.(suggestion)
    onSearch?.(suggestion.text.replace(/Search for "|"/g, ''))
  }, [recentSearches, onSelect, onSearch])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch?.(query)
      setIsOpen(false)
      
      // Add to recent searches
      const newRecent = [
        { id: `recent-${Date.now()}`, text: query, type: 'recent' as const },
        ...recentSearches.filter(s => s.text !== query)
      ].slice(0, 5)
      
      setRecentSearches(newRecent)
      localStorage.setItem('recentSearches', JSON.stringify(newRecent))
    }
  }, [query, recentSearches, onSearch])

  const clearSearch = useCallback(() => {
    setQuery('')
    setSuggestions([])
    setIsOpen(false)
  }, [])

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query && setIsOpen(true)}
            placeholder={placeholder}
            className="pr-10 pl-10"
          />
          
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" />
              <p className="mt-2">Searching...</p>
            </div>
          ) : (
            <>
              {/* Recent searches */}
              {!query && recentSearches.length > 0 && (
                <div className="p-2">
                  <p className="text-xs text-gray-500 px-3 py-2">Recent Searches</p>
                  {recentSearches.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 rounded-lg"
                    >
                      <Search className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{item.text}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="p-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      type="button"
                      onClick={() => handleSelect(suggestion)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 rounded-lg"
                    >
                      {suggestion.icon}
                      <span className="text-gray-700">{suggestion.text}</span>
                      {suggestion.type === 'location' && (
                        <span className="ml-auto text-xs text-gray-400">Location</span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* No results */}
              {query && suggestions.length === 0 && !isLoading && (
                <div className="p-4 text-center text-gray-500">
                  No results found for "{query}"
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

// Price range filter component
interface PriceRangeFilterProps {
  min?: number
  max?: number
  step?: number
  onChange?: (min: number, max: number) => void
}

export function PriceRangeFilter({
  min = 0,
  max = 1000,
  step = 10,
  onChange
}: PriceRangeFilterProps) {
  const [minValue, setMinValue] = useState(min)
  const [maxValue, setMaxValue] = useState(max)

  const handleMinChange = (value: number) => {
    const newMin = Math.min(value, maxValue - step)
    setMinValue(newMin)
    onChange?.(newMin, maxValue)
  }

  const handleMaxChange = (value: number) => {
    const newMax = Math.max(value, minValue + step)
    setMaxValue(newMax)
    onChange?.(minValue, newMax)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span>${minValue}</span>
        <span>${maxValue}</span>
      </div>
      <div className="relative h-2 bg-gray-200 rounded-full">
        <div 
          className="absolute h-full bg-blue-500 rounded-full"
          style={{
            left: `${((minValue - min) / (max - min)) * 100}%`,
            right: `${100 - ((maxValue - min) / (max - min)) * 100}%`
          }}
        />
      </div>
      <div className="flex gap-4">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minValue}
          onChange={(e) => handleMinChange(Number(e.target.value))}
          className="w-full"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxValue}
          onChange={(e) => handleMaxChange(Number(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  )
}

// Amenities filter component
interface Amenity {
  id: string
  name: string
  icon: string
}

const defaultAmenities: Amenity[] = [
  { id: 'wifi', name: 'WiFi', icon: '📶' },
  { id: 'pool', name: 'Pool', icon: '🏊' },
  { id: 'parking', name: 'Free Parking', icon: '🅿️' },
  { id: 'ac', name: 'Air Conditioning', icon: '❄️' },
  { id: 'kitchen', name: 'Kitchen', icon: '🍳' },
  { id: 'washer', name: 'Washer', icon: '🧺' },
  { id: 'gym', name: 'Gym', icon: '🏋️' },
  { id: 'pets', name: 'Pet Friendly', icon: '🐕' },
  { id: 'breakfast', name: 'Breakfast', icon: '🍳' },
  { id: 'tv', name: 'TV', icon: '📺' },
]

interface AmenitiesFilterProps {
  selected?: string[]
  onChange?: (amenities: string[]) => void
}

export function AmenitiesFilter({ selected = [], onChange }: AmenitiesFilterProps) {
  const toggleAmenity = (amenityId: string) => {
    const newSelected = selected.includes(amenityId)
      ? selected.filter(id => id !== amenityId)
      : [...selected, amenityId]
    
    onChange?.(newSelected)
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {defaultAmenities.map((amenity) => (
        <button
          key={amenity.id}
          type="button"
          onClick={() => toggleAmenity(amenity.id)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
            selected.includes(amenity.id)
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <span>{amenity.icon}</span>
          <span className="text-sm">{amenity.name}</span>
        </button>
      ))}
    </div>
  )
}
