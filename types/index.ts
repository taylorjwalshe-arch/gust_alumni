export type PersonRole = "alumni" | "student";
export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  role: PersonRole;
  email?: string;
  gradYear?: number;
  industry?: string;
  company?: string;
  location?: string;
}
