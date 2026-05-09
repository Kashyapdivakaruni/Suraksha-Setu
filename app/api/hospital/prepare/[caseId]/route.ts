import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@/lib/auth";

const prisma = new PrismaClient();

export async function PATCH(req: Request, { params }: { params: { caseId: string } }) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "HOSPITAL") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { caseId } = params;
    const { status, doctorAssigned, bedNumber, preparationNotes } = await req.json();

    const emergencyCase = await prisma.accidentCase.findUnique({
      where: { id: caseId }
    });

    if (!emergencyCase || emergencyCase.assignedHospitalId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden or not found" }, { status: 403 });
    }

    // Update HospitalResponse
    const hospitalResponse = await prisma.hospitalResponse.findFirst({
      where: { caseId, hospitalId: session.user.id }
    });

    if (hospitalResponse) {
      await prisma.hospitalResponse.update({
        where: { id: hospitalResponse.id },
        data: {
          status: status || hospitalResponse.status,
          doctorAssigned: doctorAssigned !== undefined ? doctorAssigned : hospitalResponse.doctorAssigned,
          bedNumber: bedNumber !== undefined ? bedNumber : hospitalResponse.bedNumber,
          preparationNotes: preparationNotes !== undefined ? preparationNotes : hospitalResponse.preparationNotes
        }
      });
    }

    // Sync status to AccidentCase if required
    let updatedCaseStatus = emergencyCase.status;
    if (status === "ADMITTED") updatedCaseStatus = "ADMITTED";
    if (status === "UNDER_TREATMENT") updatedCaseStatus = "UNDER_TREATMENT";
    if (status === "STABLE") updatedCaseStatus = "STABLE";
    if (status === "CRITICAL") updatedCaseStatus = "CRITICAL";

    if (updatedCaseStatus !== emergencyCase.status) {
      await prisma.accidentCase.update({
        where: { id: caseId },
        data: { status: updatedCaseStatus }
      });
    }

    await prisma.auditLog.create({
      data: {
        action: "HOSPITAL_STATUS_UPDATE",
        entityType: "ACCIDENT_CASE",
        entityId: caseId,
        userId: session.user.id,
        role: "HOSPITAL",
        details: `Hospital status updated to ${status}`
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Hospital Prepare PATCH Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
