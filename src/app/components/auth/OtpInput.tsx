import { useRef } from 'react'
import type { KeyboardEvent, ClipboardEvent } from 'react'
import './OtpInput.css'

interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

const LENGTH = 6

export function OtpInput({ value, onChange, disabled }: OtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  const digits = value.padEnd(LENGTH, ' ').slice(0, LENGTH).split('')

  const setDigit = (index: number, digit: string) => {
    const clean = digit.replace(/\D/g, '').slice(-1)
    const next = digits.map((d, i) => (i === index ? clean : d.trim())).join('')
    onChange(next.replace(/\s/g, '').slice(0, LENGTH))
    if (clean && index < LENGTH - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index]?.trim() && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LENGTH)
    onChange(pasted)
    const focusIndex = Math.min(pasted.length, LENGTH - 1)
    inputsRef.current[focusIndex]?.focus()
  }

  return (
    <div className="otp-input" role="group" aria-label="Code à 6 chiffres">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el
          }}
          className="otp-input__cell"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={digit.trim()}
          disabled={disabled}
          onChange={(e) => setDigit(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          aria-label={`Chiffre ${index + 1}`}
        />
      ))}
    </div>
  )
}
