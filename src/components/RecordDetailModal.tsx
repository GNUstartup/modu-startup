import React, { useEffect, useState } from 'react';
import { X, FileText, Download, Loader2, AlertCircle, CheckCircle2, UploadCloud } from 'lucide-react';
import Modal from './common/Modal';

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

interface RecordDetailModalProps {
    record: ApplicationRecord;
    onClose: () => void;
    baseId: string;
    apiKey: string;
    availableBudget: number;
    onSaveSuccess: () => void;
    onOpenUploadModal?: () => void;
}

function numberToKorean(number: number): string {
    if (!number || isNaN(number) || number === 0) return '';
    const numStr = number.toString();
    const result = [];
    const units = ['', '십', '백', '천'];
    const tenUnits = ['', '만', '억', '조'];
    const digits = ['영', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];

    let splitIndex = numStr.length;
    let tenUnitIndex = 0;

    while (splitIndex > 0) {
        let chunk = numStr.substring(Math.max(splitIndex - 4, 0), splitIndex);
        let chunkResult = '';
        let hasNonZero = false;

        for (let i = 0; i < chunk.length; i++) {
            const digit = parseInt(chunk[chunk.length - 1 - i], 10);
            if (digit !== 0) {
                hasNonZero = true;
                if (digit === 1 && i > 0) {
                    chunkResult = units[i] + chunkResult;
                } else {
                    chunkResult = digits[digit] + units[i] + chunkResult;
                }
            }
        }

        if (hasNonZero) {
            result.unshift(chunkResult + tenUnits[tenUnitIndex]);
        }
        tenUnitIndex++;
        splitIndex -= 4;
    }
    return `(금 ${result.join('')} 원)`;
}

export const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h4 className="text-base font-bold text-neutral-800 mt-2 mb-4">{children}</h4>
);

