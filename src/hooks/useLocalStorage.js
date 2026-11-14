import { useEffect, useState } from 'react'

const identity = (value) => value

export default function useLocalStorage(key, initialValue, normalize = identity) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return normalize(stored ? JSON.parse(stored) : initialValue)
    } catch {
      return normalize(initialValue)
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage can be unavailable in private or restricted browser contexts.
    }
  }, [key, normalize, value])

  return [value, setValue]
}
