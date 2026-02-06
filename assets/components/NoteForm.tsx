import React, { useState } from 'react';
import styled from 'styled-components';
import { api, Note, Category, NoteInput } from '../services/api';

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const Label = styled.label`
    font-weight: 500;
    color: #333;
    margin-bottom: 4px;
`;

const Input = styled.input`
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    &:focus {
        outline: none;
        border-color: #007bff;
    }
`;

const TextArea = styled.textarea`
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    min-height: 150px;
    resize: vertical;
    font-family: inherit;
    &:focus {
        outline: none;
        border-color: #007bff;
    }
`;

const Select = styled.select`
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    background: white;
    cursor: pointer;
    &:focus {
        outline: none;
        border-color: #007bff;
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 10px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
    padding: 12px 24px;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    background-color: ${props => props.variant === 'secondary' ? '#6c757d' : '#007bff'};
    color: white;
    &:hover {
        opacity: 0.9;
    }
    &:disabled {
        background-color: #ccc;
        cursor: not-allowed;
    }
`;

const ErrorMessage = styled.div`
    color: #dc3545;
    background-color: #f8d7da;
    padding: 12px;
    border-radius: 4px;
    font-size: 14px;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
`;

interface NoteFormProps {
    note?: Note | null;
    categories: Category[];
    onSuccess: () => void;
    onCancel: () => void;
}

export const NoteForm: React.FC<NoteFormProps> = ({ note, categories, onSuccess, onCancel }) => {
    const [title, setTitle] = useState(note?.title || '');
    const [content, setContent] = useState(note?.content || '');
    const [status, setStatus] = useState(note?.status || 'new');
    const [categoryId, setCategoryId] = useState<string>(note?.category?.id?.toString() || '');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!title.trim()) {
            setError('Title is required');
            return;
        }

        if (!content.trim()) {
            setError('Content is required');
            return;
        }

        setLoading(true);

        const data: NoteInput = {
            title: title.trim(),
            content: content.trim(),
            status,
            categoryId: categoryId ? parseInt(categoryId) : null,
        };

        const response = note
            ? await api.updateNote(note.id, data)
            : await api.createNote(data);

        if (response.error) {
            setError(response.error);
            setLoading(false);
            return;
        }

        onSuccess();
    };

    return (
        <Form onSubmit={handleSubmit}>
            {error && <ErrorMessage>{error}</ErrorMessage>}

            <FormGroup>
                <Label htmlFor="title">Title</Label>
                <Input
                    id="title"
                    type="text"
                    placeholder="Enter note title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={loading}
                />
            </FormGroup>

            <FormGroup>
                <Label htmlFor="content">Content</Label>
                <TextArea
                    id="content"
                    placeholder="Enter note content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={loading}
                />
            </FormGroup>

            <FormGroup>
                <Label htmlFor="status">Status</Label>
                <Select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={loading}
                >
                    <option value="new">New</option>
                    <option value="todo">Todo</option>
                    <option value="done">Done</option>
                </Select>
            </FormGroup>

            <FormGroup>
                <Label htmlFor="category">Category</Label>
                <Select
                    id="category"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    disabled={loading}
                >
                    <option value="">No Category</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </Select>
            </FormGroup>

            <ButtonGroup>
                <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
                    Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : (note ? 'Update Note' : 'Create Note')}
                </Button>
            </ButtonGroup>
        </Form>
    );
};
