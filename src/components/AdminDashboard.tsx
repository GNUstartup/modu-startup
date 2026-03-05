import { useEffect, useState } from 'react';
import { RefreshCw, AlertCircle, FileText, Pencil, Trash2, X } from 'lucide-react';
import RecordDetailModal from './RecordDetailModal';

interface AirtableRecord {
    id: string;
    createdTime: string;
    fields: {
        "팀명"?: string;
        "비목"?: string;
        "신청금액"?: number;
        "상태"?: string;
        "반려의견"?: string;
        "메모"?: string;
        "신청 일시"?: string;
        "신청일시"?: string;
        "수정 이력"?: string;
    };
    seqNo?: number;
}

export default function AdminDashboard() {
    const [records, setRecords] = useState<AirtableRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [toastMsg, setToastMsg] = useState('');

    // Dynamic Filters
    const [selectedTeam, setSelectedTeam] = useState<string>('전체 팀');
    const [selectedCategory, setSelectedCategory] = useState<string>('전체 비목');
    const [selectedStatus, setSelectedStatus] = useState<string>('전체 상태');

    // Quick Filters (Big Buttons)
    const [activeQuickFilter, setActiveQuickFilter] = useState<'미열람' | '처리 중' | '처리 완료' | null>(null);

    // Modal state
    const [selectedDetailRecord, setSelectedDetailRecord] = useState<AirtableRecord | null>(null);

    // Reject Modal States
    const [rejectModalRecord, setRejectModalRecord] = useState<AirtableRecord | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [isRejecting, setIsRejecting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteModalRecord, setDeleteModalRecord] = useState<AirtableRecord | null>(null);

    // Bulk Delete States
    const [selectedRecordIds, setSelectedRecordIds] = useState<Set<string>>(new Set());
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

    // Dynamic Airtable Status Cache
    const [categoryStatusOptions, setCategoryStatusOptions] = useState<Record<string, string[]>>({});

    const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
    const tableName = '신청 종합';
    const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY;

    const fetchMetadata = async () => {
        try {
            if (!baseId || !apiKey) return;
            const url = `https://api.airtable.com/v0/meta/bases/${baseId}/tables`;
            const response = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` }, cache: 'no-store' });
            if (!response.ok) return;

            const data = await response.json();
            const tableMap: Record<string, string> = {
                '여비': import.meta.env.VITE_AIRTABLE_TRAVEL_TABLE_NAME || '여비 신청 상세 목록',
                '재료비': import.meta.env.VITE_AIRTABLE_MATERIAL_TABLE_NAME || '재료비 신청 상세 목록',
                '외주용역비': import.meta.env.VITE_AIRTABLE_OUTSOURCING_TABLE_NAME || '외주용역비 신청 상세 목록',
                '지급수수료': import.meta.env.VITE_AIRTABLE_COMMISSION_TABLE_NAME || '지급수수료 신청 상세 목록',
                'default': tableName
            };

            const newOptions: Record<string, string[]> = {};

            for (const [category, tName] of Object.entries(tableMap)) {
                const tableMeta = data.tables?.find((t: any) => t.name === tName);
                if (tableMeta) {
                    const statusField = tableMeta.fields?.find((f: any) => f.name === '상태');
                    if (statusField?.options?.choices) {
                        newOptions[category] = statusField.options.choices.map((c: any) => c.name);
                    }
                }
            }
            setCategoryStatusOptions(newOptions);
        } catch (e) {
            console.error("Meta API error", e);
        }
    };

    const fetchRecords = async () => {
        setIsLoading(true);
        setErrorMsg('');
        try {
            if (!baseId || !tableName || !apiKey) {
                throw new Error('Airtable 연동 정보(.env.local)가 설정되지 않았습니다.');
            }

            // Fetch ALL records and Teams
            const url = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`);
            const teamTableName = import.meta.env.VITE_AIRTABLE_TEAM_TABLE_NAME || '팀 기본 정보';
            const teamUrl = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(teamTableName)}`);

            const [response, teamResponse] = await Promise.all([
                fetch(url.toString(), { headers: { 'Authorization': `Bearer ${apiKey}` }, cache: 'no-store' }),
                fetch(teamUrl.toString(), { headers: { 'Authorization': `Bearer ${apiKey}` }, cache: 'no-store' })
            ]);

            if (!response.ok) {
                let errorDetails = '';
                try {
                    const errorJson = await response.json();
                    errorDetails = errorJson.error?.message || errorJson.error?.type || '';
                } catch (e) { }
                throw new Error(`Airtable 데이터 불러오기 실패. 테이블 이름이나 권한을 확인하세요. ${errorDetails ? `(상세: ${errorDetails})` : ''}`);
            }

            const data = await response.json();

            const validTeamNames = new Set<string>();
            if (teamResponse && teamResponse.ok) {
                const teamData = await teamResponse.json();
                if (teamData.records) {
                    teamData.records.forEach((t: any) => {
                        if (t.fields["팀명"]) validTeamNames.add(t.fields["팀명"]);
                    });
                }
            }

            // Filter out empty teams (including whitespace) and deleted teams
            const validRecords = data.records.filter((r: AirtableRecord) => {
                const teamName = r.fields["팀명"];
                return teamName && teamName.trim().length > 0 && validTeamNames.has(teamName);
            });

            // Sort by Team Name (ASC), then by Date (DESC)
            const sortedRecords = validRecords.sort((a: AirtableRecord, b: AirtableRecord) => {
                const teamA = a.fields["팀명"] || '';
                const teamB = b.fields["팀명"] || '';

                if (teamA < teamB) return -1;
                if (teamA > teamB) return 1;

                // If teams are equal, sort by newest date first
                const dateA = new Date((a.fields["신청 일시"] as string) || (a.fields["신청일시"] as string) || a.createdTime).getTime();
                const dateB = new Date((b.fields["신청 일시"] as string) || (b.fields["신청일시"] as string) || b.createdTime).getTime();
                return dateB - dateA; // Descending
            });

            setRecords(sortedRecords);
        } catch (err: any) {
            setErrorMsg(err.message || '데이터를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMetadata();
        fetchRecords();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const updateDetailTableRecord = async (record: AirtableRecord, fieldsToUpdate: any) => {
        try {
            const f = record.fields;
            let detailTableName = '';
            if (f["비목"] === '여비') detailTableName = import.meta.env.VITE_AIRTABLE_TRAVEL_TABLE_NAME || '여비 신청 상세 목록';
            else if (f["비목"] === '재료비') detailTableName = import.meta.env.VITE_AIRTABLE_MATERIAL_TABLE_NAME || '재료비 신청 상세 목록';
            else if (f["비목"] === '외주용역비') detailTableName = import.meta.env.VITE_AIRTABLE_OUTSOURCING_TABLE_NAME || '외주용역비 신청 상세 목록';
            else if (f["비목"] === '지급수수료') detailTableName = import.meta.env.VITE_AIRTABLE_COMMISSION_TABLE_NAME || '지급수수료 신청 상세 목록';

            if (!detailTableName) return;

            const url = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(detailTableName)}`);
            const dateFilter = `DATETIME_DIFF(CREATED_TIME(), '${record.createdTime}', 'minutes') < 2`;
            url.searchParams.append('filterByFormula', `AND({팀명} = '${f["팀명"]}', ${dateFilter})`);
            url.searchParams.append('maxRecords', '1');

            const res = await fetch(url.toString(), {
                headers: { 'Authorization': `Bearer ${apiKey}` },
                cache: 'no-store'
            });
            if (!res.ok) return;

            const data = await res.json();
            if (data.records && data.records.length > 0) {
                const detailId = data.records[0].id;
                await fetch(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(detailTableName)}/${detailId}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        fields: fieldsToUpdate,
                        typecast: true
                    })
                });
            }
        } catch (e) {
            console.error("Detail table update failed", e);
        }
    };

    const updateStatus = async (recordId: string, newStatus: string) => {
        try {
            const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}/${recordId}`;
            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fields: { "상태": newStatus },
                    typecast: true
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                console.error('[상태 업데이트 에러]', errData);
                throw new Error(errData.error?.message || '상태 업데이트 실패');
            }

            const targetRecord = records.find(r => r.id === recordId);
            if (targetRecord) {
                await updateDetailTableRecord(targetRecord, { "상태": newStatus });
            }

            setRecords(prev => prev.map(r => r.id === recordId ? { ...r, fields: { ...r.fields, "상태": newStatus } } : r));

            setToastMsg('상태가 업데이트되었습니다');
            setTimeout(() => setToastMsg(''), 3000);
        } catch (err) {
            alert('상태 변경에 실패했습니다.');
        }
    };

    const openRejectModal = (record: AirtableRecord) => {
        setRejectModalRecord(record);
        setRejectReason(record.fields["반려의견"] || '');
    };

    const saveRejectReason = async () => {
        if (!rejectModalRecord) return;
        setIsRejecting(true);

        const now = new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');
        const timeStr = `${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

        const oldHistory = rejectModalRecord.fields["수정 이력"] || '';
        const newHistoryLine = `• 반려 처리 됨 : ${timeStr}`;
        const newHistory = oldHistory ? `${oldHistory}\n${newHistoryLine}` : newHistoryLine;

        try {
            const currentStatus = rejectModalRecord.fields["상태"];
            const targetStatus = currentStatus === '완료 서류 반려' ? '완료 서류 반려' : '반려';

            const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}/${rejectModalRecord.id}`;
            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fields: { "반려의견": rejectReason, "수정 이력": newHistory, "상태": targetStatus },
                    typecast: true
                })
            });

            if (!response.ok) throw new Error('반려 사유 저장 실패');

            await updateDetailTableRecord(rejectModalRecord, { "반려의견": rejectReason, "수정 이력": newHistory, "상태": targetStatus });

            setRecords(prev => prev.map(r => r.id === rejectModalRecord.id ? {
                ...r,
                fields: { ...r.fields, "반려의견": rejectReason, "수정 이력": newHistory, "상태": targetStatus }
            } : r));

            setToastMsg('반려 사유가 저장되었습니다');
            setTimeout(() => setToastMsg(''), 3000);
            setRejectModalRecord(null);
        } catch (err) {
            setToastMsg('반려 사유 저장에 실패했습니다.');
            setTimeout(() => setToastMsg(''), 3000);
        } finally {
            setIsRejecting(false);
        }
    };

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
            const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}/${deleteModalRecord.id}`;
            const response = await fetch(url, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${apiKey}` }
            });

            if (!response.ok) throw new Error('메인 레코드 삭제 실패');

            setRecords(prev => prev.filter(r => r.id !== deleteModalRecord.id));
            setToastMsg('기록이 완전히 삭제되었습니다.');
            setTimeout(() => setToastMsg(''), 3000);
            setDeleteModalRecord(null);
        } catch (err: any) {
            alert(err.message || '삭제 중 오류가 발생했습니다.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleBulkDeleteRecord = async () => {
        if (selectedRecordIds.size === 0) return;
        setIsBulkDeleting(true);

        try {
            const recordsToDelete = records.filter(r => selectedRecordIds.has(r.id));

            for (const rec of recordsToDelete) {
                const f = rec.fields;
                let detailTableName = '';
                if (f["비목"] === '여비') detailTableName = import.meta.env.VITE_AIRTABLE_TRAVEL_TABLE_NAME || '여비 신청 상세 목록';
                else if (f["비목"] === '재료비') detailTableName = import.meta.env.VITE_AIRTABLE_MATERIAL_TABLE_NAME || '재료비 신청 상세 목록';
                else if (f["비목"] === '외주용역비') detailTableName = import.meta.env.VITE_AIRTABLE_OUTSOURCING_TABLE_NAME || '외주용역비 신청 상세 목록';
                else if (f["비목"] === '지급수수료') detailTableName = import.meta.env.VITE_AIRTABLE_COMMISSION_TABLE_NAME || '지급수수료 신청 상세 목록';

                if (detailTableName) {
                    const searchUrl = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(detailTableName)}`);
                    const dateFilter = `DATETIME_DIFF(CREATED_TIME(), '${rec.createdTime}', 'minutes') < 2`;
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

                const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}/${rec.id}`;
                await fetch(url, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${apiKey}` }
                });
            }

            setRecords(prev => prev.filter(r => !selectedRecordIds.has(r.id)));
            setSelectedRecordIds(new Set());
            setShowBulkDeleteModal(false);
            setToastMsg(`${recordsToDelete.length}건이 완전히 삭제되었습니다.`);
            setTimeout(() => setToastMsg(''), 3000);
        } catch (err: any) {
            alert(err.message || '다중 삭제 중 오류가 발생했습니다.');
        } finally {
            setIsBulkDeleting(false);
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

    const getCategoryStyles = (category?: string) => {
        if (category === '여비') return 'text-[#0288D1] bg-[#E1F5FE]';
        if (category === '재료비') return 'text-[#2E7D32] bg-[#E8F5E9]';
        if (category === '외주용역비') return 'text-[#7B1FA2] bg-[#F3E5F5]';
        if (category === '지급수수료') return 'text-[#F57F17] bg-[#FFF8E1]';
        return 'text-neutral-600 bg-neutral-100';
    };

    const getStatusOptions = (category?: string, currentStatus?: string) => {
        let options: string[] = [];

        if (category && categoryStatusOptions[category]) {
            options = [...categoryStatusOptions[category]];
        } else if (categoryStatusOptions['default']) {
            options = [...categoryStatusOptions['default']];
        } else {
            // Fallback options
            if (category === '여비') {
                options = ['담당자 확인 전', '담당자 확인 완료', '완료 서류 첨부 대기 중', '완료 서류 첨부 완료', '지출 처리 중', '최종 완료'];
            } else if (category === '재료비') {
                options = ['담당자 확인 전', '담당자 확인 중', '구매 처리 중', '구매 완료', '완료 서류 첨부 대기 중', '완료 서류 첨부 완료', '지출 처리 중', '최종 완료'];
            } else if (category === '외주용역비') {
                options = ['담당자 확인 전', '담당자 확인 중', '계약 처리 중', '계약 완료', '완료 서류 첨부 대기 중', '완료 서류 첨부 완료', '지출 처리 중', '최종 완료'];
            } else if (category === '지급수수료') {
                options = ['담당자 확인 전', '담당자 확인 중', '완료 서류 첨부 대기 중', '완료 서류 첨부 완료', '지출 처리 중', '최종 완료'];
            } else {
                options = [
                    '담당자 확인 전', '담당자 확인 완료', '구매 처리 중', '계약 처리 중',
                    '구매 완료', '계약 완료', '완료 서류 첨부 대기 중', '완료 서류 첨부 완료', '지출 처리 중',
                    '최종 완료', '반려', '검토 중'
                ];
            }
        }

        // Add '반려 수정 완료' and '완료 서류 반려' specifically to ensure Admin visibility
        if (!options.includes('반려 수정 완료')) {
            const idx = options.indexOf('담당자 확인 전');
            if (idx >= 0) {
                options.splice(idx + 1, 0, '반려 수정 완료');
            } else {
                options.unshift('반려 수정 완료');
            }
        }
        if (!options.includes('완료 서류 반려')) {
            const idx = options.indexOf('지출 처리 중');
            if (idx >= 0) {
                options.splice(idx, 0, '완료 서류 반려');
            } else {
                options.push('완료 서류 반려');
            }
        }

        // Add current status if it isn't strictly in the template options
        if (currentStatus && !options.includes(currentStatus)) {
            options = [currentStatus, ...options];
        }

        return options;
    };

    // Extract unique values for filters
    const uniqueTeams = Array.from(new Set(records.map(r => r.fields["팀명"] || '미상'))).filter(Boolean).sort();
    const uniqueCategories = Array.from(new Set(records.map(r => r.fields["비목"] || ''))).filter(Boolean).sort();
    const uniqueStatuses = Array.from(new Set(records.map(r => r.fields["상태"] || ''))).filter(Boolean).sort();

    // Quick Filter Counts
    const unreadCount = records.filter(r => r.fields["상태"] === '담당자 확인 전').length;
    const completedCount = records.filter(r => r.fields["상태"] === '최종 완료').length;
    const processingCount = records.length - unreadCount - completedCount;

    // Apply Filters
    const filteredRecords = records.filter(record => {
        const status = record.fields["상태"] || '담당자 확인 전';

        // 1) Match Dropdowns
        const matchTeam = selectedTeam === '전체 팀' || (record.fields["팀명"] || '미상') === selectedTeam;
        const matchCategory = selectedCategory === '전체 비목' || record.fields["비목"] === selectedCategory;
        const matchStatus = selectedStatus === '전체 상태' || status === selectedStatus;

        // 2) Match Quick Filter
        let matchQuickFilter = true;
        if (activeQuickFilter === '미열람') {
            matchQuickFilter = status === '담당자 확인 전';
        } else if (activeQuickFilter === '처리 중') {
            matchQuickFilter = status !== '담당자 확인 전' && status !== '최종 완료';
        } else if (activeQuickFilter === '처리 완료') {
            matchQuickFilter = status === '최종 완료';
        }

        return matchTeam && matchCategory && matchStatus && matchQuickFilter;
    });

    return (
        <div className="min-h-screen bg-neutral-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 flex items-center">
                            <FileText className="w-6 h-6 mr-2 text-indigo-600" />
                            전체 신청 내역 관리
                        </h1>
                        <p className="mt-1 text-sm text-neutral-500">모든 팀의 제출 내역을 통합하여 조회하고 관리합니다.</p>
                    </div>
                    <div className="mt-4 sm:mt-0 flex gap-2 w-full sm:w-auto">
                        {selectedRecordIds.size > 0 && (
                            <button
                                onClick={() => setShowBulkDeleteModal(true)}
                                className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                선택 삭제 ({selectedRecordIds.size})
                            </button>
                        )}
                        <button
                            onClick={fetchRecords}
                            disabled={isLoading}
                            className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-neutral-200 rounded-xl shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin text-indigo-500' : 'text-neutral-500'}`} />
                            새로고침
                        </button>
                    </div>
                </div>

                {/* Quick Filters - KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div
                        onClick={() => setActiveQuickFilter(activeQuickFilter === '미열람' ? null : '미열람')}
                        className={`bg-white rounded-2xl p-6 border transition-all cursor-pointer hover:shadow-md ${activeQuickFilter === '미열람' ? 'border-red-500 shadow-sm ring-1 ring-red-500' : 'border-neutral-200 shadow-sm'}`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-neutral-500 mb-1">미열람 건수</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-3xl font-bold text-red-600">{unreadCount}</span>
                                    <span className="text-base font-semibold text-neutral-600 mb-1">건</span>
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-red-500" />
                            </div>
                        </div>
                    </div>

                    <div
                        onClick={() => setActiveQuickFilter(activeQuickFilter === '처리 중' ? null : '처리 중')}
                        className={`bg-white rounded-2xl p-6 border transition-all cursor-pointer hover:shadow-md ${activeQuickFilter === '처리 중' ? 'border-indigo-500 shadow-sm ring-1 ring-indigo-500' : 'border-neutral-200 shadow-sm'}`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-neutral-500 mb-1">처리 중</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-3xl font-bold text-neutral-900">{processingCount}</span>
                                    <span className="text-base font-semibold text-neutral-600 mb-1">건</span>
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center">
                                <RefreshCw className="w-6 h-6 text-indigo-600" />
                            </div>
                        </div>
                    </div>

                    <div
                        onClick={() => setActiveQuickFilter(activeQuickFilter === '처리 완료' ? null : '처리 완료')}
                        className={`bg-white rounded-2xl p-6 border transition-all cursor-pointer hover:shadow-md ${activeQuickFilter === '처리 완료' ? 'border-green-500 shadow-sm ring-1 ring-green-500' : 'border-neutral-200 shadow-sm'}`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-neutral-500 mb-1">처리 완료</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-3xl font-bold text-neutral-900">{completedCount}</span>
                                    <span className="text-base font-semibold text-neutral-600 mb-1">건</span>
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                                <FileText className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
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

                {/* Dashboard Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-neutral-200">
                            <thead className="bg-neutral-50/80">
                                <tr>
                                    <th scope="col" className="px-4 py-4 text-center w-12">
                                        <input
                                            type="checkbox"
                                            checked={filteredRecords.length > 0 && filteredRecords.every(r => selectedRecordIds.has(r.id))}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    const newSet = new Set(selectedRecordIds);
                                                    filteredRecords.forEach(r => newSet.add(r.id));
                                                    setSelectedRecordIds(newSet);
                                                } else {
                                                    const newSet = new Set(selectedRecordIds);
                                                    filteredRecords.forEach(r => newSet.delete(r.id));
                                                    setSelectedRecordIds(newSet);
                                                }
                                            }}
                                            className="w-4 h-4 text-indigo-600 border-neutral-300 rounded focus:ring-indigo-500 cursor-pointer"
                                        />
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-center">
                                        <select
                                            value={selectedTeam}
                                            onChange={(e) => setSelectedTeam(e.target.value)}
                                            className="bg-transparent text-[13px] font-bold text-neutral-600 tracking-wider focus:outline-none focus:ring-0 min-w-[100px] cursor-pointer text-center"
                                        >
                                            <option value="전체 팀">팀명 (전체)</option>
                                            {uniqueTeams.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-center">
                                        <select
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            className="bg-transparent text-[13px] font-bold text-neutral-600 tracking-wider focus:outline-none focus:ring-0 min-w-[100px] cursor-pointer"
                                        >
                                            <option value="전체 비목">비목 (전체)</option>
                                            {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-center text-[13px] font-bold text-neutral-600 tracking-wider">
                                        신청금액
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-center text-[13px] font-bold text-neutral-600 tracking-wider">
                                        신청일시
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-center">
                                        <select
                                            value={selectedStatus}
                                            onChange={(e) => setSelectedStatus(e.target.value)}
                                            className="bg-transparent text-[13px] font-bold text-neutral-600 tracking-wider focus:outline-none focus:ring-0 min-w-[100px] cursor-pointer"
                                        >
                                            <option value="전체 상태">상태 (전체)</option>
                                            {uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-center text-[13px] font-bold text-neutral-600 tracking-wider w-[120px]">
                                        관리
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-neutral-100">
                                {isLoading && records.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center text-neutral-500">
                                                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
                                                <span className="font-medium text-sm">데이터를 불러오는 중입니다...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : records.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center text-neutral-400">
                                                <FileText className="w-12 h-12 mb-3 opacity-20" />
                                                <span className="font-medium text-sm text-neutral-500">등록된 신청 내역이 없습니다.</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRecords.map((record) => {
                                        const f = record.fields;
                                        const rawDate = f["신청 일시"] || f["신청일시"] || record.createdTime;

                                        // Edit History Badge Logic
                                        const existingHistoryText = f["수정 이력"] || '';
                                        const logLines = existingHistoryText ? existingHistoryText.split('\n').filter((l: string) => l.trim().length > 0) : [];
                                        const actualEditCount = logLines.length >= 2 ? logLines.length - 1 : 0;
                                        const isModified = actualEditCount > 0;

                                        return (
                                            <tr
                                                key={record.id}
                                                className="hover:bg-indigo-50/30 transition-colors group"
                                            >
                                                <td className="px-4 py-3 whitespace-nowrap text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedRecordIds.has(record.id)}
                                                        onChange={(e) => {
                                                            const newSet = new Set(selectedRecordIds);
                                                            if (e.target.checked) {
                                                                newSet.add(record.id);
                                                            } else {
                                                                newSet.delete(record.id);
                                                            }
                                                            setSelectedRecordIds(newSet);
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="w-4 h-4 text-indigo-600 border-neutral-300 rounded focus:ring-indigo-500 cursor-pointer"
                                                    />
                                                </td>
                                                <td className="px-6 py-3 whitespace-nowrap text-center">
                                                    <div className="text-sm font-bold text-neutral-900">{f["팀명"] || '-'}</div>
                                                </td>
                                                <td className="px-6 py-3 whitespace-nowrap text-center">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${getCategoryStyles(f["비목"])}`}>
                                                        {f["비목"] || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 whitespace-nowrap text-right pr-12">
                                                    <div className="text-sm font-bold text-neutral-900 group-hover:text-indigo-600 transition-colors">
                                                        {(f["신청금액"] || 0).toLocaleString()}<span className="text-xs font-semibold text-neutral-400 ml-0.5">원</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 whitespace-nowrap text-center">
                                                    <div className="flex flex-col items-center justify-center">
                                                        {isModified ? (
                                                            <>
                                                                <span className="text-neutral-500 text-sm font-medium">{formatShortDate(rawDate)}</span>
                                                                <span className="text-[11px] text-blue-500 mt-0.5 font-bold tracking-tight">수정됨({actualEditCount})</span>
                                                            </>
                                                        ) : (
                                                            <span className="text-neutral-500 text-sm font-medium">{formatShortDate(rawDate)}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 whitespace-nowrap text-center">
                                                    <select
                                                        value={f["상태"] || '담당자 확인 전'}
                                                        onChange={(e) => updateStatus(record.id, e.target.value)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className={`block w-full min-w-[160px] rounded-lg border-neutral-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs px-2 py-1.5 font-bold cursor-pointer transition-colors whitespace-nowrap ${f["상태"] === '반려' || f["상태"] === '완료 서류 반려' ? 'border-red-300 text-red-700 bg-red-50' : 'text-neutral-700 bg-white'}`}
                                                    >
                                                        {getStatusOptions(f["비목"], f["상태"])
                                                            .filter(opt => opt !== '반려 수정 완료' || f["상태"] === '반려 수정 완료')
                                                            .map(status => (
                                                                <option key={status} value={status}>
                                                                    {status}
                                                                </option>
                                                            ))}
                                                    </select>
                                                </td>
                                                <td className="px-6 py-3 whitespace-nowrap text-center">
                                                    <div className="flex items-center justify-center space-x-2 min-w-[130px]">
                                                        <div className="w-[32px] flex justify-center flex-shrink-0">
                                                            {(f["상태"] === '반려' || f["상태"] === '완료 서류 반려') && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        openRejectModal(record);
                                                                    }}
                                                                    title="반려 사유 입력"
                                                                    className="inline-flex items-center justify-center p-1.5 border border-red-200 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors shadow-sm"
                                                                >
                                                                    <Pencil className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => setSelectedDetailRecord(record)}
                                                            className="inline-flex items-center justify-center px-3 py-1.5 border border-indigo-200 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors shadow-sm whitespace-nowrap h-8"
                                                        >
                                                            🔍 신청서 보기
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setDeleteModalRecord(record);
                                                            }}
                                                            title="삭제"
                                                            className="inline-flex items-center justify-center p-1.5 border border-red-200 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors shadow-sm h-8 w-8 flex-shrink-0"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
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

            {/* Reject Reason Modal */}
            {rejectModalRecord && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between bg-white text-neutral-900">
                            <h3 className="text-lg font-bold flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
                                반려 사유 입력
                            </h3>
                            <button
                                onClick={() => setRejectModalRecord(null)}
                                className="text-neutral-400 hover:text-neutral-600 transition-colors outline-none"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                반려 사유를 상세하게 작성해 주세요
                            </label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                rows={4}
                                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all resize-none text-sm text-neutral-800 bg-white"
                                placeholder="예: 견적서 상호명 불일치로 반려합니다. 수정 후 재제출 바랍니다."
                            />
                        </div>
                        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex justify-end space-x-3">
                            <button
                                onClick={() => setRejectModalRecord(null)}
                                className="px-4 py-2 text-sm font-bold text-neutral-600 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors shadow-sm outline-none"
                            >
                                취소
                            </button>
                            <button
                                onClick={saveRejectReason}
                                disabled={isRejecting}
                                className="px-6 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 flex items-center outline-none"
                            >
                                {isRejecting ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                        저장 중...
                                    </>
                                ) : (
                                    '사유 저장'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {selectedDetailRecord && (
                <RecordDetailModal
                    record={selectedDetailRecord}
                    onClose={() => setSelectedDetailRecord(null)}
                    baseId={baseId}
                    apiKey={apiKey}
                    availableBudget={999999999} // Admin is unbounded or not strictly constrained in viewing 
                    onSaveSuccess={() => {
                        fetchRecords();
                    }}
                />
            )}

            {/* Toast Notification */}
            {toastMsg && (
                <div className="fixed bottom-6 right-6 bg-neutral-900 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 z-50">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="font-bold text-sm tracking-wide">{toastMsg}</span>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModalRecord && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 text-center p-6">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                            <AlertCircle className="h-6 w-6 text-red-600" />
                        </div>
                        <h3 className="text-lg font-bold text-neutral-900 mb-2">정말 삭제하시겠습니까?</h3>
                        <p className="text-sm text-neutral-500 mb-6">
                            이 작업은 되돌릴 수 없으며, 연결된 상세 테이블의 기록도 함께 완전히 삭제됩니다.
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

            {/* Bulk Delete Confirmation Modal */}
            {showBulkDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 text-center p-6">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                            <AlertCircle className="h-6 w-6 text-red-600" />
                        </div>
                        <h3 className="text-lg font-bold text-neutral-900 mb-2">선택한 {selectedRecordIds.size}건을 삭제하시겠습니까?</h3>
                        <p className="text-sm text-neutral-500 mb-6">
                            이 작업은 되돌릴 수 없으며, 연결된 상세 테이블의 기록도 함께 완전히 일괄 삭제됩니다.
                        </p>
                        <div className="flex justify-center space-x-3">
                            <button
                                onClick={() => setShowBulkDeleteModal(false)}
                                disabled={isBulkDeleting}
                                className="px-4 py-2 text-sm font-bold text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors shadow-sm outline-none"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleBulkDeleteRecord}
                                disabled={isBulkDeleting}
                                className="px-6 py-2 text-sm font-bold text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center"
                            >
                                {isBulkDeleting ? (
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
