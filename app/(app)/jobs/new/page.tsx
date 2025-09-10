import JobNewForm from "@/components/jobs/JobNewForm";

export default function Page() {
  return (
    <div className="mx-auto max-w-2xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">Post a Job or Request</h1>
      <JobNewForm />
    </div>
  );
}
