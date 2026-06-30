import React, { useState, useEffect } from 'react';
import { Tag, ChevronDown, CheckCircle2, UploadCloud, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    apiGetActiveCategories, apiGetFields,
    apiCreateDynamicApplication, apiUploadFile,
} from '../api';
import type { Category, Field } from '../api';

// ── 숫자 → 한글 변환 ─────────────────────────────────────────────────────────
function numberToKorean(number: number): string {
    if (!number || isNaN(number) || number === 0) return '';
    const numStr = number.toString();
    const result: string[] = [];
    const units = ['', '십', '백', '천'];
    const tenUnits = ['', '만', '억', '조'];
    const digits = ['영', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
    let splitIndex = numStr.length;
    let tenUnitIndex = 0;
    while (splitIndex > 0) {
        const chunk = numStr.substring(Math.max(splitIndex - 4, 0), splitIndex);
        let chunkResult = '';
        let hasNonZero = false;
        for (let i = 0; i < chunk.length; i++) {
            const digit = parseInt(chunk[chunk.length - 1 - i], 10);
            if (digit !== 0) {
                hasNonZero = true;
                chunkResult = (digit === 1 && i > 0 ? '' : digits[digit]) + units[i] + chunkResult;
            }
        }
        if (hasNonZero) result.unshift(chunkResult + tenUnits[tenUnitIndex]);
        tenUnitIndex++;
        splitIndex -= 4;
    }
    return result.join('');
}

// ── 성공 모달 ─────────────────────────────────────────────────────────────────
function SuccessModal() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-5">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">신청 완료</h3>
                <p className="text-sm text-neutral-500 mb-1">신청이 정상적으로 완료되었습니다.</p>
                <p className="text-xs text-neutral-400">잠시 후 대시보드로 이동합니다...</p>
            </div>
        </div>
    );
}

