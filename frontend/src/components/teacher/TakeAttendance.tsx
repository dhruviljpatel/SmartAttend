import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Camera, Trash2, Mic, Plus } from 'lucide-react';

export function TakeAttendance() {
    const [subjects] = useState<string[]>(['Computer Networks', 'Machine Learning', 'Data Structures']); // Added some dummies so the select works visually
    const [selectedSubject, setSelectedSubject] = useState('');

    return (
        <div className="flex flex-col gap-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Take AI Attendance</h2>
                <Button variant="outline" className="text-gray-700 font-medium">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Photos
                </Button>
            </div>

            <div className="flex flex-col gap-3 max-w-sm">
                <Label htmlFor="subject-select" className="text-sm font-medium text-gray-700">Select Subject</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger id="subject-select" className="h-11">
                        <SelectValue placeholder="Select a subject..." />
                    </SelectTrigger>
                    <SelectContent>
                        {subjects.length === 0 ? (
                            <SelectItem value="none" disabled>No options available</SelectItem>
                        ) : (
                            subjects.map((sub, index) => (
                                <SelectItem key={index} value={sub}>{sub}</SelectItem>
                            ))
                        )}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-gray-100">
                <Button variant="destructive" size="lg" className="h-12 px-6">
                    <Trash2 className="w-5 h-5 mr-2" />
                    Clear Photos
                </Button>
                <Button size="lg" className="h-12 px-6 bg-indigo-600 hover:bg-indigo-700">
                    <Camera className="w-5 h-5 mr-2" />
                    Run Face Analysis
                </Button>
                <Button size="lg" className="h-12 px-6 bg-purple-600 hover:bg-purple-700">
                    <Mic className="w-5 h-5 mr-2" />
                    Use Voice Attendance
                </Button>
            </div>
        </div>
    );
}
