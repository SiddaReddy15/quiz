import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const totalExamsRes = await db.execute("SELECT COUNT(*) as count FROM exams");
    const totalStudentsRes = await db.execute("SELECT COUNT(*) as count FROM users WHERE role = 'STUDENT'");
    const totalSubmissionsRes = await db.execute("SELECT COUNT(*) as count FROM attempts WHERE status = 'SUBMITTED'");
    
    // LibSQL datetime('now') works well
    const upcomingExamsRes = await db.execute("SELECT COUNT(*) as count FROM exams WHERE start_time > datetime('now')");

    return NextResponse.json({
      totalExams: totalExamsRes.rows[0].count,
      totalStudents: totalStudentsRes.rows[0].count,
      totalSubmissions: totalSubmissionsRes.rows[0].count,
      upcomingExams: upcomingExamsRes.rows[0].count,
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
