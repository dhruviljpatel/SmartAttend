import { useState } from "react";
import { Users, BookOpen, Trash2, QrCode } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShareSubjectModal } from "./ShareSubjectModal";

interface SubjectCardProps {
    id?: number;
    name: string;
    code: string;
    section: string;
    students: number;
    classes: number;
    onDelete?: (id: number) => void;
}

export function SubjectCard({ id, name, code, section, students, classes, onDelete }: SubjectCardProps) {
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    return (
        <>
            <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-gray-200 bg-white flex flex-col h-full group">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-xl leading-tight line-clamp-1">{name}</CardTitle>
                        {onDelete && id && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onDelete(id)}
                                className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity -mr-2 -mt-1 rounded-lg"
                                title="Delete subject"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="font-mono text-sm bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200">
                            {code}
                        </Badge>
                        <span className="text-gray-300">|</span>
                        <span className="text-sm text-gray-500">
                            Section: <span className="font-semibold text-gray-700">{section}</span>
                        </span>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 pb-4">
                    <div className="flex items-center gap-4 text-sm pt-4 border-t border-gray-100 mt-2">
                        <div className="flex items-center gap-2 bg-blue-50/50 px-3 py-2 rounded-lg border border-blue-100 flex-1 justify-center transition-colors hover:bg-blue-50">
                            <Users className="w-4 h-4 text-blue-600" />
                            <span className="font-medium text-gray-800">{students} <span className="text-gray-500 font-normal">Students</span></span>
                        </div>
                        <div className="flex items-center gap-2 bg-purple-50/50 px-3 py-2 rounded-lg border border-purple-100 flex-1 justify-center transition-colors hover:bg-purple-50">
                            <BookOpen className="w-4 h-4 text-purple-600" />
                            <span className="font-medium text-gray-800">{classes} <span className="text-gray-500 font-normal">Classes</span></span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="pt-0">
                    <Button
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm transition-all rounded-xl"
                        onClick={() => setIsShareModalOpen(true)}
                    >
                        <QrCode className="w-4 h-4 mr-2" />
                        Share Code & QR
                    </Button>
                </CardFooter>
            </Card>

            {/* SHARE & QR CODE MODAL */}
            <ShareSubjectModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                subject={{ id, name, code, section }}
            />
        </>
    );
}
