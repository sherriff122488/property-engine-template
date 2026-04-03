'use client'

import { useState, useMemo, useTransition } from 'react'
import { RotateCcw, Save, FolderOpen, Trash2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'
import {
  calculateDeal, calcSdlt, sdltLabel, getDefaults, migrateInputs,
  type DealInputs, type DealResults, type SdltType, type DealType, type FinanceType,
} from '@/lib/utils/deal-calculator'
import { saveDeal, deleteDeal } from '@/lib/actions/deal-analyses'
import type { SavedDeal } from '@/lib/actions/deal-analyses'
import { useRouter } from 'next/navigation'

// ── Helpers ────────────────────────────────────────────────────────────────

function fmt(n: number | null | undefined): string {
  if (n == null) return '—'
  return formatCurrency(n)
}

function fmtPct(n: number | null | undefined, dp = 2): string {
  if (n == null) return '—'
  return n.toFixed(dp) + '%'
}

function roiColour(roi: number | null): string {
  if (roi === null) return 'text-stone-400'
  if (roi >= 25)   return 'text-emerald-400'
  if (roi >= 15)   return 'text-green-400'
  if (roi >= 8)    return 'text-amber-400'
  if (roi >= 0)    return 'text-orange-400'
  return 'text-red-400'
}

// ── Input primitives ───────────────────────────────────────────────────────

function NumInput({
  label, value, onChange, prefix = '£', suffix, hint, readOnly = false, step = 'any',
}: {
  label: string; value: number; onChange?: (v: number) => void
  prefix?: string | null; suffix?: string; hint?: string
  readOnly?: boolean; step?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1.5">{label}</label>
      {hint && <p className="text-xs text-stone-400 mb-1">{hint}</p>}
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 pointer-events-none select-none">{prefix}</span>
        )}
        <input
          type="number"
          inputMode="decimal"
          step={step}
          value={value === 0 && !readOnly ? '' : value}
          onChange={e => onChange?.(parseFloat(e.target.value) || 0)}
          readOnly={readOnly}
          placeholder="0"
          className={cn(
            'w-full rounded-lg border py-2.5 text-sm',
            'focus:outline-none focus:ring-2 focus:ring-stone-400/20 focus:border-stone-400',
            prefix ? 'pl-6 pr-3' : suffix ? 'pl-3 pr-8' : 'px-3',
            readOnly
              ? 'border-stone-100 dark:border-stone-700/50 bg-stone-50 dark:bg-stone-900/60 text-stone-400 dark:text-stone-500 cursor-default'
              : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100'
          )}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 pointer-events-none select-none">{suffix}</span>
        )}
      </div>
    </div>
  )
}

