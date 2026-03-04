import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { RefreshCw, CheckCircle2, FileText, AlertCircle, UploadCloud, Trash2, Clock, XCircle, ArrowDownUp, ChevronDown } from 'lucide-react';
import ReportUploadModal from './ReportUploadModal';
import RecordDetailModal from './RecordDetailModal';

interface ApplicationRecord {
    id: string;
    createdTime: string;
    fields: {
        "팀명"?: string;
        "비목"?: string;
        "신청금액"?: number;
        "상태"?: string;
        "반려의견"?: string;
        "연번"?: number | string;
        "신청일시"?: string;
        "신청 일시"?: string;
        "수정 횟수"?: number;
        "수정 이력"?: string;
    };
    seqNo?: number;
}

export default function StudentDashboard() {
    const { user } = useAuth();
    const [records, setRecords] = useState<ApplicationRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [uploadModalRecord, setUploadModalRecord] = useState<{ id: string, category: string } | null>(null);
    const [selectedDetailRecord, setSelectedDetailRecord] = useState<ApplicationRecord | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteModalRecord, setDeleteModalRecord] = useState<ApplicationRecord | null>(null);

    const [teamBudgets, setTeamBudgets] = useState({
        total: user?.budget || 0,
        yubi: user?.budgetYubi || 0,
        jaeryo: user?.budgetJaeryo || 0,
        oiju: user?.budgetOiju || 0,
        jigeup: user?.budgetJigeup || 0
    });

    const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
    const mainTableName = '신청 종합';
    const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY;

    const handleDeleteRecord = async () => {
        if (!deleteModalRecord) return;
        setIsDeleting(true);

        try {
            // Delete Detail Record
            const f = deleteModalRecord.fields;
            let detailTableName = '';
            if (f["비목"] === '여비') detailTableName = import.meta.env.VITE_AIRTABLE_TRAVEL_TABLE_NAME || '여비 신청 상세 목록';
            else if (f["비목"] === '재료비') detailTableName = import.meta.env.VITE_AIRTABLE_MATERIAL_TABLE_NAME || '재료비 신청 상세 목록';
            else if (f["비목"] === '외주용역비') detailTableName = import.meta.env.VITE_AIRTABLE_OUTSOURCING_TABLE_NAME || '외주용역비 신청 상세 목록';
            else if (f["비목"] === '지급수수료') detailTableName = import.meta.env.VITE_AIRTABLE_COMMISSION_TABLE_NAME || '지급수수료 신청 상세 목록';

            if (detailTableName) {
                const searchUrl = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(detailTableName)}`);
                const dateFilter = `DATETIME_DIFF(CREATED_TIME(), '${deleteModalRecord.createdTime}', 'minutes') < 2`;
                searchUrl.searchParams.append('filterByFormula', `AND({팀명} = '${f["팀명"]}', ${dateFilter})`);
                searchUrl.searchParams.append('maxRecords', '1');

                const resSearch = await fetch(searchUrl.toString(), {
                    headers: { 'Authorization': `Bearer ${apiKey}` },
                    cache: 'no-store'
                });

                if (resSearch.ok) {
                    const dataSearch = await resSearch.json();
                    if (dataSearch.records && dataSearch.records.length > 0) {
                        const detailId = dataSearch.records[0].id;
                        await fetch(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(detailTableName)}/${detailId}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${apiKey}` }
                        });
                    }
                }
            }

            // Delete Main Record
            const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(mainTableName)}/${deleteModalRecord.id}`;
            const response = await fetch(url, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${apiKey}` }
            });

            if (!response.ok) throw new Error('메인 레코드 삭제 실패');

            setRecords(prev => prev.filter(r => r.id !== deleteModalRecord.id));
            setDeleteModalRecord(null);
            // Re-fetch everything natively
            fetchMyRecords();
        } catch (err: any) {
            alert(err.message || '삭제 중 오류가 발생했습니다.');
        } finally {
            setIsDeleting(false);
        }
    };

    const fetchMyRecords = async () => {
        if (!user?.projectName) return;
        setIsLoading(true);
        setErrorMsg('');

        try {
            if (!baseId || !apiKey) {
                throw new Error('Airtable API 연동 정보가 설정되지 않았습니다.');
            }

            // 1. Fetch Latest Team Info (Budgets)
            const teamTableName = import.meta.env.VITE_AIRTABLE_TEAM_TABLE_NAME || '팀 기본 정보';
            const teamUrl = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(teamTableName)}`);
            teamUrl.searchParams.append('filterByFormula', `{팀명} = '${user.projectName}'`);

            const teamResponse = await fetch(teamUrl.toString(), {
                headers: { 'Authorization': `Bearer ${apiKey}` },
                cache: 'no-store'
            });

            if (teamResponse.ok) {
                const teamData = await teamResponse.json();
                if (teamData.records && teamData.records.length > 0) {
                    const f = teamData.records[0].fields;
                    setTeamBudgets({
                        total: f['배정 예산'] ? Number(f['배정 예산']) : 0,
                        yubi: f['여비_배정액'] ? Number(f['여비_배정액']) : (f['여비 배정액'] ? Number(f['여비 배정액']) : 0),
                        jaeryo: f['재료비_배정액'] ? Number(f['재료비_배정액']) : (f['재료비 배정액'] ? Number(f['재료비 배정액']) : 0),
                        oiju: f['외주용역비_배정액'] ? Number(f['외주용역비_배정액']) : (f['외주용역비 배정액'] ? Number(f['외주용역비 배정액']) : 0),
                        jigeup: f['지급수수료_배정액'] ? Number(f['지급수수료_배정액']) : (f['지급수수료 배정액'] ? Number(f['지급수수료 배정액']) : 0),
                    });
                }
            }

            // 2. Fetch records filtered by 팀명
            const url = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(mainTableName)}`);
            url.searchParams.append('filterByFormula', `{팀명} = '${user.projectName}'`);

            const response = await fetch(url.toString(), {
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                },
                cache: 'no-store'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || '신청 내역을 불러오는 데 실패했습니다.');
            }

            const data = await response.json();

            // Add chronological sequence number calculation to parsed records
            const fetchedRecords: ApplicationRecord[] = data.records;

            // 1. Sort all fetched records purely chronologically to determine their absolute index (1, 2, 3...)
            const chronoSorted = [...fetchedRecords].sort((a, b) => {
                const dateA = new Date((a.fields["신청 일시"] as string) || (a.fields["신청일시"] as string) || a.createdTime).getTime();
                const dateB = new Date((b.fields["신청 일시"] as string) || (b.fields["신청일시"] as string) || b.createdTime).getTime();
                return dateA - dateB; // Ascending: oldest first
            });

            // 2. Assign absolute sequence number
            const recordsWithSeqNo = fetchedRecords.map(record => ({
                ...record,
                seqNo: chronoSorted.findIndex(r => r.id === record.id) + 1
            }));

            // 3. Set the state with the enriched records
            setRecords(recordsWithSeqNo);
        } catch (err: any) {
            setErrorMsg(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMyRecords();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.projectName]);

    useEffect(() => {
        if (selectedDetailRecord) {
            const syncedRecord = records.find(r => r.id === selectedDetailRecord.id);
            if (syncedRecord && JSON.stringify(syncedRecord.fields) !== JSON.stringify(selectedDetailRecord.fields)) {
                setSelectedDetailRecord(syncedRecord);
            }
        }
    }, [records]);

    const handleUploadSuccess = () => {
        setUploadModalRecord(null);
        fetchMyRecords(); // Refresh list to show updated status
    };

    const getCategoryBadge = (category?: string) => {
        let bgClass = 'bg-[#F5F5F5]';
        let textClass = 'text-[#616161]';
        if (category === '여비') { bgClass = 'bg-[#E1F5FE]'; textClass = 'text-[#0288D1]'; }
        else if (category === '재료비') { bgClass = 'bg-[#E8F5E9]'; textClass = 'text-[#2E7D32]'; }
        else if (category === '외주용역비') { bgClass = 'bg-[#F3E5F5]'; textClass = 'text-[#7B1FA2]'; }
        else if (category === '지급수수료') { bgClass = 'bg-[#FFF8E1]'; textClass = 'text-[#F57F17]'; }

        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${textClass} ${bgClass}`}>
                {category || '-'}
            </span>
        );
    };

    const getStatusBadge = (status?: string) => {
        const baseClass = "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold";
        switch (status) {
            case '완료 서류 첨부 대기 중':
                return (
                    <span className={`${baseClass} bg-indigo-100 text-indigo-700`}>
                        <UploadCloud className="w-3.5 h-3.5 mr-1" /> 완료 서류 첨부 대기 중
                    </span>
                );
            case '완료 서류 반려':
                return (
                    <span className={`${baseClass} bg-[#FFEBEE] text-[#C62828]`}>
                        <UploadCloud className="w-3.5 h-3.5 mr-1" /> 완료 서류 반려
                    </span>
                );
            case '완료 서류 첨부 완료':
                return (
                    <span className={`${baseClass} bg-green-100 text-green-700`}>
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> 완료 서류 첨부 완료
                    </span>
                );
            case '검토중':
                return (
                    <span className={`${baseClass} bg-[#F3E5F5] text-[#7B1FA2]`}>
                        <Clock className="w-3.5 h-3.5 mr-1 animate-pulse" /> 검토중
                    </span>
                );
            case '승인':
                return (
                    <span className={`${baseClass} bg-[#E0F2F1] text-[#00796B]`}>
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> 최종 승인 완료
                    </span>
                );
            case '반려':
                return (
                    <span className={`${baseClass} bg-[#FFEBEE] text-[#C62828]`}>
                        <XCircle className="w-3.5 h-3.5 mr-1" /> 반려됨
                    </span>
                );
            case '반려 수정 완료':
                return (
                    <span className={`${baseClass} bg-[#FFF8E1] text-[#F57F17]`}>
                        <Clock className="w-3.5 h-3.5 mr-1" /> 반려 수정 완료
                    </span>
                );
            case '담당자 확인 전':
                return (
                    <span className={`${baseClass} bg-[#F5F5F5] text-[#616161]`}>
                        <Clock className="w-3.5 h-3.5 mr-1" /> 담당자 확인 전
                    </span>
                );
            default:
                return (
                    <span className={`${baseClass} bg-[#F5F5F5] text-[#616161]`}>
                        <Clock className="w-3.5 h-3.5 mr-1" /> {status || '담당자 확인 전'}
                    </span>
                );
        }
    };

    const formatShortDate = (dateString?: string) => {
        if (!dateString) return '-';
        try {
            const d = new Date(dateString);
            if (isNaN(d.getTime())) return dateString;
            const pad = (n: number) => n.toString().padStart(2, '0');
            return `${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
        } catch {
            return '-';
        }
    };



    const [selectedCategory, setSelectedCategory] = useState<string>('전체 비목');
    const [selectedStatus, setSelectedStatus] = useState<string>('전체 상태');
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

    // Extract dynamic unique filter values
    const uniqueCategories = Array.from(new Set(records.map(r => r.fields["비목"] || ''))).filter(Boolean).sort();
    const uniqueStatuses = Array.from(new Set(records.map(r => r.fields["상태"] || ''))).filter(Boolean).sort();



    // Calculate Global Subtotals per Category (Only Approved + Pending)
    const validStatuses = ['담당자 확인 전', '반려 수정 완료', '승인', '지출 처리 중', '완료 서류 첨부 대기 중', '완료 서류 반려', '완료 서류 첨부 완료', '검토중'];
    const globalYubi = records.filter(r => r.fields["비목"] === '여비' && validStatuses.includes(r.fields["상태"] || '')).reduce((sum, r) => sum + (r.fields["신청금액"] || 0), 0);
    const globalJaeryo = records.filter(r => r.fields["비목"] === '재료비' && validStatuses.includes(r.fields["상태"] || '')).reduce((sum, r) => sum + (r.fields["신청금액"] || 0), 0);
    const globalOiju = records.filter(r => r.fields["비목"] === '외주용역비' && validStatuses.includes(r.fields["상태"] || '')).reduce((sum, r) => sum + (r.fields["신청금액"] || 0), 0);
    const globalJigeup = records.filter(r => r.fields["비목"] === '지급수수료' && validStatuses.includes(r.fields["상태"] || '')).reduce((sum, r) => sum + (r.fields["신청금액"] || 0), 0);

    // Filter Records Based on Selected Category and Status
    const rawFilteredRecords = records.filter(record => {
        const matchCategory = selectedCategory === '전체 비목' || record.fields["비목"] === selectedCategory;
        const matchStatus = selectedStatus === '전체 상태' || record.fields["상태"] === selectedStatus;
        return matchCategory && matchStatus;
    });

    const filteredRecords = [...rawFilteredRecords].sort((a, b) => {
        // Fallback to 0 if seqNo is somehow undefined
        const numA = a.seqNo ?? 0;
        const numB = b.seqNo ?? 0;
        return sortOrder === 'desc' ? numB - numA : numA - numB;
    });

    // Calculation for Overall Aggregate KPIs
    const budget = teamBudgets.total;
    const sumApproved = records.filter(r => r.fields["상태"] === '승인').reduce((sum, r) => sum + (r.fields["신청금액"] || 0), 0);
    const sumPending = records.filter(r => {
        const status = r.fields["상태"];
        return status && status !== '반려' && status !== '승인'; // Everything except final rejection or final approval is pending.
    }).reduce((sum, r) => sum + (r.fields["신청금액"] || 0), 0);
    const realBalance = budget - (sumApproved + sumPending);

    // Category-specific budgets
    const budgetYubi = teamBudgets.yubi;
    const budgetJaeryo = teamBudgets.jaeryo;
    const budgetOiju = teamBudgets.oiju;
    const budgetJigeup = teamBudgets.jigeup;

    // Calculate Subtotal for the filtered view
    const filteredSubtotal = filteredRecords.reduce((sum, record) => sum + (record.fields["신청금액"] || 0), 0);

    return (
        <div className="min-h-screen bg-neutral-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Header Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 flex items-center">
                            <FileText className="w-6 h-6 mr-2 text-indigo-600" />
                            내 신청 내역
                        </h1>
                        <p className="mt-1 text-sm text-neutral-500">
                            <span className="font-semibold text-indigo-600">{user?.projectName}</span> 팀이 제출한 MVP 제작비 신청 현황입니다.
                        </p>
                    </div>

                    <div className="mt-4 sm:mt-0 flex flex-col sm:items-end space-y-3 justify-center">

                        <button
                            onClick={fetchMyRecords}
                            disabled={isLoading}
                            className="inline-flex items-center px-4 py-2 border border-neutral-200 rounded-xl shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin text-indigo-500' : 'text-neutral-500'}`} />
                            새로고침
                        </button>
                    </div>
                </div>

                {errorMsg && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-100 flex items-start">
                        <AlertCircle className="w-5 h-5 mr-2 shrink-0 text-red-500 mt-0.5" />
                        {errorMsg}
                    </div>
                )}

                {/* Dashboard List */}
                <div className="space-y-4 animate-in fade-in duration-500">
                    {/* 3 Summary KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* 승인 금액 합계 */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col justify-center transition-all hover:shadow-md">
                            <h3 className="text-sm font-semibold text-neutral-500 mb-2">승인 금액 합계</h3>
                            <div className="text-blue-600" style={{ fontSize: '24px', fontWeight: 700 }}>
                                {sumApproved.toLocaleString()} <span className="opacity-75" style={{ fontSize: '16px', fontWeight: 500 }}>원</span>
                            </div>
                        </div>

                        {/* 신청 금액 합계 */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col justify-center transition-all hover:shadow-md">
                            <h3 className="text-sm font-semibold text-neutral-500 mb-2">신청 금액 합계</h3>
                            <div className="text-orange-500" style={{ fontSize: '24px', fontWeight: 700 }}>
                                {sumPending.toLocaleString()} <span className="opacity-75" style={{ fontSize: '16px', fontWeight: 500 }}>원</span>
                            </div>
                        </div>

                        {/* 잔액 */}
                        <div className={`p-6 rounded-2xl shadow-sm border flex flex-col justify-center transition-all hover:shadow-md ${realBalance <= 0 ? 'bg-red-50 border-red-200' : 'bg-indigo-50 border-indigo-100'}`}>
                            <h3 className={`text-sm font-semibold mb-2 ${realBalance <= 0 ? 'text-red-700' : 'text-indigo-700'}`}>잔액 (가용 예산)</h3>
                            <div className={`${realBalance <= 0 ? 'text-red-600' : 'text-indigo-700'}`} style={{ fontSize: '24px', fontWeight: 700 }}>
                                {realBalance.toLocaleString()} <span className="opacity-75" style={{ fontSize: '16px', fontWeight: 500 }}>원</span>
                            </div>
                        </div>
                    </div>

                    {/* Global Category Summary Bar */}
                    <div className="bg-white px-3 sm:px-4 py-3 w-full max-w-[100%] overflow-hidden rounded-2xl shadow-sm border border-neutral-200 flex items-center">
                        <div className="flex flex-col mr-2 sm:mr-4 shrink-0">
                            <span className="font-semibold text-neutral-500 text-[13px] whitespace-nowrap">비목별 소계</span>
                            <span className="text-[11px] font-medium text-[#888888] mt-0.5 whitespace-nowrap">(신청·승인 / 계획)</span>
                        </div>
                        <div className="flex flex-1 overflow-hidden" style={{ gap: '8px' }}>
                            <div className={`flex items-baseline justify-center pl-1 pr-2 sm:pr-3 py-1.5 box-border rounded-md flex-1 min-w-0 overflow-hidden ${globalYubi > budgetYubi && budgetYubi > 0 ? 'bg-red-50 text-red-500' : 'bg-[#E1F5FE] text-[#0288D1]'}`}>
                                <span className="font-semibold text-[10.5px] sm:text-[11.5px] mr-0.5 sm:mr-1 shrink-0 whitespace-nowrap" style={{ letterSpacing: '-0.3px' }}>여비:</span>
                                <span className="font-bold text-[11px] sm:text-[12px] truncate whitespace-nowrap" style={{ letterSpacing: '-0.5px' }}>{globalYubi.toLocaleString()} / <span className={`${globalYubi > budgetYubi && budgetYubi > 0 ? 'text-red-500/80' : 'text-[#0288D1]/70'}`}>{budgetYubi.toLocaleString()}</span></span>
                            </div>
                            <div className={`flex items-baseline justify-center pl-1 pr-2 sm:pr-3 py-1.5 box-border rounded-md flex-1 min-w-0 overflow-hidden ${globalJaeryo > budgetJaeryo && budgetJaeryo > 0 ? 'bg-red-50 text-red-500' : 'bg-[#E8F5E9] text-[#2E7D32]'}`}>
                                <span className="font-semibold text-[10.5px] sm:text-[11.5px] mr-0.5 sm:mr-1 shrink-0 whitespace-nowrap" style={{ letterSpacing: '-0.3px' }}>재료비:</span>
                                <span className="font-bold text-[11px] sm:text-[12px] truncate whitespace-nowrap" style={{ letterSpacing: '-0.5px' }}>{globalJaeryo.toLocaleString()} / <span className={`${globalJaeryo > budgetJaeryo && budgetJaeryo > 0 ? 'text-red-500/80' : 'text-[#2E7D32]/70'}`}>{budgetJaeryo.toLocaleString()}</span></span>
                            </div>
                            <div className={`flex items-baseline justify-center pl-1 pr-2 sm:pr-3 py-1.5 box-border rounded-md flex-1 min-w-0 overflow-hidden ${globalOiju > budgetOiju && budgetOiju > 0 ? 'bg-red-50 text-red-500' : 'bg-[#F3E5F5] text-[#7B1FA2]'}`}>
                                <span className="font-semibold text-[10.5px] sm:text-[11.5px] mr-0.5 sm:mr-1 shrink-0 whitespace-nowrap" style={{ letterSpacing: '-0.3px' }}>외주용역비:</span>
                                <span className="font-bold text-[11px] sm:text-[12px] truncate whitespace-nowrap" style={{ letterSpacing: '-0.5px' }}>{globalOiju.toLocaleString()} / <span className={`${globalOiju > budgetOiju && budgetOiju > 0 ? 'text-red-500/80' : 'text-[#7B1FA2]/70'}`}>{budgetOiju.toLocaleString()}</span></span>
                            </div>
                            <div className={`flex items-baseline justify-center pl-1 pr-2 sm:pr-3 py-1.5 box-border rounded-md flex-1 min-w-0 overflow-hidden ${globalJigeup > budgetJigeup && budgetJigeup > 0 ? 'bg-red-50 text-red-500' : 'bg-[#FFF8E1] text-[#F57F17]'}`}>
                                <span className="font-semibold text-[10.5px] sm:text-[11.5px] mr-0.5 sm:mr-1 shrink-0 whitespace-nowrap" style={{ letterSpacing: '-0.3px' }}>지급수수료:</span>
                                <span className="font-bold text-[11px] sm:text-[12px] truncate whitespace-nowrap" style={{ letterSpacing: '-0.5px' }}>{globalJigeup.toLocaleString()} / <span className={`${globalJigeup > budgetJigeup && budgetJigeup > 0 ? 'text-red-500/80' : 'text-[#F57F17]/70'}`}>{budgetJigeup.toLocaleString()}</span></span>
                            </div>
                        </div>
                    </div>

                    {/* Top action row for table: Right aligned Subtotal */}
                    <div className="flex justify-end">
                        <div className="flex items-center px-4 py-2 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                            <span className="text-sm font-semibold text-indigo-900 mr-2">
                                선택 영역 소계:
                            </span>
                            <span className="text-lg font-bold text-indigo-600">
                                {filteredSubtotal.toLocaleString()}원
                            </span>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-neutral-200">
                                <thead className="bg-neutral-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap align-top w-20">
                                            <button
                                                onClick={() => setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'))}
                                                className="inline-flex items-center justify-center group focus:outline-none w-full"
                                            >
                                                연번
                                                <ArrowDownUp className="ml-1 w-3 h-3 text-neutral-400 group-hover:text-neutral-600 transition-colors" />
                                            </button>
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap align-top w-[18%]">신청일시</th>
                                        <th scope="col" className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider whitespace-nowrap align-top w-[18%]">
                                            <div className="relative inline-flex items-center justify-center group cursor-pointer w-full" title="비목 필터">
                                                <span className={`transition-colors ${selectedCategory !== '전체 비목' ? 'text-indigo-600 font-bold' : 'text-neutral-500'}`}>
                                                    비목 {selectedCategory !== '전체 비목' && <span className="ml-1 font-medium bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">({selectedCategory})</span>}
                                                </span>
                                                <ChevronDown
                                                    className={`ml-1 w-[14px] h-[14px] transition-colors ${selectedCategory !== '전체 비목' ? 'text-indigo-500' : 'text-neutral-400 group-hover:text-neutral-600'}`}
                                                />
                                                <select
                                                    value={selectedCategory}
                                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                >
                                                    <option value="전체 비목">전체</option>
                                                    {uniqueCategories.map(cat => (
                                                        <option key={cat} value={cat}>{cat}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap align-top w-[18%]">신청금액</th>
                                        <th scope="col" className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider whitespace-nowrap align-top w-[20%]">
                                            <div className="relative inline-flex items-center justify-center group cursor-pointer w-full" title="상태 필터">
                                                <span className={`transition-colors ${selectedStatus !== '전체 상태' ? 'text-indigo-600 font-bold' : 'text-neutral-500'}`}>
                                                    진행 상태 {selectedStatus !== '전체 상태' && <span className="ml-1 font-medium bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">({selectedStatus})</span>}
                                                </span>
                                                <ChevronDown
                                                    className={`ml-1 w-[14px] h-[14px] transition-colors ${selectedStatus !== '전체 상태' ? 'text-indigo-500' : 'text-neutral-400 group-hover:text-neutral-600'}`}
                                                />
                                                <select
                                                    value={selectedStatus}
                                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                >
                                                    <option value="전체 상태">전체</option>
                                                    {uniqueStatuses.map(status => (
                                                        <option key={status} value={status}>
                                                            {status}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap align-top w-[140px]">관리</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-neutral-100">
                                    {isLoading && records.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="text-center py-24">
                                                <RefreshCw className="mx-auto w-8 h-8 text-indigo-500 animate-spin mb-3" />
                                                <span className="text-neutral-500 font-medium">내역을 불러오는 중입니다...</span>
                                            </td>
                                        </tr>
                                    ) : records.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="text-center py-24 bg-neutral-50/30">
                                                <FileText className="mx-auto h-12 w-12 text-neutral-300 mb-3" />
                                                <h3 className="text-sm font-semibold text-neutral-900">제출된 신청 내역이 없습니다</h3>
                                                <p className="mt-1 text-sm text-neutral-500">새로운 MVP 제작비를 신청해 보세요.</p>
                                            </td>
                                        </tr>
                                    ) : filteredRecords.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="text-center py-16 bg-neutral-50/30">
                                                <FileText className="mx-auto h-10 w-10 text-neutral-300 mb-3" />
                                                <h3 className="text-sm font-semibold text-neutral-900">조건에 맞는 내역이 없습니다</h3>
                                                <p className="mt-1 text-sm text-neutral-500">다른 비목이나 상태를 선택하거나 새로운 신청을 진행해 보세요.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredRecords.map((record) => {
                                            const f = record.fields;
                                            const isUploadReady = f["상태"] === '완료 서류 첨부 대기 중' || f["상태"] === '완료 서류 반려';

                                            return (
                                                <tr key={record.id} className="hover:bg-neutral-50/50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-neutral-700">
                                                        {record.seqNo}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <div className="flex flex-col items-center justify-center">
                                                            {(() => {
                                                                const editTimeStr = (f["신청 일시"] as string) || (f["신청일시"] as string);
                                                                const createdTimeStr = record.createdTime;

                                                                const existingHistoryText = f["수정 이력"] || '';
                                                                const logLines = existingHistoryText ? existingHistoryText.split('\n').filter((l: string) => l.trim().length > 0) : [];
                                                                const actualEditCount = logLines.length >= 2 ? logLines.length - 1 : 0;
                                                                const isModified = actualEditCount > 0;

                                                                const displayTime = editTimeStr ? formatShortDate(editTimeStr) : formatShortDate(createdTimeStr);
                                                                return (
                                                                    <>
                                                                        <span className="text-sm font-medium text-neutral-600">{displayTime}</span>
                                                                        {isModified ? (
                                                                            <span className="text-[11px] text-blue-500 mt-0.5 font-bold tracking-tight whitespace-nowrap">수정됨({actualEditCount})</span>
                                                                        ) : null}
                                                                    </>
                                                                );
                                                            })()}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        {getCategoryBadge(f["비목"])}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <div className="flex flex-col items-center justify-center">
                                                            <div>
                                                                <span className="text-sm font-bold text-neutral-900">
                                                                    {f["신청금액"] ? f["신청금액"].toLocaleString() : 0}
                                                                </span>
                                                                <span className="text-xs text-neutral-500 ml-1">원</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        {getStatusBadge(f["상태"])}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center w-[140px]">
                                                        <div className="flex flex-row space-x-2 items-center justify-center w-full">
                                                            <div className={`flex flex-row space-x-2 items-center justify-center ${isUploadReady ? 'w-auto' : 'w-full'}`}>
                                                                <button
                                                                    onClick={() => setSelectedDetailRecord(record)}
                                                                    title="신청서 보기"
                                                                    className="relative inline-flex items-center justify-center px-3 py-1.5 border border-indigo-200 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors shadow-sm whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 h-8"
                                                                >
                                                                    🔍 신청서 보기
                                                                    {f["상태"] === '반려' && (
                                                                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                                                        </span>
                                                                    )}
                                                                </button>
                                                                {isUploadReady && (
                                                                    <button
                                                                        onClick={() => setUploadModalRecord({ id: record.id, category: f["비목"] || '' })}
                                                                        title="완료 보고서 첨부"
                                                                        className="relative inline-flex items-center justify-center w-8 h-8 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 flex-shrink-0"
                                                                    >
                                                                        <UploadCloud className="w-4 h-4" />
                                                                        {f["상태"] === '완료 서류 반려' || f["상태"] === '완료 서류 첨부 대기 중' ? (
                                                                            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                                                            </span>
                                                                        ) : null}
                                                                    </button>
                                                                )}
                                                                {f["상태"] === '담당자 확인 전' && (
                                                                    <button
                                                                        onClick={() => setDeleteModalRecord(record)}
                                                                        title="삭제"
                                                                        className="inline-flex items-center justify-center p-1.5 border border-red-200 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors shadow-sm h-8 w-8 flex-shrink-0"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Phase 2 Report Upload Modal */}
            {uploadModalRecord && (
                <ReportUploadModal
                    mainRecordId={uploadModalRecord.id}
                    teamName={user?.projectName || ''}
                    expenseCategory={uploadModalRecord.category}
                    onClose={() => setUploadModalRecord(null)}
                    onSuccess={handleUploadSuccess}
                />
            )}

            {/* Application Detail Modal */}
            {selectedDetailRecord && (
                <RecordDetailModal
                    record={selectedDetailRecord}
                    onClose={() => setSelectedDetailRecord(null)}
                    baseId={baseId}
                    apiKey={apiKey}
                    onOpenUploadModal={() => {
                        setSelectedDetailRecord(null);
                        setUploadModalRecord({ id: selectedDetailRecord.id, category: selectedDetailRecord.fields["비목"] || '' });
                    }}
                    availableBudget={(function () {
                        const c = selectedDetailRecord.fields["비목"];
                        if (c === '여비') return teamBudgets.yubi - globalYubi;
                        if (c === '재료비') return teamBudgets.jaeryo - globalJaeryo;
                        if (c === '외주용역비') return teamBudgets.oiju - globalOiju;
                        if (c === '지급수수료') return teamBudgets.jigeup - globalJigeup;
                        return 0;
                    })()}
                    onSaveSuccess={async () => {
                        await fetchMyRecords();
                    }}
                />
            )}
            {/* Delete Confirmation Modal */}
            {deleteModalRecord && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 text-center p-6">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                            <AlertCircle className="h-6 w-6 text-red-600" />
                        </div>
                        <h3 className="text-lg font-bold text-neutral-900 mb-2">신청 건을 삭제하시겠습니까?</h3>
                        <p className="text-sm text-neutral-500 mb-6">
                            이 작업은 되돌릴 수 없으며, 연결된 모든 상세 데이터가 함께 완전히 삭제됩니다.
                        </p>
                        <div className="flex justify-center space-x-3">
                            <button
                                onClick={() => setDeleteModalRecord(null)}
                                disabled={isDeleting}
                                className="px-4 py-2 text-sm font-bold text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors shadow-sm outline-none"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleDeleteRecord}
                                disabled={isDeleting}
                                className="px-6 py-2 text-sm font-bold text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center"
                            >
                                {isDeleting ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                        삭제 중...
                                    </>
                                ) : (
                                    '삭제 완료'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
