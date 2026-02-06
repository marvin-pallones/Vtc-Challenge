import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { api, Note, Category } from '../services/api';
import { NoteForm } from './NoteForm';

const Container = styled.div`
    width: 100%;
    max-width: 1000px;
    padding: 20px;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 10px;
`;

const Title = styled.h1`
    margin: 0;
    color: #333;
`;

const Filters = styled.div`
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    flex-wrap: wrap;
`;

const SearchInput = styled.input`
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    flex: 1;
    min-width: 200px;
    &:focus {
        outline: none;
        border-color: #007bff;
    }
`;

const Select = styled.select`
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    min-width: 150px;
    background: white;
    cursor: pointer;
    &:focus {
        outline: none;
        border-color: #007bff;
    }
`;

const Button = styled.button<{ variant?: 'primary' | 'danger' | 'secondary' }>`
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    background-color: ${props => {
        if (props.variant === 'danger') return '#dc3545';
        if (props.variant === 'secondary') return '#6c757d';
        return '#007bff';
    }};
    color: white;
    &:hover {
        opacity: 0.9;
    }
`;

const NoteCard = styled.div`
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 12px;
    cursor: pointer;
    transition: box-shadow 0.2s;
    &:hover {
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
`;

const NoteTitle = styled.h3`
    margin: 0 0 8px 0;
    color: #333;
`;

const NoteContent = styled.p`
    margin: 0 0 12px 0;
    color: #666;
    font-size: 14px;
    white-space: pre-wrap;
    max-height: 60px;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const NoteMeta = styled.div`
    display: flex;
    gap: 12px;
    font-size: 12px;
    color: #888;
    flex-wrap: wrap;
`;

const StatusBadge = styled.span<{ status: string }>`
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    background-color: ${props => {
        if (props.status === 'done') return '#28a745';
        if (props.status === 'todo') return '#ffc107';
        return '#17a2b8';
    }};
    color: ${props => props.status === 'todo' ? '#333' : 'white'};
`;

const CategoryBadge = styled.span`
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    background-color: #6c757d;
    color: white;
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 40px;
    color: #666;
`;

const Modal = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 20px;
`;

const ModalContent = styled.div`
    background: white;
    border-radius: 8px;
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #ddd;
`;

const ModalTitle = styled.h2`
    margin: 0;
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
    &:hover {
        color: #333;
    }
`;

const ModalBody = styled.div`
    padding: 20px;
`;

export const NotesList: React.FC = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const loadNotes = async () => {
        const params: { search?: string; status?: string; category?: number } = {};
        if (search) params.search = search;
        if (statusFilter) params.status = statusFilter;
        if (categoryFilter) params.category = parseInt(categoryFilter);

        const { data } = await api.getNotes(params);
        setNotes(data?.notes || []);
    };

    const loadCategories = async () => {
        const { data } = await api.getCategories();
        setCategories(data?.categories || []);
    };

    useEffect(() => {
        const init = async () => {
            await Promise.all([loadNotes(), loadCategories()]);
            setLoading(false);
        };
        init();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadNotes();
        }, 300);
        return () => clearTimeout(timer);
    }, [search, statusFilter, categoryFilter]);

    const handleNoteClick = (note: Note) => {
        setEditingNote(note);
        setShowForm(true);
    };

    const handleCreateNote = () => {
        setEditingNote(null);
        setShowForm(true);
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditingNote(null);
    };

    const handleFormSuccess = () => {
        handleFormClose();
        loadNotes();
    };

    const handleDeleteNote = async (note: Note) => {
        if (confirm('Are you sure you want to delete this note?')) {
            await api.deleteNote(note.id);
            loadNotes();
        }
    };

    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        const { error } = await api.createCategory(newCategoryName.trim());
        if (!error) {
            setNewCategoryName('');
            loadCategories();
        }
    };

    const handleDeleteCategory = async (id: number) => {
        if (confirm('Are you sure you want to delete this category?')) {
            await api.deleteCategory(id);
            loadCategories();
            if (categoryFilter === String(id)) {
                setCategoryFilter('');
            }
        }
    };

    if (loading) {
        return <Container><p>Loading...</p></Container>;
    }

    return (
        <Container>
            <Header>
                <Title>My Notes</Title>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Button variant="secondary" onClick={() => setShowCategoryModal(true)}>
                        Manage Categories
                    </Button>
                    <Button onClick={handleCreateNote}>+ New Note</Button>
                </div>
            </Header>

            <Filters>
                <SearchInput
                    type="text"
                    placeholder="Search notes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">All Statuses</option>
                    <option value="new">New</option>
                    <option value="todo">Todo</option>
                    <option value="done">Done</option>
                </Select>
                <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </Select>
            </Filters>

            {notes.length === 0 ? (
                <EmptyState>
                    <p>No notes found.</p>
                    <Button onClick={handleCreateNote}>Create your first note</Button>
                </EmptyState>
            ) : (
                notes.map(note => (
                    <NoteCard key={note.id} onClick={() => handleNoteClick(note)}>
                        <NoteTitle>{note.title}</NoteTitle>
                        <NoteContent>{note.content}</NoteContent>
                        <NoteMeta>
                            <StatusBadge status={note.status}>{note.status}</StatusBadge>
                            {note.category && <CategoryBadge>{note.category.name}</CategoryBadge>}
                            <span>Updated: {new Date(note.updatedAt).toLocaleDateString()}</span>
                            <Button
                                variant="danger"
                                style={{ padding: '4px 8px', marginLeft: 'auto' }}
                                onClick={(e) => { e.stopPropagation(); handleDeleteNote(note); }}
                            >
                                Delete
                            </Button>
                        </NoteMeta>
                    </NoteCard>
                ))
            )}

            {showForm && (
                <Modal onClick={handleFormClose}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <ModalHeader>
                            <ModalTitle>{editingNote ? 'Edit Note' : 'New Note'}</ModalTitle>
                            <CloseButton onClick={handleFormClose}>&times;</CloseButton>
                        </ModalHeader>
                        <ModalBody>
                            <NoteForm
                                note={editingNote}
                                categories={categories}
                                onSuccess={handleFormSuccess}
                                onCancel={handleFormClose}
                            />
                        </ModalBody>
                    </ModalContent>
                </Modal>
            )}

            {showCategoryModal && (
                <Modal onClick={() => setShowCategoryModal(false)}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <ModalHeader>
                            <ModalTitle>Manage Categories</ModalTitle>
                            <CloseButton onClick={() => setShowCategoryModal(false)}>&times;</CloseButton>
                        </ModalHeader>
                        <ModalBody>
                            <form onSubmit={handleCreateCategory} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                                <SearchInput
                                    type="text"
                                    placeholder="New category name"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    style={{ flex: 1 }}
                                />
                                <Button type="submit">Add</Button>
                            </form>
                            {categories.length === 0 ? (
                                <p style={{ color: '#666' }}>No categories yet.</p>
                            ) : (
                                categories.map(cat => (
                                    <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                                        <span>{cat.name}</span>
                                        <Button variant="danger" style={{ padding: '4px 8px' }} onClick={() => handleDeleteCategory(cat.id)}>Delete</Button>
                                    </div>
                                ))
                            )}
                        </ModalBody>
                    </ModalContent>
                </Modal>
            )}
        </Container>
    );
};
