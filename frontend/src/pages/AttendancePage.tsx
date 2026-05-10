import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {AttendanceSchema,type AttendanceInput,} from "../schemas/attendance";
import { Input, Label, Select, Button } from "../lib/FormField";

export default function AttendancePage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AttendanceInput>({
    resolver: zodResolver(AttendanceSchema),
    defaultValues: {
      date: "",
      inTime: "",
      outTime: "",
      status: "Present",
      rollNo: "",
    },
  });

  function onSubmit(data: AttendanceInput) {
    console.log("Attendance submit:", data);
    alert("✅ Attendance saved!");
    reset({ ...data, inTime: "", outTime: "" });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-blue-800 text-white">
      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
          <h1 className="text-2xl font-bold mb-4">Attendance — Mark</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-black">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  {...register("date")}
                  error={errors.date?.message}
                />
              </div>
              <div>
                <Label>Roll No (2 digits)</Label>
                <Input
                  placeholder="02"
                  {...register("rollNo")}
                  error={errors.rollNo?.message}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>In Time (HH:MM)</Label>
                <Input
                  placeholder="09:00"
                  {...register("inTime")}
                  error={errors.inTime?.message}
                />
              </div>
              <div>
                <Label>Out Time (HH:MM)</Label>
                <Input
                  placeholder="15:30"
                  {...register("outTime")}
                  error={errors.outTime?.message}
                />
              </div>
            </div>

            <div>
              <Label>Status</Label>
              <Select {...register("status")} error={errors.status?.message}>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
              </Select>
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Mark Attendance"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
