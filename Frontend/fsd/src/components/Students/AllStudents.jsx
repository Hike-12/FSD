import React, { useEffect, useState } from "react";
import DJANGO_BASE_URL from "../utils";

const AllStudents = () => {
    const [students, setStudents] = useState([]);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await fetch(`${DJANGO_BASE_URL}/api/students/`);
                if (!response.ok) {
                    throw new Error("Failed to fetch students");
                }
                const data = await response.json();
                setStudents(data);
            } catch (error) {
                console.error("Error fetching students:", error);
            }
        };

        fetchStudents();
    }, []);

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h2 className="text-3xl font-bold text-center mb-6">Student Profiles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {students.map((student) => (
                    <div key={student.id} className="bg-white p-4 rounded-lg shadow-lg">
                        <h3 className="text-xl font-semibold">{student.full_name || "Unnamed"}</h3>
                        <p className="text-gray-600">ID: {student.student_id || "N/A"}</p>
                        <p className="text-gray-600">Gender: {student.gender}</p>
                        <p className="text-gray-600">Department: {student.department || "N/A"}</p>
                        <p className="text-gray-600">Year: {student.year_of_study || "N/A"}</p>
                        <p className="text-gray-600">GPA: {student.gpa || "N/A"}</p>
                        <p className="text-gray-600">Career Goal: {student.career_goal || "N/A"}</p>
                        <p className="text-gray-600">Hobbies: {student.hobbies || "N/A"}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AllStudents;
