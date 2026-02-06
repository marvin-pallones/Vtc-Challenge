import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    max-width: 400px;
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

const Button = styled.button`
    padding: 12px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    &:hover {
        background-color: #0056b3;
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

const SuccessMessage = styled.div`
    color: #155724;
    background-color: #d4edda;
    padding: 12px;
    border-radius: 4px;
    font-size: 14px;
`;

const ToggleLink = styled.button`
    background: none;
    border: none;
    color: #007bff;
    cursor: pointer;
    font-size: 14px;
    padding: 0;
    text-decoration: underline;
`;

const Title = styled.h2`
    margin: 0 0 20px 0;
    color: #333;
    text-align: center;
`;

export const LoginForm: React.FC = () => {
    const { login, register } = useAuth();
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!email || !password) {
            setError('Email and password are required');
            return;
        }

        if (isRegistering && password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        if (isRegistering) {
            const result = await register(email, password);
            if (result.success) {
                setSuccess('Registration successful! Please check your email (var/emails folder) to confirm your account.');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
            } else {
                setError(result.error || 'Registration failed');
            }
        } else {
            const result = await login(email, password);
            if (!result.success) {
                setError(result.error || 'Login failed');
            }
        }

        setLoading(false);
    };

    const toggleMode = () => {
        setIsRegistering(!isRegistering);
        setError('');
        setSuccess('');
    };

    return (
        <Form onSubmit={handleSubmit}>
            <Title>{isRegistering ? 'Create Account' : 'Login'}</Title>

            {error && <ErrorMessage>{error}</ErrorMessage>}
            {success && <SuccessMessage>{success}</SuccessMessage>}

            <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
            />

            <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
            />

            {isRegistering && (
                <Input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                />
            )}

            <Button type="submit" disabled={loading}>
                {loading ? 'Please wait...' : (isRegistering ? 'Register' : 'Login')}
            </Button>

            <div style={{ textAlign: 'center' }}>
                {isRegistering ? (
                    <>Already have an account? <ToggleLink type="button" onClick={toggleMode}>Login</ToggleLink></>
                ) : (
                    <>Don't have an account? <ToggleLink type="button" onClick={toggleMode}>Register</ToggleLink></>
                )}
            </div>
        </Form>
    );
};
