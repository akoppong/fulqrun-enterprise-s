import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { GeographyService, getCountriesByRegion, getAllRegions, type Region, type Country } from '@/lib/geography-data';

interface RegionCountrySelectorProps {
  selectedRegion?: string;
  selectedCountry?: string;
  onRegionChange: (regionCode: string) => void;
  onCountryChange: (countryCode: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function RegionCountrySelector({
  selectedRegion,
  selectedCountry,
  onRegionChange,
  onCountryChange,
  required = false,
  disabled = false,
  className = ""
}: RegionCountrySelectorProps) {
  const [regions, setRegions] = useState<Region[]>([]);
  const [availableCountries, setAvailableCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  // Load regions on component mount
  useEffect(() => {
    const loadRegions = async () => {
      try {
        setLoading(true);
        // Initialize default regions if needed
        await GeographyService.initializeDefaultRegions();
        const regionsData = await GeographyService.getRegions();
        setRegions(regionsData);
      } catch (error) {
        console.error('Error loading regions:', error);
        // Fallback to hardcoded regions
        setRegions(getAllRegions());
      } finally {
        setLoading(false);
      }
    };

    loadRegions();
  }, []);

  // Update available countries when region changes
  useEffect(() => {
    if (selectedRegion) {
      const countries = getCountriesByRegion(selectedRegion);
      setAvailableCountries(countries);
      
      // If the selected country is not in the new region, clear it
      if (selectedCountry && !countries.find(c => c.code === selectedCountry)) {
        onCountryChange('');
      }
    } else {
      setAvailableCountries([]);
      if (selectedCountry) {
        onCountryChange('');
      }
    }
  }, [selectedRegion, selectedCountry, onCountryChange]);

  const handleRegionChange = (regionCode: string) => {
    onRegionChange(regionCode);
  };

  const handleCountryChange = (countryCode: string) => {
    onCountryChange(countryCode);
  };

  if (loading) {
    return (
      <div className={className}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Region</Label>
            <div className="h-10 bg-muted animate-pulse rounded-md" />
          </div>
          <div className="space-y-2">
            <Label>Country</Label>
            <div className="h-10 bg-muted animate-pulse rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Region Selector */}
        <div className="space-y-2">
          <Label htmlFor="region-select">
            Region {required && <span className="text-destructive">*</span>}
          </Label>
          <Select
            value={selectedRegion || ''}
            onValueChange={handleRegionChange}
            disabled={disabled}
          >
            <SelectTrigger id="region-select">
              <SelectValue placeholder="Select a region..." />
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region.code} value={region.code}>
                  {region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Country Selector */}
        <div className="space-y-2">
          <Label htmlFor="country-select">
            Country {required && <span className="text-destructive">*</span>}
          </Label>
          <Select
            value={selectedCountry || ''}
            onValueChange={handleCountryChange}
            disabled={disabled || !selectedRegion || availableCountries.length === 0}
          >
            <SelectTrigger id="country-select">
              <SelectValue 
                placeholder={
                  !selectedRegion 
                    ? "Select a region first..." 
                    : availableCountries.length === 0 
                    ? "No countries available..."
                    : "Select a country..."
                } 
              />
            </SelectTrigger>
            <SelectContent>
              {availableCountries.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Helper text */}
      {selectedRegion && availableCountries.length > 0 && (
        <p className="text-sm text-muted-foreground mt-2">
          {availableCountries.length} countries available in {regions.find(r => r.code === selectedRegion)?.name}
        </p>
      )}
    </div>
  );
}

// Hook for easier usage
export function useRegionCountrySelector(initialRegion?: string, initialCountry?: string) {
  const [selectedRegion, setSelectedRegion] = useState(initialRegion || '');
  const [selectedCountry, setSelectedCountry] = useState(initialCountry || '');

  const reset = () => {
    setSelectedRegion('');
    setSelectedCountry('');
  };

  const setRegionCountry = (region: string, country: string) => {
    setSelectedRegion(region);
    setSelectedCountry(country);
  };

  return {
    selectedRegion,
    selectedCountry,
    setSelectedRegion,
    setSelectedCountry,
    reset,
    setRegionCountry,
    // Get display names
    getRegionName: () => {
      const regions = getAllRegions();
      return regions.find(r => r.code === selectedRegion)?.name || '';
    },
    getCountryName: () => {
      if (!selectedRegion) return '';
      const countries = getCountriesByRegion(selectedRegion);
      return countries.find(c => c.code === selectedCountry)?.name || '';
    }
  };
}