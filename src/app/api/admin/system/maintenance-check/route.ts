import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const maintenanceFile = path.join(process.cwd(), ".maintenance");
    const exists = fs.existsSync(maintenanceFile);
    return NextResponse.json({ maintenance: exists });
  } catch (error) {
    console.error("Maintenance check failed:", error);
    return NextResponse.json({ maintenance: false });
  }
}
