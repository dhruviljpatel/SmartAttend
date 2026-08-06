import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export function TeacherRegister() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-xl border-0">
                <CardHeader className="text-center pb-8 pt-8">
                    <CardTitle className="text-3xl font-bold tracking-tight">Teacher Registration</CardTitle>
                    <CardDescription>Create a new teacher account</CardDescription>
                </CardHeader>
                <form onSubmit={(e) => { e.preventDefault(); navigate('/teacher-login'); }}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" type="text" placeholder="@someone" required className="h-11" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" type="text" placeholder="John Doe" required className="h-11" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" placeholder="••••••••" required className="h-11" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input id="confirmPassword" type="password" placeholder="••••••••" required className="h-11" />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 mt-4">
                        <Button type="submit" className="w-full h-12 text-md font-medium">
                            Register
                        </Button>
                        <Button 
                            type="button" 
                            variant="ghost" 
                            className="w-full"
                            onClick={() => navigate('/teacher-login')}
                        >
                            Already have an account? Login
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}