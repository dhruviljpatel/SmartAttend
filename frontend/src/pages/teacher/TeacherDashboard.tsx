import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "../../components/Header";
import { TeacherTabs } from "../../components/teacher/TeacherTabs";

export function TeacherDashboard() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const queryName = searchParams.get("name");

    // Derive teacher name synchronously from query params or localStorage
    const getTeacherName = () => {
        if (queryName) return queryName;
        try {
            const teacherData = localStorage.getItem("teacher");
            if (teacherData) {
                const parsed = JSON.parse(teacherData);
                return parsed.name || "";
            }
        } catch {
            // ignore JSON parse errors
        }
        return "";
    };

    const teacherName = getTeacherName();

    useEffect(() => {
        const token = localStorage.getItem("token");
        // Protect route: redirect to login if not authenticated
        if (!token) {
            navigate("/teacher-login");
        }
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <div className="flex-1 w-full mx-auto">
                <TeacherTabs name={teacherName} />
            </div>
        </div>
    );
}