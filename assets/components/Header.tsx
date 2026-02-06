import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const HeaderWrapper = styled.header`
    background-color: #343a40;
    color: white;
    padding: 16px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const Logo = styled.h1`
    margin: 0;
    font-size: 24px;
`;

const UserInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
`;

const Email = styled.span`
    font-size: 14px;
    color: #adb5bd;
`;

const LogoutButton = styled.button`
    padding: 8px 16px;
    background-color: #dc3545;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    &:hover {
        background-color: #c82333;
    }
`;

export const Header: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <HeaderWrapper>
            <Logo>VTC Notes</Logo>
            {user && (
                <UserInfo>
                    <Email>{user.email}</Email>
                    <LogoutButton onClick={logout}>Logout</LogoutButton>
                </UserInfo>
            )}
        </HeaderWrapper>
    );
};
