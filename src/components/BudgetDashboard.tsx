import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { RefreshCw, Wallet, Search, AlertCircle, DollarSign, CheckCircle2, TrendingUp } from 'lucide-react';
import TeamDetailModal from './TeamDetailModal';

interface AirtableRecord {
    id: string;
    createdTime: string;
    fields: {
        "팀명"?: string;
        "비목"?: string;
        "신청금액"?: number;
        "상태"?: string;
    };
}

interface AirtableTeamRecord {
    id: string;
    fields: {
        "팀명"?: string;
        "팀장명"?: string;
        "아이디"?: string;
        "비밀번호"?: string;
        "여비_배정액"?: number;
        "재료비_배정액"?: number;
        "외주용역비_배정액"?: number;
        "지급수수료_배정액"?: number;
        "배정 예산"?: number;
        "사업 계획 변경 신청서"?: Array<{ url: string, filename: string }>;
        "역할"?: string;
    };
}

interface TeamBudget {
    id: string; // Airtable Record ID for updates
    teamName: string;
    teamLeaderName: string;
    accountId: string; // 아이디
    accountPw: string; // 비밀번호
    totalBudget: number;
    usedAmount: number; // 최종 완료
    processingAmount: number; // 진행 중
    remainingAmount: number; // 잔액
}

interface TeamDetailData {
    id: string;
    teamName: string;
    teamLeaderName: string;
    accountId: string;
    accountPw: string;
    budgetPlan: {
        total: number;
        travel: number;
        material: number;
        outsourcing: number;
        fee: number;
    };
    businessPlanDoc?: Array<{ url: string, filename: string }>;
    recentRequests: AirtableRecord[];
}

