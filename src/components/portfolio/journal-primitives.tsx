'use client'

import * as React from 'react'

interface SegOption {
  value: string
  label: string
}

/**
 * Pill-style segmented control. Relies on `.journal .seg` CSS — must be
 * rendered inside a `.journal` wrapper.
 */
export function SegmentedControl({
  options,
  value,
  onChange,
  className,
}: {
  options: SegOption[]
  value: string
  onChange: (v: string) => void
  className?: string
}) {
  return (
    <div className={'seg' + (className ? ' ' + className : '')}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          data-v={o.value}
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/**
 * Dollar-prefixed numeric input. Relies on `.journal .money` CSS.
 */
export function MoneyInput({
  value,
  onChange,
  placeholder = '0.00',
  id,
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  id?: string
  disabled?: boolean
}) {
  return (
    <div className="money">
      <i>$</i>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        className="num"
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

/**
 * Single-select pill chips. Relies on `.journal .chips` + `.chip` CSS.
 */
export function Chips({
  options,
  value,
  onChange,
}: {
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="chips">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          className="chip"
          aria-pressed={value === opt}
          onClick={() => onChange(value === opt ? '' : opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}
