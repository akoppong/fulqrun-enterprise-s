/**
 * Geographic data for regions and countries
 * Organized by continent/region with comprehensive country lists
 */

export interface Country {
  code: string; // ISO 3166-1 alpha-2 code
  name: string;
  region: string;
  subRegion?: string;
}

export interface Region {
  code: string;
  name: string;
  countries: Country[];
}

export const WORLD_REGIONS: Region[] = [
  {
    code: 'NA',
    name: 'North America',
    countries: [
      { code: 'US', name: 'United States', region: 'North America' },
      { code: 'CA', name: 'Canada', region: 'North America' },
      { code: 'MX', name: 'Mexico', region: 'North America' },
      { code: 'GT', name: 'Guatemala', region: 'North America' },
      { code: 'BZ', name: 'Belize', region: 'North America' },
      { code: 'SV', name: 'El Salvador', region: 'North America' },
      { code: 'HN', name: 'Honduras', region: 'North America' },
      { code: 'NI', name: 'Nicaragua', region: 'North America' },
      { code: 'CR', name: 'Costa Rica', region: 'North America' },
      { code: 'PA', name: 'Panama', region: 'North America' },
      { code: 'CU', name: 'Cuba', region: 'North America' },
      { code: 'JM', name: 'Jamaica', region: 'North America' },
      { code: 'HT', name: 'Haiti', region: 'North America' },
      { code: 'DO', name: 'Dominican Republic', region: 'North America' },
      { code: 'TT', name: 'Trinidad and Tobago', region: 'North America' },
      { code: 'BB', name: 'Barbados', region: 'North America' },
      { code: 'BS', name: 'Bahamas', region: 'North America' },
    ]
  },
  {
    code: 'SA',
    name: 'South America',
    countries: [
      { code: 'BR', name: 'Brazil', region: 'South America' },
      { code: 'AR', name: 'Argentina', region: 'South America' },
      { code: 'CL', name: 'Chile', region: 'South America' },
      { code: 'PE', name: 'Peru', region: 'South America' },
      { code: 'CO', name: 'Colombia', region: 'South America' },
      { code: 'VE', name: 'Venezuela', region: 'South America' },
      { code: 'EC', name: 'Ecuador', region: 'South America' },
      { code: 'BO', name: 'Bolivia', region: 'South America' },
      { code: 'PY', name: 'Paraguay', region: 'South America' },
      { code: 'UY', name: 'Uruguay', region: 'South America' },
      { code: 'GY', name: 'Guyana', region: 'South America' },
      { code: 'SR', name: 'Suriname', region: 'South America' },
      { code: 'GF', name: 'French Guiana', region: 'South America' },
    ]
  },
  {
    code: 'EU',
    name: 'Europe',
    countries: [
      { code: 'DE', name: 'Germany', region: 'Europe' },
      { code: 'FR', name: 'France', region: 'Europe' },
      { code: 'GB', name: 'United Kingdom', region: 'Europe' },
      { code: 'IT', name: 'Italy', region: 'Europe' },
      { code: 'ES', name: 'Spain', region: 'Europe' },
      { code: 'PL', name: 'Poland', region: 'Europe' },
      { code: 'NL', name: 'Netherlands', region: 'Europe' },
      { code: 'BE', name: 'Belgium', region: 'Europe' },
      { code: 'CH', name: 'Switzerland', region: 'Europe' },
      { code: 'AT', name: 'Austria', region: 'Europe' },
      { code: 'PT', name: 'Portugal', region: 'Europe' },
      { code: 'SE', name: 'Sweden', region: 'Europe' },
      { code: 'NO', name: 'Norway', region: 'Europe' },
      { code: 'DK', name: 'Denmark', region: 'Europe' },
      { code: 'FI', name: 'Finland', region: 'Europe' },
      { code: 'IE', name: 'Ireland', region: 'Europe' },
      { code: 'GR', name: 'Greece', region: 'Europe' },
      { code: 'CZ', name: 'Czech Republic', region: 'Europe' },
      { code: 'HU', name: 'Hungary', region: 'Europe' },
      { code: 'RO', name: 'Romania', region: 'Europe' },
      { code: 'BG', name: 'Bulgaria', region: 'Europe' },
      { code: 'HR', name: 'Croatia', region: 'Europe' },
      { code: 'SK', name: 'Slovakia', region: 'Europe' },
      { code: 'SI', name: 'Slovenia', region: 'Europe' },
      { code: 'LT', name: 'Lithuania', region: 'Europe' },
      { code: 'LV', name: 'Latvia', region: 'Europe' },
      { code: 'EE', name: 'Estonia', region: 'Europe' },
      { code: 'IS', name: 'Iceland', region: 'Europe' },
      { code: 'MT', name: 'Malta', region: 'Europe' },
      { code: 'CY', name: 'Cyprus', region: 'Europe' },
      { code: 'LU', name: 'Luxembourg', region: 'Europe' },
      { code: 'RU', name: 'Russia', region: 'Europe' },
      { code: 'UA', name: 'Ukraine', region: 'Europe' },
      { code: 'BY', name: 'Belarus', region: 'Europe' },
      { code: 'MD', name: 'Moldova', region: 'Europe' },
    ]
  },
  {
    code: 'AS',
    name: 'Asia',
    countries: [
      { code: 'CN', name: 'China', region: 'Asia' },
      { code: 'IN', name: 'India', region: 'Asia' },
      { code: 'JP', name: 'Japan', region: 'Asia' },
      { code: 'KR', name: 'South Korea', region: 'Asia' },
      { code: 'ID', name: 'Indonesia', region: 'Asia' },
      { code: 'PH', name: 'Philippines', region: 'Asia' },
      { code: 'VN', name: 'Vietnam', region: 'Asia' },
      { code: 'TH', name: 'Thailand', region: 'Asia' },
      { code: 'MY', name: 'Malaysia', region: 'Asia' },
      { code: 'SG', name: 'Singapore', region: 'Asia' },
      { code: 'TW', name: 'Taiwan', region: 'Asia' },
      { code: 'HK', name: 'Hong Kong', region: 'Asia' },
      { code: 'MO', name: 'Macao', region: 'Asia' },
      { code: 'MM', name: 'Myanmar', region: 'Asia' },
      { code: 'KH', name: 'Cambodia', region: 'Asia' },
      { code: 'LA', name: 'Laos', region: 'Asia' },
      { code: 'BD', name: 'Bangladesh', region: 'Asia' },
      { code: 'PK', name: 'Pakistan', region: 'Asia' },
      { code: 'LK', name: 'Sri Lanka', region: 'Asia' },
      { code: 'NP', name: 'Nepal', region: 'Asia' },
      { code: 'BT', name: 'Bhutan', region: 'Asia' },
      { code: 'MV', name: 'Maldives', region: 'Asia' },
      { code: 'AF', name: 'Afghanistan', region: 'Asia' },
      { code: 'UZ', name: 'Uzbekistan', region: 'Asia' },
      { code: 'KZ', name: 'Kazakhstan', region: 'Asia' },
      { code: 'KG', name: 'Kyrgyzstan', region: 'Asia' },
      { code: 'TJ', name: 'Tajikistan', region: 'Asia' },
      { code: 'TM', name: 'Turkmenistan', region: 'Asia' },
      { code: 'MN', name: 'Mongolia', region: 'Asia' },
      { code: 'KP', name: 'North Korea', region: 'Asia' },
    ]
  },
  {
    code: 'AF',
    name: 'Africa',
    countries: [
      { code: 'NG', name: 'Nigeria', region: 'Africa' },
      { code: 'EG', name: 'Egypt', region: 'Africa' },
      { code: 'ZA', name: 'South Africa', region: 'Africa' },
      { code: 'KE', name: 'Kenya', region: 'Africa' },
      { code: 'UG', name: 'Uganda', region: 'Africa' },
      { code: 'TZ', name: 'Tanzania', region: 'Africa' },
      { code: 'ET', name: 'Ethiopia', region: 'Africa' },
      { code: 'GH', name: 'Ghana', region: 'Africa' },
      { code: 'CI', name: 'Côte d\'Ivoire', region: 'Africa' },
      { code: 'SN', name: 'Senegal', region: 'Africa' },
      { code: 'ML', name: 'Mali', region: 'Africa' },
      { code: 'BF', name: 'Burkina Faso', region: 'Africa' },
      { code: 'NE', name: 'Niger', region: 'Africa' },
      { code: 'TD', name: 'Chad', region: 'Africa' },
      { code: 'LY', name: 'Libya', region: 'Africa' },
      { code: 'TN', name: 'Tunisia', region: 'Africa' },
      { code: 'DZ', name: 'Algeria', region: 'Africa' },
      { code: 'MA', name: 'Morocco', region: 'Africa' },
      { code: 'SD', name: 'Sudan', region: 'Africa' },
      { code: 'SS', name: 'South Sudan', region: 'Africa' },
      { code: 'ER', name: 'Eritrea', region: 'Africa' },
      { code: 'DJ', name: 'Djibouti', region: 'Africa' },
      { code: 'SO', name: 'Somalia', region: 'Africa' },
      { code: 'RW', name: 'Rwanda', region: 'Africa' },
      { code: 'BI', name: 'Burundi', region: 'Africa' },
      { code: 'CD', name: 'Democratic Republic of Congo', region: 'Africa' },
      { code: 'CG', name: 'Republic of Congo', region: 'Africa' },
      { code: 'CM', name: 'Cameroon', region: 'Africa' },
      { code: 'CF', name: 'Central African Republic', region: 'Africa' },
      { code: 'GA', name: 'Gabon', region: 'Africa' },
      { code: 'GQ', name: 'Equatorial Guinea', region: 'Africa' },
      { code: 'ST', name: 'São Tomé and Príncipe', region: 'Africa' },
      { code: 'AO', name: 'Angola', region: 'Africa' },
      { code: 'ZM', name: 'Zambia', region: 'Africa' },
      { code: 'ZW', name: 'Zimbabwe', region: 'Africa' },
      { code: 'BW', name: 'Botswana', region: 'Africa' },
      { code: 'NA', name: 'Namibia', region: 'Africa' },
      { code: 'SZ', name: 'Eswatini', region: 'Africa' },
      { code: 'LS', name: 'Lesotho', region: 'Africa' },
      { code: 'MW', name: 'Malawi', region: 'Africa' },
      { code: 'MZ', name: 'Mozambique', region: 'Africa' },
      { code: 'MG', name: 'Madagascar', region: 'Africa' },
      { code: 'MU', name: 'Mauritius', region: 'Africa' },
      { code: 'SC', name: 'Seychelles', region: 'Africa' },
      { code: 'KM', name: 'Comoros', region: 'Africa' },
    ]
  },
  {
    code: 'OC',
    name: 'Oceania',
    countries: [
      { code: 'AU', name: 'Australia', region: 'Oceania' },
      { code: 'NZ', name: 'New Zealand', region: 'Oceania' },
      { code: 'PG', name: 'Papua New Guinea', region: 'Oceania' },
      { code: 'FJ', name: 'Fiji', region: 'Oceania' },
      { code: 'SB', name: 'Solomon Islands', region: 'Oceania' },
      { code: 'VU', name: 'Vanuatu', region: 'Oceania' },
      { code: 'WS', name: 'Samoa', region: 'Oceania' },
      { code: 'TO', name: 'Tonga', region: 'Oceania' },
      { code: 'KI', name: 'Kiribati', region: 'Oceania' },
      { code: 'TV', name: 'Tuvalu', region: 'Oceania' },
      { code: 'NR', name: 'Nauru', region: 'Oceania' },
      { code: 'PW', name: 'Palau', region: 'Oceania' },
      { code: 'MH', name: 'Marshall Islands', region: 'Oceania' },
      { code: 'FM', name: 'Micronesia', region: 'Oceania' },
    ]
  },
  {
    code: 'ME',
    name: 'Middle East',
    countries: [
      { code: 'SA', name: 'Saudi Arabia', region: 'Middle East' },
      { code: 'AE', name: 'United Arab Emirates', region: 'Middle East' },
      { code: 'IR', name: 'Iran', region: 'Middle East' },
      { code: 'IQ', name: 'Iraq', region: 'Middle East' },
      { code: 'IL', name: 'Israel', region: 'Middle East' },
      { code: 'PS', name: 'Palestine', region: 'Middle East' },
      { code: 'JO', name: 'Jordan', region: 'Middle East' },
      { code: 'LB', name: 'Lebanon', region: 'Middle East' },
      { code: 'SY', name: 'Syria', region: 'Middle East' },
      { code: 'TR', name: 'Turkey', region: 'Middle East' },
      { code: 'KW', name: 'Kuwait', region: 'Middle East' },
      { code: 'QA', name: 'Qatar', region: 'Middle East' },
      { code: 'BH', name: 'Bahrain', region: 'Middle East' },
      { code: 'OM', name: 'Oman', region: 'Middle East' },
      { code: 'YE', name: 'Yemen', region: 'Middle East' },
    ]
  }
];

