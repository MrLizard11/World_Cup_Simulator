/**
 * Approximate ELO ratings for each team
 * Based on recent FIFA rankings and international performance
 * Used to determine team strength and seeding in tournaments
 */
export const ELO_RATINGS: { [key: string]: number } = {
  'Brazil': 2001,
  'Argentina': 2131,
  'France': 2055,
  'Germany': 1913,
  'Spain': 2156,
  'England': 1984,
  'Italy': 1881,
  'Netherlands': 1975,
  'Portugal': 2030,
  'Belgium': 1846,
  'Croatia': 1926,
  'Uruguay': 1901,
  'Mexico': 1860,
  'Colombia': 1951,
  'Chile': 1688,
  'Peru': 1743,
  'Ecuador': 1905,
  'Venezuela': 1745,
  'United States': 1696,
  'Canada': 1768,
  'Japan': 1881,
  'South Korea': 1752,
  'Australia': 1773,
  'Saudi Arabia': 1567,
  'Iran': 1799,
  'Qatar': 1517,
  'Morocco': 1812,
  'Tunisia': 1614,
  'Egypt': 1667,
  'Ghana': 1478,
  'Nigeria': 1578,
  'Senegal': 1784
};
