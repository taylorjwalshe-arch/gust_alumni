import JobsView from "@/components/jobs/JobsView";

export default function Page() {
  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Jobs</h1>
      <JobsView />
    </div>
  );
}
