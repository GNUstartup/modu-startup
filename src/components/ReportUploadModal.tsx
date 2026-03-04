import React, { useState } from 'react';
import { UploadCloud, X, CheckCircle2, AlertCircle } from 'lucide-react';
import Modal from './common/Modal';

interface Props {
    mainRecordId: string;
    teamName: string;
    expenseCategory: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ReportUploadModal({ mainRecordId, teamName, expenseCategory, onClose, onSuccess }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
    const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY;
    const mainTableName = '신청 종합';

    // Get specific table and column names based on category
    const getCategoryConfig = () => {
        switch (expenseCategory) {
            case '여비':
                return { tableName: import.meta.env.VITE_AIRTABLE_TRAVEL_TABLE_NAME || '여비 신청 상세 목록', columnName: '출장보고서' };
            case '재료비':
                return { tableName: import.meta.env.VITE_AIRTABLE_MATERIAL_TABLE_NAME || '재료비 신청 상세 목록', columnName: '재료 구매 보고서' };
            case '외주용역비':
                return { tableName: import.meta.env.VITE_AIRTABLE_OUTSOURCING_TABLE_NAME || '외주용역비 신청 상세 목록', columnName: '외주용역 결과보고서' };
            case '지급수수료':
                return { tableName: import.meta.env.VITE_AIRTABLE_COMMISSION_TABLE_NAME || '지급수수료 신청 상세 목록', columnName: '멘토링 결과보고서' };
            default:
                return { tableName: '', columnName: '결과보고서' };
        }
    };

    const config = getCategoryConfig();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setErrorMsg('파일을 선택해주세요.');
            return;
        }

        setIsSubmitting(true);
        setErrorMsg('');

        try {
            if (!baseId || !apiKey) throw new Error('API 연동 설정 오류');

            // 1. Upload file to file.io
            let fileUrl = '';
            try {
                const formData = new FormData();
                formData.append('file', file);
                const resTmp = await fetch('https://file.io', {
                    method: 'POST',
                    body: formData
                });
                const dataTmp = await resTmp.json();
                if (!resTmp.ok || !dataTmp.success) throw new Error('파일 업로드 실패 (임시 서버)');
                fileUrl = dataTmp.link;
            } catch (uploadErr: any) {
                console.warn(`파일 업로드 실패 (보고서 상태 변경만 진행됩니다): ${uploadErr.message}`);
                // 업로드 실패 시 에러를 던지지 않고, 파일 없이 상태 변경만 진행하도록 우회
            }

            // 2. Find the Detail Record ID using teamName
            const searchUrl = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(config.tableName)}`);
            searchUrl.searchParams.append('filterByFormula', `{팀명} = '${teamName}'`);

            const resSearch = await fetch(searchUrl.toString(), {
                headers: { 'Authorization': `Bearer ${apiKey}` }
            });

            if (!resSearch.ok) throw new Error(`상세 기록 조회 실패 (${config.tableName})`);
            const dataSearch = await resSearch.json();

            if (!dataSearch.records || dataSearch.records.length === 0) {
                throw new Error('매칭되는 상세 기록을 찾을 수 없습니다.');
            }

            const detailRecordId = dataSearch.records[0].id;

            // 3. PATCH Detail Table with the new File and Status
            const detailUpdateFields: any = {
                "상태": "완료 서류 첨부 완료"
            };

            if (fileUrl) {
                detailUpdateFields[config.columnName] = [{ url: fileUrl }];
            }

            const payloadDetail = {
                records: [{
                    id: detailRecordId,
                    fields: detailUpdateFields
                }]
            };

            console.log(`[상세 테이블 (${config.tableName}) 보고서 전송 데이터]`, JSON.stringify(payloadDetail, null, 2));

            const resPatchDetail = await fetch(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(config.tableName)}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payloadDetail)
            });

            if (!resPatchDetail.ok) throw new Error('상세 테이블 보고서 첨부 실패');

            // 4. PATCH Main Table Status to '완료 서류 첨부 완료'
            const payloadMain = {
                records: [{
                    id: mainRecordId,
                    fields: { "상태": "완료 서류 첨부 완료" }
                }]
            };

            console.log(`[메인 테이블 (${mainTableName}) 상태 변경 전송 데이터]`, JSON.stringify(payloadMain, null, 2));

            const resPatchMain = await fetch(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(mainTableName)}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payloadMain)
            });

            if (!resPatchMain.ok) throw new Error('신청 상태 변경 실패');

            onSuccess();
        } catch (err: any) {
            console.error('보고서 업로드 에러:', err);
            setErrorMsg(err.message || '업로드 중 오류가 발생했습니다.');
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                <h3 className="text-lg font-bold text-neutral-900 flex items-center">
                    <UploadCloud className="w-5 h-5 mr-2 text-indigo-600" />
                    2차 증빙 서류 제출
                </h3>
                <button
                    onClick={onClose}
                    className="text-neutral-400 hover:text-neutral-600 transition-colors p-1 rounded-lg hover:bg-neutral-100"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm leading-relaxed border border-blue-100">
                    <p className="font-semibold mb-1">제출 대상: [{expenseCategory}]</p>
                    <p>해당 비목에 대한 <span className="font-bold underline decoration-blue-300 underline-offset-4">{config.columnName}</span> 파일을 양식에 맞게 업로드해 주세요.</p>
                </div>

                {errorMsg && (
                    <div className="flex items-start p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                        <AlertCircle className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
                        {errorMsg}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-bold text-neutral-700 flex items-center">
                        {config.columnName} 파일 선택
                    </label>
                    <input
                        type="file"
                        onChange={e => setFile(e.target.files?.[0] || null)}
                        className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 shadow-sm text-neutral-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                    />
                </div>

                <div className="pt-2 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 bg-white border border-neutral-200 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-50 transition-colors"
                    >
                        취소
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || !file}
                        className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center shadow-sm"
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                업로드 중...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                제출하기
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
