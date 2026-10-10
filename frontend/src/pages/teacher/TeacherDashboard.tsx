import { useSearchParams } from "react-router-dom";
import { Header } from "../../components/Header";
import { TeacherTabs } from "../../components/teacher/TeacherTabs";

export function TeacherDashboard() {
    const [searchParams] = useSearchParams();
    const name = searchParams.get("name") || "";

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <div className="flex-1 w-full mx-auto">
                <TeacherTabs name={name} />
            </div>
        </div>
    )
}