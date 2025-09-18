import Link from "next/link";

type Props = {
  id: string;
  firstName: string | null;
  lastName: string | null;
};

export default function DirectoryCard({ id, firstName, lastName }: Props) {
  return (
    <Link
      href={`/directory/${id}`}
      className="block border rounded p-4 hover:shadow"
    >
      <h2 className="text-lg font-semibold">
        {firstName} {lastName}
      </h2>
    </Link>
  );
}