export const getAllRegions = (): Region[] => WORLD_REGIONS;

export const getRegionByCode = (code: string): Region | undefined => {
  return WORLD_REGIONS.find(region => region.code === code);
};

export const getCountriesByRegion = (regionCode: string): Country[] => {
  const region = getRegionByCode(regionCode);
  return region ? region.countries : [];
};

export const getCountryByCode = (code: string): Country | undefined => {
  for (const region of WORLD_REGIONS) {
    const country = region.countries.find(country => country.code === code);
    if (country) return country;
  }
  return undefined;
};

export const getAllCountries = (): Country[] => {
  return WORLD_REGIONS.flatMap(region => region.countries);
};

export const searchCountries = (query: string): Country[] => {
  const lowercaseQuery = query.toLowerCase();
  return getAllCountries().filter(country =>
    country.name.toLowerCase().includes(lowercaseQuery) ||
    country.code.toLowerCase().includes(lowercaseQuery)
  );
};

export const searchCountriesInRegion = (regionCode: string, query: string): Country[] => {
  const countries = getCountriesByRegion(regionCode);
  const lowercaseQuery = query.toLowerCase();
  return countries.filter(country =>
    country.name.toLowerCase().includes(lowercaseQuery) ||
    country.code.toLowerCase().includes(lowercaseQuery)
  );
};

