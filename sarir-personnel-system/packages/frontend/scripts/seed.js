const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  let hr = null;
  try {
    // اگر در مدل departments داری:
    hr = await p.departments.upsert({
      where: { code: "HR" },
      update: {},
      create: { name: "اداری", code: "HR" },
    });
  } catch (_) {
    // اگر مدل departments در Prisma نیست، صرف‌نظر کن
  }

  const emp = await p.employees.create({
    data: {
      first_name: "علی",
      last_name: "نمونه",
      emp_code: "E-1001",
      position: "کارشناس",
      phone: "09120000000",
      email: "ali@example.com",
      department_id: hr?.id ?? null,
    },
  });

  console.log("Seeded:", { employee: emp.emp_code });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await p.$disconnect();
  });
