import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  await db.person.deleteMany();

  await db.person.createMany({
    data: [
      {
        firstName: "Kate",
        lastName: "Canty",
        email: "Kwcanty@gmail.com",
        role: "alumni",
        gradYear: 2012,
        industries: ["Healthcare"] as any,
        company: "Boston Children's Hospital",
        location: "Boston",
        expertise: ["Grad School Advice", "Early Career Mentorship"] as any,
        contactPermission: true,
        teamAffiliation: "Team Alum",
      },
      {
        firstName: "Rebekah",
        lastName: "Morrison",
        email: "rebekahmmorrison@gmail.com",
        role: "alumni",
        gradYear: 2023,
        industries: ["Nonprofit", "Education"] as any,
        company: "District of Columbia Public Schools",
        location: "DC",
        priorExperience: "Teach For America + getting my masters degree at JHU",
        expertise: [
          "Resume Review / Application Feedback",
          "Networking / Job Referrals",
          "Breaking into My Industry",
          "Early Career Mentorship"
        ] as any,
        contactPermission: true,
        bio: "I joined Teach For America right after graduation... happy to talk about all things education, non-profit, and public service.",
        teamAffiliation: "Team Alum",
      },
      {
        firstName: "Olivia",
        lastName: "van den Born",
        email: "omv2@georgetown.edu",
        role: "alumni",
        gradYear: 2021,
        industries: ["Public Sector", "Entrepreneurship", "Tech"] as any,
        company: "Vannevar Labs",
        location: "DC",
        priorExperience: "Department of the Air Force; Department of Defense; MA Security Studies from Georgetown SFS",
        expertise: [
          "Resume Review / Application Feedback",
          "Interview Prep",
          "Grad School Advice",
          "Networking / Job Referrals",
          "Navigating Career Pivots",
          "Breaking into My Industry",
          "Early Career Mentorship"
        ] as any,
        contactPermission: true,
        teamAffiliation: "Team Alum",
      },
      {
        firstName: "Sarah",
        lastName: "Baker",
        email: "s.nasonbaker@gmail.com",
        role: "student",
        gradYear: 2020,
        industries: ["Healthcare"] as any,
        company: "Hackensack Meridian School of Medicine",
        location: "Hoboken, NJ",
        priorExperience: "Georgetown Pre-Med Post-Bac Program; Telecare Anywhere; MGH - medical assistant & research coordinator",
        expertise: ["Grad School Advice"] as any,
        contactPermission: true,
        bio: "I graduated from Georgetown in 2020, attended Pre-Med Post-Bac, worked at MGH Fertility Center, then Anesthesia Dept. Currently med student aiming for OBGYN.",
        teamAffiliation: "Team Alum",
      },
      {
        firstName: "Marley",
        lastName: "Mais",
        email: "maismarley@gmail.com",
        role: "alumni",
        gradYear: 2021,
        industries: ["Healthcare"] as any,
        company: "Opentrons Labworks",
        location: "DC",
        expertise: ["Early Career Mentorship"] as any,
        contactPermission: true,
        bio: "Graduated in 2021, worked 3 different roles at Opentrons with annual promotions. Experience in sales, now account manager.",
        teamAffiliation: "Team Alum",
      }
    ],
  });

  console.log("✅ Database seeded.");
}

main().finally(() => db.$disconnect());