function SelectInput<T extends string>({
  label, value, onChange, options,
}: {
  label: string; value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1.5">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value as T)}
        className="w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-400/20"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

function Section({ title, children, cols = 2 }: { title: string; children: React.ReactNode; cols?: 2 | 1 }) {
  return (
    <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-4 pb-3 border-b border-stone-100 dark:border-stone-700">
        {title}
      </h3>
      <div className={cn('gap-4', cols === 2 ? 'grid grid-cols-1 sm:grid-cols-2' : 'space-y-4')}>
        {children}
      </div>
    </div>
  )
}

// ── Segmented control ──────────────────────────────────────────────────────

function SegmentedControl<T extends string>({
  value, onChange, options,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
}) {
  return (
    <div className="flex rounded-lg border border-stone-200 dark:border-stone-700 p-0.5 gap-0.5 text-xs font-medium">
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'px-3 py-1 rounded-md transition-colors',
            value === o.value
              ? 'bg-stone-900 dark:bg-stone-600 text-white'
              : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

// ── Results row ────────────────────────────────────────────────────────────

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-stone-400">{label}</span>
      <span className={cn('text-sm font-medium tabular-nums', muted ? 'text-stone-500' : 'text-stone-200')}>{value}</span>
    </div>
  )
}

function Divider() {
  return <div className="border-t border-stone-700/60 my-1" />
}

// ── Cost breakdown row ─────────────────────────────────────────────────────

function CostRow({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total > 0 ? (value / total) * 100 : 0
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="text-xs text-stone-500 dark:text-stone-400 w-40 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-stone-100 dark:bg-stone-700 overflow-hidden">
        <div className="h-full rounded-full bg-[#CF7454]/70" style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className="text-xs font-medium text-stone-600 dark:text-stone-300 tabular-nums w-24 text-right">{fmt(value)}</span>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export function DealAnalyser({ savedDeals = [] }: { savedDeals?: SavedDeal[] }) {
  const [inp, setInp]               = useState<DealInputs>(getDefaults())
  const [sdltManual, setSdltManual] = useState(false)
  const [currentId, setCurrentId]   = useState<string | null>(null)
  const [savedOk, setSavedOk]       = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const set = <K extends keyof DealInputs>(key: K) =>
    (val: DealInputs[K]) => {
      setInp(prev => ({ ...prev, [key]: val }))
      setSavedOk(false)
    }

  const results: DealResults = useMemo(() => calculateDeal(inp), [inp])
  const autoSdlt = calcSdlt(inp.purchasePrice, inp.sdltType)
  const hasFinance = inp.financeType !== 'none'

  function handleSdltTypeChange(v: SdltType) {
    set('sdltType')(v)
    setSdltManual(false)
    set('sdltOverride')(null)
  }

  function toggleSdltManual() {
    if (!sdltManual) {
      set('sdltOverride')(Math.round(autoSdlt))
      setSdltManual(true)
    } else {
      set('sdltOverride')(null)
      setSdltManual(false)
    }
  }

  function handleReset() {
    setInp(getDefaults())
    setSdltManual(false)
    setCurrentId(null)
    setSavedOk(false)
  }

  function handleLoad(deal: SavedDeal) {
    const inputs = migrateInputs(deal.inputs as unknown as Record<string, unknown>)
    setInp(inputs)
    setSdltManual(inputs.sdltOverride !== null)
    setCurrentId(deal.id)
    setSavedOk(false)
  }

  function handleSave() {
    startTransition(async () => {
      const result = await saveDeal(inp, currentId ?? undefined)
      if (result.success) {
        setCurrentId(result.id)
        setSavedOk(true)
        router.refresh()
        setTimeout(() => setSavedOk(false), 2500)
      }
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteDeal(id)
      if (currentId === id) handleReset()
      router.refresh()
    })
  }

  // Finance section label
  const financeLabel = inp.financeType === 'bridge' ? 'Bridge finance' : 'Mortgage finance'

  return (
    <div className="space-y-4">

      {/* ── Saved deals bar ────────────────────────────────────────── */}
      {savedDeals.length > 0 && (
        <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <FolderOpen className="h-3.5 w-3.5 text-stone-400" />
            <span className="text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wider">Saved deals</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {savedDeals.map(deal => (
              <div
                key={deal.id}
                className={cn(
                  'group flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer',
                  currentId === deal.id
                    ? 'border-[#CF7454]/40 bg-[#CF7454]/10 text-[#CF7454]'
                    : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-stone-300 dark:hover:border-stone-500 hover:bg-stone-50 dark:hover:bg-stone-700/50'
                )}
                onClick={() => handleLoad(deal)}
              >
                <span className="max-w-[180px] truncate">{deal.name}</span>
                <span className="text-stone-300 dark:text-stone-600 text-xs uppercase tracking-wider ml-0.5">{deal.deal_type === 'btl' ? 'BTL' : 'Flip'}</span>
                <button
                  onClick={e => { e.stopPropagation(); handleDelete(deal.id) }}
                  className={cn(
                    'ml-1 rounded p-0.5 transition-colors opacity-0 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 opacity-100',
                    currentId === deal.id
                      ? 'text-[#CF7454]/60 hover:text-[#CF7454]'
                      : 'text-stone-300 dark:text-stone-500 hover:text-red-400 dark:hover:text-red-400'
                  )}
                  title="Delete deal"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Main layout ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">

        {/* ── Left: Inputs ──────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Deal type + basic info */}
          <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-stone-100 dark:border-stone-700">
              <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Deal information</h3>
              <SegmentedControl<DealType>
                value={inp.dealType}
                onChange={set('dealType')}
                options={[
                  { value: 'flip', label: 'Flip / Development' },
                  { value: 'btl',  label: 'Buy to Let' },
                ]}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1.5">Property / deal name</label>
                <input
                  type="text"
                  value={inp.propertyName}
                  onChange={e => set('propertyName')(e.target.value)}
                  placeholder="e.g. 14 Church Street flip"
                  className="w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-2.5 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400/20 focus:border-stone-400"
                />
              </div>
              <NumInput label="Purchase price"          value={inp.purchasePrice} onChange={set('purchasePrice')} />
              <NumInput
                label={inp.dealType === 'btl' ? 'End / refinance value' : 'GDV / sale price'}
                value={inp.gdv}
                onChange={set('gdv')}
              />
              <NumInput label="Holding period (months)" value={inp.months} onChange={set('months')} prefix={null} />
            </div>
          </div>

          {/* SDLT */}
          <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-4 pb-3 border-b border-stone-100 dark:border-stone-700">
              Stamp duty (SDLT)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectInput<SdltType>
                label="Rate type"
                value={inp.sdltType}
                onChange={handleSdltTypeChange}
                options={[
                  { value: 'commercial',              label: 'Commercial / mixed-use' },
                  { value: 'residential_additional',  label: 'Residential — additional dwelling' },
                  { value: 'residential_standard',    label: 'Residential — standard' },
                ]}
              />
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-stone-600 dark:text-stone-400">Stamp duty</label>
                  <button
                    onClick={toggleSdltManual}
                    className="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 underline"
                  >
                    {sdltManual ? 'Use auto-calc' : 'Override'}
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 pointer-events-none">£</span>
                  <input
                    type="number"
                    readOnly={!sdltManual}
                    value={sdltManual ? (inp.sdltOverride ?? '') : Math.round(autoSdlt)}
                    onChange={e => sdltManual && set('sdltOverride')(parseFloat(e.target.value) || 0)}
                    inputMode="decimal"
                    className={cn(
                      'w-full rounded-lg border py-2.5 pl-6 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400/20 focus:border-stone-400',
                      sdltManual
                        ? 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100'
                        : 'border-stone-100 dark:border-stone-700/50 bg-stone-50 dark:bg-stone-900/60 text-stone-400 cursor-default'
                    )}
                  />
                </div>
                <p className="mt-1 text-xs text-stone-400">{sdltLabel(inp.sdltType)}</p>
              </div>
            </div>
          </div>

          {/* Costs */}
          <Section title="Costs">
            <NumInput label="Refurb / build costs"  value={inp.refurb}         onChange={set('refurb')} />
            <NumInput label="Solicitors"             value={inp.solicitorsCost} onChange={set('solicitorsCost')} />
            <NumInput label="Holding costs"          value={inp.holdingCosts}   onChange={set('holdingCosts')} hint="Insurance, utilities, council tax" />
            <NumInput label="Other costs"            value={inp.otherCosts}     onChange={set('otherCosts')} />
          </Section>

          {/* Finance */}
          <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-stone-100 dark:border-stone-700">
              <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Finance</h3>
              <SegmentedControl<FinanceType>
                value={inp.financeType}
                onChange={set('financeType')}
                options={[
                  { value: 'none',     label: 'None' },
                  { value: 'mortgage', label: 'Mortgage' },
                  { value: 'bridge',   label: 'Bridge' },
                ]}
              />
            </div>

            {hasFinance ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Shared fields */}
                <NumInput label="LTV"                      value={inp.financeLtv}          onChange={set('financeLtv')}         prefix={null} suffix="%" />
                <NumInput label="Loan amount (auto)"       value={Math.round(results.totalBorrowed)} prefix="£" readOnly />
                <NumInput label="Annual interest rate"     value={inp.interestRate}         onChange={set('interestRate')}       prefix={null} suffix="%" />
                <NumInput label="Monthly rate (auto)"      value={parseFloat(results.monthlyInterestRate.toFixed(4))} prefix={null} suffix="%" readOnly />
                <NumInput label="Arrangement fee"          value={inp.arrangementFeePct}    onChange={set('arrangementFeePct')} prefix={null} suffix="%" />
                <NumInput label="Arrangement fee (£, auto)" value={Math.round(results.arrangementFee)} prefix="£" readOnly />
                <NumInput label="Legal fee"                value={inp.legalFee}             onChange={set('legalFee')} />

                {/* Bridge-only */}
                {inp.financeType === 'bridge' && (
                  <>
                    <NumInput label="Title insurance"      value={inp.titleInsurance}     onChange={set('titleInsurance')} />
                    <NumInput label="Documentation fee"    value={inp.documentationFee}   onChange={set('documentationFee')} />
                    <NumInput label="Funds transfer fee"   value={inp.fundsTransferFee}   onChange={set('fundsTransferFee')} />
                  </>
                )}

                {/* Mortgage-only */}
                {inp.financeType === 'mortgage' && (
                  <NumInput label="Valuation fee"          value={inp.valuationFee}       onChange={set('valuationFee')} />
                )}
              </div>
            ) : (
              <p className="text-sm text-stone-400 italic">Select Bridge or Mortgage to include finance costs.</p>
            )}
          </div>

          {/* BTL: Rental income */}
          {inp.dealType === 'btl' && (
            <Section title="Rental income">
              <NumInput label="Monthly rent"           value={inp.monthlyRent}         onChange={set('monthlyRent')} />
              <NumInput label="Management fee"         value={inp.managementFeePct}    onChange={set('managementFeePct')} prefix={null} suffix="%" />
              <NumInput label="Annual service charge / ground rent" value={inp.annualServiceCharge} onChange={set('annualServiceCharge')} />
            </Section>
          )}

          {/* Cost breakdown */}
          {results.totalCosts > 0 && (
            <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-4 pb-3 border-b border-stone-100 dark:border-stone-700">
                Cost breakdown
              </h3>
              <div className="space-y-0.5">
                <CostRow label="Purchase price"  value={inp.purchasePrice}            total={results.totalCosts} />
                <CostRow label="Stamp duty"       value={results.sdlt}                total={results.totalCosts} />
                {inp.refurb > 0         && <CostRow label="Refurb"               value={inp.refurb}               total={results.totalCosts} />}
                {hasFinance             && <CostRow label={`${financeLabel} costs`} value={results.totalBridgeCosts} total={results.totalCosts} />}
                {inp.holdingCosts > 0   && <CostRow label="Holding costs"         value={inp.holdingCosts}          total={results.totalCosts} />}
                {inp.solicitorsCost > 0 && <CostRow label="Solicitors"            value={inp.solicitorsCost}        total={results.totalCosts} />}
                {inp.otherCosts > 0     && <CostRow label="Other costs"           value={inp.otherCosts}            total={results.totalCosts} />}
              </div>
              <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-700 flex justify-between">
                <span className="text-xs font-semibold text-stone-600 dark:text-stone-300">Total costs</span>
                <span className="text-sm font-bold text-stone-900 dark:text-stone-100 tabular-nums">{fmt(results.totalCosts)}</span>
              </div>
            </div>
          )}

          {/* Save / Reset */}
          <div className="flex items-center justify-between pb-4">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              {currentId ? 'New deal' : 'Reset all'}
            </button>

            <button
              onClick={handleSave}
              disabled={isPending}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium transition-colors',
                savedOk
                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                  : 'bg-stone-900 dark:bg-[#CF7454] text-white hover:bg-stone-700 dark:hover:bg-[#b8613d] disabled:opacity-50'
              )}
            >
              {savedOk ? (
                <><Check className="h-3 w-3" /> Saved</>
              ) : (
                <><Save className="h-3 w-3" /> {currentId ? 'Update deal' : 'Save deal'}</>
              )}
            </button>
          </div>

        </div>

        {/* ── Right: Results (sticky) ────────────────────────────────── */}
        <div className="lg:sticky lg:top-6">
          <div className="rounded-xl border border-stone-700 bg-stone-900 text-white p-5 shadow-lg space-y-4">

            {inp.propertyName && (
              <p className="text-xs text-stone-400 font-medium truncate">{inp.propertyName}</p>
            )}

            {/* ROI — hero metric */}
            <div className="rounded-xl bg-stone-800 p-4 text-center">
              <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">ROI</p>
              <p className={cn('text-4xl font-bold tabular-nums', roiColour(results.roi))}>
                {fmtPct(results.roi)}
              </p>
              {results.annualisedRoi !== null && (
                <p className="text-xs text-stone-400 mt-1">{fmtPct(results.annualisedRoi)} annualised</p>
              )}
            </div>

            {/* Key financials */}
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wider mb-2">Financials</p>
              <Row label="Profit"          value={fmt(results.profit)} />
              <Row label="Cash needed"     value={fmt(results.cashNeeded)} />
              <Row label="Total costs"     value={fmt(results.totalCosts)} muted />
              <Row label="Stamp duty"      value={fmt(results.sdlt)}        muted />
              <Divider />
              <Row label="Profit on GDV"   value={fmtPct(results.profitOnGdv)} />
              <Row label="MOIC"            value={results.moic !== null ? results.moic.toFixed(2) + 'x' : '—'} />
              <Row label="Break-even GDV"  value={fmt(results.breakEvenGdv)} muted />
            </div>

            {/* Finance */}
            {hasFinance && results.totalBorrowed > 0 && (
              <div>
                <Divider />
                <p className="text-xs text-stone-500 uppercase tracking-wider mb-2 mt-3">{financeLabel}</p>
                <Row label="Loan amount"      value={fmt(results.totalBorrowed)} />
                <Row label="Net loan"         value={fmt(results.netLoan)} />
                <Row label="Total interest"   value={fmt(results.totalInterestPaid)} muted />
                <Row label="Arrangement fee"  value={fmt(results.arrangementFee)}    muted />
                <Row label="Total finance costs" value={fmt(results.totalBridgeCosts)} />
              </div>
            )}

            {/* BTL */}
            {inp.dealType === 'btl' && inp.monthlyRent > 0 && (
              <div>
                <Divider />
                <p className="text-xs text-stone-500 uppercase tracking-wider mb-2 mt-3">Rental returns</p>
                <Row label="Gross yield"       value={fmtPct(results.grossYield)} />
                <Row label="Net yield"         value={fmtPct(results.netYield)} />
                <Row label="Monthly cashflow"  value={fmt(results.monthlyCashflow)} />
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  )
}
