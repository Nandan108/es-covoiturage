// LocationSearch.tsx
import { useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useAutocompleteQuery, type Loc } from "@/services/locationApi";
import AutocompleteInput from "./AutocompleteInput";
import { useI18n } from "@/i18n/I18nProvider";

type Props = {
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  onSelectLocation: (lat: number, lng: number) => void;
} & React.ComponentProps<"input">;

function LocationSearch({
  onSelectLocation,
  searchQuery,
  onSearchQueryChange,
  ref,
  ...props
}: Props) {


  const [open, setOpen] = useState(false);
  const debounced = useDebounce(searchQuery, 500);
  const { t } = useI18n();

  const { data: results = [], isFetching } = useAutocompleteQuery(
    { query: debounced },
    { skip: debounced.length < 2 }
  );

  const formatAddress = (loc: Loc) => {
    const a = loc.address || {};
    const road = ((a.house_number || "") + " " + (a.road || "")).trim() || a.name;
    return `${road}, ${a.postcode ?? ""} ${a.city ?? ""}, ${a.country ?? ""}`;
  };

  return (
    <AutocompleteInput
      value={searchQuery}
      open={open}
      onBlur={() => setOpen(false)}
      onOpenChange={setOpen}
      onChange={(e) => onSearchQueryChange(e.target.value)}
      ref={ref}
      options={results}
      renderOption={(loc) => formatAddress(loc)}
      selectOption={(loc) => {
        onSearchQueryChange(formatAddress(loc));
        onSelectLocation(Number(loc.lat), Number(loc.lon));
      }}
      isLoading={isFetching}
      loadingClassName="opacity-50 bg-neutral-200"
      loadingNode={<p className="text-sm absolute text-gray-500">{t("locationSearch.loading")}</p>}
      {...props}
    />
  );
}

export default LocationSearch;
