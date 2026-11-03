import { useState, useEffect } from "react";
import { SubjectCard } from "./SubjectCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, AlertCircle, Sparkles, BookOpen, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { Icons8BookStack } from "@/components/ui/Icons";

export interface SubjectItem {
    id: number;
    name: string;
    code: string;
    subjectCode?: string;
    section: string;
    students: number;
    classes: number;
}

export function ManageSubjects() {
    const [subjects, setSubjects] = useState<SubjectItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [section, setSection] = useState("A");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Fetch subjects from backend on mount
    const fetchSubjects = async () => {
        setIsLoading(true);
        setFetchError(null);
        try {
            let teacherId: number | null = null;
            const teacherRaw = localStorage.getItem("teacher");
            if (teacherRaw) {
                try {
                    const parsed = JSON.parse(teacherRaw);
                    if (parsed.id) teacherId = parsed.id;
                } catch {
                    // ignore
                }
            }

            const url = teacherId ? `/subjects?teacherId=${teacherId}` : "/subjects";
            const res = await api.get(url);
            setSubjects(res.data || []);
        } catch (err: any) {
            console.error("Error loading subjects:", err);
            setFetchError(
                err.response?.data?.error || "Failed to load subjects. Please check backend connection."
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    // Handle Create Subject Form Submit
    const handleCreateSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!name.trim()) {
            setFormError("Please enter a subject name.");
            return;
        }

        if (!code.trim()) {
            setFormError("Please enter a subject code (e.g. CS-401).");
            return;
        }

        setIsSubmitting(true);

        try {
            let teacherId: number | null = null;
            const teacherRaw = localStorage.getItem("teacher");
            if (teacherRaw) {
                try {
                    const parsed = JSON.parse(teacherRaw);
                    if (parsed.id) teacherId = parsed.id;
                } catch {
                    // ignore
                }
            }

            const res = await api.post("/subjects", {
                name: name.trim(),
                subjectCode: code.trim(),
                section: section.trim() || "A",
                teacherId,
            });

            if (res.data?.subject) {
                // Prepend new subject to state so it reflects immediately
                setSubjects((prev) => [res.data.subject, ...prev]);
                // Reset form & close modal
                setName("");
                setCode("");
                setSection("A");
                setIsModalOpen(false);
            }
        } catch (err: any) {
            console.error("Error creating subject:", err);
            setFormError(
                err.response?.data?.error || "Failed to create subject in database. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle Subject Deletion
    const handleDeleteSubject = async (subjectId: number) => {
        if (!confirm("Are you sure you want to delete this subject? This action cannot be undone.")) {
            return;
        }

        try {
            await api.delete(`/subjects/${subjectId}`);
            setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
        } catch (err: any) {
            console.error("Error deleting subject:", err);
            alert(err.response?.data?.error || "Failed to delete subject.");
        }
    };

    return (
        <div className="flex flex-col gap-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-900 tracking-tight flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-indigo-600" />
                        Manage Subjects
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                        Create and organize subjects stored in your database
                    </p>
                </div>

                <Button
                    onClick={() => {
                        setFormError(null);
                        setIsModalOpen(true);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md rounded-xl h-11 px-5"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Subject
                </Button>
            </div>

            {/* ERROR ALERT */}
            {fetchError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between text-red-700 text-sm">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span>{fetchError}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchSubjects} className="h-8 text-xs">
                        Retry
                    </Button>
                </div>
            )}

            {/* LOADING STATE */}
            {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    <p className="text-sm font-medium">Loading subjects from database...</p>
                </div>
            ) : subjects.length === 0 ? (
                /* EMPTY STATE */
                <div className="py-16 px-4 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 shadow-sm">
                        <Icons8BookStack className="w-9 h-9" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No subjects created yet</h3>
                    <p className="text-sm text-gray-500 max-w-sm mb-6">
                        Get started by adding your first subject. It will be stored in your PostgreSQL database and ready for facial attendance.
                    </p>
                    <Button
                        onClick={() => {
                            setFormError(null);
                            setIsModalOpen(true);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md rounded-xl"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Subject
                    </Button>
                </div>
            ) : (
                /* SUBJECT CARDS GRID */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjects.map((subject) => (
                        <SubjectCard
                            key={subject.id}
                            id={subject.id}
                            name={subject.name}
                            code={subject.code}
                            section={subject.section}
                            students={subject.students}
                            classes={subject.classes}
                            onDelete={handleDeleteSubject}
                        />
                    ))}
                </div>
            )}

            {/* CREATE SUBJECT MODAL DIALOG */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div
                        className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* MODAL HEADER */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-slate-50/60">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Create New Subject</h3>
                                    <p className="text-xs text-gray-500">Add course details to database</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsModalOpen(false)}
                                className="rounded-full text-gray-400 hover:text-gray-700 h-8 w-8"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* MODAL FORM */}
                        <form onSubmit={handleCreateSubject} className="p-6 space-y-4">
                            {formError && (
                                <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{formError}</span>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <Label htmlFor="subjectName" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Subject Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="subjectName"
                                    type="text"
                                    placeholder="e.g. Machine Learning"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="h-11 rounded-xl text-sm"
                                    autoFocus
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="subjectCode" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Subject Code <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="subjectCode"
                                        type="text"
                                        placeholder="e.g. CS-501"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        className="h-11 rounded-xl text-sm uppercase"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="subjectSection" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Section
                                    </Label>
                                    <Input
                                        id="subjectSection"
                                        type="text"
                                        placeholder="e.g. A"
                                        value={section}
                                        onChange={(e) => setSection(e.target.value)}
                                        className="h-11 rounded-xl text-sm"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsModalOpen(false)}
                                    disabled={isSubmitting}
                                    className="h-11 rounded-xl px-5 border-gray-200"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || !name.trim() || !code.trim()}
                                    className="h-11 rounded-xl px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md shadow-indigo-500/20"
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Saving to DB...</span>
                                        </div>
                                    ) : (
                                        "Create Subject"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
