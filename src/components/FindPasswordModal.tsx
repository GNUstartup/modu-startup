import React, { useState } from 'react';
import { X, Search, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import Modal from './common/Modal';

interface FindPasswordModalProps {
    onClose: () => void;
}

export default function FindPasswordModal({ onClose }: FindPasswordModalProps) {
    // ... existing state and logic
    const [teamName, setTeamName] = useState('');
    const [leaderName, setLeaderName] = useState('');
    const [contact, setContact] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // State after successfully finding the account
    const [foundRecordId, setFoundRecordId] = useState<string | null>(null);
    const [currentPassword, setCurrentPassword] = useState<string | null>(null);

    // State for setting a new password
    const [newPassword, setNewPassword] = useState('');
    const [isChanging, setIsChanging] = useState(false);

    const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
    const tableName = import.meta.env.VITE_AIRTABLE_TEAM_TABLE_NAME || '팀 기본 정보'; // Or '팀 로그인 정보' based on user's exact table name
    const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY;

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');
        setFoundRecordId(null);
        setCurrentPassword(null);

        if (!baseId || !apiKey) {
            setErrorMsg('Airtable 연동 정보가 설정되지 않았습니다.');
            setIsLoading(false);
            return;
        }

        try {
            // Encode formula: {팀명} = 'teamName' AND {팀장명} = 'leaderName' AND {연락처} = 'contact'
            const filterFormula = encodeURIComponent(`AND({팀명} = '${teamName.replace(/'/g, "\\'")}', {팀장명} = '${leaderName.replace(/'/g, "\\'")}', {연락처} = '${contact.replace(/'/g, "\\'")}')`);
            const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}?filterByFormula=${filterFormula}`;

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${apiKey}` }
            });

            if (!response.ok) {
                throw new Error('데이터 조회 중 오류가 발생했습니다.');
            }

            const data = await response.json();

            if (data.records.length === 0) {
                setErrorMsg('입력하신 정보와 일치하는 계정이 없습니다.');
            } else {
                const record = data.records[0];
                setFoundRecordId(record.id);
                setCurrentPassword(record.fields['비밀번호'] || '설정된 비밀번호 없음');
            }
        } catch (err: any) {
            setErrorMsg(err.message || '오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!newPassword || newPassword.length < 6 || !/^\d+$/.test(newPassword)) {
            setErrorMsg('비밀번호는 6자리 이상의 숫자로 입력해주세요.');
            return;
        }

        setIsChanging(true);
        setErrorMsg('');

        try {
            const response = await fetch(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}/${foundRecordId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fields: {
                        '비밀번호': newPassword
                    }
                })
            });

            if (!response.ok) throw new Error('비밀번호 변경 실패');

            setSuccessMsg('비밀번호가 변경되었습니다.');
            setTimeout(() => {
                onClose();
            }, 2000);

        } catch (err: any) {
            setErrorMsg(err.message || '비밀번호 변경 중 오류가 발생했습니다.');
        } finally {
            setIsChanging(false);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-neutral-800 px-6 py-4 flex items-center justify-between shrink-0">
                <h3 className="text-lg font-bold text-white flex items-center">
                    <Lock className="w-5 h-5 mr-2 text-neutral-300" />
                    비밀번호 찾기
                </h3>
                <button
                    onClick={onClose}
                    className="text-neutral-400 hover:text-white transition-colors focus:outline-none"
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
                        <h3 className="text-xl font-bold text-neutral-900 mb-2">{successMsg}</h3>
                    </div>
                ) : (
                    <>
                        {errorMsg && (
                            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex items-start">
                                <AlertCircle className="w-5 h-5 mr-2 shrink-0 mt-0.5 text-red-500" />
                                {errorMsg}
                            </div>
                        )}

                        {!foundRecordId ? (
                            <form onSubmit={handleSearch} className="space-y-4">
                                <p className="text-sm text-neutral-600 mb-6">
                                    가입 시 등록한 팀 정보를 입력해 주세요.
                                </p>
                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 mb-1">팀명</label>
                                    <input
                                        type="text"
                                        required
                                        value={teamName}
                                        onChange={e => setTeamName(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        placeholder="예: 멋쟁이사자들"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 mb-1">팀장명</label>
                                    <input
                                        type="text"
                                        required
                                        value={leaderName}
                                        onChange={e => setLeaderName(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        placeholder="홍길동"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 mb-1">연락처</label>
                                    <input
                                        type="text"
                                        required
                                        value={contact}
                                        onChange={e => setContact(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        placeholder="010-0000-0000"
                                    />
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-neutral-800 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900 disabled:opacity-50 transition-colors"
                                    >
                                        {isLoading ? '조회 중...' : (
                                            <>
                                                <Search className="w-4 h-4 mr-2" />
                                                계정 찾기
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-xl text-center">
                                    <p className="text-sm font-medium text-indigo-700 mb-2">현재 비밀번호</p>
                                    <p className="text-2xl font-bold text-indigo-900 tracking-wider">
                                        {currentPassword}
                                    </p>
                                </div>

                                <div className="border-t border-neutral-100 pt-6">
                                    <div className="mb-4">
                                        <label className="block text-sm font-semibold text-neutral-700 mb-1">새 비밀번호 설정 <span className="text-xs font-normal text-neutral-500 ml-1">(선택 사항)</span></label>
                                        <input
                                            type="text"
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value.replace(/[^\d]/g, ''))} // only digits
                                            className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder-neutral-400"
                                            placeholder="6자리 이상 숫자"
                                            maxLength={12}
                                        />
                                        <p className="text-xs text-neutral-500 mt-2">비밀번호는 보안을 위해 6자리 이상의 숫자로만 설정해 주세요.</p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleChangePassword}
                                        disabled={isChanging || !newPassword || newPassword.length < 6}
                                        className="w-full py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isChanging ? '변경 중...' : '비밀번호 변경하기'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </Modal>
    );
}
