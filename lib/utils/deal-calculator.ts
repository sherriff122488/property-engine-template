// ── Types ──────────────────────────────────────────────────────────────────

export type DealType     = 'flip' | 'btl'
export type SdltType     = 'commercial' | 'residential_additional' | 'residential_standard'
export type FinanceType  = 'none' | 'bridge' | 'mortgage'

export interface DealInputs {
  dealType:            DealType
  propertyName:        string

  // Core
  purchasePrice:       number
  gdv:                 number   // sale price for flips; end value for BTL
  months:              number   // holding period / bridge term

  // Stamp duty
  sdltType:            SdltType
  sdltOverride:        number | null  // null = auto

  // Acquisition / costs
  refurb:              number
  holdingCosts:        number
  solicitorsCost:      number
  otherCosts:          number

  // Finance (bridge or mortgage)
  financeType:         FinanceType
  financeLtv:          number   // % e.g. 75
  interestRate:        number   // annual % e.g. 9
  arrangementFeePct:   number   // % e.g. 1
  legalFee:            number

  // Bridge-only fees
  titleInsurance:      number
  documentationFee:    number
  fundsTransferFee:    number

  // Mortgage-only fees
  valuationFee:        number

  // BTL only
  monthlyRent:         number
  managementFeePct:    number
  annualServiceCharge: number
}

/** Migrate legacy inputs that used useBridgeFinance boolean */
export function migrateInputs(raw: Record<string, unknown>): DealInputs {
  const defaults = getDefaults()
  const merged = { ...defaults, ...raw } as DealInputs & { useBridgeFinance?: boolean; bridgeLtv?: number }
  if (!merged.financeType) {
    merged.financeType = merged.useBridgeFinance ? 'bridge' : 'none'
  }
  if (!merged.financeLtv && merged.bridgeLtv) {
    merged.financeLtv = merged.bridgeLtv
  }
  return merged
}

export function getDefaults(): DealInputs {
  return {
    dealType:            'flip',
    propertyName:        '',
    purchasePrice:       0,
    gdv:                 0,
    months:              12,
    sdltType:            'commercial',
    sdltOverride:        null,
    refurb:              0,
    holdingCosts:        0,
    solicitorsCost:      0,
    otherCosts:          0,
    financeType:         'bridge',
    financeLtv:          75,
    interestRate:        9,
    arrangementFeePct:   1,
    legalFee:            1800,
    titleInsurance:      260,
    documentationFee:    795,
    fundsTransferFee:    35,
    valuationFee:        500,
    monthlyRent:         0,
    managementFeePct:    10,
    annualServiceCharge: 0,
  }
}

export interface DealResults {
  sdlt:                number
  totalBorrowed:       number
  arrangementFee:      number
  monthlyInterestRate: number
  totalInterestPaid:   number
  totalBridgeCosts:    number
  netLoan:             number
  totalCosts:          number
  cashNeeded:          number
  profit:              number
  roi:                 number | null
  annualisedRoi:       number | null
  profitOnGdv:         number | null
  moic:                number | null
  breakEvenGdv:        number
  // BTL
  grossYield:          number | null
  netYield:            number | null
  monthlyCashflow:     number | null
}

// ── SDLT ───────────────────────────────────────────────────────────────────

export function calcSdlt(price: number, type: SdltType): number {
  if (price <= 0) return 0

  if (type === 'commercial') {
    // HMRC commercial / mixed-use rates
    // 0% up to £150k · 2% £150k–£250k · 5% above £250k
    let duty = 0
    if (price > 150_000) duty += (Math.min(price, 250_000) - 150_000) * 0.02
    if (price > 250_000) duty += (price - 250_000) * 0.05
    return duty
  }

  // Residential bands (April 2025+ nil-rate threshold back to £125k)
  // Additional dwelling surcharge increased to 5% from Oct 2024
  const surcharge = type === 'residential_additional' ? 0.05 : 0
  const bands = [
    { from: 0,         to: 125_000,   rate: 0.00 },
    { from: 125_000,   to: 250_000,   rate: 0.02 },
    { from: 250_000,   to: 925_000,   rate: 0.05 },
    { from: 925_000,   to: 1_500_000, rate: 0.10 },
    { from: 1_500_000, to: Infinity,  rate: 0.12 },
  ]

  let duty = 0
  for (const band of bands) {
    if (price <= band.from) break
    const taxable = Math.min(price, band.to) - band.from
    duty += taxable * (band.rate + surcharge)
  }
  return duty
}

export function sdltLabel(type: SdltType): string {
  switch (type) {
    case 'commercial':               return 'Commercial / mixed-use rates'
    case 'residential_additional':   return 'Residential — additional dwelling (+5% surcharge)'
    case 'residential_standard':     return 'Residential — standard rates'
  }
}

// ── Main calculator ────────────────────────────────────────────────────────

export function calculateDeal(i: DealInputs): DealResults {
  const sdlt = i.sdltOverride !== null
    ? i.sdltOverride
    : calcSdlt(i.purchasePrice, i.sdltType)

  // Finance (bridge or mortgage — same core math, different fee set)
  const hasFinance          = i.financeType !== 'none'
  const totalBorrowed       = hasFinance ? i.purchasePrice * (i.financeLtv / 100) : 0
  const arrangementFee      = totalBorrowed * (i.arrangementFeePct / 100)
  const monthlyInterestRate = i.interestRate / 100 / 12
  const totalInterestPaid   = totalBorrowed * monthlyInterestRate * i.months

  const extraFees = i.financeType === 'bridge'
    ? i.titleInsurance + i.documentationFee + i.fundsTransferFee
    : i.financeType === 'mortgage'
      ? i.valuationFee
      : 0

  const totalBridgeCosts    = hasFinance
    ? totalInterestPaid + arrangementFee + i.legalFee + extraFees
    : 0
  const netLoan             = totalBorrowed - arrangementFee

  // Totals
  const totalCosts  = i.purchasePrice + sdlt + i.refurb + totalBridgeCosts + i.holdingCosts + i.solicitorsCost + i.otherCosts
  const cashNeeded  = totalCosts - netLoan
  const profit      = i.gdv - totalCosts

  // Return metrics
  const roi           = cashNeeded > 0  ? (profit / cashNeeded) * 100    : null
  const annualisedRoi = roi !== null && i.months > 0 ? (roi / i.months) * 12 : null
  const profitOnGdv   = i.gdv > 0       ? (profit / i.gdv) * 100          : null
  const moic          = cashNeeded > 0  ? (cashNeeded + profit) / cashNeeded : null
  const breakEvenGdv  = totalCosts

  // BTL
  const annualRent       = i.monthlyRent * 12
  const managementCost   = annualRent * (i.managementFeePct / 100)
  const annualNetIncome  = annualRent - managementCost - i.annualServiceCharge
  const grossYield       = i.purchasePrice > 0 ? (annualRent / i.purchasePrice) * 100 : null
  const netYield         = i.purchasePrice > 0 ? (annualNetIncome / i.purchasePrice) * 100 : null
  const monthlyCashflow  = i.monthlyRent > 0 ? (annualNetIncome / 12) : null

  return {
    sdlt, totalBorrowed, arrangementFee, monthlyInterestRate,
    totalInterestPaid, totalBridgeCosts, netLoan,
    totalCosts, cashNeeded, profit,
    roi, annualisedRoi, profitOnGdv, moic, breakEvenGdv,
    grossYield, netYield, monthlyCashflow,
  }
}