// Region management for settings
export class GeographyService {
  private static REGIONS_KEY = 'app_regions';
  private static COUNTRIES_KEY = 'app_countries';

  /**
   * Initialize default regions if none exist
   */
  static async initializeDefaultRegions(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const existingRegions = localStorage.getItem(this.REGIONS_KEY);
      const existingCountries = localStorage.getItem(this.COUNTRIES_KEY);

      if (!existingRegions) {
        localStorage.setItem(this.REGIONS_KEY, JSON.stringify(WORLD_REGIONS));
      }

      if (!existingCountries) {
        localStorage.setItem(this.COUNTRIES_KEY, JSON.stringify(getAllCountries()));
      }
    } catch (error) {
      console.error('Error initializing geography data:', error);
    }
  }

  /**
   * Get all regions from storage
   */
  static async getRegions(): Promise<Region[]> {
    if (typeof window === 'undefined') return WORLD_REGIONS;

    try {
      const stored = localStorage.getItem(this.REGIONS_KEY);
      return stored ? JSON.parse(stored) : WORLD_REGIONS;
    } catch (error) {
      console.error('Error loading regions:', error);
      return WORLD_REGIONS;
    }
  }

  /**
   * Get all countries from storage
   */
  static async getCountries(): Promise<Country[]> {
    if (typeof window === 'undefined') return getAllCountries();

    try {
      const stored = localStorage.getItem(this.COUNTRIES_KEY);
      return stored ? JSON.parse(stored) : getAllCountries();
    } catch (error) {
      console.error('Error loading countries:', error);
      return getAllCountries();
    }
  }

  /**
   * Add custom region
   */
  static async addRegion(region: Region): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const regions = await this.getRegions();
      regions.push(region);
      localStorage.setItem(this.REGIONS_KEY, JSON.stringify(regions));
    } catch (error) {
      console.error('Error adding region:', error);
    }
  }

  /**
   * Update region
   */
  static async updateRegion(code: string, updatedRegion: Region): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const regions = await this.getRegions();
      const index = regions.findIndex(r => r.code === code);
      if (index !== -1) {
        regions[index] = updatedRegion;
        localStorage.setItem(this.REGIONS_KEY, JSON.stringify(regions));
      }
    } catch (error) {
      console.error('Error updating region:', error);
    }
  }

  /**
   * Delete region
   */
  static async deleteRegion(code: string): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const regions = await this.getRegions();
      const filtered = regions.filter(r => r.code !== code);
      localStorage.setItem(this.REGIONS_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting region:', error);
    }
  }
}