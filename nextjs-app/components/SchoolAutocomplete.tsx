'use client'

import { useState, useRef, useCallback, useId } from 'react'
import type { School } from '@/lib/types'
import { schoolKey } from '@/lib/utils'

interface Props {
  placeholder: string
  allSchools: School[]
  onSelect: (school: School) => void
  value?: string
  onChange?: (v: string) => void
}

export default function SchoolAutocomplete({ placeholder, allSchools, onSelect, value, onChange }: Props) {
  const listId = useId()
  const [query, setQuery] = useState(value ?? '')
  const [items, setItems] = useState<School[]>([])
  const [activeIdx, setActiveIdx] = useState(-1)
  const dropdownRef = useRef<HTMLUListElement>(null)

  const search = useCallback((q: string) => {
    if (!q.trim()) { setItems([]); return }
    const lower = q.toLowerCase()
    const hits = allSchools
      .filter(s => s.school_name.toLowerCase().includes(lower) || s.city?.toLowerCase().includes(lower))
      .sort((a, b) => {
        const ai = a.school_name.toLowerCase().indexOf(lower)
        const bi = b.school_name.toLowerCase().indexOf(lower)
        return ai - bi || a.school_name.localeCompare(b.school_name)
      })
      .slice(0, 12)
    setItems(hits)
    setActiveIdx(-1)
  }, [allSchools])

  const close = () => { setItems([]); setActiveIdx(-1) }

  const select = (school: School) => {
    onSelect(school)
    setQuery('')
    onChange?.(school.school_name)
    close()
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setQuery(v)
    onChange?.(v)
    search(v)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!items.length) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, items.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); select(items[Math.max(activeIdx, 0)]) }
    else if (e.key === 'Escape') close()
  }

  return (
    <div className="school-search-wrap">
      <input
        className="school-input"
        role="combobox"
        aria-label={placeholder}
        aria-autocomplete="list"
        aria-expanded={items.length > 0}
        aria-controls={listId}
        aria-activedescendant={activeIdx >= 0 ? `${listId}-${activeIdx}` : undefined}
        type="text"
        placeholder={placeholder}
        value={value !== undefined ? value : query}
        autoComplete="off"
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onBlur={() => setTimeout(close, 160)}
      />
      <ul id={listId} role="listbox" aria-label="Matching schools" ref={dropdownRef} className={`school-dropdown${items.length ? '' : ' hidden'}`}>
        {items.map((s, i) => {
          const typeLabel = s.school_type && s.school_type !== 'CA Public' ? ` · ${s.school_type}` : ''
          const loc = [s.city, s.county].filter(Boolean).join(', ')
          return (
            <li
              key={schoolKey(s)}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === activeIdx}
              className={i === activeIdx ? 'active' : ''}
              onMouseDown={e => { e.preventDefault(); select(s) }}
            >
              <span className="dd-name">{s.school_name}</span>
              <span className="dd-loc">{loc}{typeLabel}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
