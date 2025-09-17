"use client";
import React from "react";
import OfferHelpButton from "./OfferHelpButton";

export default function JobCard({ title }: { title: string }) {
  return (
    <div className="border rounded p-4 shadow-sm space-y-2">
      <h3 className="font-semibold text-lg">{title}</h3>
      <OfferHelpButton />
    </div>
  );
}
