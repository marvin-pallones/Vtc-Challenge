import React from 'react';
import styled from 'styled-components';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { LoginForm } from '../../components/LoginForm';
import { NotesList } from '../../components/NotesList';
import { Header } from '../../components/Header';

const AppWrapper = styled.div`
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #f5f5f5;
`;

const MainContent = styled.main`
    flex: 1;
    display: flex;
    justify-content: center;
    padding: 20px;
`;

const LoginWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 100px);
    padding: 20px;
`;

const LoadingWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    font-size: 18px;
    color: #666;
`;

const AppContent: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <LoadingWrapper>
                Loading...
            </LoadingWrapper>
        );
    }

    if (!user) {
        return (
            <AppWrapper>
                <Header />
                <LoginWrapper>
                    <LoginForm />
                </LoginWrapper>
            </AppWrapper>
        );
    }

    return (
        <AppWrapper>
            <Header />
            <MainContent>
                <NotesList />
            </MainContent>
        </AppWrapper>
    );
};

export const IndexPage: React.FC = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export { IndexPage as default };
