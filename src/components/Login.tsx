import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, User, AlertCircle } from 'lucide-react';
import FindPasswordModal from './FindPasswordModal';
import SignUpModal from './SignUpModal';
import { apiLogin } from '../api';

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

        try {
            const u = await apiLogin(projectName.trim(), password.trim());

            const isAdmin = u['역할'] === '관리자';

            login({
                role: isAdmin ? 'admin' : 'student',
                projectName: u['참가자명'],
                teamLeaderName: u['팀장명'] || '',
                contact: u['연락처'] || '',
                isGnuStudent: u['경상국립대생여부'] === true || u['경상국립대생여부'] === 'TRUE' || u['경상국립대생여부'] === '참',
                budgetYubi: Number(u['여비_배정액']) || 0,
                budgetJaeryo: Number(u['재료비_배정액']) || 0,
                budgetOiju: Number(u['외주용역비_배정액']) || 0,
                budgetJigeup: Number(u['지급수수료_배정액']) || 0,
            });

            if (isAdmin) {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
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
                    참가자 로그인
                </h2>
                <p className="mt-2 text-center text-sm text-neutral-600">
                    MVP 제작비 신청을 위해 참가자 계정으로 로그인해주세요.
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
                            <label className="block text-sm font-semibold text-neutral-700">참가자명</label>
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
                                    placeholder="참가자명을 입력하세요"
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
                                참가자 회원가입
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
