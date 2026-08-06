import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';

export function TeacherLogin() {
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });
    const navigate = useNavigate();

    function Login(e: React.FormEvent) {
        e.preventDefault();
        navigate(`/teacher/dashboard?name=${formData.username}`);
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md relative shadow-xl border-0">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute left-4 top-4 rounded-full text-gray-500 hover:text-gray-900"
                    onClick={() => navigate('/')}
                >
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <CardHeader className="text-center pb-8 pt-12">
                    <CardTitle className="text-3xl font-bold tracking-tight">Teacher Login</CardTitle>
                    <CardDescription>Enter your credentials to access the portal</CardDescription>
                </CardHeader>
                <form onSubmit={Login}>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="@someone"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                                className="h-12"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                className="h-12"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button type="submit" className="w-full h-12 text-md font-medium">
                            Login
                            <kbd className="ml-2 hidden sm:inline-flex items-center gap-1 rounded border border-white/20 bg-white/10 px-1.5 font-mono text-[10px] font-medium text-white">
                                <span className="text-xs">⌘</span>Enter
                            </kbd>
                        </Button>
                        <Button 
                            type="button" 
                            variant="outline" 
                            className="w-full h-12 text-md font-medium"
                            onClick={() => navigate('/teacher-register')}
                        >
                            Create an account
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}