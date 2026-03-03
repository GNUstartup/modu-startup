import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface TeamInfo {
    id: string; // Airtable Record ID
    projectName: string; // 프로젝트명
    teamLeaderName: string; // 팀장명
    contact: string; // 연락처
    isGnuStudent: boolean; // 경상국립대생여부
    isPasswordChanged: boolean; // 비밀번호변경여부
    budget: number; // 총 배정예산 (Legacy/Fallback)
    budgetYubi: number; // 여비 배정액
    budgetJaeryo: number; // 재료비 배정액
    budgetOiju: number; // 외주용역비 배정액
    budgetJigeup: number; // 지급수수료 배정액
    role?: 'admin' | 'student'; // 추가: 관리자/참가자 구분
}

interface AuthContextType {
    user: TeamInfo | null;
    login: (teamData: TeamInfo) => void;
    logout: () => void;
    updateTeamInfo: (updatedData: Partial<TeamInfo>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<TeamInfo | null>(() => {
        const stored = localStorage.getItem('modu_team_user');
        return stored ? JSON.parse(stored) : null;
    });

    useEffect(() => {
        if (user) {
            localStorage.setItem('modu_team_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('modu_team_user');
        }
    }, [user]);

    const login = (teamData: TeamInfo) => setUser(teamData);
    const logout = () => setUser(null);
    const updateTeamInfo = (updatedData: Partial<TeamInfo>) => {
        setUser(prev => prev ? { ...prev, ...updatedData } : null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateTeamInfo }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
