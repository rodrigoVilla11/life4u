import type { ExchangeRateMap } from "./types";

/**
 * Build exchange rate map key from currency pair
 */
export function rateKey(from: string, to: string): string {
  return `${from}_${to}`;
}

/**
 * Convert amount from one currency to another using exchange rate map.
 * If same currency, returns amount as-is.
 * If no rate found, returns amount (1:1 fallback).
 */
export function convertToGoalCurrency(
  amount: number,
  fromCurrency: string,
  goalCurrency: string,
  rates: ExchangeRateMap
): number {
  if (fromCurrency === goalCurrency) return amount;

  const directKey = rateKey(fromCurrency, goalCurrency);
  if (rates[directKey]) {
    return amount * rates[directKey];
  }

  // Try inverse
  const inverseKey = rateKey(goalCurrency, fromCurrency);
  if (rates[inverseKey]) {
    return amount / rates[inverseKey];
  }

  // Fallback: 1:1
  return amount;
}

/**
 * Build ExchangeRateMap from raw exchange rate records
 */
export function buildExchangeRateMap(
  rates: Array<{ fromCurrency: string; toCurrency: string; rate: number }>
): ExchangeRateMap {
  const map: ExchangeRateMap = {};
  for (const r of rates) {
    map[rateKey(r.fromCurrency, r.toCurrency)] = r.rate;
  }
  return map;
}
