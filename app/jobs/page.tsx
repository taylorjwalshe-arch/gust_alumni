import JobCard from "@/components/jobs/JobCard";

export default function JobsPage() {
  const jobs = [
    { id: 1, title: "VC Internship at Sequoia" },
    { id: 2, title: "Operations Associate at Anduril" },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Jobs</h1>
      {jobs.map((job) => (
        <JobCard key={job.id} title={job.title} />
      ))}
    </div>
  );
}
