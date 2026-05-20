"use client";
import { useEffect, useState } from "react";
import { getRegions } from "../../services/regions/regions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

export const RegionSelect = ({ value, onChange, className }) => {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRegions = async () => {
      try {
        const data = await getRegions();
        setRegions(data);
      } catch (error) {
        console.error("Failed to load regions:", error);
      } finally {
        setLoading(false);
      }
    };
    loadRegions();
  }, []);

  return (
    <Select
      value={value}
      onValueChange={onChange}
      disabled={loading}
      className={className}
    >
      <SelectTrigger>
        <SelectValue
          placeholder={loading ? "Loading regions..." : "Select a region"}
        />
      </SelectTrigger>
      <SelectContent>
        {regions.map((region) => (
          <SelectItem key={region._id} value={region._id}>
            {region.name.fr} / {region.name.ar}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
