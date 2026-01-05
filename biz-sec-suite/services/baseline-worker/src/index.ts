import { runCaptureForCompany } from "./runner/capture";

async function main(): Promise<void> {
  const companyId = process.env.COMPANY_ID;
  if (!companyId) throw new Error("COMPANY_ID required");
  await runCaptureForCompany(companyId);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
