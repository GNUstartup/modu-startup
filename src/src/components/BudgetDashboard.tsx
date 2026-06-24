import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { RefreshCw, Wallet, Search, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import { apiGetParticipants, apiGetApplications } from '../api';
import type { Participant, Application } from '../api';

interface TeamBudget {
    teamName: string;
    teamLeaderName: string;
    totalBudget: number;
    usedAmount: number;       // 완료
    processingAmount: number; // 처리 중
    remainingAmount: number;
}

export default function BudgetDashboard() {
    const { user } = useAuth();
    const [teams, setTeams] = useState<TeamBudget[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        setIsLoading(true);
        setErrorMsg('');
        try {
            const [participants, apps] = await Promise.all([
                apiGetParticipants('관리자'),
                apiGetApplications(user?.projectName || '', '관리자'),
            ]);

            const result: TeamBudget[] = participants
                .filter((p: Participant) => p['역할'] !== '관리자')
                .map((p: Participant) => {
                    const name = p['참가자명'];
                    const total = (Number(p['여비_배정액']) || 0) + (Number(p['재료비_배정액']) || 0)
                        + (Number(p['외주용역비_배정액']) || 0) + (Number(p['지급수수료_배정액']) || 0);
                    const teamApps = apps.filter((a: Application) => a['참가자명'] === name);
                    const used = teamApps.filter(a => a['상태'] === '완료' || a['상태'] === '승인')
                        .reduce((s, a) => s + (Number(a['신청금액']) || 0), 0);
                    const processing = teamApps.filter(a => a['상태'] !== '완료' && a['상태'] !== '승인' && a['상태'] !== '반려')
                        .reduce((s, a) => s + (Number(a['신청금액']) || 0), 0);
                    return {
                        teamName: name,
                        teamLeaderName: p['팀장명'] || '',
                        totalBudget: total,
                        usedAmount: used,
                        processingAmount: processing,
                        remainingAmount: total - used - processing,
                    };
                });

            setTeams(result);
        } catch (err: any) {
            setErrorMsg(err.message || '데이터를 불러오지 못했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filtered = teams.filter(t => !searchTerm || t.teamName.toLowerCase().includes(searchTerm.toLowerCase()));

    const grandTotal = teams.reduce((s, t) => s + t.totalBudget, 0);
    const grandUsed = teams.reduce((s, t) => s + t.usedAmount, 0);
    const grandProcessing = teams.reduce((s, t) => s + t.processingAmount, 0);

    return (
        <div className="min-h-screen bg-neutral-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 flex items-center">
                            <Wallet className="w-6 h-6 mr-2 text-indigo-600" /> 팀별 예산 현황 (관리자 홈)
                        </h1>
                        <p className="mt-1 text-sm text-neutral-500">참가팀별 배정 예산과 사용 현황입니다.</p>
                    </div>
                    <button onClick={fetchData} disabled={isLoading}
                        className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-neutral-200 rounded-xl shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 disabled:opacity-50 transition-colors">
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin text-indigo-500' : 'text-neutral-500'}`} /> 새로고침
                    </button>
                </div>

                {errorMsg && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-100 flex items-start">
                        <AlertCircle className="w-5 h-5 mr-2 shrink-0 text-red-500 mt-0.5" /> {errorMsg}
                    </div>
                )}

                {/* 총괄 KPI */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
                        <h3 className="text-sm font-semibold text-neutral-500 mb-2">총 배정 예산</h3>
                        <div className="text-neutral-900" style={{ fontSize: '24px', fontWeight: 700 }}>{grandTotal.toLocaleString()} <span style={{ fontSize: '16px', fontWeight: 500 }}>원</span></div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
                        <h3 className="text-sm font-semibold text-neutral-500 mb-2 flex items-center"><CheckCircle2 className="w-4 h-4 mr-1 text-blue-500" />완료 집행액</h3>
                        <div className="text-blue-600" style={{ fontSize: '24px', fontWeight: 700 }}>{grandUsed.toLocaleString()} <span style={{ fontSize: '16px', fontWeight: 500 }}>원</span></div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
                        <h3 className="text-sm font-semibold text-neutral-500 mb-2 flex items-center"><TrendingUp className="w-4 h-4 mr-1 text-orange-500" />처리 중</h3>
                        <div className="text-orange-500" style={{ fontSize: '24px', fontWeight: 700 }}>{grandProcessing.toLocaleString()} <span style={{ fontSize: '16px', fontWeight: 500 }}>원</span></div>
                    </div>
                </div>

                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="참가자명 검색"
                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-neutral-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm shadow-sm" />
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-neutral-200">
                            <thead className="bg-neutral-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase">참가자명</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-neutral-500 uppercase">팀장</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-500 uppercase">배정 예산</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-500 uppercase">완료</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-500 uppercase">처리 중</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-500 uppercase">잔액</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-neutral-100">
                                {isLoading && teams.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-24">
                                        <RefreshCw className="mx-auto w-8 h-8 text-indigo-500 animate-spin mb-3" />
                                        <span className="text-neutral-500 font-medium">불러오는 중입니다...</span>
                                    </td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-24 bg-neutral-50/30">
                                        <Wallet className="mx-auto h-12 w-12 text-neutral-300 mb-3" />
                                        <h3 className="text-sm font-semibold text-neutral-900">참가팀이 없습니다</h3>
                                    </td></tr>
                                ) : (
                                    filtered.map((t) => (
                                        <tr key={t.teamName} className="hover:bg-neutral-50/50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-semibold text-neutral-800">{t.teamName}</td>
                                            <td className="px-6 py-4 text-center text-sm text-neutral-600">{t.teamLeaderName || '-'}</td>
                                            <td className="px-6 py-4 text-right text-sm font-medium text-neutral-900">{t.totalBudget.toLocaleString()}원</td>
                                            <td className="px-6 py-4 text-right text-sm text-blue-600">{t.usedAmount.toLocaleString()}원</td>
                                            <td className="px-6 py-4 text-right text-sm text-orange-500">{t.processingAmount.toLocaleString()}원</td>
                                            <td className={`px-6 py-4 text-right text-sm font-bold ${t.remainingAmount < 0 ? 'text-red-600' : 'text-indigo-700'}`}>{t.remainingAmount.toLocaleString()}원</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
