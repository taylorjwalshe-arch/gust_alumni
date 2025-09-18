"use client";

import { DirectoryFilters } from "./DirectoryFilters";
import React from "react";
import DirectoryCard from "./DirectoryCard";

export default function DirectoryView() {
  return (
    <div className="space-y-4">
      <DirectoryFilters />
      <DirectoryCard person={person} />
    </div>
  );
}
