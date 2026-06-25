'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function EditContentPage() {
    const params = useParams();
    const router = useRouter();
    const filename = params.filename as string;

    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await fetch(`/api/content/${filename}`);
                if (!res.ok) throw new Error('Failed to fetch content');
                const data = await res.json();
                setContent(JSON.stringify(data, null, 2));
            } catch (error) {
                toast.error('Error loading content');
            } finally {
                setLoading(false);
            }
        };

        if (filename) {
            fetchContent();
        }
    }, [filename]);

    const handleSave = async () => {
        try {
            // Validate JSON
            const json = JSON.parse(content);

            const res = await fetch(`/api/content/${filename}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(json),
            });

            if (!res.ok) throw new Error('Failed to save');

            toast.success('Content saved successfully');
            router.push('/admin');
        } catch (error) {
            if (error instanceof SyntaxError) {
                toast.error('Invalid JSON format');
            } else {
                toast.error('Error saving content');
            }
        }
    };

    if (loading) {
        return <div className="p-10">Loading...</div>;
    }

    return (
        <div className="container mx-auto py-10">
            <Card>
                <CardHeader>
                    <CardTitle>Editing: {filename}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="min-h-[500px] font-mono"
                    />
                    <div className="flex gap-4">
                        <Button onClick={handleSave}>Save Changes</Button>
                        <Button variant="outline" onClick={() => router.back()}>
                            Cancel
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
