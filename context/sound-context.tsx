"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type SoundType = "click" | "add" | "remove" | "success" | "error"

interface SoundContextType {
  isSoundEnabled: boolean
  toggleSound: () => void
  playSound: (type: SoundType) => void
}

const SoundContext = createContext<SoundContextType | undefined>(undefined)

export function SoundProvider({ children }: { children: ReactNode }) {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true)
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const [sounds, setSounds] = useState<Record<SoundType, AudioBuffer | null>>({
    click: null,
    add: null,
    remove: null,
    success: null,
    error: null,
  })

  // Initialize AudioContext on client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)()
      setAudioContext(context)

      // Create different sounds for different actions
      const createBeepSound = (frequency: number, duration: number) => {
        const sampleRate = context.sampleRate
        const buffer = context.createBuffer(1, sampleRate * duration, sampleRate)
        const data = buffer.getChannelData(0)

        for (let i = 0; i < buffer.length; i++) {
          data[i] = Math.sin((2 * Math.PI * frequency * i) / sampleRate) * Math.exp((-5 * i) / buffer.length) // Add decay
        }

        return buffer
      }

      // Create different sounds for different actions
      const clickSound = createBeepSound(800, 0.1)
      const addSound = createBeepSound(1200, 0.15)
      const removeSound = createBeepSound(400, 0.15)
      const successSound = createBeepSound(600, 0.3)
      const errorSound = createBeepSound(200, 0.3)

      setSounds({
        click: clickSound,
        add: addSound,
        remove: removeSound,
        success: successSound,
        error: errorSound,
      })

      // Load sound preference from localStorage
      if (typeof window !== "undefined") {
        const storedPreference = localStorage.getItem("soundEnabled")
        if (storedPreference !== null) {
          setIsSoundEnabled(storedPreference === "true")
        }
      }

      return () => {
        context.close()
      }
    }
  }, [])

  // Save sound preference to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("soundEnabled", isSoundEnabled.toString())
    }
  }, [isSoundEnabled])

  const toggleSound = () => {
    setIsSoundEnabled((prev) => !prev)
  }

  const playSound = (type: SoundType) => {
    if (!isSoundEnabled || !audioContext || !sounds[type]) return

    const source = audioContext.createBufferSource()
    source.buffer = sounds[type]
    source.connect(audioContext.destination)
    source.start()
  }

  return (
    <SoundContext.Provider
      value={{
        isSoundEnabled,
        toggleSound,
        playSound,
      }}
    >
      {children}
    </SoundContext.Provider>
  )
}

export function useSound() {
  const context = useContext(SoundContext)
  if (context === undefined) {
    throw new Error("useSound must be used within a SoundProvider")
  }
  return context
}

