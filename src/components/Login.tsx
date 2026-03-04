import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, User, AlertCircle } from 'lucide-react';
import FindPasswordModal from './FindPasswordModal';
import SignUpModal from './SignUpModal';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [projectName, setProjectName] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const [isFindPasswordOpen, setIsFindPasswordOpen] = useState(false);
    const [isSignUpOpen, setIsSignUpOpen] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');

        const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
        const tableName = import.meta.env.VITE_AIRTABLE_TEAM_TABLE_NAME || '팀 로그인 정보';
        const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY;

        if (!baseId || !apiKey) {
            setErrorMsg('Airtable 연동 정보가 설정되지 않았습니다.');
            setIsLoading(false);
            return;
        }

        try {
            // Encode formula: {팀명} = 'inputProjectName'
            const filterFormula = encodeURIComponent(`{팀명} = '${projectName.replace(/'/g, "\\'")}'`);

            const response = await fetch(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}?filterByFormula=${filterFormula}`, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                },
                cache: 'no-store'
            });

            if (!response.ok) {
                let errorDetails = '';
                try {
                    const errorJson = await response.json();
                    errorDetails = errorJson.error?.message || errorJson.error?.type || '';
                } catch (e) { }
                throw new Error(`Airtable 데이터 불러오기 실패. 설정 및 권한을 확인하세요. ${errorDetails ? `(상세: ${errorDetails})` : ''}`);
            }

            const data = await response.json();

            if (data.records.length === 0) {
                setErrorMsg('일치하는 팀명이 없습니다.');
                setIsLoading(false);
                return;
            }

            const record = data.records[0];
            const f = record.fields;

            // 로직 개선: 강제 문자열 변환 및 양쪽 공백 제거
            const dbPassword = String(f['비밀번호'] || '').trim();
            const inputPassword = password.trim();

            console.log('--- 로그인 시도 ---');
            console.log('입력한 비번:', `"${inputPassword}"`);
            console.log('DB의 비번:', `"${dbPassword}"`);

            if (dbPassword !== inputPassword) {
                setErrorMsg('비밀번호가 일치하지 않습니다.');
                setIsLoading(false);
                return;
            }

            const isAdmin = f['역할'] === '관리자';
            const assignedRole = isAdmin ? 'admin' : 'student';

            console.log('--- 계정 권한 확인 ---');
            console.log('Airtable 원본 역할:', f['역할']);
            console.log('부여된 시스템 Role:', assignedRole);

            // Success
            login({
                id: record.id,
                role: assignedRole,
                projectName: f['팀명'],
                teamLeaderName: f['팀장명'] || '',
                contact: f['연락처'] || '',
                isGnuStudent: !!f['경상국립대생여부'],
                isPasswordChanged: !!f['비밀번호변경여부'],
                budget: f['배정 예산'] ? Number(f['배정 예산']) : 0,
                budgetYubi: f['여비_배정액'] ? Number(f['여비_배정액']) : (f['여비 배정액'] ? Number(f['여비 배정액']) : 0),
                budgetJaeryo: f['재료비_배정액'] ? Number(f['재료비_배정액']) : (f['재료비 배정액'] ? Number(f['재료비 배정액']) : 0),
                budgetOiju: f['외주용역비_배정액'] ? Number(f['외주용역비_배정액']) : (f['외주용역비 배정액'] ? Number(f['외주용역비 배정액']) : 0),
                budgetJigeup: f['지급수수료_배정액'] ? Number(f['지급수수료_배정액']) : (f['지급수수료 배정액'] ? Number(f['지급수수료 배정액']) : 0),
            });

            // Immediately redirect to dashboard upon login
            navigate('/dashboard');

        } catch (err: any) {
            setErrorMsg(err.message || '로그인 처리 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-neutral-900">
                    팀 로그인
                </h2>
                <p className="mt-2 text-center text-sm text-neutral-600">
                    MVP 제작비 신청을 위해 팀 계정으로 로그인해주세요.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-neutral-100">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        {errorMsg && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl shadow-sm">
                                <div className="flex items-center">
                                    <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                                    <p className="text-sm text-red-700 font-medium">{errorMsg}</p>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-neutral-700">팀명</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-neutral-400" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    className="pl-10 block w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                                    placeholder="팀명을 입력하세요"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-neutral-700">비밀번호</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-neutral-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 block w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                                    placeholder="비밀번호를 입력하세요"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                            >
                                {isLoading ? '로그인 중...' : '로그인'}
                            </button>
                        </div>
                        <div className="pt-4 flex items-center justify-center space-x-6 text-sm font-medium text-neutral-500">
                            <button
                                type="button"
                                onClick={() => setIsFindPasswordOpen(true)}
                                className="hover:text-indigo-600 transition-colors focus:outline-none"
                            >
                                비밀번호 찾기
                            </button>
                            <span className="text-neutral-300">|</span>
                            <button
                                type="button"
                                onClick={() => setIsSignUpOpen(true)}
                                className="hover:text-indigo-600 transition-colors focus:outline-none"
                            >
                                팀 회원가입
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Modals */}
            {isFindPasswordOpen && (
                <FindPasswordModal onClose={() => setIsFindPasswordOpen(false)} />
            )}
            {isSignUpOpen && (
                <SignUpModal onClose={() => setIsSignUpOpen(false)} />
            )}
        </div>
    );
}