// ── 오류 모달 ─────────────────────────────────────────────────────────────────
function ErrorModal({ msg, onClose }: { msg: string; onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
                onClick={e => e.stopPropagation()}>
                <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                    <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500" /> 오류
                    </h3>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 text-xl leading-none">✕</button>
                </div>
                <div className="px-6 py-5">
                    <p className="text-sm text-neutral-700 leading-relaxed">{msg}</p>
                </div>
                <div className="px-6 py-4 border-t border-neutral-100 flex justify-end">
                    <button onClick={onClose}
                        className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── 동적 필드 렌더러 ──────────────────────────────────────────────────────────
function DynamicField({ field, value, fileValue, onChange, onFileChange, uploading }: {
    field: Field;
    value: string;
    fileValue: File | null;
    onChange: (v: string) => void;
    onFileChange: (f: File | null) => void;
    uploading: boolean;
}) {
    const base = "w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm text-neutral-900";
    const label = (
        <label className="flex items-center text-sm font-semibold text-neutral-700 min-h-[20px]">
            {field.칸이름}
            {field.필수여부 && <span className="ml-1 text-red-500">*</span>}
        </label>
    );

    if (field.칸종류 === 'text') {
        return (
            <div className="space-y-1.5">
                {label}
                <input type="text" value={value} onChange={e => onChange(e.target.value)}
                    placeholder={field.칸이름} className={base} />
            </div>
        );
    }

    if (field.칸종류 === 'number') {
        return (
            <div className="space-y-1.5">
                {label}
                <input type="number" value={value} onChange={e => onChange(e.target.value)}
                    placeholder="0" className={base} />
            </div>
        );
    }

    if (field.칸종류 === 'textarea') {
        return (
            <div className="space-y-1.5 md:col-span-2">
                {label}
                <textarea value={value} onChange={e => onChange(e.target.value)}
                    placeholder={field.칸이름} rows={4}
                    className={`${base} resize-y min-h-[100px]`} />
            </div>
        );
    }

    if (field.칸종류 === 'select') {
        const options = (field.선택지 || '').split(',').map(s => s.trim()).filter(Boolean);
        return (
            <div className="space-y-1.5">
                {label}
                <div className="relative">
                    <select value={value} onChange={e => onChange(e.target.value)}
                        className={`${base} appearance-none cursor-pointer pr-10 ${!value ? 'text-neutral-400' : ''}`}>
                        <option value="">선택</option>
                        {options.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                </div>
            </div>
        );
    }

    if (field.칸종류 === 'file') {
        return (
            <div className="space-y-1.5 md:col-span-2">
                {label}
                <input type="file" disabled={uploading}
                    onChange={e => onFileChange(e.target.files?.[0] || null)}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm focus:ring-2 focus:ring-indigo-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all" />
                {uploading && (
                    <p className="text-xs text-indigo-500 flex items-center gap-1">
                        <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        파일 업로드 중...
                    </p>
                )}
                {!uploading && fileValue && (
                    <p className="text-xs text-neutral-500">선택됨: {fileValue.name}</p>
                )}
            </div>
        );
    }

    return null;
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────────
export default function DynamicRequestForm() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [categories, setCategories] = useState<Category[]>([]);
    const [catLoading, setCatLoading] = useState(true);
    const [selectedCat, setSelectedCat] = useState<Category | null>(null);
    const [fields, setFields] = useState<Field[]>([]);
    const [fieldsLoading, setFieldsLoading] = useState(false);

    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [fileMap, setFileMap] = useState<Record<string, File | null>>({});
    const [amountStr, setAmountStr] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        apiGetActiveCategories()
            .then(setCategories)
            .catch(() => {})
            .finally(() => setCatLoading(false));
    }, []);

    const handleCategoryChange = async (catId: string) => {
        if (!catId) { setSelectedCat(null); setFields([]); return; }
        const cat = categories.find(c => String(c.id) === catId) || null;
        setSelectedCat(cat);
        setAnswers({});
        setFileMap({});
        setAmountStr('');
        setErrorMsg(null);
        if (!cat?.id) return;
        setFieldsLoading(true);
        try {
            setFields(await apiGetFields(cat.id));
        } catch { setFields([]); } finally { setFieldsLoading(false); }
    };

    const setAnswer = (칸이름: string, value: string) =>
        setAnswers(prev => ({ ...prev, [칸이름]: value }));

    const setFile = (칸이름: string, file: File | null) =>
        setFileMap(prev => ({ ...prev, [칸이름]: file }));

    const validate = (): string | null => {
        for (const f of fields) {
            if (!f.필수여부) continue;
            if (f.칸종류 === 'file') {
                if (!fileMap[f.칸이름]) return `'${f.칸이름}'은(는) 필수 항목입니다.`;
            } else {
                if (!answers[f.칸이름]?.trim()) return `'${f.칸이름}'은(는) 필수 항목입니다.`;
            }
        }
        if (!amountStr) return '신청금액을 입력해주세요.';
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCat || !user) return;

        const validErr = validate();
        if (validErr) { setErrorMsg(validErr); return; }

        setIsSubmitting(true);
        setErrorMsg(null);

        // 파일 업로드
        const collected: Record<string, any> = { ...answers };
        setIsUploading(true);
        try {
            for (const f of fields) {
                if (f.칸종류 === 'file' && fileMap[f.칸이름]) {
                    const { url, 원본파일명 } = await apiUploadFile(fileMap[f.칸이름]!);
                    collected[f.칸이름] = `${원본파일명}|||${url}`;
                }
            }
        } catch (uploadErr: any) {
            setErrorMsg('파일 업로드 중 오류가 발생했습니다: ' + (uploadErr.message || ''));
            setIsSubmitting(false);
            setIsUploading(false);
            return;
        } finally {
            setIsUploading(false);
        }

        try {
            await apiCreateDynamicApplication({
                참가자명: user.projectName,
                비목명: selectedCat.비목명,
                동적답변: collected,
                신청금액: Number(amountStr.replace(/,/g, '')),
            });
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                navigate('/dashboard');
            }, 2000);
        } catch (err: any) {
            setErrorMsg(err.message || '신청 저장 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const numericAmount = Number(amountStr.replace(/,/g, ''));
    const canSubmit = !isSubmitting && !isUploading && !showSuccess && selectedCat && !validate();

    return (
        <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-neutral-100">

                    {/* 헤더 */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-10 text-white">
                        <h2 className="text-3xl font-bold mb-2">MVP 제작비 신청서</h2>
                        <p className="text-blue-100/80 text-sm">
                            비목을 선택하면 해당 항목의 입력 칸이 나타납니다.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="px-8 py-10 space-y-8">

                        {/* 참가자명 */}
                        <div className="space-y-1.5">
                            <label className="flex items-center text-sm font-semibold text-neutral-700">
                                <Tag className="w-4 h-4 mr-2 text-indigo-500" /> 참가자명
                            </label>
                            <input type="text" value={user?.projectName || ''} readOnly
                                className="w-full px-4 py-2.5 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-600 font-medium outline-none cursor-not-allowed text-sm" />
                        </div>

                        {/* 비목 선택 */}
                        <div className="space-y-1.5">
                            <label className="flex items-center text-sm font-semibold text-neutral-700">
                                <Tag className="w-4 h-4 mr-2 text-indigo-500" /> 신청 비목
                            </label>
                            {catLoading ? (
                                <p className="text-sm text-neutral-400 py-2">비목 목록 불러오는 중...</p>
                            ) : (
                                <div className="relative">
                                    <select
                                        value={selectedCat ? String(selectedCat.id) : ''}
                                        onChange={e => handleCategoryChange(e.target.value)}
                                        required
                                        className={`w-full pl-4 pr-10 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer text-sm ${!selectedCat ? 'text-neutral-400' : 'text-neutral-900'}`}
                                    >
                                        <option value="">비목을 선택하세요</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={String(c.id)}>{c.비목명}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                                </div>
                            )}
                        </div>

                        {/* 동적 질문칸 */}
                        {selectedCat && (
                            <div className="pt-4 border-t border-neutral-100 space-y-6">
                                <h3 className="text-base font-bold text-neutral-800">
                                    {selectedCat.비목명} 세부 정보
                                </h3>

                                {fieldsLoading ? (
                                    <p className="text-sm text-neutral-400">질문칸 불러오는 중...</p>
                                ) : fields.length === 0 ? (
                                    <p className="text-sm text-neutral-400">등록된 질문칸이 없습니다.</p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {fields.map(f => (
                                            <DynamicField
                                                key={f.id}
                                                field={f}
                                                value={answers[f.칸이름] || ''}
                                                fileValue={fileMap[f.칸이름] || null}
                                                onChange={v => setAnswer(f.칸이름, v)}
                                                onFileChange={file => setFile(f.칸이름, file)}
                                                uploading={isUploading}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* 신청금액 (공통) */}
                                <div className="pt-4 border-t border-neutral-100 space-y-1.5">
                                    <label className="flex items-center text-sm font-semibold text-neutral-700">
                                        <span className="w-4 h-4 mr-2 text-indigo-500 font-bold flex items-center justify-center">₩</span>
                                        신청금액
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={amountStr}
                                            onChange={e => {
                                                const raw = e.target.value.replace(/[^0-9]/g, '');
                                                setAmountStr(raw ? Number(raw).toLocaleString() : '');
                                            }}
                                            placeholder="0"
                                            className="w-full h-[48px] pl-4 pr-12 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:ring-2 focus:ring-indigo-500 text-right font-medium text-lg text-neutral-900"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none text-neutral-500 font-medium">원</div>
                                    </div>
                                    {amountStr && (
                                        <p className="text-sm text-neutral-400 text-right">
                                            금 {numberToKorean(numericAmount)}원
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 제출 */}
                        <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                            <p className="text-xs text-neutral-400">신청 내역은 관리자 승인 후 처리됩니다.</p>
                            <button
                                type="submit"
                                disabled={!canSubmit}
                                className="inline-flex items-center px-6 py-3 text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {isSubmitting || isUploading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        {isUploading ? '파일 업로드 중...' : '처리 중...'}
                                    </span>
                                ) : (
                                    <span className="flex items-center">
                                        <UploadCloud className="w-5 h-5 mr-2" /> 신청서 제출
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {showSuccess && <SuccessModal />}
            {errorMsg && <ErrorModal msg={errorMsg} onClose={() => setErrorMsg(null)} />}
        </div>
    );
}
