import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';
import { api } from '@/lib/api';

export function TeacherLogin() {
    const navigate = useNavigate();
    const location = useLocation();

    // Check if user was redirected from registration
    const registrationState = location.state as { registered?: boolean; username?: string } | null;

    const [formData, setFormData] = useState({
        username: registrationState?.username || '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            // Axios automatically serializes the body to JSON and parses the response data
            const response = await api.post('/auth/teacher/login', {
                username: formData.username.trim(),
                password: formData.password,
            });

            const data = response.data;

            // Save the JWT token and user info to localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('teacher', JSON.stringify(data.teacher));

            // Navigate to dashboard with teacher's display name
            navigate(`/teacher/dashboard?name=${encodeURIComponent(data.teacher.name)}`);
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                // Axios captures non-2xx responses (like 400, 401) in err.response
                setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
            <Card className="w-full max-w-md md:max-w-lg relative shadow-xl border-0 transition-all duration-300">
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
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-6">
                        {registrationState?.registered && (
                            <div className="p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg">
                                Account created successfully! Please enter your password to log in.
                            </div>
                        )}
                        {error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                                {error}
                            </div>
                        )}
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
                        <Button type="submit" disabled={isLoading} className="w-full h-12 text-md font-medium">
                            {isLoading ? 'Signing in...' : 'Login'}
                            {!isLoading && (
                                <kbd className="ml-2 hidden sm:inline-flex items-center gap-1 rounded border border-white/20 bg-white/10 px-1.5 font-mono text-[10px] font-medium text-white">
                                    <span className="text-xs">⌘</span>Enter
                                </kbd>
                            )}
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