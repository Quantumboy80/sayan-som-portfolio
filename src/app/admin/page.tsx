'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import React, { useState } from 'react';

export default function AdminPage() {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password }),
        });

        if (res.ok) {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('Invalid password');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <Card className="w-full max-w-sm">
                    <CardHeader>
                        <CardTitle>Admin Login</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter admin password"
                                />
                            </div>
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            <Button type="submit" className="w-full">
                                Login
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const files = [
        { name: 'Hero Section', file: 'hero.json' },
        { name: 'About Section', file: 'about.json' },
        { name: 'Projects Section', file: 'projects.json' },
        { name: 'Experience Section', file: 'experience.json' },
        { name: 'Site Settings', file: 'settings.json' },
    ];

    return (
        <div className="container mx-auto py-10">
            <h1 className="mb-8 text-3xl font-bold">Content Management</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {files.map((item) => (
                    <Card key={item.file}>
                        <CardHeader>
                            <CardTitle>{item.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Link href={`/admin/edit/${item.file}`}>
                                <Button className="w-full">Edit Content</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
