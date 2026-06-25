import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    RefreshCw, CheckCircle2, FileText, AlertCircle, Clock, XCircle,
    ArrowDownUp, Info, UploadCloud, Send, Edit3, ChevronDown
} from 'lucide-react';
import { apiGetApplications, apiUploadFile, apiSubmitSettlement, apiUpdateApplication } from '../api';
import type { Application } from '../api';
import { STATUS_INFO } from '../statusInfo';

// ─── 수정 모달용 로컬 상태 초기값 ───────────────────────────────────────
function initEditFields(rec: Application) {
    return {
        비목: rec['비목'] || '',
        신청금액Str: rec['신청금액'] ? String(rec['신청금액']) : '',
        // 여비
        출발지: rec['출발지'] || '',
        도착지: rec['도착지'] || '',
        대중교통: rec['대중교통'] || '',
        // 재료비
        구매품목: rec['구매품목'] || '',
        구매처: rec['구매처'] || '',
        구매품목설명: rec['구매품목설명'] || '',
        업체명: rec['업체명'] || '',
        // 외주용역비
        계약명: rec['계약명'] || '',
        외주용역설명: rec['외주용역설명'] || '',
        업체명_외주: rec['업체명'] || '',
        // 지급수수료
        멘토명: rec['멘토명'] || '',
        멘토소속: rec['멘토소속'] || '',
        멘토직급: rec['멘토직급'] || '',
        멘토링시간: rec['멘토링시간'] || '',
        멘토링주제: rec['멘토링주제'] || '',
    };
}
type EditFields = ReturnType<typeof initEditFields>;

