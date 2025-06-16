import { useEffect } from 'react'

interface Shortcut {
  key: string
  action: () => void
  description?: string
  modifier?: 'ctrl' | 'alt' | 'shift' | 'meta'
  secondModifier?: 'ctrl' | 'alt' | 'shift' | 'meta'
}

export const useKeyboardShortcuts = (shortcuts: Shortcut[]) => {
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      shortcuts.forEach(({ key, action, modifier, secondModifier }) => {
        // Check if the key matches (case-insensitive)
        const isKeyPressed = e.key.toLowerCase() === key.toLowerCase()
        
        // Check modifiers
        const isFirstModifierPressed = modifier ? e[`${modifier}Key`] : true
        const isSecondModifierPressed = secondModifier ? e[`${secondModifier}Key`] : true
        
        // Check if no other modifiers are pressed
        const isOnlyModifiersPressed = !e.ctrlKey || (modifier === 'ctrl' || secondModifier === 'ctrl')
        const isOnlyAltPressed = !e.altKey || (modifier === 'alt' || secondModifier === 'alt')
        const isOnlyShiftPressed = !e.shiftKey || (modifier === 'shift' || secondModifier === 'shift')
        const isOnlyMetaPressed = !e.metaKey || (modifier === 'meta' || secondModifier === 'meta')

        if (
          isKeyPressed &&
          isFirstModifierPressed &&
          isSecondModifierPressed &&
          isOnlyModifiersPressed &&
          isOnlyAltPressed &&
          isOnlyShiftPressed &&
          isOnlyMetaPressed
        ) {
          e.preventDefault()
          action()
        }
      })
    }

    document.addEventListener('keydown', handleKeydown)
    return () => document.removeEventListener('keydown', handleKeydown)
  }, [shortcuts])
} 