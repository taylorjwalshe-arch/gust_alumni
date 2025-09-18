import { NextResponse } from 'next/server'

export async function GET() {
  // Placeholder list of suggested mentors
  const suggestedMentors = [
    {
      id: '1',
      firstName: 'Jane',
      lastName: 'Doe',
      expertise: 'Product Management',
      company: 'TechCorp',
    },
    {
      id: '2',
      firstName: 'John',
      lastName: 'Smith',
      expertise: 'Data Science',
      company: 'DataWorks',
    },
  ]

  return NextResponse.json(suggestedMentors)
}
