import { useState, useEffect } from 'react';
import { ChevronDown, UserCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { TeamInfo } from '../../context/AuthContext';
import { apiGetParticipants } from '../../api';
import type { Participant } from '../../api';
import ExpenseRequestForm from '../../components/ExpenseRequestForm';

function participantToTeamInfo(p: Participant): TeamInfo {
    return {
        projectName: p.참가자명,
        teamLeaderName: p.팀장명 || '',
        contact: p.연락처 || '',
        isGnuStudent: !!p.경상국립대생여부,
        budgetYubi: p.여비_배정액 || 0,
        budgetJaeryo: p.재료비_배정액 || 0,
        budgetOiju: p.외주용역비_배정액 || 0,
        budgetJigeup: p.지급수수료_배정액 || 0,
        role: 'student',
    };
}

export default function AdminNewRequest() {
    const { user } = useAuth();
    const navigate = useNavigate();
    // allParticipants: 전체(관리자 포함) / students: 역할='참가자'만 드롭다운에 표시
    const [allParticipants, setAllParticipants] = useState<Participant[]>([]);
    const [students, setStudents] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedKey, setSelectedKey] = useState('');
    const [targetUser, setTargetUser] = useState<TeamInfo | null>(null);

    useEffect(() => {
        apiGetParticipants('관리자')
            .then(list => {
                setAllParticipants(list);
                setStudents(list.filter(p => p.역할 === '참가자'));
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleConfirm = () => {
        if (!selectedKey) return;
        if (selectedKey === '__admin__') {
            // 전체 목록에서 admin 행을 찾아 실제 배정금액 사용
            const adminRow = allParticipants.find(p => p.참가자명 === user?.projectName);
            if (adminRow) {
                setTargetUser({ ...participantToTeamInfo(adminRow), role: 'admin' });
            } else {
                // participants 표에 admin 행이 없는 경우 fallback
                setTargetUser({
                    projectName: user?.projectName || 'admin',
                    teamLeaderName: '',
                    contact: '',
                    isGnuStudent: false,
                    budgetYubi: 0,
                    budgetJaeryo: 0,
                    budgetOiju: 0,
                    budgetJigeup: 0,
                    role: 'admin',
                });
            }
        } else {
            const p = allParticipants.find(p => p.참가자명 === selectedKey);
            if (p) setTargetUser(participantToTeamInfo(p));
        }
    };

    if (targetUser) {
        return (
            <ExpenseRequestForm
                targetUser={targetUser}
                isAdminProxy={true}
                onSuccess={() => navigate('/admin/requests')}
            />
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8 font-sans flex items-start justify-center">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-neutral-100">

                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-8 text-white">
                        <h2 className="text-2xl font-bold mb-1">새 신청서 작성 (관리자)</h2>
                        <p className="text-blue-100/80 text-sm">신청자를 선택하면 해당 참가자 이름으로 신청서를 작성합니다.</p>
                    </div>

                    <div className="px-8 py-8 space-y-6">
                        <div className="space-y-2">
                            <label className="flex items-center text-sm font-semibold text-neutral-700">
                                <UserCheck className="w-4 h-4 mr-2 text-indigo-500" />
                                신청자 선택
                            </label>

                            {loading ? (
                                <p className="text-sm text-neutral-400 py-3">참가자 목록 불러오는 중...</p>
                            ) : (
                                <div className="relative">
                                    <select
                                        value={selectedKey}
                                        onChange={e => setSelectedKey(e.target.value)}
                                        className={`w-full pl-4 pr-10 py-3 rounded-xl bg-neutral-50 border border-neutral-200 shadow-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all duration-200 outline-none appearance-none cursor-pointer ${!selectedKey ? 'text-neutral-400' : 'text-neutral-900'}`}
                                    >
                                        <option value="" className="text-neutral-400">신청자를 선택하세요</option>
                                        <option value="__admin__" className="text-neutral-900">
                                            관리자 본인 ({user?.projectName || 'admin'})
                                        </option>
                                        {students.map(p => (
                                            <option key={p.참가자명} value={p.참가자명} className="text-neutral-900">
                                                {p.참가자명}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-neutral-400">
                                        <ChevronDown className="w-5 h-5" />
                                    </div>
                                </div>
                            )}

                            {students.length === 0 && !loading && (
                                <p className="text-xs text-neutral-400">등록된 참가자가 없습니다. 관리자 본인 이름으로만 작성 가능합니다.</p>
                            )}
                        </div>

                        <div className="pt-2 flex gap-3 justify-end">
                            <button
                                onClick={() => navigate('/admin/requests')}
                                className="px-5 py-2.5 text-sm font-semibold text-neutral-700 bg-white border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={!selectedKey}
                                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                신청서 작성 시작
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
