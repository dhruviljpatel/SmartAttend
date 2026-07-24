import { useSearchParams } from "react-router-dom";
import { Header } from "../../components/Header";
import { TeacherTabs } from "../../components/teacher/TeacherTabs";

export function TeacherDashboard() {
    const [searchParams] = useSearchParams();
    const name = searchParams.get("name");

    return (
        <div>
            <Header />
            <TeacherTabs
                name={name}
            />
        </div>
    )
}