import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, CheckCircle2, User, Phone, GraduationCap } from 'lucide-react';

export default function FirstTimeSetupPopup() {
    const { user, updateTeamInfo } = useAuth();

    // If not logged in or already changed password, don't show
    if (!user || user.isPasswordChanged) return null;

    const [newPassword, setNewPassword] = useState('');
    const [teamLeaderName, setTeamLeaderName] = useState(user.teamLeaderName || '');
    const [contact, setContact] = useState(user.contact || '');
    const [isGnuStudent, setIsGnuStudent] = useState(user.isGnuStudent || false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMsg('');

        if (newPassword.length < 4) {
            setErrorMsg('새 비밀번호는 4자리 이상이어야 합니다.');
            setIsSubmitting(false);
            return;
        }

        const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
        const tableName = import.meta.env.VITE_AIRTABLE_TEAM_TABLE_NAME || '팀 로그인 정보';
        const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY;

        try {
            const payload = {
                records: [
                    {
                        id: user.id,
                        fields: {
                            "비밀번호": newPassword,
                            "팀장명": teamLeaderName,
                            "연락처": contact,
                            "경상국립대생여부": isGnuStudent,
                            "비밀번호변경여부": true
                        }
                    }
                ]
            };

            const response = await fetch(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                let errorDetails = '';
                try {
                    const errorJson = await response.json();
                    errorDetails = errorJson.error?.message || errorJson.error?.type || '';
                } catch (e) { }

                throw new Error(`정보 업데이트 실패: ${errorDetails}`);
            }

            // Update local context
            updateTeamInfo({
                teamLeaderName,
                contact,
                isGnuStudent,
                isPasswordChanged: true
            });

        } catch (err: any) {
            setErrorMsg(err.message || '업데이트 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="bg-indigo-600 px-6 py-6 text-white flex items-start space-x-4">
                    <div className="bg-indigo-500/50 p-3 rounded-full shrink-0">
                        <ShieldAlert className="w-8 h-8 text-indigo-100" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">초기 정보 설정</h3>
                        <p className="text-indigo-100 text-sm mt-1">
                            보안을 위해 비밀번호를 변경하고 팀 대표자 정보를 입력해주세요.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-8 space-y-6">
                    {errorMsg && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                            {errorMsg}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-neutral-700">팀장명</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-neutral-400" />
                            </div>
                            <input
                                type="text"
                                required
                                value={teamLeaderName}
                                onChange={e => setTeamLeaderName(e.target.value)}
                                className="pl-10 w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all duration-200 text-neutral-900"
                                placeholder="예) 홍길동"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-neutral-700">연락처</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Phone className="h-5 w-5 text-neutral-400" />
                            </div>
                            <input
                                type="text"
                                required
                                value={contact}
                                onChange={e => setContact(e.target.value)}
                                className="pl-10 w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all duration-200 text-neutral-900"
                                placeholder="예) 010-1234-5678"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-neutral-700">경상국립대 재학생 여부</label>
                        <label className="flex items-center p-4 border border-neutral-200 rounded-xl cursor-pointer hover:bg-neutral-50 transition-colors">
                            <div className="flex items-center h-5">
                                <input
                                    type="checkbox"
                                    checked={isGnuStudent}
                                    onChange={e => setIsGnuStudent(e.target.checked)}
                                    className="w-5 h-5 text-indigo-600 bg-neutral-100 border-neutral-300 rounded focus:ring-indigo-500"
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <span className="font-semibold text-neutral-800 flex items-center">
                                    <GraduationCap className="w-4 h-4 mr-2 text-indigo-500" />
                                    경상국립대학교 재학생입니다
                                </span>
                            </div>
                        </label>
                    </div>

                    <div className="pt-4 border-t border-neutral-100 space-y-2">
                        <label className="block text-sm font-semibold text-neutral-700">새 비밀번호 설정</label>
                        <input
                            type="password"
                            required
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all duration-200 text-neutral-900"
                            placeholder="새로운 비밀번호를 입력하세요"
                        />
                        <p className="text-xs text-neutral-500 mt-1">4자리 이상 안전한 비밀번호를 권장합니다.</p>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full inline-flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                        >
                            {isSubmitting ? '저장 중...' : (
                                <>
                                    <CheckCircle2 className="w-5 h-5 mr-2" />
                                    정보 저장 및 시작하기
                                </>
                            )}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}
