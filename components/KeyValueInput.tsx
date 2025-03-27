// components/KeyValueInput.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface KeyValuePair {
  key: string;
  value: string;
}

interface KeyValueInputProps {
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
  label: string;
}

export function KeyValueInput({ value, onChange, label }: KeyValueInputProps) {
  const [pairs, setPairs] = useState<KeyValuePair[]>(
    Object.entries(value || {}).map(([key, value]) => ({ key, value }))
  );

  const addPair = () => {
    setPairs([...pairs, { key: "", value: "" }]);
  };

  const updatePair = (
    index: number,
    field: "key" | "value",
    newValue: string
  ) => {
    const newPairs = [...pairs];
    newPairs[index][field] = newValue;
    setPairs(newPairs);
    onChange(Object.fromEntries(newPairs.map((p) => [p.key, p.value])));
  };

  const removePair = (index: number) => {
    const newPairs = pairs.filter((_, i) => i !== index);
    setPairs(newPairs);
    onChange(Object.fromEntries(newPairs.map((p) => [p.key, p.value])));
  };

  return (
    <div className="space-y-2">
      <label className="text-base font-medium">{label}</label>
      {pairs.map((pair, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            placeholder="Key (e.g., Brand)"
            value={pair.key}
            onChange={(e) => updatePair(index, "key", e.target.value)}
          />
          <Input
            placeholder="Value (e.g., Amul)"
            value={pair.value}
            onChange={(e) => updatePair(index, "value", e.target.value)}
          />
          <Button
            variant="destructive"
            size="icon"
            onClick={() => removePair(index)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={addPair}>
        Add {label}
      </Button>
    </div>
  );
}
