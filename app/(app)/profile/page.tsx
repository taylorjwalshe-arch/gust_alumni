import ProfileForm from "@/components/profile/ProfileForm";

export default function Page() {
  return (
    <div className="mx-auto max-w-2xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">Create or Claim Your Profile</h1>
      <p className="text-sm text-gray-600">
        Paste your existing Person ID to claim, or fill in details to create a new profile.
      </p>
      <ProfileForm />
    </div>
  );
}