export default function StudentDashboard() {
    const { user } = useAuth();
    const [records, setRecords] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [selectedDetail, setSelectedDetail] = useState<Application | null>(null);

    // 상태 설명 팝업
    const [statusPopup, setStatusPopup] = useState<string | null>(null);

    // 정산 신청 모달
    const [settlementTarget, setSettlementTarget] = useState<Application | null>(null);
    const [settlementFiles, setSettlementFiles] = useState<{
        영수증: File | null; 수령: File | null; 기타1: File | null; 기타2: File | null;
    }>({ 영수증: null, 수령: null, 기타1: null, 기타2: null });
    const [settlementMemo, setSettlementMemo] = useState('');
    const [isSettlementSubmitting, setIsSettlementSubmitting] = useState(false);
    const [settlementError, setSettlementError] = useState('');

    // 수정 모달
    const [editTarget, setEditTarget] = useState<Application | null>(null);
    const [editFields, setEditFields] = useState<EditFields | null>(null);
    const [isEditSubmitting, setIsEditSubmitting] = useState(false);
    const [editError, setEditError] = useState('');

    const budgets = {
        yubi: user?.budgetYubi || 0,
        jaeryo: user?.budgetJaeryo || 0,
        oiju: user?.budgetOiju || 0,
        jigeup: user?.budgetJigeup || 0,
    };

    const fetchMyRecords = async () => {
        if (!user?.projectName) return;
        setIsLoading(true);
        setErrorMsg('');
        try {
            const apps = await apiGetApplications(user.projectName, 'student');
            const sorted = [...apps].sort((a, b) =>
                new Date(a['신청일시'] || 0).getTime() - new Date(b['신청일시'] || 0).getTime()
            );
            const withSeq = apps.map(rec => ({
                ...rec,
                _seqNo: sorted.findIndex(r => r['신청번호'] === rec['신청번호']) + 1,
            }));
            setRecords(withSeq);
        } catch (err: any) {
            setErrorMsg(err.message || '신청 내역을 불러오지 못했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMyRecords();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.projectName]);

    // ── 정산 신청 모달 ──────────────────────────────────────────────────────
    const openSettlementModal = (rec: Application) => {
        setSettlementTarget(rec);
        setSettlementFiles({ 영수증: null, 수령: null, 기타1: null, 기타2: null });
        setSettlementMemo('');
        setSettlementError('');
    };

    const handleSettlementSubmit = async () => {
        if (!settlementTarget?.['신청번호'] || !user?.projectName) return;
        setIsSettlementSubmitting(true);
        setSettlementError('');
        try {
            const toStr = async (file: File | null): Promise<string | undefined> => {
                if (!file) return undefined;
                const { url, 원본파일명 } = await apiUploadFile(file);
                return `${원본파일명}|||${url}`;
            };
            const [영수증Str, 수령Str, 기타1Str, 기타2Str] = await Promise.all([
                toStr(settlementFiles.영수증),
                toStr(settlementFiles.수령),
                toStr(settlementFiles.기타1),
                toStr(settlementFiles.기타2),
            ]);
            await apiSubmitSettlement({
                신청번호: settlementTarget['신청번호']!,
                참가자명: user.projectName,
                증빙_영수증: 영수증Str,
                증빙_수령: 수령Str,
                증빙_기타1: 기타1Str,
                증빙_기타2: 기타2Str,
                증빙_메모: settlementMemo.trim() || undefined,
            });
            setSettlementTarget(null);
            setSelectedDetail(null);
            await fetchMyRecords();
        } catch (err: any) {
            setSettlementError(err.message || '제출 중 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            setIsSettlementSubmitting(false);
        }
    };

    // ── 수정 모달 ────────────────────────────────────────────────────────────
    const openEditModal = (rec: Application) => {
        setEditTarget(rec);
        setEditFields(initEditFields(rec));
        setEditError('');
    };

    const setEF = (key: keyof EditFields, val: string) =>
        setEditFields(prev => prev ? { ...prev, [key]: val } : prev);

    const handleEditSubmit = async () => {
        if (!editTarget?.['신청번호'] || !user?.projectName || !editFields) return;
        const numAmt = Number(editFields.신청금액Str.replace(/,/g, ''));
        if (!numAmt || isNaN(numAmt)) {
            setEditError('신청금액을 올바르게 입력해주세요.');
            return;
        }

        // 비목별 상세칸 구성
        const fields: Partial<Application> = { 신청금액: numAmt };
        if (editFields.비목 === '여비') {
            fields.출발지 = editFields.출발지;
            fields.도착지 = editFields.도착지;
            fields.대중교통 = editFields.대중교통;
        } else if (editFields.비목 === '재료비') {
            fields.구매품목 = editFields.구매품목;
            fields.구매처 = editFields.구매처;
            fields.구매품목설명 = editFields.구매품목설명;
            fields.업체명 = editFields.업체명;
        } else if (editFields.비목 === '외주용역비') {
            fields.계약명 = editFields.계약명;
            fields.업체명 = editFields.업체명_외주;
            fields.외주용역설명 = editFields.외주용역설명;
        } else if (editFields.비목 === '지급수수료') {
            fields.멘토명 = editFields.멘토명;
            fields.멘토소속 = editFields.멘토소속;
            fields.멘토직급 = editFields.멘토직급;
            fields.멘토링시간 = editFields.멘토링시간;
            fields.멘토링주제 = editFields.멘토링주제;
        }

        setIsEditSubmitting(true);
        setEditError('');
        try {
            await apiUpdateApplication({
                신청번호: editTarget['신청번호']!,
                참가자명: user.projectName,
                fields,
            });
            setEditTarget(null);
            setSelectedDetail(null);
            await fetchMyRecords();
        } catch (err: any) {
            setEditError(err.message || '수정 저장 중 오류가 발생했습니다.');
        } finally {
            setIsEditSubmitting(false);
        }
    };

    // ── 뱃지 렌더러 ──────────────────────────────────────────────────────────
    const getCategoryBadge = (category?: string) => {
        let bg = 'bg-[#F5F5F5]', tx = 'text-[#616161]';
        if (category === '여비')      { bg = 'bg-[#E1F5FE]'; tx = 'text-[#0288D1]'; }
        else if (category === '재료비')    { bg = 'bg-[#E8F5E9]'; tx = 'text-[#2E7D32]'; }
        else if (category === '외주용역비') { bg = 'bg-[#F3E5F5]'; tx = 'text-[#7B1FA2]'; }
        else if (category === '지급수수료') { bg = 'bg-[#FFF8E1]'; tx = 'text-[#F57F17]'; }
        return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${tx} ${bg}`}>{category || '-'}</span>;
    };

    const getStatusBadge = (status?: string) => {
        const base = 'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold';
        switch (status) {
            case '담당자 검토 대기 중':  return <span className={`${base} bg-[#F5F5F5] text-[#616161]`}><Clock className="w-3.5 h-3.5 mr-1" /> 담당자 검토 대기 중</span>;
            case '수정 필요':            return <span className={`${base} bg-[#FFEBEE] text-[#C62828]`}><XCircle className="w-3.5 h-3.5 mr-1" /> 수정 필요</span>;
            case '사전 승인 완료':       return <span className={`${base} bg-[#E3F2FD] text-[#1565C0]`}><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> 사전 승인 완료</span>;
            case '정산 신청':            return <span className={`${base} bg-[#EDE7F6] text-[#6A1B9A]`}><FileText className="w-3.5 h-3.5 mr-1" /> 정산 신청</span>;
            case '정산 반려':            return <span className={`${base} bg-[#FFEBEE] text-[#C62828]`}><XCircle className="w-3.5 h-3.5 mr-1" /> 정산 반려</span>;
            case '정산 중':              return <span className={`${base} bg-[#FFF3E0] text-[#E65100]`}><Clock className="w-3.5 h-3.5 mr-1" /> 정산 중</span>;
            case '정산 완료':            return <span className={`${base} bg-[#E0F2F1] text-[#00796B]`}><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> 정산 완료</span>;
            default:                    return <span className={`${base} bg-[#F5F5F5] text-[#616161]`}><Clock className="w-3.5 h-3.5 mr-1" /> {status || '담당자 검토 대기 중'}</span>;
        }
    };

    const formatShortDate = (dateString?: string) => {
        if (!dateString) return '-';
        try {
            const d = new Date(dateString);
            if (isNaN(d.getTime())) return dateString;
            const pad = (n: number) => n.toString().padStart(2, '0');
            return `${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
        } catch { return '-'; }
    };

    const [selectedCategory, setSelectedCategory] = useState<string>('전체 비목');
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    const uniqueCategories = Array.from(new Set(records.map(r => r['비목'] || ''))).filter(Boolean).sort();

    const sumBy = (cat: string) => records
        .filter(r => r['비목'] === cat && r['상태'] !== '수정 필요' && r['상태'] !== '정산 반려')
        .reduce((s, r) => s + (Number(r['신청금액']) || 0), 0);
    const usedYubi = sumBy('여비'), usedJaeryo = sumBy('재료비'), usedOiju = sumBy('외주용역비'), usedJigeup = sumBy('지급수수료');

    const filtered = records
        .filter(r => selectedCategory === '전체 비목' || r['비목'] === selectedCategory)
        .sort((a, b) => {
            const na = (a as any)._seqNo ?? 0, nb = (b as any)._seqNo ?? 0;
            return sortOrder === 'desc' ? nb - na : na - nb;
        });

    const totalBudget = budgets.yubi + budgets.jaeryo + budgets.oiju + budgets.jigeup;
    const sumApproved = records.filter(r => r['상태'] === '정산 완료' || r['상태'] === '완료' || r['상태'] === '승인').reduce((s, r) => s + (Number(r['신청금액']) || 0), 0);
    const sumPending  = records.filter(r => r['상태'] !== '수정 필요' && r['상태'] !== '정산 반려' && r['상태'] !== '정산 완료' && r['상태'] !== '완료' && r['상태'] !== '승인').reduce((s, r) => s + (Number(r['신청금액']) || 0), 0);
    const balance = totalBudget - (sumApproved + sumPending);

    // ── 공통 입력 헬퍼 ───────────────────────────────────────────────────────
    const inputCls = 'w-full h-[44px] px-3 rounded-xl bg-neutral-50 border border-neutral-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all';
    const labelCls = 'text-sm font-semibold text-neutral-700';

    const renderSettlementFileInput = (label: string, key: keyof typeof settlementFiles) => (
        <div className="space-y-1.5">
            <label className="flex items-center text-sm font-semibold text-neutral-700">
                <UploadCloud className="w-4 h-4 mr-2 text-indigo-400" />
                {label}<span className="ml-1.5 text-xs font-normal text-neutral-400">(선택)</span>
            </label>
            <input type="file" disabled={isSettlementSubmitting}
                onChange={e => setSettlementFiles(prev => ({ ...prev, [key]: e.target.files?.[0] || null }))}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-sm focus:ring-2 focus:ring-indigo-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50" />
            {settlementFiles[key] && <p className="text-xs text-neutral-500 pl-1">선택됨: {settlementFiles[key]!.name}</p>}
        </div>
    );

    // ── 수정 모달 내 비목별 입력칸 ────────────────────────────────────────────
    const renderEditDetailFields = () => {
        if (!editFields) return null;
        const cat = editFields.비목;

        if (cat === '여비') return (
            <>
                <div className="space-y-1">
                    <label className={labelCls}>출발지</label>
                    <input className={inputCls} value={editFields.출발지} onChange={e => setEF('출발지', e.target.value)} placeholder="예: 진주" />
                </div>
                <div className="space-y-1">
                    <label className={labelCls}>도착지</label>
                    <input className={inputCls} value={editFields.도착지} onChange={e => setEF('도착지', e.target.value)} placeholder="예: 서울" />
                </div>
                <div className="col-span-2 space-y-1">
                    <label className={labelCls}>대중교통</label>
                    <div className="relative">
                        <select value={editFields.대중교통} onChange={e => setEF('대중교통', e.target.value)}
                            className={`${inputCls} appearance-none cursor-pointer`}>
                            <option value="">선택</option>
                            <option value="버스">버스</option>
                            <option value="기차">기차</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                    </div>
                </div>
            </>
        );

        if (cat === '재료비') return (
            <>
                <div className="space-y-1">
                    <label className={labelCls}>구매 품목</label>
                    <input className={inputCls} value={editFields.구매품목} onChange={e => setEF('구매품목', e.target.value)} placeholder="예: 3D 프린터 필라멘트" />
                </div>
                <div className="space-y-1">
                    <label className={labelCls}>구매처</label>
                    <div className="relative">
                        <select value={editFields.구매처} onChange={e => setEF('구매처', e.target.value)}
                            className={`${inputCls} appearance-none cursor-pointer`}>
                            <option value="">선택</option>
                            <option value="온라인">온라인</option>
                            <option value="오프라인">오프라인</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className={labelCls}>업체명</label>
                    <input className={inputCls} value={editFields.업체명} onChange={e => setEF('업체명', e.target.value)} placeholder="예: ABC전자" />
                </div>
                <div className="col-span-2 space-y-1">
                    <label className={labelCls}>구매 품목 상세 설명</label>
                    <textarea value={editFields.구매품목설명} onChange={e => setEF('구매품목설명', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-y min-h-[80px]"
                        placeholder="재료의 용도 및 MVP 제작 시 활용 방법" />
                </div>
            </>
        );

        if (cat === '외주용역비') return (
            <>
                <div className="space-y-1">
                    <label className={labelCls}>계약 명</label>
                    <input className={inputCls} value={editFields.계약명} onChange={e => setEF('계약명', e.target.value)} placeholder="예: 시제품 앱 개발" />
                </div>
                <div className="space-y-1">
                    <label className={labelCls}>업체명</label>
                    <input className={inputCls} value={editFields.업체명_외주} onChange={e => setEF('업체명_외주', e.target.value)} placeholder="예: (주)테스트소프트" />
                </div>
                <div className="col-span-2 space-y-1">
                    <label className={labelCls}>외주용역 설명</label>
                    <input className={inputCls} value={editFields.외주용역설명} onChange={e => setEF('외주용역설명', e.target.value)} placeholder="어떤 용역인지 설명" />
                </div>
            </>
        );

        if (cat === '지급수수료') return (
            <>
                <div className="space-y-1">
                    <label className={labelCls}>멘토명</label>
                    <input className={inputCls} value={editFields.멘토명} onChange={e => setEF('멘토명', e.target.value)} />
                </div>
                <div className="space-y-1">
                    <label className={labelCls}>멘토 소속</label>
                    <input className={inputCls} value={editFields.멘토소속} onChange={e => setEF('멘토소속', e.target.value)} />
                </div>
                <div className="space-y-1">
                    <label className={labelCls}>멘토 직급</label>
                    <input className={inputCls} value={editFields.멘토직급} onChange={e => setEF('멘토직급', e.target.value)} />
                </div>
                <div className="space-y-1">
                    <label className={labelCls}>멘토링 시간</label>
                    <input className={inputCls} value={editFields.멘토링시간} onChange={e => setEF('멘토링시간', e.target.value)} placeholder="예: 2시간" />
                </div>
                <div className="col-span-2 space-y-1">
                    <label className={labelCls}>멘토링 예정 내용</label>
                    <input className={inputCls} value={editFields.멘토링주제} onChange={e => setEF('멘토링주제', e.target.value)} />
                </div>
            </>
        );

        return null;
    };

    // ── JSX ─────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-neutral-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* 헤더 */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 flex items-center">
                            <FileText className="w-6 h-6 mr-2 text-indigo-600" /> 내 신청 내역
                        </h1>
                        <p className="mt-1 text-sm text-neutral-500">
                            <span className="font-semibold text-indigo-600">{user?.projectName}</span> 님이 제출한 MVP 제작비 신청 현황입니다.
                        </p>
                    </div>
                    <button onClick={fetchMyRecords} disabled={isLoading}
                        className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-neutral-200 rounded-xl shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 disabled:opacity-50 transition-colors">
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin text-indigo-500' : 'text-neutral-500'}`} /> 새로고침
                    </button>
                </div>

                {errorMsg && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-100 flex items-start">
                        <AlertCircle className="w-5 h-5 mr-2 shrink-0 text-red-500 mt-0.5" /> {errorMsg}
                    </div>
                )}

                {/* KPI 카드 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
                        <h3 className="text-sm font-semibold text-neutral-500 mb-2">정산 완료 금액</h3>
                        <div className="text-blue-600" style={{ fontSize: '24px', fontWeight: 700 }}>{sumApproved.toLocaleString()} <span style={{ fontSize: '16px', fontWeight: 500 }}>원</span></div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
                        <h3 className="text-sm font-semibold text-neutral-500 mb-2">처리 중 금액</h3>
                        <div className="text-orange-500" style={{ fontSize: '24px', fontWeight: 700 }}>{sumPending.toLocaleString()} <span style={{ fontSize: '16px', fontWeight: 500 }}>원</span></div>
                    </div>
                    <div className={`p-6 rounded-2xl shadow-sm border ${balance <= 0 ? 'bg-red-50 border-red-200' : 'bg-indigo-50 border-indigo-100'}`}>
                        <h3 className={`text-sm font-semibold mb-2 ${balance <= 0 ? 'text-red-700' : 'text-indigo-700'}`}>잔액 (가용 예산)</h3>
                        <div className={balance <= 0 ? 'text-red-600' : 'text-indigo-700'} style={{ fontSize: '24px', fontWeight: 700 }}>{balance.toLocaleString()} <span style={{ fontSize: '16px', fontWeight: 500 }}>원</span></div>
                    </div>
                </div>

                {/* 비목별 소계 */}
                <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-neutral-200 flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-neutral-500 text-[13px] mr-2">비목별 소계 (사용/배정)</span>
                    {[
                        { label: '여비', used: usedYubi, budget: budgets.yubi, bg: 'bg-[#E1F5FE]', tx: 'text-[#0288D1]' },
                        { label: '재료비', used: usedJaeryo, budget: budgets.jaeryo, bg: 'bg-[#E8F5E9]', tx: 'text-[#2E7D32]' },
                        { label: '외주용역비', used: usedOiju, budget: budgets.oiju, bg: 'bg-[#F3E5F5]', tx: 'text-[#7B1FA2]' },
                        { label: '지급수수료', used: usedJigeup, budget: budgets.jigeup, bg: 'bg-[#FFF8E1]', tx: 'text-[#F57F17]' },
                    ].map(c => (
                        <div key={c.label} className={`px-3 py-1.5 rounded-md ${c.used > c.budget && c.budget > 0 ? 'bg-red-50 text-red-500' : `${c.bg} ${c.tx}`}`}>
                            <span className="font-semibold text-[11.5px] mr-1">{c.label}:</span>
                            <span className="font-bold text-[12px]">{c.used.toLocaleString()} / {c.budget.toLocaleString()}</span>
                        </div>
                    ))}
                </div>

                {/* 테이블 */}
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-neutral-200">
                            <thead className="bg-neutral-50">
                                <tr>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-neutral-500 uppercase w-20">
                                        <button onClick={() => setSortOrder(p => p === 'desc' ? 'asc' : 'desc')} className="inline-flex items-center">
                                            연번 <ArrowDownUp className="ml-1 w-3 h-3 text-neutral-400" />
                                        </button>
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-neutral-500 uppercase">신청일시</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase">
                                        <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
                                            className="bg-transparent text-neutral-500 cursor-pointer outline-none">
                                            <option value="전체 비목">비목 (전체)</option>
                                            {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-neutral-500 uppercase">신청금액</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-neutral-500 uppercase">진행 상태</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-neutral-500 uppercase">관리</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-neutral-100">
                                {isLoading && records.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-24">
                                        <RefreshCw className="mx-auto w-8 h-8 text-indigo-500 animate-spin mb-3" />
                                        <span className="text-neutral-500 font-medium">내역을 불러오는 중입니다...</span>
                                    </td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-24 bg-neutral-50/30">
                                        <FileText className="mx-auto h-12 w-12 text-neutral-300 mb-3" />
                                        <h3 className="text-sm font-semibold text-neutral-900">제출된 신청 내역이 없습니다</h3>
                                        <p className="mt-1 text-sm text-neutral-500">새로운 MVP 제작비를 신청해 보세요.</p>
                                    </td></tr>
                                ) : (
                                    filtered.map((rec) => (
                                        <tr key={rec['신청번호']} className="hover:bg-neutral-50/50 transition-colors">
                                            <td className="px-6 py-4 text-center text-sm font-semibold text-neutral-700">{(rec as any)._seqNo}</td>
                                            <td className="px-6 py-4 text-center text-sm text-neutral-600">{formatShortDate(rec['신청일시'])}</td>
                                            <td className="px-6 py-4 text-center">{getCategoryBadge(rec['비목'])}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-sm font-bold text-neutral-900">{(Number(rec['신청금액']) || 0).toLocaleString()}</span>
                                                <span className="text-xs text-neutral-500 ml-1">원</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="inline-flex items-center gap-1">
                                                    {getStatusBadge(rec['상태'])}
                                                    {STATUS_INFO[rec['상태'] || ''] && (
                                                        <button onClick={() => setStatusPopup(rec['상태'] || '')}
                                                            className="text-neutral-400 hover:text-indigo-500 transition-colors" title="상태 설명 보기">
                                                            <Info className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="inline-flex items-center gap-1.5 flex-wrap justify-center">
                                                    <button onClick={() => setSelectedDetail(rec)}
                                                        className="px-3 py-1.5 border border-indigo-200 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors">
                                                        🔍 보기
                                                    </button>
                                                    {/* 수정 필요 상태에만 수정하기 버튼 */}
                                                    {rec['상태'] === '수정 필요' && (
                                                        <button onClick={() => openEditModal(rec)}
                                                            className="px-3 py-1.5 border border-amber-200 rounded-lg text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors">
                                                            ✏️ 수정하기
                                                        </button>
                                                    )}
                                                    {/* 사전 승인 완료 상태에만 정산 신청 버튼 */}
                                                    {rec['상태'] === '사전 승인 완료' && (
                                                        <button onClick={() => openSettlementModal(rec)}
                                                            className="px-3 py-1.5 border border-emerald-200 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors">
                                                            📋 정산 신청
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── 상태 설명 팝업 ─────────────────────────────────────────────────── */}
            {statusPopup && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setStatusPopup(null)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                                <Info className="w-4 h-4 text-indigo-500" /> '{statusPopup}'란?
                            </h3>
                            <button onClick={() => setStatusPopup(null)} className="text-neutral-400 hover:text-neutral-600">✕</button>
                        </div>
                        <div className="px-6 py-5">
                            <p className="text-sm text-neutral-700 leading-relaxed">{STATUS_INFO[statusPopup]}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── 상세 보기 모달 ────────────────────────────────────────────────── */}
            {selectedDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedDetail(null)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-neutral-900">신청 상세 ({selectedDetail['신청번호']})</h3>
                            <button onClick={() => setSelectedDetail(null)} className="text-neutral-400 hover:text-neutral-600">✕</button>
                        </div>
                        <div className="px-6 py-5 space-y-3 max-h-[60vh] overflow-y-auto text-sm">
                            <DetailRow label="비목" value={selectedDetail['비목']} />
                            <DetailRow label="신청금액" value={`${(Number(selectedDetail['신청금액']) || 0).toLocaleString()}원`} />
                            <div className="flex justify-between py-1 border-b border-neutral-50">
                                <span className="text-neutral-500">상태</span>
                                <div className="flex items-center gap-1.5">
                                    {getStatusBadge(selectedDetail['상태'])}
                                    {STATUS_INFO[selectedDetail['상태'] || ''] && (
                                        <button onClick={() => setStatusPopup(selectedDetail['상태'] || '')}
                                            className="text-neutral-400 hover:text-indigo-500 transition-colors">
                                            <Info className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            {selectedDetail['비목'] === '여비' && <>
                                <DetailRow label="출발지" value={selectedDetail['출발지']} />
                                <DetailRow label="도착지" value={selectedDetail['도착지']} />
                                <DetailRow label="대중교통" value={selectedDetail['대중교통']} />
                            </>}
                            {selectedDetail['비목'] === '재료비' && <>
                                <DetailRow label="구매품목" value={selectedDetail['구매품목']} />
                                <DetailRow label="구매처" value={selectedDetail['구매처']} />
                                <DetailRow label="업체명" value={selectedDetail['업체명']} />
                                <DetailRow label="구매품목설명" value={selectedDetail['구매품목설명']} />
                            </>}
                            {selectedDetail['비목'] === '외주용역비' && <>
                                <DetailRow label="계약명" value={selectedDetail['계약명']} />
                                <DetailRow label="업체명" value={selectedDetail['업체명']} />
                                <DetailRow label="외주용역설명" value={selectedDetail['외주용역설명']} />
                            </>}
                            {selectedDetail['비목'] === '지급수수료' && <>
                                <DetailRow label="멘토명" value={selectedDetail['멘토명']} />
                                <DetailRow label="멘토소속" value={selectedDetail['멘토소속']} />
                                <DetailRow label="멘토직급" value={selectedDetail['멘토직급']} />
                                <DetailRow label="멘토링시간" value={selectedDetail['멘토링시간']} />
                                <DetailRow label="멘토링주제" value={selectedDetail['멘토링주제']} />
                            </>}
                            {selectedDetail['첨부파일'] && (() => {
                                const raw = selectedDetail['첨부파일']!;
                                const si = raw.indexOf('|||');
                                return (
                                    <div className="flex justify-between py-1 border-b border-neutral-50">
                                        <span className="text-neutral-500">첨부파일</span>
                                        <a href={si !== -1 ? raw.slice(si + 3) : raw} target="_blank" rel="noopener noreferrer"
                                            className="font-medium text-indigo-600 hover:text-indigo-800 underline max-w-[60%] text-right break-all">
                                            {si !== -1 ? raw.slice(0, si) : '첨부파일 보기'}
                                        </a>
                                    </div>
                                );
                            })()}
                            {/* 증빙 서류 */}
                            {(selectedDetail['증빙_영수증'] || selectedDetail['증빙_수령'] || selectedDetail['증빙_기타1'] || selectedDetail['증빙_기타2'] || selectedDetail['증빙_메모']) && (
                                <div className="mt-2 pt-3 border-t border-neutral-100">
                                    <p className="text-xs font-semibold text-neutral-500 mb-2">📎 제출된 증빙 서류</p>
                                    {[
                                        { label: '영수증', val: selectedDetail['증빙_영수증'] },
                                        { label: '수령 증빙', val: selectedDetail['증빙_수령'] },
                                        { label: '기타1', val: selectedDetail['증빙_기타1'] },
                                        { label: '기타2', val: selectedDetail['증빙_기타2'] },
                                    ].map(({ label, val }) => val ? (() => {
                                        const si = val.indexOf('|||');
                                        return (
                                            <div key={label} className="flex justify-between py-1 border-b border-neutral-50">
                                                <span className="text-neutral-500">{label}</span>
                                                <a href={si !== -1 ? val.slice(si + 3) : val} target="_blank" rel="noopener noreferrer"
                                                    className="font-medium text-indigo-600 hover:text-indigo-800 underline max-w-[60%] text-right break-all">
                                                    {si !== -1 ? val.slice(0, si) : '보기'}
                                                </a>
                                            </div>
                                        );
                                    })() : null)}
                                    {selectedDetail['증빙_메모'] && (
                                        <div className="mt-1 p-2 bg-neutral-50 rounded-lg text-xs text-neutral-600">
                                            <span className="font-semibold">메모: </span>{selectedDetail['증빙_메모']}
                                        </div>
                                    )}
                                </div>
                            )}
                            {/* 반려 사유 */}
                            {(selectedDetail['상태'] === '수정 필요' || selectedDetail['상태'] === '정산 반려') && selectedDetail['반려사유'] && (
                                <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-lg">
                                    <span className="font-semibold text-red-700">반려 사유: </span>
                                    <span className="text-red-600">{selectedDetail['반려사유']}</span>
                                </div>
                            )}
                        </div>
                        {/* 하단 액션 버튼 */}
                        {(selectedDetail['상태'] === '사전 승인 완료' || selectedDetail['상태'] === '수정 필요') && (
                            <div className="px-6 py-4 border-t border-neutral-100 flex justify-end gap-2">
                                {selectedDetail['상태'] === '수정 필요' && (
                                    <button onClick={() => { openEditModal(selectedDetail); setSelectedDetail(null); }}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-amber-500 rounded-xl hover:bg-amber-600 transition-colors shadow-sm">
                                        <Edit3 className="w-4 h-4" /> 수정하기
                                    </button>
                                )}
                                {selectedDetail['상태'] === '사전 승인 완료' && (
                                    <button onClick={() => { openSettlementModal(selectedDetail); setSelectedDetail(null); }}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm">
                                        <Send className="w-4 h-4" /> 정산 신청 (증빙 제출)
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── 수정 모달 ─────────────────────────────────────────────────────── */}
            {editTarget && editFields && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => !isEditSubmitting && setEditTarget(null)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
                        {/* 헤더 */}
                        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <Edit3 className="w-5 h-5" /> 신청 수정 후 재제출
                                    </h3>
                                    <p className="text-amber-100/80 text-xs mt-1">
                                        신청번호: {editTarget['신청번호']} · {editTarget['비목']}
                                    </p>
                                </div>
                                {!isEditSubmitting && (
                                    <button onClick={() => setEditTarget(null)} className="text-white/60 hover:text-white text-xl leading-none">✕</button>
                                )}
                            </div>
                        </div>

                        {/* 반려 사유 강조 표시 */}
                        {editTarget['반려사유'] && (
                            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                                <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-red-700 mb-0.5">반려 사유</p>
                                    <p className="text-sm text-red-600">{editTarget['반려사유']}</p>
                                </div>
                            </div>
                        )}

                        {/* 에러 메시지 */}
                        {editError && (
                            <div className="mx-6 mt-3 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700 flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {editError}
                            </div>
                        )}

                        {/* 폼 */}
                        <div className="px-6 py-4 space-y-4 max-h-[52vh] overflow-y-auto">
                            {/* 비목 (읽기전용 표시) */}
                            <div className="space-y-1">
                                <label className={labelCls}>비목</label>
                                <div className="h-[44px] px-3 flex items-center rounded-xl bg-neutral-100 border border-neutral-200 text-sm text-neutral-600 font-semibold">
                                    {editFields.비목}
                                </div>
                            </div>

                            {/* 신청금액 */}
                            <div className="space-y-1">
                                <label className={labelCls}>신청금액 (원)</label>
                                <input
                                    className={inputCls}
                                    value={editFields.신청금액Str}
                                    onChange={e => {
                                        const raw = e.target.value.replace(/[^0-9]/g, '');
                                        setEF('신청금액Str', raw ? Number(raw).toLocaleString() : '');
                                    }}
                                    placeholder="0"
                                />
                            </div>

                            {/* 비목별 상세 칸 */}
                            <div className="grid grid-cols-2 gap-4">
                                {renderEditDetailFields()}
                            </div>
                        </div>

                        {/* 하단 버튼 */}
                        <div className="px-6 py-4 border-t border-neutral-100 flex justify-end gap-2">
                            <button onClick={() => setEditTarget(null)} disabled={isEditSubmitting}
                                className="px-4 py-2 text-sm font-bold text-neutral-700 bg-white border border-neutral-300 rounded-xl hover:bg-neutral-50 disabled:opacity-50 transition-colors">
                                취소
                            </button>
                            <button onClick={handleEditSubmit} disabled={isEditSubmitting}
                                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-amber-500 rounded-xl hover:bg-amber-600 disabled:opacity-50 transition-colors shadow-sm">
                                {isEditSubmitting ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        저장 중...
                                    </>
                                ) : (
                                    <><Edit3 className="w-4 h-4" /> 수정 후 재제출</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── 정산 신청 모달 ────────────────────────────────────────────────── */}
            {settlementTarget && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => !isSettlementSubmitting && setSettlementTarget(null)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <Send className="w-5 h-5" /> 정산 신청 (증빙 제출)
                                    </h3>
                                    <p className="text-emerald-100/80 text-xs mt-1">
                                        신청번호: {settlementTarget['신청번호']} · {settlementTarget['비목']} · {(Number(settlementTarget['신청금액']) || 0).toLocaleString()}원
                                    </p>
                                </div>
                                {!isSettlementSubmitting && (
                                    <button onClick={() => setSettlementTarget(null)} className="text-white/60 hover:text-white text-xl leading-none">✕</button>
                                )}
                            </div>
                        </div>
                        <div className="px-6 pt-4 pb-2">
                            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800 leading-relaxed">
                                거래·수령 후 증빙 서류를 업로드해 주세요. 각 항목은 선택사항이며, 메모만 입력해도 제출이 가능합니다.
                            </div>
                        </div>
                        {settlementError && (
                            <div className="mx-6 mt-3 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700 flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {settlementError}
                            </div>
                        )}
                        <div className="px-6 py-4 space-y-4 max-h-[50vh] overflow-y-auto">
                            {renderSettlementFileInput('영수증', '영수증')}
                            {renderSettlementFileInput('수령 증빙', '수령')}
                            {renderSettlementFileInput('기타 서류 1', '기타1')}
                            {renderSettlementFileInput('기타 서류 2', '기타2')}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-neutral-700">메모 <span className="text-xs font-normal text-neutral-400">(선택)</span></label>
                                <textarea value={settlementMemo} onChange={e => setSettlementMemo(e.target.value)}
                                    disabled={isSettlementSubmitting} placeholder="증빙과 관련된 추가 설명이 있으면 입력해주세요."
                                    className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-y min-h-[80px] disabled:opacity-50" />
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-neutral-100 flex justify-end gap-2">
                            <button onClick={() => setSettlementTarget(null)} disabled={isSettlementSubmitting}
                                className="px-4 py-2 text-sm font-bold text-neutral-700 bg-white border border-neutral-300 rounded-xl hover:bg-neutral-50 disabled:opacity-50 transition-colors">
                                취소
                            </button>
                            <button onClick={handleSettlementSubmit} disabled={isSettlementSubmitting}
                                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm">
                                {isSettlementSubmitting ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        업로드 및 제출 중...
                                    </>
                                ) : (
                                    <><Send className="w-4 h-4" /> 정산 신청 제출</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function DetailRow({ label, value }: { label: string; value?: any }) {
    return (
        <div className="flex justify-between py-1 border-b border-neutral-50">
            <span className="text-neutral-500">{label}</span>
            <span className="font-medium text-neutral-900 text-right">{value || '-'}</span>
        </div>
    );
}
