import { Users, BookOpen, Share2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SubjectCardProps {
    name: string;
    code: string;
    section: string;
    students: number;
    classes: number;
}

export function SubjectCard({ name, code, section, students, classes }: SubjectCardProps) {
    return (
        <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-gray-200 bg-white flex flex-col h-full">
            <CardHeader className="pb-3">
                <CardTitle className="text-xl leading-tight line-clamp-1">{name}</CardTitle>
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
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-all" onClick={() => console.log('Share code logic here')}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Code
                </Button>
            </CardFooter>
        </Card>
    );
}
