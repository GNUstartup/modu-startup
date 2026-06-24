import React, { useState } from 'react';
import { X, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import Modal from './common/Modal';
import { apiSignup } from '../api';

interface SignUpModalProps {
    onClose: () => void;
}

export default function SignUpModal({ onClose }: SignUpModalProps) {
    const [teamName, setTeamName] = useState('');
    const [leaderName, setLeaderName] = useState('');
    const [contact, setContact] = useState('');
    const [isGnuStudent, setIsGnuStudent] = useState(true);
    const [password, setPassword] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/[^\d]/g, '');
        let formatted = rawValue;
        if (rawValue.length > 3 && rawValue.length <= 7) {
            formatted = `${rawValue.slice(0, 3)}-${rawValue.slice(3)}`;
        } else if (rawValue.length > 7) {
            formatted = `${rawValue.slice(0, 3)}-${rawValue.slice(3, 7)}-${rawValue.slice(7, 11)}`;
        }
        setContact(formatted);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (!teamName.trim() || !password.trim()) {
            setErrorMsg('참가자명과 비밀번호는 필수입니다.');
            return;
        }

        setIsLoading(true);
        try {
            await apiSignup({
                참가자명: teamName.trim(),
                비밀번호: password.trim(),
                팀장명: leaderName.trim(),
                연락처: contact.trim(),
                경상국립대생여부: isGnuStudent,
            });
            setSuccessMsg('회원가입이 완료되었습니다! 로그인해주세요.');
            setTimeout(() => onClose(), 1800);
        } catch (err: any) {
            setErrorMsg(err.message || '회원가입 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
                    <h3 className="text-lg font-bold text-neutral-900 flex items-center">
                        <UserPlus className="w-5 h-5 mr-2 text-indigo-600" />
                        참가자 회원가입
                    </h3>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    {errorMsg && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg flex items-center">
                            <AlertCircle className="h-4 w-4 text-red-400 mr-2 shrink-0" />
                            <p className="text-sm text-red-700">{errorMsg}</p>
                        </div>
                    )}
                    {successMsg && (
                        <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded-r-lg flex items-center">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 shrink-0" />
                            <p className="text-sm text-green-700">{successMsg}</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-1">참가자명 *</label>
                        <input
                            type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)}
                            className="block w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="참가자명(팀명)을 입력하세요"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-1">팀장명</label>
                        <input
                            type="text" value={leaderName} onChange={(e) => setLeaderName(e.target.value)}
                            className="block w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="팀장 이름"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-1">연락처</label>
                        <input
                            type="text" value={contact} onChange={handleContactChange}
                            className="block w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="010-0000-0000"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-1">비밀번호 *</label>
                        <input
                            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                            className="block w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="비밀번호"
                        />
                    </div>
                    <label className="flex items-center text-sm text-neutral-700 cursor-pointer">
                        <input
                            type="checkbox" checked={isGnuStudent} onChange={(e) => setIsGnuStudent(e.target.checked)}
                            className="w-4 h-4 mr-2 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        경상국립대학교 재학생입니다
                    </label>

                    <button
                        type="submit" disabled={isLoading}
                        className="w-full py-3 px-4 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                        {isLoading ? '처리 중...' : '회원가입'}
                    </button>
                </form>
            </div>
        </Modal>
    );
}
