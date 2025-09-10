"use client";
import React from "react";

type JobCardProps = {
  id: string;
  title: string | null;
  company: string | null;
  location: string | null;
  isRequest: boolean | null;
  postedAt: string | null;
};

export default function JobCard(props: JobCardProps) {
  const { title, company, location, isRequest, postedAt } = props;
  const dateLabel = postedAt ? new Date(postedAt).toLocaleDateString() : null;
  return (
    <div className="rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">{title ?? "Untitled"}</h3>
          <p className="text-sm text-gray-700">{company ?? "Unknown company"}</p>
        </div>
        {isRequest ? (
          <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
            Request
          </span>
        ) : null}
      </div>
      {location ? <p className="mt-2 text-sm text-gray-500">{location}</p> : null}
      {dateLabel ? <p className="mt-1 text-xs text-gray-400">Posted {dateLabel}</p> : null}
    </div>
  );
}
