import { useState, useRef, useCallback, useEffect } from 'react'
import ProviderLegend from './ProviderLegend'

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6)  // 6..22

function formatHour(h) {
  if (h === 12) return '12 PM'
  if (h < 12)  return `${h} AM`
  return `${h - 12} PM`
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function isToday(dateStr) {
  return dateStr === new Date().toISOString().slice(0, 10)
}

/**
 * CalendarPainter
 *
 * Props:
 *   days        - string[] of YYYY-MM-DD dates (7 items, oldest first)
 *   providers   - [{ id, name, color }]
 *   data        - { 'YYYY-MM-DD': { [hour]: providerId | null } }
 *   onChange    - (newData) => void
 *   readOnly    - boolean (default false)
 */
export default function CalendarPainter({ days, providers, data, onChange, readOnly = false }) {
  const [selectedTool, setSelectedTool] = useState(providers[0]?.id || null)
  const isPainting = useRef(false)
  const gridRef = useRef(null)

  // Sync selected tool if providers change (e.g. first load)
  useEffect(() => {
    if (!selectedTool && providers.length > 0) {
      setSelectedTool(providers[0].id)
    }
  }, [providers])

  function getCellValue(date, hour) {
    return data?.[date]?.[hour] ?? null
  }

  function paintCell(date, hour) {
    if (readOnly) return
    const value = selectedTool === 'eraser' ? null : selectedTool
    const newData = {
      ...data,
      [date]: {
        ...(data?.[date] || {}),
        [hour]: value,
      },
    }
    onChange(newData)
  }

  // ── Mouse events ────────────────────────────────────────────────────────────

  function handleMouseDown(date, hour, e) {
    if (e.button !== 0) return
    e.preventDefault()
    isPainting.current = true
    paintCell(date, hour)
  }

  function handleMouseEnter(date, hour) {
    if (isPainting.current) paintCell(date, hour)
  }

  function handleMouseUp() {
    isPainting.current = false
  }

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp)
    return () => window.removeEventListener('mouseup', handleMouseUp)
  }, [])

  // ── Touch events ─────────────────────────────────────────────────────────────

  function getCellFromPoint(x, y) {
    if (!gridRef.current) return null
    const el = document.elementFromPoint(x, y)
    if (!el) return null
    const cell = el.closest('[data-date][data-hour]')
    if (!cell) return null
    return { date: cell.dataset.date, hour: Number(cell.dataset.hour) }
  }

  function handleTouchStart(e) {
    if (readOnly) return
    isPainting.current = true
    const t = e.touches[0]
    const cell = getCellFromPoint(t.clientX, t.clientY)
    if (cell) paintCell(cell.date, cell.hour)
  }

  function handleTouchMove(e) {
    if (!isPainting.current || readOnly) return
    e.preventDefault()
    const t = e.touches[0]
    const cell = getCellFromPoint(t.clientX, t.clientY)
    if (cell) paintCell(cell.date, cell.hour)
  }

  function handleTouchEnd() {
    isPainting.current = false
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const providerMap = Object.fromEntries(providers.map(p => [p.id, p]))

  const filledSlots = Object.values(data || {}).reduce((acc, dayData) =>
    acc + Object.values(dayData).filter(v => v !== null).length, 0)
  const totalSlots = days.length * HOURS.length

  // Grid columns: 1 time-label + 7 days
  const gridTemplateColumns = `52px repeat(${days.length}, 1fr)`

  return (
    <div>
      {!readOnly && (
        <ProviderLegend
          providers={providers}
          selectedTool={selectedTool}
          onSelect={setSelectedTool}
        />
      )}

      <div className="calendar-wrap" style={{ marginTop: readOnly ? 0 : '1rem' }}>
        <div className="calendar-grid" ref={gridRef}>
          <div
            className="calendar-inner"
            style={{ display: 'grid', gridTemplateColumns }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Header row */}
            <div className="calendar-time-label" style={{ borderBottom: '2px solid var(--gray-200)', height: 'auto', padding: '.5rem .375rem', fontWeight: 600, color: 'var(--gray-500)', fontSize: '.7rem' }}>
              Time
            </div>
            {days.map(date => (
              <div
                key={date}
                className={`calendar-day-header${isToday(date) ? ' calendar-day-header--today' : ''}`}
              >
                {formatDate(date).split(',')[0]}
                <span className="calendar-day-header__date">
                  {formatDate(date).split(',')[1]?.trim()}
                </span>
              </div>
            ))}

            {/* Data rows */}
            {HOURS.map(hour => (
              <>
                <div key={`label-${hour}`} className="calendar-time-label">
                  {formatHour(hour)}
                </div>
                {days.map(date => {
                  const providerId = getCellValue(date, hour)
                  const provider = providerId ? providerMap[providerId] : null
                  return (
                    <div
                      key={`${date}-${hour}`}
                      data-date={date}
                      data-hour={hour}
                      className={`calendar-cell${!providerId ? ' calendar-cell--empty' : ''}`}
                      style={{ backgroundColor: provider?.color || undefined }}
                      onMouseDown={(e) => handleMouseDown(date, hour, e)}
                      onMouseEnter={() => handleMouseEnter(date, hour)}
                      title={provider ? `${provider.name} — ${formatDate(date)} ${formatHour(hour)}` : `${formatDate(date)} ${formatHour(hour)}`}
                    />
                  )
                })}
              </>
            ))}
          </div>
        </div>
      </div>

      {/* Fill progress */}
      <div className="text-sm text-muted mt-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>
          {filledSlots} of {totalSlots} hours filled ({Math.round((filledSlots / totalSlots) * 100)}%)
        </span>
        {!readOnly && filledSlots > 0 && (
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => onChange({})}
            style={{ fontSize: '.75rem', padding: '.25rem .5rem' }}
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  )
}
