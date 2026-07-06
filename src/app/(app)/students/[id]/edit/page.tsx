"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StudentForm from "@/components/students/StudentForm";
import Link from "next/link";

export default function EditStudentPage() {
  const params = useParams();
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStudent() {
      try {
        const res = await fetch("/api/students");
        const data = await res.json();
        
        if (data.success) {
          const found = data.data.find((s: any) => s._id === params.id);
          if (found) {
            setStudent(found);
          } else {
            router.push("/students");
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    
    if (params.id) {
      fetchStudent();
    }
  }, [params.id, router]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!student) {
    return null;
  }

  return (
    <>  
      <div className="pt-4 px-4">
        <StudentForm initialData={student} isEdit />
      </div>
    </>
  );
}
