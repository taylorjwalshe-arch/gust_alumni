import Link from "next/link";
import JobsView from "@/components/jobs/JobsView";

export default function Page() {
  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Jobs</h1>
        <Link
          href="/jobs/new"
          className="rounded-2xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Post a job
        </Link>
      </div>
      <JobsView />
    </div>
  );
}
