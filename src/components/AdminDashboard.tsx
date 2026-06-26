import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle2, FileText, AlertCircle, Clock, XCircle, Search, Info, Banknote } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiGetApplications, apiUpdateStatus } from '../api';
import type { Application } from '../api';
import { STATUS_INFO } from '../statusInfo';

// 증빙 관련 상태 목록
const SETTLEMENT_STATUSES = ['정산 신청', '정산 반려', '정산 중', '정산 완료'];

export default function AdminDashboard() {
    const { user } = useAuth();
    const [records, setRecords] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [selectedDetail, setSelectedDetail] = useState<Application | null>(null);
    const [rejectTarget, setRejectTarget] = useState<Application | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    // '1차': 수정 필요(1차 반려), '2차': 정산 반려(2차 반려)
    const [rejectMode, setRejectMode] = useState<'1차' | '2차'>('1차');
    const [processing, setProcessing] = useState(false);

    // 상태 설명 팝업
    const [statusPopup, setStatusPopup] = useState<string | null>(null);

    // 상태 수동 조정 — 드롭다운 선택값
    const ALL_STATUSES = [
        '담당자 검토 대기 중',
        '수정 필요',
        '사전 승인 완료',
        '정산 신청',
        '정산 반려',
        '정산 중',
        '정산 완료',
    ] as const;
    const [manualStatus, setManualStatus] = useState<string>('');
    // 커스텀 확인 모달: 변경할 상태 정보 (null이면 닫힘)
    const [manualConfirm, setManualConfirm] = useState<{ from: string; to: string } | null>(null);
    // 커스텀 안내 모달: 동일 상태 선택 시 메시지 (null이면 닫힘)
    const [manualInfoMsg, setManualInfoMsg] = useState<string | null>(null);

    // 상세 모달이 열릴 때마다 현재 상태를 드롭다운 기본값으로 설정
    useEffect(() => {
        if (selectedDetail) {
            setManualStatus(selectedDetail['상태'] || '담당자 검토 대기 중');
        }
    }, [selectedDetail]);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('전체 비목');
    const [selectedStatus, setSelectedStatus] = useState('전체 상태');

    const fetchAll = async () => {
        setIsLoading(true);
        setErrorMsg('');
        try {
            const apps = await apiGetApplications(user?.projectName || '', '관리자');
            const sorted = [...apps].sort((a, b) =>
                new Date(b['신청일시'] || 0).getTime() - new Date(a['신청일시'] || 0).getTime()
            );
            setRecords(sorted);
            // 상세 모달이 열려 있으면 최신 데이터로 동기화
            setSelectedDetail(prev =>
                prev ? (sorted.find(r => r['신청번호'] === prev['신청번호']) ?? prev) : null
            );
        } catch (err: any) {
            setErrorMsg(err.message || '신청 내역을 불러오지 못했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── 1차 승인 (사전 승인 완료) ──────────────────────────────────────────
    const handleApprove = async (rec: Application) => {
        if (!rec['신청번호']) return;
        setProcessing(true);
        try {
            await apiUpdateStatus({ 신청번호: rec['신청번호'], 상태: '사전 승인 완료', 처리자: user?.projectName || '관리자' });
            await fetchAll();
            setSelectedDetail(null);
        } catch (err: any) {
            alert(err.message || '승인 처리 중 오류가 발생했습니다.');
        } finally {
            setProcessing(false);
        }
    };

    // ── 반려 확정 (1차: 수정 필요 / 2차: 정산 반려) ────────────────────────
    const handleReject = async () => {
        if (!rejectTarget?.['신청번호']) return;
        if (!rejectReason.trim()) { alert('반려 사유를 입력해주세요.'); return; }
        setProcessing(true);
        try {
            const targetStatus = rejectMode === '1차' ? '수정 필요' : '정산 반려';
            await apiUpdateStatus({
                신청번호: rejectTarget['신청번호'], 상태: targetStatus,
                반려사유: rejectReason.trim(), 처리자: user?.projectName || '관리자',
            });
            await fetchAll();
            setRejectTarget(null);
            setRejectReason('');
            setSelectedDetail(null);
        } catch (err: any) {
            alert(err.message || '반려 처리 중 오류가 발생했습니다.');
        } finally {
            setProcessing(false);
        }
    };

    // ── 2차 승인: 정산 중 ──────────────────────────────────────────────────
    const handleSettlementApprove = async (rec: Application) => {
        if (!rec['신청번호']) return;
        setProcessing(true);
        try {
            await apiUpdateStatus({ 신청번호: rec['신청번호'], 상태: '정산 중', 처리자: user?.projectName || '관리자' });
            await fetchAll();
            setSelectedDetail(null);
        } catch (err: any) {
            alert(err.message || '처리 중 오류가 발생했습니다.');
        } finally {
            setProcessing(false);
        }
    };

    // ── 2차 완료: 정산 완료 ────────────────────────────────────────────────
    const handleSettlementComplete = async (rec: Application) => {
        if (!rec['신청번호']) return;
        setProcessing(true);
        try {
            await apiUpdateStatus({ 신청번호: rec['신청번호'], 상태: '정산 완료', 처리자: user?.projectName || '관리자' });
            await fetchAll();
            setSelectedDetail(null);
        } catch (err: any) {
            alert(err.message || '처리 중 오류가 발생했습니다.');
        } finally {
            setProcessing(false);
        }
    };

    // ── 상태 수동 조정 ──────────────────────────────────────────────────────
    // 「상태 변경」 버튼 클릭 → 확인 모달 열기 (또는 동일 상태 안내)
    const handleManualStatusChange = () => {
        if (!selectedDetail?.['신청번호']) return;
        const currentStatus = (selectedDetail['상태'] || '').trim();
        const nextStatus = manualStatus.trim();
        if (currentStatus === nextStatus) {
            setManualInfoMsg('현재 상태와 동일한 상태입니다. 다른 상태를 선택해주세요.');
            return;
        }
        // 확인 모달 열기
        setManualConfirm({ from: currentStatus, to: nextStatus });
    };

    // 확인 모달에서 「변경」 클릭 → 실제 API 호출
    const doManualStatusChange = async () => {
        if (!selectedDetail?.['신청번호'] || !manualConfirm) return;
        setManualConfirm(null);
        setProcessing(true);
        try {
            await apiUpdateStatus({
                신청번호: selectedDetail['신청번호'],
                상태: manualConfirm.to,
                처리자: user?.projectName || 'admin',
            });
            await fetchAll();
        } catch (err: any) {
            setManualInfoMsg(err.message || '상태 변경 중 오류가 발생했습니다.');
        } finally {
            setProcessing(false);
        }
    };

    const getCategoryBadge = (c?: string) => {
        let bg = 'bg-[#F5F5F5]', tx = 'text-[#616161]';
        if (c === '여비') { bg = 'bg-[#E1F5FE]'; tx = 'text-[#0288D1]'; }
        else if (c === '재료비') { bg = 'bg-[#E8F5E9]'; tx = 'text-[#2E7D32]'; }
        else if (c === '외주용역비') { bg = 'bg-[#F3E5F5]'; tx = 'text-[#7B1FA2]'; }
        else if (c === '지급수수료') { bg = 'bg-[#FFF8E1]'; tx = 'text-[#F57F17]'; }
        return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${tx} ${bg}`}>{c || '-'}</span>;
    };

    const getStatusBadge = (s?: string) => {
        const base = "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold";
        switch (s) {
            case '담당자 검토 대기 중':
                return <span className={`${base} bg-[#F5F5F5] text-[#616161]`}><Clock className="w-3.5 h-3.5 mr-1" /> 담당자 검토 대기 중</span>;
            case '수정 필요':
                return <span className={`${base} bg-[#FFEBEE] text-[#C62828]`}><XCircle className="w-3.5 h-3.5 mr-1" /> 수정 필요</span>;
            case '사전 승인 완료':
                return <span className={`${base} bg-[#E3F2FD] text-[#1565C0]`}><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> 사전 승인 완료</span>;
            case '정산 신청':
                return <span className={`${base} bg-[#EDE7F6] text-[#6A1B9A]`}><FileText className="w-3.5 h-3.5 mr-1" /> 정산 신청</span>;
            case '정산 반려':
                return <span className={`${base} bg-[#FFEBEE] text-[#C62828]`}><XCircle className="w-3.5 h-3.5 mr-1" /> 정산 반려</span>;
            case '정산 중':
                return <span className={`${base} bg-[#FFF3E0] text-[#E65100]`}><Clock className="w-3.5 h-3.5 mr-1" /> 정산 중</span>;
            case '정산 완료':
                return <span className={`${base} bg-[#E0F2F1] text-[#00796B]`}><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> 정산 완료</span>;
            default:
                return <span className={`${base} bg-[#F5F5F5] text-[#616161]`}><Clock className="w-3.5 h-3.5 mr-1" /> {s || '담당자 검토 대기 중'}</span>;
        }
    };

    const formatShortDate = (d?: string) => {
        if (!d) return '-';
        try {
            const dt = new Date(d);
            if (isNaN(dt.getTime())) return d;
            const pad = (n: number) => n.toString().padStart(2, '0');
            return `${pad(dt.getMonth() + 1)}/${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
        } catch { return '-'; }
    };

    // "원본파일명|||url" 파싱 헬퍼
    const parseAttach = (raw?: string | null) => {
        if (!raw || typeof raw !== 'string') return null;
        const si = raw.indexOf('|||');
        return { name: si !== -1 ? raw.slice(0, si) : '보기', href: si !== -1 ? raw.slice(si + 3) : raw };
    };

    const uniqueCategories = Array.from(new Set(records.map(r => r['비목'] || ''))).filter(Boolean).sort();
    const uniqueStatuses = Array.from(new Set(records.map(r => r['상태'] || ''))).filter(Boolean).sort();

    const filtered = records.filter(r => {
        const matchSearch = !searchTerm || (r['참가자명'] || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchCat = selectedCategory === '전체 비목' || r['비목'] === selectedCategory;
        const matchStatus = selectedStatus === '전체 상태' || r['상태'] === selectedStatus;
        return matchSearch && matchCat && matchStatus;
    });

    // "처리 필요" 상태 (담당자 검토 대기 중, 정산 신청, 정산 반려)
    const pendingCount = records.filter(r =>
        r['상태'] === '담당자 검토 대기 중' || r['상태'] === '정산 신청' || r['상태'] === '정산 반려'
    ).length;

    return (
        <div className="min-h-screen bg-neutral-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 flex items-center">
                            <FileText className="w-6 h-6 mr-2 text-indigo-600" /> 전체 신청 내역 (관리자)
                        </h1>
                        <p className="mt-1 text-sm text-neutral-500">
                            처리 대기 중인 신청 <span className="font-semibold text-indigo-600">{pendingCount}건</span>이 있습니다.
                        </p>
                    </div>
                    <button onClick={fetchAll} disabled={isLoading}
                        className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-neutral-200 rounded-xl shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 disabled:opacity-50 transition-colors">
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin text-indigo-500' : 'text-neutral-500'}`} /> 새로고침
                    </button>
                </div>

                {errorMsg && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-100 flex items-start">
                        <AlertCircle className="w-5 h-5 mr-2 shrink-0 text-red-500 mt-0.5" /> {errorMsg}
                    </div>
                )}

                {/* 필터 바 */}
                <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-neutral-200 flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="참가자명 검색"
                            className="w-full pl-9 pr-4 py-2 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                    </div>
                    <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-sm outline-none cursor-pointer">
                        <option value="전체 비목">전체 비목</option>
                        {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-sm outline-none cursor-pointer">
                        <option value="전체 상태">전체 상태</option>
                        {uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                {/* 테이블 */}
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-neutral-200">
                            <thead className="bg-neutral-50">
                                <tr>
                                    <th className="px-4 py-4 text-center text-xs font-semibold text-neutral-500 uppercase">신청번호</th>
                                    <th className="px-4 py-4 text-center text-xs font-semibold text-neutral-500 uppercase">참가자명</th>
                                    <th className="px-4 py-4 text-center text-xs font-semibold text-neutral-500 uppercase">신청일시</th>
                                    <th className="px-4 py-4 text-center text-xs font-semibold text-neutral-500 uppercase">비목</th>
                                    <th className="px-4 py-4 text-center text-xs font-semibold text-neutral-500 uppercase">신청금액</th>
                                    <th className="px-4 py-4 text-center text-xs font-semibold text-neutral-500 uppercase">상태</th>
                                    <th className="px-4 py-4 text-center text-xs font-semibold text-neutral-500 uppercase">관리</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-neutral-100">
                                {isLoading && records.length === 0 ? (
                                    <tr><td colSpan={7} className="text-center py-24">
                                        <RefreshCw className="mx-auto w-8 h-8 text-indigo-500 animate-spin mb-3" />
                                        <span className="text-neutral-500 font-medium">불러오는 중입니다...</span>
                                    </td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan={7} className="text-center py-24 bg-neutral-50/30">
                                        <FileText className="mx-auto h-12 w-12 text-neutral-300 mb-3" />
                                        <h3 className="text-sm font-semibold text-neutral-900">조건에 맞는 신청이 없습니다</h3>
                                    </td></tr>
                                ) : (
                                    filtered.map((rec) => (
                                        <tr key={rec['신청번호']} className="hover:bg-neutral-50/50 transition-colors">
                                            <td className="px-4 py-4 text-center text-xs font-mono text-neutral-500">{rec['신청번호']}</td>
                                            <td className="px-4 py-4 text-center text-sm font-semibold text-neutral-800">{rec['참가자명']}</td>
                                            <td className="px-4 py-4 text-center text-sm text-neutral-600">{formatShortDate(rec['신청일시'])}</td>
                                            <td className="px-4 py-4 text-center">{getCategoryBadge(rec['비목'])}</td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="text-sm font-bold text-neutral-900">{(Number(rec['신청금액']) || 0).toLocaleString()}</span>
                                                <span className="text-xs text-neutral-500 ml-1">원</span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <div className="inline-flex items-center gap-1">
                                                    {getStatusBadge(rec['상태'])}
                                                    {STATUS_INFO[rec['상태'] || ''] && (
                                                        <button
                                                            onClick={() => setStatusPopup(rec['상태'] || '')}
                                                            className="text-neutral-400 hover:text-indigo-500 transition-colors"
                                                            title="상태 설명 보기"
                                                        >
                                                            <Info className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <button onClick={() => setSelectedDetail(rec)}
                                                    className="px-3 py-1.5 border border-indigo-200 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors">
                                                    상세/처리
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

            {/* 상태 설명 팝업 */}
            {statusPopup && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setStatusPopup(null)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                                <Info className="w-4 h-4 text-indigo-500" />
                                '{statusPopup}'란?
                            </h3>
                            <button onClick={() => setStatusPopup(null)} className="text-neutral-400 hover:text-neutral-600">✕</button>
                        </div>
                        <div className="px-6 py-5">
                            <p className="text-sm text-neutral-700 leading-relaxed">{STATUS_INFO[statusPopup]}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* 상세 모달 */}
            {selectedDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedDetail(null)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-neutral-900">
                                {selectedDetail['참가자명']} · {selectedDetail['신청번호']}
                            </h3>
                            <button onClick={() => setSelectedDetail(null)} className="text-neutral-400 hover:text-neutral-600">✕</button>
                        </div>

                        {/* 본문 */}
                        <div className="px-6 py-5 space-y-3 max-h-[60vh] overflow-y-auto text-sm">
                            <DetailRow label="비목" value={selectedDetail['비목']} />
                            <DetailRow label="신청금액" value={`${(Number(selectedDetail['신청금액']) || 0).toLocaleString()}원`} />

                            {/* 상태 행 */}
                            <div className="flex justify-between py-1 border-b border-neutral-50">
                                <span className="text-neutral-500">상태</span>
                                <div className="flex items-center gap-1.5">
                                    {getStatusBadge(selectedDetail['상태'])}
                                    {STATUS_INFO[selectedDetail['상태'] || ''] && (
                                        <button onClick={() => setStatusPopup(selectedDetail['상태'] || '')}
                                            className="text-neutral-400 hover:text-indigo-500 transition-colors" title="상태 설명 보기">
                                            <Info className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* 비목별 상세 */}
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

                            {/* 첨부파일 */}
                            {selectedDetail['첨부파일'] && (() => {
                                const p = parseAttach(selectedDetail['첨부파일']);
                                if (!p) return null;
                                return (
                                    <div className="flex justify-between py-1 border-b border-neutral-50">
                                        <span className="text-neutral-500">첨부파일</span>
                                        <a href={p.href} target="_blank" rel="noopener noreferrer"
                                            className="font-medium text-indigo-600 hover:text-indigo-800 underline max-w-[60%] text-right break-all">
                                            {p.name}
                                        </a>
                                    </div>
                                );
                            })()}

                            {/* ── 증빙 서류 (정산 관련 상태이면 항상 섹션 표시, 파일은 있는 것만) ── */}
                            {SETTLEMENT_STATUSES.includes((selectedDetail['상태'] || '').trim()) && (
                                <div className="mt-3 pt-3 border-t border-neutral-200">
                                    <p className="text-xs font-bold text-neutral-600 mb-2 flex items-center gap-1.5">
                                        <Banknote className="w-3.5 h-3.5 text-violet-500" /> 제출된 증빙 서류
                                    </p>
                                    {[
                                        { label: '영수증', val: selectedDetail['증빙_영수증'] },
                                        { label: '수령 증빙', val: selectedDetail['증빙_수령'] },
                                        { label: '기타1', val: selectedDetail['증빙_기타1'] },
                                        { label: '기타2', val: selectedDetail['증빙_기타2'] },
                                    ].map(({ label, val }) => {
                                        const p = parseAttach(val);
                                        if (!p) return null;
                                        return (
                                            <div key={label} className="flex justify-between py-1 border-b border-neutral-50">
                                                <span className="text-neutral-500">{label}</span>
                                                <a href={p.href} target="_blank" rel="noopener noreferrer"
                                                    className="font-medium text-violet-600 hover:text-violet-800 underline max-w-[60%] text-right break-all">
                                                    {p.name}
                                                </a>
                                            </div>
                                        );
                                    })}
                                    {selectedDetail['증빙_메모'] ? (
                                        <div className="mt-1.5 p-2 bg-violet-50 rounded-lg text-xs text-violet-800">
                                            <span className="font-semibold">메모: </span>{selectedDetail['증빙_메모']}
                                        </div>
                                    ) : (
                                        !selectedDetail['증빙_영수증'] && !selectedDetail['증빙_수령'] &&
                                        !selectedDetail['증빙_기타1'] && !selectedDetail['증빙_기타2'] && (
                                            <p className="text-xs text-neutral-400 italic">제출된 증빙 파일이 없습니다.</p>
                                        )
                                    )}
                                </div>
                            )}

                            {/* 처리이력 */}
                            {selectedDetail['처리이력'] && (
                                <div className="mt-2 p-3 bg-neutral-50 border border-neutral-100 rounded-lg whitespace-pre-line text-xs text-neutral-600">
                                    <span className="font-semibold text-neutral-700">처리이력:</span><br />{selectedDetail['처리이력']}
                                </div>
                            )}

                            {/* 반려 사유 (수정 필요 / 정산 반려) */}
                            {(selectedDetail['상태'] === '수정 필요' || selectedDetail['상태'] === '정산 반려') && selectedDetail['반려사유'] && (
                                <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-lg">
                                    <span className="font-semibold text-red-700">반려 사유: </span>
                                    <span className="text-red-600">{selectedDetail['반려사유']}</span>
                                </div>
                            )}

                            {/* ── 상태 수동 조정 ── */}
                            <div className="mt-4 pt-4 border-t-2 border-dashed border-amber-200">
                                <p className="text-xs font-bold text-amber-700 mb-2 flex items-center gap-1.5">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    상태 수동 조정 (관리자 전용)
                                </p>
                                <div className="flex items-center gap-2">
                                    <select
                                        id="manual-status-select"
                                        value={manualStatus}
                                        onChange={e => setManualStatus(e.target.value)}
                                        disabled={processing}
                                        className="flex-1 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-sm outline-none focus:ring-2 focus:ring-amber-400 text-neutral-800 disabled:opacity-50 cursor-pointer"
                                    >
                                        {ALL_STATUSES.map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                    <button
                                        id="manual-status-change-btn"
                                        onClick={handleManualStatusChange}
                                        disabled={processing}
                                        className="px-4 py-2 text-sm font-bold text-amber-800 bg-amber-100 border border-amber-300 rounded-xl hover:bg-amber-200 disabled:opacity-50 transition-colors whitespace-nowrap"
                                    >
                                        {processing ? '처리 중...' : '상태 변경'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ── 하단 버튼: 상태별 if-else 분기 (trim으로 공백 방어) ── */}
                        {(() => {
                            const st = (selectedDetail['상태'] || '').trim();
                            if (st === '담당자 검토 대기 중') return (
                                <div className="px-6 py-4 border-t border-neutral-100 flex justify-end gap-2 flex-wrap">
                                    <button onClick={() => { setRejectMode('1차'); setRejectTarget(selectedDetail); }} disabled={processing}
                                        className="px-4 py-2 text-sm font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors">
                                        수정 필요 (반려)
                                    </button>
                                    <button onClick={() => handleApprove(selectedDetail)} disabled={processing}
                                        className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                                        {processing ? '처리 중...' : '사전 승인 완료'}
                                    </button>
                                </div>
                            );
                            if (st === '정산 신청' || st === '정산 반려') return (
                                <div className="px-6 py-4 border-t border-neutral-100 flex justify-end gap-2 flex-wrap">
                                    <button onClick={() => { setRejectMode('2차'); setRejectTarget(selectedDetail); }} disabled={processing}
                                        className="px-4 py-2 text-sm font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors">
                                        정산 반려
                                    </button>
                                    <button onClick={() => handleSettlementApprove(selectedDetail)} disabled={processing}
                                        className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-bold text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors">
                                        <Banknote className="w-4 h-4" />
                                        {processing ? '처리 중...' : '증빙 승인 (정산 진행)'}
                                    </button>
                                </div>
                            );
                            if (st === '정산 중') return (
                                <div className="px-6 py-4 border-t border-neutral-100 flex justify-end gap-2">
                                    <button onClick={() => handleSettlementComplete(selectedDetail)} disabled={processing}
                                        className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                                        <CheckCircle2 className="w-4 h-4" />
                                        {processing ? '처리 중...' : '정산 완료 (송금 완료)'}
                                    </button>
                                </div>
                            );
                            if (st === '정산 완료') return (
                                <div className="px-6 py-4 border-t border-neutral-100 flex justify-end">
                                    <span className="text-sm text-neutral-400 italic">최종 완료 — 추가 처리 없음</span>
                                </div>
                            );
                            // 그 외(수정 필요, 사전 승인 완료 등) — 버튼 없음
                            return null;
                        })()}
                    </div>
                </div>
            )}

            {/* 반려 사유 입력 모달 (1차/2차 공통) */}
            {rejectTarget && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-neutral-100">
                            <h3 className="text-lg font-bold text-neutral-900">
                                {rejectMode === '1차' ? '수정 요청 사유 입력' : '정산 반려 사유 입력'}
                            </h3>
                        </div>
                        <div className="px-6 py-5">
                            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                                placeholder={rejectMode === '1차'
                                    ? '수정이 필요한 사유를 입력하세요. 참가자에게 표시됩니다.'
                                    : '정산 반려 사유를 입력하세요. 참가자에게 표시됩니다.'}
                                className="w-full min-h-[120px] px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-y" />
                        </div>
                        <div className="px-6 py-4 border-t border-neutral-100 flex justify-end gap-2">
                            <button onClick={() => { setRejectTarget(null); setRejectReason(''); }} disabled={processing}
                                className="px-4 py-2 text-sm font-bold text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50 transition-colors">
                                취소
                            </button>
                            <button onClick={handleReject} disabled={processing}
                                className="px-5 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors">
                                {processing ? '처리 중...' : (rejectMode === '1차' ? '수정 필요 확정' : '정산 반려 확정')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── 상태 수동 조정: 변경 확인 모달 (z-[80], 상세 모달보다 위) ── */}
            {manualConfirm && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    onClick={() => setManualConfirm(null)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
                        onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-amber-500" />
                                상태 변경 확인
                            </h3>
                            <button onClick={() => setManualConfirm(null)} className="text-neutral-400 hover:text-neutral-600">✕</button>
                        </div>
                        <div className="px-6 py-5">
                            <p className="text-sm text-neutral-700 leading-relaxed">
                                <span className="font-semibold text-neutral-900">'{manualConfirm.from}'</span>
                                <span className="mx-2 text-neutral-400">→</span>
                                <span className="font-semibold text-amber-700">'{manualConfirm.to}'</span>
                                <span className="text-neutral-600">(으)로 변경하시겠습니까?</span>
                            </p>
                            <p className="mt-2 text-xs text-neutral-400">변경 후 처리이력에 자동으로 기록됩니다.</p>
                        </div>
                        <div className="px-6 py-4 border-t border-neutral-100 flex justify-end gap-2">
                            <button onClick={() => setManualConfirm(null)} disabled={processing}
                                className="px-4 py-2 text-sm font-bold text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50 transition-colors">
                                취소
                            </button>
                            <button onClick={doManualStatusChange} disabled={processing}
                                className="px-5 py-2 text-sm font-bold text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors">
                                {processing ? '처리 중...' : '변경'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── 상태 수동 조정: 동일 상태 또는 오류 안내 모달 (z-[80]) ── */}
            {manualInfoMsg && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                    onClick={() => setManualInfoMsg(null)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
                        onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                                <Info className="w-4 h-4 text-indigo-500" />
                                안내
                            </h3>
                            <button onClick={() => setManualInfoMsg(null)} className="text-neutral-400 hover:text-neutral-600">✕</button>
                        </div>
                        <div className="px-6 py-5">
                            <p className="text-sm text-neutral-700 leading-relaxed">{manualInfoMsg}</p>
                        </div>
                        <div className="px-6 py-4 border-t border-neutral-100 flex justify-end">
                            <button onClick={() => setManualInfoMsg(null)}
                                className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
                                확인
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