export default function BudgetDashboard() {
    const { user } = useAuth();
    const [records, setRecords] = useState<AirtableRecord[]>([]);
    const [teamRecords, setTeamRecords] = useState<AirtableTeamRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [selectedTeamDetail, setSelectedTeamDetail] = useState<TeamDetailData | null>(null);

    const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
    const tableName = '신청 종합';
    const teamTableName = import.meta.env.VITE_AIRTABLE_TEAM_TABLE_NAME || '팀 기본 정보';
    const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY;

    const fetchData = async () => {
        setIsLoading(true);
        setErrorMsg('');
        try {
            if (!baseId || !tableName || !apiKey) {
                throw new Error('Airtable 연동 정보(.env.local)가 설정되지 않았습니다.');
            }

            const recordsUrl = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`);
            const teamsUrl = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(teamTableName)}`);

            const [recordsRes, teamsRes] = await Promise.all([
                fetch(recordsUrl.toString(), { headers: { 'Authorization': `Bearer ${apiKey}` } }),
                fetch(teamsUrl.toString(), { headers: { 'Authorization': `Bearer ${apiKey}` } })
            ]);

            if (!recordsRes.ok || !teamsRes.ok) {
                throw new Error(`Airtable 데이터 불러오기 실패. 테이블 이름이나 권한을 확인하세요.`);
            }

            const recordsData = await recordsRes.json();
            const teamsData = await teamsRes.json();

            const validRecords = recordsData.records.filter((r: AirtableRecord) => r.fields["팀명"] && r.fields["팀명"].trim().length > 0);
            const validTeams = teamsData.records.filter((t: AirtableTeamRecord) => t.fields["팀명"] && t.fields["팀명"].trim().length > 0 && t.fields["역할"] !== '관리자');

            setRecords(validRecords);
            setTeamRecords(validTeams);
        } catch (err: any) {
            setErrorMsg(err.message || '데이터를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Calculate Team Budgets
    const teamBudgetsMap: Record<string, TeamBudget> = {};

    teamRecords.forEach(t => {
        const teamName = t.fields["팀명"] || '미상';
        teamBudgetsMap[teamName] = {
            id: t.id,
            teamName: teamName,
            teamLeaderName: t.fields["팀장명"] || '-',
            accountId: t.fields["아이디"] || '',
            accountPw: t.fields["비밀번호"] || '',
            totalBudget: t.fields["배정 예산"] || 0,
            usedAmount: 0,
            processingAmount: 0,
            remainingAmount: 0
        };
    });

    // Calculate Global Budget Metrics ONLY from participant teams
    const TOTAL_BUDGET = teamRecords.reduce((sum, t) => sum + (t.fields["배정 예산"] || 0), 0);

    const totalUsed = records
        .filter(r => r.fields["상태"] === '최종 완료' && teamBudgetsMap[r.fields["팀명"] || '미상'])
        .reduce((sum, r) => sum + (r.fields["신청금액"] || 0), 0);

    const totalProcessing = records
        .filter(r => r.fields["상태"] !== '최종 완료' && teamBudgetsMap[r.fields["팀명"] || '미상'])
        .reduce((sum, r) => sum + (r.fields["신청금액"] || 0), 0);

    const totalAvailable = TOTAL_BUDGET - totalUsed - totalProcessing;
    const executionRate = TOTAL_BUDGET > 0 ? (totalUsed / TOTAL_BUDGET) * 100 : 0;

    records.forEach(r => {
        const teamName = r.fields["팀명"] || '미상';
        if (teamBudgetsMap[teamName]) {
            const amount = r.fields["신청금액"] || 0;
            if (r.fields["상태"] === '최종 완료') {
                teamBudgetsMap[teamName].usedAmount += amount;
            } else {
                teamBudgetsMap[teamName].processingAmount += amount;
            }
        }
    });

    Object.values(teamBudgetsMap).forEach(tb => {
        tb.remainingAmount = tb.totalBudget - tb.usedAmount - tb.processingAmount;
    });

    const teamBudgets = Object.values(teamBudgetsMap).sort((a, b) => a.teamName.localeCompare(b.teamName));

    if (user?.role !== 'admin') {
        return (
            <div className="min-h-screen bg-neutral-50 flex flex-col justify-center items-center p-4">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-neutral-900 mb-2">접근 권한 없음</h1>
                <p className="text-neutral-500">이 페이지는 관리자만 접근할 수 있습니다.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 flex items-center">
                            <Wallet className="w-6 h-6 mr-2 text-indigo-600" />
                            MVP 예산 현황 대시보드
                        </h1>
                        <p className="mt-1 text-sm text-neutral-500">사업단 전체 예산 흐름과 팀별 집행 내역 및 소속 계정 정보를 관리합니다.</p>
                    </div>
                    <div className="mt-4 sm:mt-0 flex gap-2 w-full sm:w-auto">
                        <button
                            onClick={fetchData}
                            disabled={isLoading}
                            className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-neutral-200 rounded-xl shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin text-indigo-500' : 'text-neutral-500'}`} />
                            새로고침
                        </button>
                    </div>
                </div>

                {errorMsg && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl shadow-sm">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <AlertCircle className="h-5 w-5 text-red-400" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700 font-medium">{errorMsg}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Global Budget Progress */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-bold text-neutral-700">전체 예산 집행률 (참가자 기준)</span>
                        <span className="text-xl font-black text-indigo-600">{executionRate.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-neutral-100 rounded-full h-3 overflow-hidden">
                        <div
                            className="bg-indigo-600 h-3 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${Math.min(100, executionRate)}%` }}
                        ></div>
                    </div>
                </div>

                {/* Top Cards: Global Budget Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-semibold text-neutral-500">총 예산</p>
                            <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-indigo-600" />
                            </div>
                        </div>
                        <div className="flex items-end gap-1 w-full justify-end">
                            <span className="text-2xl font-black text-neutral-900">{TOTAL_BUDGET.toLocaleString()}</span>
                            <span className="text-sm font-bold text-neutral-600 mb-1">원</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-semibold text-neutral-500">집행 완료</p>
                            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                            </div>
                        </div>
                        <div className="flex items-end gap-1 w-full justify-end">
                            <span className="text-2xl font-black text-green-600">{totalUsed.toLocaleString()}</span>
                            <span className="text-sm font-bold text-neutral-600 mb-1">원</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-semibold text-neutral-500">진행 중</p>
                            <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-orange-600" />
                            </div>
                        </div>
                        <div className="flex items-end gap-1 w-full justify-end">
                            <span className="text-2xl font-black text-orange-600">{totalProcessing.toLocaleString()}</span>
                            <span className="text-sm font-bold text-neutral-600 mb-1">원</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-semibold text-neutral-500">가용 잔액</p>
                            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                                <Wallet className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                        <div className="flex items-end gap-1 w-full justify-end">
                            <span className="text-2xl font-black text-blue-600">{totalAvailable.toLocaleString()}</span>
                            <span className="text-sm font-bold text-neutral-600 mb-1">원</span>
                        </div>
                    </div>
                </div>

                {/* Team Detail Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                    <div className="px-6 py-5 border-b border-neutral-100 bg-white">
                        <h2 className="text-lg font-bold text-neutral-900">팀별 예산 현황 및 로그인 계정 관리</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-neutral-200">
                            <thead className="bg-neutral-50/80">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-center text-[13px] font-bold text-neutral-600 tracking-wider">
                                        팀명
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-center text-[13px] font-bold text-neutral-600 tracking-wider">
                                        팀장명
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-right pr-8 text-[13px] font-bold text-neutral-600 tracking-wider">
                                        총 배정 예산
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-right pr-8 text-[13px] font-bold text-neutral-600 tracking-wider">
                                        현재 사용액
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-right pr-8 text-[13px] font-bold text-neutral-600 tracking-wider">
                                        진행 중 금액
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-right pr-8 text-[13px] font-bold text-neutral-600 tracking-wider">
                                        남은 잔액
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-center text-[13px] font-bold text-neutral-600 tracking-wider">
                                        상세보기
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-neutral-100">
                                {isLoading && teamBudgets.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center text-neutral-500">
                                                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
                                                <span className="font-medium text-sm">데이터를 불러오는 중입니다...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : teamBudgets.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center text-neutral-400">
                                                <Wallet className="w-12 h-12 mb-3 opacity-20" />
                                                <span className="font-medium text-sm text-neutral-500">집행 내역이 있는 참가자 팀이 없습니다.</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    teamBudgets.map((team) => (
                                        <tr
                                            key={team.teamName}
                                            className="hover:bg-indigo-50/30 transition-colors cursor-pointer"
                                            onClick={() => {
                                                const relatedTeams = teamRecords.filter(t => t.fields["팀명"] === team.teamName);
                                                const defaultTeam = relatedTeams[0];
                                                if (defaultTeam) {
                                                    const recentDocs = records
                                                        .filter(r => r.fields["팀명"] === team.teamName)
                                                        .sort((a, b) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime());

                                                    setSelectedTeamDetail({
                                                        id: defaultTeam.id,
                                                        teamName: defaultTeam.fields["팀명"] || '미상',
                                                        teamLeaderName: defaultTeam.fields["팀장명"] || '-',
                                                        accountId: defaultTeam.fields["아이디"] || '',
                                                        accountPw: defaultTeam.fields["비밀번호"] || '',
                                                        budgetPlan: {
                                                            total: defaultTeam.fields["배정 예산"] || 0,
                                                            travel: defaultTeam.fields["여비_배정액"] || 0,
                                                            material: defaultTeam.fields["재료비_배정액"] || 0,
                                                            outsourcing: defaultTeam.fields["외주용역비_배정액"] || 0,
                                                            fee: defaultTeam.fields["지급수수료_배정액"] || 0
                                                        },
                                                        businessPlanDoc: defaultTeam.fields["사업 계획 변경 신청서"],
                                                        recentRequests: recentDocs
                                                    });
                                                }
                                            }}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="text-sm font-bold text-neutral-900">{team.teamName}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="text-sm font-medium text-neutral-500">{team.teamLeaderName}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right pr-8">
                                                <div className="text-sm font-bold text-neutral-900">
                                                    {team.totalBudget.toLocaleString()}<span className="text-xs font-semibold text-neutral-400 ml-1">원</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right pr-8">
                                                <div className="text-sm font-bold text-green-600">
                                                    {team.usedAmount.toLocaleString()}<span className="text-xs font-semibold text-neutral-400 ml-1">원</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right pr-8">
                                                <div className="text-sm font-bold text-orange-600">
                                                    {team.processingAmount.toLocaleString()}<span className="text-xs font-semibold text-neutral-400 ml-1">원</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right pr-8">
                                                <div className="text-sm font-black text-indigo-600">
                                                    {team.remainingAmount.toLocaleString()}<span className="text-xs font-semibold text-neutral-400 ml-1">원</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <button className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors">
                                                    <Search className="w-3.5 h-3.5 mr-1" />
                                                    상세보기
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {selectedTeamDetail && (
                <TeamDetailModal
                    isOpen={!!selectedTeamDetail}
                    onClose={() => setSelectedTeamDetail(null)}
                    teamId={selectedTeamDetail.id}
                    teamName={selectedTeamDetail.teamName}
                    teamLeaderName={selectedTeamDetail.teamLeaderName}
                    accountId={selectedTeamDetail.accountId}
                    accountPw={selectedTeamDetail.accountPw}
                    budgetPlan={selectedTeamDetail.budgetPlan}
                    recentRequests={selectedTeamDetail.recentRequests}
                    onSaveAccount={async (id, pw) => {
                        try {
                            const url = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(teamTableName)}`);
                            const updateData = {
                                records: [{ id: selectedTeamDetail.id, fields: { '아이디': id, '비밀번호': pw } }]
                            };
                            const response = await fetch(url.toString(), {
                                method: 'PATCH',
                                headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                                body: JSON.stringify(updateData)
                            });
                            if (!response.ok) throw new Error('계정 정보 저장 실패');

                            setTeamRecords(prev => prev.map(t =>
                                t.id === selectedTeamDetail.id ? { ...t, fields: { ...t.fields, '아이디': id, '비밀번호': pw } } : t
                            ));
                            setSelectedTeamDetail(prev => prev ? { ...prev, accountId: id, accountPw: pw } : null);
                        } catch (err: any) {
                            alert(err.message || '저장 중 오류가 발생했습니다.');
                        }
                    }}
                    onSaveBudget={async (budget) => {
                        try {
                            const url = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(teamTableName)}`);
                            const updateData = {
                                records: [{
                                    id: selectedTeamDetail.id,
                                    fields: {
                                        '여비_배정액': budget.travel,
                                        '재료비_배정액': budget.material,
                                        '외주용역비_배정액': budget.outsourcing,
                                        '지급수수료_배정액': budget.fee
                                    }
                                }]
                            };
                            const response = await fetch(url.toString(), {
                                method: 'PATCH',
                                headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                                body: JSON.stringify(updateData)
                            });
                            if (!response.ok) throw new Error('예산 계획 저장 실패');

                            setTeamRecords(prev => prev.map(t =>
                                t.id === selectedTeamDetail.id ? {
                                    ...t,
                                    fields: {
                                        ...t.fields,
                                        '여비_배정액': budget.travel,
                                        '재료비_배정액': budget.material,
                                        '외주용역비_배정액': budget.outsourcing,
                                        '지급수수료_배정액': budget.fee,
                                        '배정 예산': budget.travel + budget.material + budget.outsourcing + budget.fee
                                    }
                                } : t
                            ));
                            setSelectedTeamDetail(prev => prev ? {
                                ...prev,
                                budgetPlan: { ...budget, total: budget.travel + budget.material + budget.outsourcing + budget.fee },
                                totalBudget: budget.travel + budget.material + budget.outsourcing + budget.fee
                            } : null);
                        } catch (err: any) {
                            alert(err.message || '저장 중 오류가 발생했습니다.');
                        }
                    }}
                />
            )}
        </div>
    );
}

