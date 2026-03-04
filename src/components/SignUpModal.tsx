import React, { useState } from 'react';
import { X, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import Modal from './common/Modal';

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

    const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
    const tableName = import.meta.env.VITE_AIRTABLE_TEAM_TABLE_NAME || '팀 기본 정보'; // Or '팀 로그인 정보'
    const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY;

    const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/[^\d]/g, '');
        const truncatedValue = rawValue.slice(0, 11);
        let formattedValue = '';
        if (truncatedValue.length <= 3) {
            formattedValue = truncatedValue;
        } else if (truncatedValue.length <= 7) {
            formattedValue = `${truncatedValue.slice(0, 3)}-${truncatedValue.slice(3)}`;
        } else {
            formattedValue = `${truncatedValue.slice(0, 3)}-${truncatedValue.slice(3, 7)}-${truncatedValue.slice(7)}`;
        }
        setContact(formattedValue);
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Validation
        if (!teamName || !leaderName || !contact || !password) {
            setErrorMsg('모든 필수 항목을 입력해주세요.');
            return;
        }

        const phoneRegex = /^010-\d{4}-\d{4}$/;
        if (!phoneRegex.test(contact)) {
            setErrorMsg('올바른 전화번호 형식을 입력해주세요.');
            return;
        }

        if (password.length < 6 || !/^\d+$/.test(password)) {
            setErrorMsg('비밀번호는 6자리 이상의 숫자로 입력해주세요.');
            return;
        }

        setIsLoading(true);
        setErrorMsg('');

        if (!baseId || !apiKey) {
            setErrorMsg('Airtable 연동 정보가 설정되지 않았습니다.');
            setIsLoading(false);
            return;
        }

        try {
            // 2. Format Phone Number
            const formattedContact = contact.replace(/[^0-9-]/g, '');

            // 3. Create Record
            const payload = {
                records: [
                    {
                        fields: {
                            '팀명': teamName,
                            '팀장명': leaderName,
                            '연락처': formattedContact,
                            '경상국립대생여부': isGnuStudent,
                            '역할': '참가자', // Default role constraint
                            '비밀번호': password
                        }
                    }
                ]
            };

            const response = await fetch(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('[회원가입 에러]:', errorData);
                throw new Error('회원가입 처리 중 데이터 반영에 실패했습니다. (중복된 팀명이거나 필수 필드 누락일 수 있습니다)');
            }

            // 4. Success state
            setSuccessMsg('회원가입이 완료되었습니다!\n방금 생성한 정보로 로그인해주세요.');
            setTimeout(() => {
                onClose();
            }, 3000);

        } catch (err: any) {
            setErrorMsg(err.message || '오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between shrink-0">
                <h3 className="text-lg font-bold text-white flex items-center">
                    <UserPlus className="w-5 h-5 mr-2 text-indigo-200" />
                    팀 신규 회원가입
                </h3>
                <button
                    onClick={onClose}
                    className="text-indigo-200 hover:text-white transition-colors focus:outline-none"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto">
                {successMsg ? (
                    <div className="py-8 text-center animate-in fade-in zoom-in duration-300">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-neutral-900 mb-2 truncate whitespace-pre-wrap">{successMsg}</h3>
                    </div>
                ) : (
                    <>
                        {errorMsg && (
                            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex items-start">
                                <AlertCircle className="w-5 h-5 mr-2 shrink-0 mt-0.5 text-red-500" />
                                {errorMsg}
                            </div>
                        )}

                        <form onSubmit={handleSignUp} className="space-y-4">
                            <p className="text-sm text-neutral-600 mb-6">
                                새로운 MVP 제작 팀을 등록합니다.
                            </p>
                            <div>
                                <label className="block text-sm font-semibold text-neutral-700 mb-1">팀명<span className="text-red-500 ml-1">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={teamName}
                                    onChange={e => setTeamName(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder-neutral-400"
                                    placeholder="고유한 팀명 입력"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 mb-1">팀장명<span className="text-red-500 ml-1">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={leaderName}
                                        onChange={e => setLeaderName(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder-neutral-400"
                                        placeholder="홍길동"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 mb-1">연락처<span className="text-red-500 ml-1">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={contact}
                                        onChange={handleContactChange}
                                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder-neutral-400"
                                        placeholder="010-0000-0000"
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <label className="block text-sm font-semibold text-neutral-700 mb-2">경상국립대생 여부<span className="text-red-500 ml-1">*</span></label>
                                <div className="flex space-x-4">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="isGnu"
                                            checked={isGnuStudent === true}
                                            onChange={() => setIsGnuStudent(true)}
                                            className="w-4 h-4 text-indigo-600 bg-neutral-100 border-neutral-300 focus:ring-indigo-500"
                                        />
                                        <span className="ml-2 text-sm text-neutral-800 font-medium">네, 맞습니다</span>
                                    </label>
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="isGnu"
                                            checked={isGnuStudent === false}
                                            onChange={() => setIsGnuStudent(false)}
                                            className="w-4 h-4 text-indigo-600 bg-neutral-100 border-neutral-300 focus:ring-indigo-500"
                                        />
                                        <span className="ml-2 text-sm text-neutral-800 font-medium">아닙니다</span>
                                    </label>
                                </div>
                            </div>

                            <div className="pt-2">
                                <label className="block text-sm font-semibold text-neutral-700 mb-1">로그인 비밀번호<span className="text-red-500 ml-1">*</span></label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value.replace(/[^\d]/g, ''))} // only digits
                                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder-neutral-400"
                                    placeholder="6자리 이상의 숫자"
                                    maxLength={12}
                                />
                                <p className="text-xs text-neutral-500 mt-1.5">비밀번호는 보안을 위해 6자리 이상의 숫자로 제한됩니다.</p>
                            </div>

                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                                >
                                    {isLoading ? '등록 중...' : '가입 완료하기'}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </Modal>
    );
}
