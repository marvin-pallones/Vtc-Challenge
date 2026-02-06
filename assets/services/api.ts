const API_BASE = '/api';

interface ApiResponse<T = any> {
    data?: T;
    error?: string;
}

async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const url = `${API_BASE}${endpoint}`;
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers,
            credentials: 'same-origin',
        });

        const data = await response.json();

        if (!response.ok) {
            return { error: data.error || 'An error occurred' };
        }

        return { data };
    } catch (error) {
        return { error: 'Network error. Please try again.' };
    }
}

export const api = {
    // Auth
    register: (email: string, password: string) =>
        request('/register', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    login: (email: string, password: string) =>
        request('/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    logout: () =>
        request('/logout', {
            method: 'POST',
        }),

    getCurrentUser: () =>
        request<{ user: User | null }>('/user'),

    // Categories
    getCategories: () =>
        request<{ categories: Category[] }>('/categories'),

    createCategory: (name: string) =>
        request('/categories', {
            method: 'POST',
            body: JSON.stringify({ name }),
        }),

    updateCategory: (id: number, name: string) =>
        request(`/categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ name }),
        }),

    deleteCategory: (id: number) =>
        request(`/categories/${id}`, {
            method: 'DELETE',
        }),

    // Notes
    getNotes: (params?: { search?: string; status?: string; category?: number }) => {
        const searchParams = new URLSearchParams();
        if (params?.search) searchParams.append('search', params.search);
        if (params?.status) searchParams.append('status', params.status);
        if (params?.category) searchParams.append('category', String(params.category));
        const query = searchParams.toString();
        return request<{ notes: Note[] }>(`/notes${query ? `?${query}` : ''}`);
    },

    getNote: (id: number) =>
        request<{ note: Note }>(`/notes/${id}`),

    createNote: (data: NoteInput) =>
        request('/notes', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    updateNote: (id: number, data: NoteInput) =>
        request(`/notes/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    deleteNote: (id: number) =>
        request(`/notes/${id}`, {
            method: 'DELETE',
        }),

    getStatuses: () =>
        request<{ statuses: string[] }>('/notes/statuses'),
};

export interface User {
    id: number;
    email: string;
    isVerified?: boolean;
}

export interface Category {
    id: number;
    name: string;
}

export interface Note {
    id: number;
    title: string;
    content: string;
    status: string;
    category: Category | null;
    createdAt: string;
    updatedAt: string;
}

export interface NoteInput {
    title: string;
    content: string;
    status: string;
    categoryId?: number | null;
}