export const DetailTable = ({ children }: { children: React.ReactNode }) => (
    <div className="overflow-hidden border border-neutral-200 rounded-lg">
        <table className="min-w-full divide-y divide-neutral-200 text-sm">
            <tbody className="divide-y divide-neutral-200">
                {children}
            </tbody>
        </table>
    </div>
);
export default function RecordDetailModal({ record, onClose, baseId, apiKey, availableBudget, onSaveSuccess, onOpenUploadModal }: RecordDetailModalProps) {
    const [detailData, setDetailData] = useState<any | null>(null);
    const [detailRecordId, setDetailRecordId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    // Editing States
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<any>({});
    const [editFiles, setEditFiles] = useState<Record<string, File | null>>({});
    const [isSaving, setIsSaving] = useState(false);

    const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const f = record.fields;

    useEffect(() => {
        const fetchDetails = async () => {
            if (!f["비목"] || !f["팀명"]) {
                setErrorMsg('필수 정보(비목, 팀명)가 누락되어 상세 내용을 불러올 수 없습니다.');
                setIsLoading(false);
                return;
            }

            try {
                let detailTableName = '';
                if (f["비목"] === '여비') detailTableName = import.meta.env.VITE_AIRTABLE_TRAVEL_TABLE_NAME || '여비 신청 상세 목록';
                else if (f["비목"] === '재료비') detailTableName = import.meta.env.VITE_AIRTABLE_MATERIAL_TABLE_NAME || '재료비 신청 상세 목록';
                else if (f["비목"] === '외주용역비') detailTableName = import.meta.env.VITE_AIRTABLE_OUTSOURCING_TABLE_NAME || '외주용역비 신청 상세 목록';
                else if (f["비목"] === '지급수수료') detailTableName = import.meta.env.VITE_AIRTABLE_COMMISSION_TABLE_NAME || '지급수수료 신청 상세 목록';

                if (!detailTableName) {
                    throw new Error('해당 비목의 상세 테이블 정보가 없습니다.');
                }

                const url = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(detailTableName)}`);

                // Detail tables do not have a custom date field, so we rely on system CREATED_TIME() matching within 2 minutes of the main record
                const dateFilter = `DATETIME_DIFF(CREATED_TIME(), '${record.createdTime}', 'minutes') < 2`;
                url.searchParams.append('filterByFormula', `AND({팀명} = '${f["팀명"]}', ${dateFilter})`);
                url.searchParams.append('maxRecords', '1'); // Should only be one exact match usually

                const response = await fetch(url.toString(), {
                    headers: { 'Authorization': `Bearer ${apiKey}` }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error?.message || '상세 데이터를 불러오는 데 실패했습니다.');
                }

                const data = await response.json();
                if (data.records && data.records.length > 0) {
                    setDetailData(data.records[0].fields);
                    setDetailRecordId(data.records[0].id);
                    setEditData({ ...data.records[0].fields, '신청금액': f['신청금액'] });
                } else {
                    setErrorMsg('일치하는 상세 내역을 찾을 수 없습니다.');
                }
            } catch (err: any) {
                setErrorMsg(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetails();
    }, [record, baseId, apiKey, f]);

    const handleSave = async () => {
        try {
            // Aggressive sanitization: strip all non-numeric characters and parse as Number
            const amountRaw = editData['신청금액'] !== undefined ? editData['신청금액'] : f['신청금액'];
            const newAmt = Number(String(amountRaw || 0).replace(/[^0-9]/g, ''));
            const originalAmt = Number(f['신청금액'] || 0);

            if (newAmt > (availableBudget + originalAmt)) {
                showToast(`입력하신 금액(${newAmt.toLocaleString()}원)이 수정 가능 예산(${(availableBudget + originalAmt).toLocaleString()}원)을 초과합니다.`, 'error');
                return;
            }

            setIsSaving(true);
            setErrorMsg('');

            // --- DETECT CHANGES (Diff Check) ---
            const changedFieldNames: string[] = [];

            if (newAmt !== originalAmt) {
                changedFieldNames.push('신청금액');
            }

            const allowedFields: Record<string, string[]> = {
                '여비': ['출발지', '도착지', '대중교통'],
                '재료비': ['구매 품목', '구매처', '업체명', '구매 품목 설명'],
                '외주용역비': ['계약 명', '업체명', '외주용역 설명'],
                '지급수수료': ['멘토명', '멘토 소속', '멘토 직급', '멘토링 시간', '멘토링 주제']
            };

            if (f['비목'] && allowedFields[f['비목']] && detailData) {
                allowedFields[f['비목']].forEach(key => {
                    const oldVal = detailData[key] !== undefined ? String(detailData[key]) : '';
                    const newVal = editData[key] !== undefined ? String(editData[key]) : oldVal;
                    if (oldVal !== newVal) {
                        changedFieldNames.push(key);
                    }
                });
            }

            Object.keys(editFiles).forEach(key => {
                if (editFiles[key]) {
                    changedFieldNames.push(`${key}(파일)`);
                }
            });

            if (changedFieldNames.length === 0) {
                showToast('수정된 내용이 없습니다.', 'error');
                setIsSaving(false);
                return;
            }
            // -----------------------------------

            // Upload any new files first
            const uploadedAttachments: Record<string, Array<{ url: string, filename: string }>> = {};

            for (const [key, file] of Object.entries(editFiles)) {
                if (file) {
                    try {
                        const formData = new FormData();
                        formData.append('file', file);
                        const uploadRes = await fetch('https://tmpfiles.org/api/v1/upload', {
                            method: 'POST',
                            body: formData
                        });

                        if (!uploadRes.ok) throw new Error(`[임시 파일 서버 연결 실패] Status: ${uploadRes.status}`);
                        const result = await uploadRes.json();

                        if (result.status === 'success' && result.data?.url) {
                            const fileUrl = result.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');

                            // URL 유효성 검사 (Airtable 전송 전)
                            try {
                                const checkUrlRes = await fetch(fileUrl, { method: 'HEAD' });
                                if (!checkUrlRes.ok) {
                                    throw new Error(`[생성된 파일 URL 접근 불가] Status: ${checkUrlRes.status}`);
                                }
                            } catch (urlCheckErr: any) {
                                console.warn('[URL HEAD 검사 실패, 계속 진행 시도]:', urlCheckErr);
                                // HEAD 요청이 막혀있을 수 있으므로 에러를 던지지 않고 경고만 남김
                            }

                            uploadedAttachments[key] = [{ url: fileUrl, filename: file.name }];
                        } else {
                            throw new Error(`[파일 업로드 응답 형식 오류] Response: ${JSON.stringify(result)}`);
                        }
                    } catch (uploadErr: any) {
                        console.error('[파일 업로드 처리 중 상세 에러]:', uploadErr);
                        throw new Error(`파일 업로드 실패: ${uploadErr.message}`);
                    }
                }
            }

            // 1. Update Main Table [신청 종합]
            const now = new Date();

            // Calculate edit count dynamically from history string
            const existingHistoryText = f['수정 이력'] || '';
            const logLines = existingHistoryText ? existingHistoryText.split('\n').filter((l: string) => l.trim().length > 0) : [];
            const newEditCount = logLines.length + 1;

            // Build new edit history log
            const pad = (n: number) => n.toString().padStart(2, '0');
            const formattedNow = `${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
            const changesStr = changedFieldNames.length > 0 ? ` (${changedFieldNames.join(', ')})` : '';

            // If it was rejected, append specific string and reset status
            const isRejectedResubmission = f['상태'] === '반려';
            const logSuffix = isRejectedResubmission ? ' (반려 사항 수정 및 재신청 완료)' : '';

            const newLogEntry = `• ${newEditCount}차 수정 ${formattedNow}${changesStr}${logSuffix}`;
            const updatedHistory = existingHistoryText ? `${existingHistoryText}\n${newLogEntry}` : newLogEntry;

            const mainTableName = '신청 종합';

            const mainUpdateFields: any = {
                '신청금액': newAmt,
                '신청 일시': now.toISOString(),
                '수정 이력': updatedHistory
            };

            if (isRejectedResubmission) {
                mainUpdateFields['상태'] = '반려 수정 완료';
            }

            const mainPatchResponse = await fetch(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(mainTableName)}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    records: [{
                        id: record.id,
                        fields: mainUpdateFields
                    }],
                    typecast: true
                })
            });

            if (!mainPatchResponse.ok) {
                const errData = await mainPatchResponse.json();
                console.error("Main Patch Error:", errData);
                throw new Error(`메인 데이터 수정 실패: ${errData.error?.message || JSON.stringify(errData)}`);
            }

            // 2. Update Detail Table
            let detailTableName = '';
            if (f["비목"] === '여비') detailTableName = import.meta.env.VITE_AIRTABLE_TRAVEL_TABLE_NAME || '여비 신청 상세 목록';
            else if (f["비목"] === '재료비') detailTableName = import.meta.env.VITE_AIRTABLE_MATERIAL_TABLE_NAME || '재료비 신청 상세 목록';
            else if (f["비목"] === '외주용역비') detailTableName = import.meta.env.VITE_AIRTABLE_OUTSOURCING_TABLE_NAME || '외주용역비 신청 상세 목록';
            else if (f["비목"] === '지급수수료') detailTableName = import.meta.env.VITE_AIRTABLE_COMMISSION_TABLE_NAME || '지급수수료 신청 상세 목록';

            if (detailRecordId && detailTableName) {
                // Construct patch fields combining text edits and new attachments
                const patchFields: any = {};

                // STRICTLY INCLUDE ALLOWED FIELDS AND NOTHING ELSE
                if (f['비목'] && allowedFields[f['비목']]) {
                    allowedFields[f['비목']].forEach(key => {
                        if (editData[key] !== undefined) patchFields[key] = editData[key];
                    });
                }

                Object.keys(uploadedAttachments).forEach(key => {
                    if (uploadedAttachments[key] && uploadedAttachments[key].length > 0) {
                        patchFields[key] = uploadedAttachments[key];
                    }
                });

                const detailPatchResponse = await fetch(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(detailTableName)}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        records: [{
                            id: detailRecordId,
                            fields: patchFields
                        }]
                    })
                });

                if (!detailPatchResponse.ok) {
                    const errData = await detailPatchResponse.json();
                    console.error("Detail Patch Error:", errData);
                    throw new Error(`상세 데이터 수정 실패: ${errData.error?.message || JSON.stringify(errData)}`);
                }
            }

            showToast('신청 내역이 성공적으로 수정되었습니다.', 'success');
            await Promise.resolve(onSaveSuccess());
            setIsEditing(false);
            setEditFiles({});
        } catch (err: any) {
            console.error("Save Error:", err);
            showToast(`수정에 실패했습니다: ${err.message}`, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        try {
            const d = new Date(dateString);
            if (isNaN(d.getTime())) return dateString;
            // Removed year entirely
            const pad = (n: number) => n.toString().padStart(2, '0');
            return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
        } catch {
            return '-';
        }
    };

    const renderAttachment = (attachmentField: any) => {
        if (!attachmentField || !Array.isArray(attachmentField) || attachmentField.length === 0) return <span className="text-neutral-400">-</span>;
        const file = attachmentField[0];
        return (
            <a href={file.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 hover:underline">
                <Download className="w-4 h-4 mr-1.5" />
                {file.filename || '첨부파일 확인'}
            </a>
        );
    };

    const renderCategorySpecificDetails = () => {
        if (!detailData) return null;

        const renderDetailRow = (label: string, fieldKey: string, isNumeric = false, isFile = false, isTextarea = false) => {
            const val = isEditing ? editData[fieldKey] : detailData[fieldKey];

            let content;
            if (!isEditing) {
                if (isFile) content = renderAttachment(val);
                else content = val || '-';
            } else {
                if (isFile) {
                    content = (
                        <div className="flex flex-col space-y-2">
                            {renderAttachment(detailData[fieldKey])}
                            <input
                                type="file"
                                onChange={(e) => setEditFiles(prev => ({ ...prev, [fieldKey]: e.target.files?.[0] || null }))}
                                className="text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            />
                            {editFiles[fieldKey] && <span className="text-xs text-indigo-600 font-medium ml-1">교체 파일: {editFiles[fieldKey]?.name}</span>}
                        </div>
                    );
                } else if (isNumeric) {
                    content = <input type="number" value={val || ''} onChange={(e) => setEditData({ ...editData, [fieldKey]: Number(e.target.value) })} className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-2 py-1.5 border text-right" />;
                } else if (isTextarea) {
                    content = <textarea value={val || ''} onChange={(e) => setEditData({ ...editData, [fieldKey]: e.target.value })} rows={3} className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-2 py-1.5 border" />;
                } else {
                    // Use defaultValue for uncontrolled input to prevent re-renders on keystroke. Requires explicit focus management if needing controlled.
                    content = <input type="text" defaultValue={val || ''} onChange={(e) => setEditData({ ...editData, [fieldKey]: e.target.value })} className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-2 py-1.5 border" />;
                }
            }

            return (
                <tr>
                    <th scope="row" className="px-5 py-3.5 bg-neutral-50 text-center text-xs font-semibold text-neutral-600 w-1/3 align-middle border-r border-neutral-200">
                        {label}
                    </th>
                    <td className={`px-5 py-3.5 text-neutral-900 font-medium break-words align-middle ${isNumeric && !isEditing ? 'text-right' : 'text-left'}`}>
                        {content}
                    </td>
                </tr>
            );
        };

        if (f["비목"] === '여비') {
            return (
                <div>
                    <SectionTitle>여비 상세 정보</SectionTitle>
                    <DetailTable>
                        {renderDetailRow("출발지", "출발지")}
                        {renderDetailRow("도착지", "도착지")}
                        {renderDetailRow("대중교통", "대중교통")}
                        {renderDetailRow("교통비 영수증", "교통비 영수증", false, true)}
                        {!isEditing && renderDetailRow("출장보고서 (2차)", "출장보고서", false, true)}
                    </DetailTable>
                </div>
            );
        } else if (f["비목"] === '재료비') {
            return (
                <div>
                    <SectionTitle>재료비 상세 정보</SectionTitle>
                    <DetailTable>
                        {renderDetailRow("구매 품목", "구매 품목")}
                        {renderDetailRow("구매처", "구매처")}
                        {renderDetailRow("업체명", "업체명")}
                        {renderDetailRow("구매 품목 설명", "구매 품목 설명", false, false, true)}
                        {renderDetailRow("재료 구매 계획서", "재료 구매 계획서", false, true)}
                        {!isEditing && renderDetailRow("재료 구매 보고서 (2차)", "재료 구매 보고서", false, true)}
                    </DetailTable>
                </div>
            );
        } else if (f["비목"] === '외주용역비') {
            return (
                <div>
                    <SectionTitle>외주용역비 상세 정보</SectionTitle>
                    <DetailTable>
                        {renderDetailRow("계약 명", "계약 명")}
                        {renderDetailRow("업체명", "업체명")}
                        {renderDetailRow("외주용역 설명", "외주용역 설명", false, false, true)}
                        {renderDetailRow("외주용역 계약서", "외주용역 계약서", false, true)}
                        {!isEditing && renderDetailRow("외주용역 결과보고서 (2차)", "외주용역 결과보고서", false, true)}
                    </DetailTable>
                </div>
            );
        } else if (f["비목"] === '지급수수료') {
            return (
                <div>
                    <SectionTitle>지급수수료(멘토링) 상세 정보</SectionTitle>
                    <DetailTable>
                        {renderDetailRow("멘토명", "멘토명")}
                        {renderDetailRow("멘토 소속", "멘토 소속")}
                        {renderDetailRow("멘토 직급", "멘토 직급")}
                        {renderDetailRow("멘토링 시간", "멘토링 시간", true)}
                        {renderDetailRow("멘토링 주제", "멘토링 주제", false, false, true)}
                        {renderDetailRow("이력서", "이력서", false, true)}
                        {!isEditing && renderDetailRow("멘토링 결과보고서 (2차)", "멘토링 결과보고서", false, true)}
                    </DetailTable>
                </div>
            );
        }
        return null;
    };


    return (
        <React.Fragment>
            <Modal isOpen={true} onClose={onClose} className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
                    <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-indigo-600" />
                        <h3 className="text-lg font-bold text-neutral-900">신청내역 상세</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors focus:outline-none"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Common Header Info Card */}
                    <div className="bg-indigo-50/30 border border-indigo-100 rounded-xl p-5 mb-6">
                        <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                            <div>
                                <p className="text-xs font-semibold text-indigo-400 mb-1">연번</p>
                                <p className="text-sm font-bold text-indigo-900">No. {record.seqNo || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-indigo-400 mb-1">신청일시</p>
                                <p className="text-sm font-medium text-indigo-900 text-mono">{formatDate((f["신청 일시"] as string) || (f["신청일시"] as string) || record.createdTime)}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-indigo-400 mb-1">비목</p>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-white border border-indigo-100 text-indigo-700 shadow-sm">
                                    {f["비목"] || '-'}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-indigo-400 mb-1">신청금액</p>
                                {isEditing ? (
                                    <div className="flex flex-col">
                                        <div className="flex items-center">
                                            <input
                                                type="text"
                                                defaultValue={editData['신청금액'] ? Number(editData['신청금액']).toLocaleString() : ''}
                                                onChange={(e) => {
                                                    const rawVal = e.target.value.replace(/[^0-9]/g, '');
                                                    const numVal = rawVal ? Number(rawVal) : 0;
                                                    e.target.value = numVal > 0 ? numVal.toLocaleString() : '';
                                                    setEditData({ ...editData, '신청금액': numVal });
                                                }}
                                                className="block w-full max-w-[120px] rounded-md border-neutral-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-2 py-1 border text-right font-bold text-indigo-900"
                                            />
                                            <span className="text-sm font-bold text-indigo-900 ml-1">원</span>
                                        </div>
                                        {editData['신청금액'] > 0 && (
                                            <p className="text-[11px] font-medium text-indigo-600 mt-1">{numberToKorean(Number(editData['신청금액']))}</p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm font-bold text-indigo-900">{f["신청금액"]?.toLocaleString() || 0} 원</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Common Status & Rejection Card */}
                    <div className="mb-6 space-y-4">
                        <div className="flex items-center justify-between px-4 py-3 bg-neutral-50 rounded-lg border border-neutral-100">
                            <span className="text-sm font-semibold text-neutral-600">현재 상태</span>
                            <span className="text-sm font-bold text-neutral-900">{f["상태"] || '-'}</span>
                        </div>

                        {f["반려의견"] && (
                            <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                                <div className="flex items-center text-red-700 font-bold text-sm mb-2">
                                    <AlertCircle className="w-4 h-4 mr-1.5" />
                                    반려 사유 (관리자 코멘트)
                                </div>
                                <p className="text-sm text-red-600 whitespace-pre-wrap">{f["반려의견"]}</p>
                            </div>
                        )}
                    </div>

                    {/* Category Specific Details (Fetched from Airtable) */}
                    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
                                <span className="text-sm font-medium text-neutral-500">상세 데이터를 불러오는 중...</span>
                            </div>
                        ) : errorMsg ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <AlertCircle className="w-10 h-10 text-red-300 mb-3" />
                                <p className="text-sm text-red-600 font-medium">{errorMsg}</p>
                            </div>
                        ) : (
                            <>
                                {renderCategorySpecificDetails()}

                                {/* 신청 이력 Section: Minimal Blue Text, No year, Multi-line support */}
                                <div className="mt-4 text-[13px] text-blue-500 font-medium leading-[1.6] select-none break-words whitespace-pre-wrap">
                                    <div className="flex flex-col space-y-1.5">
                                        <div>• 최초 신청 {formatDate(record.createdTime)}</div>
                                        {f['수정 이력'] && f['수정 이력'].split('\n').map((log: string, index: number) => {
                                            if (!log.trim()) return null;
                                            const isReject = log.includes('반려 처리 됨');
                                            return (
                                                <div key={index} className={isReject ? "text-[#FF4D4F] font-bold" : ""}>
                                                    {log}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50 flex flex-col sm:flex-row justify-between items-center sm:space-x-4 space-y-3 sm:space-y-0">
                    <div className="text-xs text-neutral-500 w-full sm:w-auto text-left">
                        {(!isEditing && (f["상태"] === '담당자 확인 전' || f["상태"] === '반려')) && (
                            <span className="text-indigo-600 font-medium">* 내역 수정 및 재신청이 가능합니다.</span>
                        )}
                        {isEditing && (() => {
                            const maxAmount = availableBudget + Number(f['신청금액'] || 0);
                            const currentInputAmt = Number(String(editData['신청금액'] !== undefined ? editData['신청금액'] : f['신청금액'] || 0).replace(/[^0-9]/g, ''));
                            const isOverBudget = currentInputAmt > maxAmount;
                            return (
                                <span className={`block ${isOverBudget ? 'text-red-600 font-bold' : 'text-amber-600 font-medium'}`}>
                                    변경 가능 최대 금액: {maxAmount.toLocaleString()}원
                                </span>
                            );
                        })()}
                    </div>

                    <div className="flex space-x-2 w-full sm:w-auto justify-end">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditFiles({});
                                        setEditData({ ...detailData, '신청금액': f['신청금액'] });
                                    }}
                                    disabled={isSaving}
                                    className="px-4 py-2 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-sm font-semibold rounded-lg shadow-sm transition-colors focus:outline-none"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving || (() => {
                                        const maxAmount = availableBudget + Number(f['신청금액'] || 0);
                                        const currentInputAmt = Number(String(editData['신청금액'] !== undefined ? editData['신청금액'] : f['신청금액'] || 0).replace(/[^0-9]/g, ''));
                                        return currentInputAmt > maxAmount;
                                    })()}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors focus:outline-none flex items-center disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                                    수정 완료
                                </button>
                            </>
                        ) : (
                            <>
                                {(f["상태"] === '완료 서류 첨부 대기 중' || f["상태"] === '완료 서류 반려') && typeof onOpenUploadModal === 'function' && (
                                    <button
                                        onClick={onOpenUploadModal}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors focus:outline-none flex items-center"
                                    >
                                        <UploadCloud className="w-4 h-4 mr-2" />
                                        서류 첨부하기
                                    </button>
                                )}
                                {(f["상태"] === '담당자 확인 전' || f["상태"] === '반려') && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-4 py-2 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-lg shadow-sm transition-colors focus:outline-none"
                                    >
                                        수정하기
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-sm font-semibold rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-200"
                                >
                                    닫기
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </Modal>

            {/* Custom Toast Notification Overlay */}
            {toast && toast.show && (
                <div className={`fixed top-6 right-6 z-[100000] flex items-center p-4 rounded-xl shadow-xl border animate-in slide-in-from-top-10 fade-in duration-300 ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                    {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 mr-3 text-green-600" /> : <AlertCircle className="w-5 h-5 mr-3 text-red-500" />}
                    <span className="text-sm font-bold">{toast.message}</span>
                </div>
            )}
        </React.Fragment>
    );
}
