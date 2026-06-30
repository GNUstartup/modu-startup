import { useState, useEffect } from 'react';
import {
    Plus, Edit2, Trash2, Save, ChevronDown, ChevronRight,
    Eye, EyeOff, Tag, List, Info
} from 'lucide-react';
import {
    apiGetCategories, apiCreateCategory, apiUpdateCategory, apiSetCategoryActive,
    apiGetFields, apiCreateField, apiUpdateField, apiDeleteField,
} from '../../api';
import type { Category, Field } from '../../api';

// ── 공통 모달 래퍼 ────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children, footer }: {
    open: boolean; onClose: () => void; title: string;
    children: React.ReactNode; footer: React.ReactNode;
}) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
                onClick={e => e.stopPropagation()}>
                <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                    <h3 className="text-base font-bold text-neutral-900">{title}</h3>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 text-xl leading-none">✕</button>
                </div>
                <div className="px-6 py-5 space-y-4">{children}</div>
                <div className="px-6 py-4 border-t border-neutral-100 flex justify-end gap-2">{footer}</div>
            </div>
        </div>
    );
}

// ── 안내 모달 ─────────────────────────────────────────────────────────────────
function InfoModal({ msg, onClose }: { msg: string | null; onClose: () => void }) {
    return (
        <Modal open={!!msg} onClose={onClose} title="안내"
            footer={
                <button onClick={onClose}
                    className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
                    확인
                </button>
            }>
            <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-neutral-700 leading-relaxed">{msg}</p>
            </div>
        </Modal>
    );
}

// ── 삭제 확인 모달 ────────────────────────────────────────────────────────────
function ConfirmModal({ open, message, onConfirm, onCancel, loading }: {
    open: boolean; message: string; onConfirm: () => void; onCancel: () => void; loading?: boolean;
}) {
    return (
        <Modal open={open} onClose={onCancel} title="삭제 확인"
            footer={
                <>
                    <button onClick={onCancel} disabled={loading}
                        className="px-4 py-2 text-sm font-bold text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50 transition-colors">
                        취소
                    </button>
                    <button onClick={onConfirm} disabled={loading}
                        className="px-5 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors">
                        {loading ? '삭제 중...' : '삭제'}
                    </button>
                </>
            }>
            <p className="text-sm text-neutral-700 leading-relaxed">{message}</p>
            <p className="text-xs text-red-500 mt-1">삭제 후 복구할 수 없습니다.</p>
        </Modal>
    );
}

// ── 입력 컴포넌트 ─────────────────────────────────────────────────────────────
function Field_({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-xs font-bold text-neutral-600">{label}</label>
            {children}
        </div>
    );
}

const inputCls = "w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm";
const selectCls = `${inputCls} appearance-none cursor-pointer`;

// ── 칸종류 레이블 ─────────────────────────────────────────────────────────────
const FIELD_TYPE_LABELS: Record<string, string> = {
    text: '한 줄 텍스트',
    number: '숫자',
    textarea: '여러 줄 텍스트',
    select: '드롭다운 선택',
    file: '파일 첨부',
};

// ── 질문칸 모달 ───────────────────────────────────────────────────────────────
function FieldModal({ open, onClose, onSave, initial, processing }: {
    open: boolean;
    onClose: () => void;
    onSave: (data: Omit<Field, 'id' | '비목id'>) => void;
    initial?: Field | null;
    processing?: boolean;
}) {
    const [칸이름, set칸이름] = useState('');
    const [칸종류, set칸종류] = useState<Field['칸종류']>('text');
    const [선택지, set선택지] = useState('');
    const [필수여부, set필수여부] = useState(false);
    const [정렬순서, set정렬순서] = useState(0);

    useEffect(() => {
        if (open) {
            set칸이름(initial?.칸이름 ?? '');
            set칸종류(initial?.칸종류 ?? 'text');
            set선택지(initial?.선택지 ?? '');
            set필수여부(initial?.필수여부 ?? false);
            set정렬순서(initial?.정렬순서 ?? 0);
        }
    }, [open, initial]);

    const handleSave = () => {
        if (!칸이름.trim()) return;
        onSave({ 칸이름: 칸이름.trim(), 칸종류, 선택지: 선택지.trim(), 필수여부, 정렬순서 });
    };

    return (
        <Modal open={open} onClose={onClose}
            title={initial ? '질문칸 수정' : '질문칸 추가'}
            footer={
                <>
                    <button onClick={onClose} disabled={processing}
                        className="px-4 py-2 text-sm font-bold text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50 transition-colors">
                        취소
                    </button>
                    <button onClick={handleSave} disabled={processing || !칸이름.trim()}
                        className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                        <Save className="w-3.5 h-3.5" />
                        {processing ? '저장 중...' : (initial ? '수정 완료' : '추가')}
                    </button>
                </>
            }>
            <Field_ label="칸이름">
                <input value={칸이름} onChange={e => set칸이름(e.target.value)}
                    placeholder="예: 출발지" className={inputCls} />
            </Field_>

            <Field_ label="칸종류">
                <div className="relative">
                    <select value={칸종류} onChange={e => set칸종류(e.target.value as Field['칸종류'])}
                        className={selectCls}>
                        {Object.entries(FIELD_TYPE_LABELS).map(([v, l]) => (
                            <option key={v} value={v}>{l}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                </div>
            </Field_>

            {칸종류 === 'select' && (
                <Field_ label="선택지 (쉼표로 구분)">
                    <input value={선택지} onChange={e => set선택지(e.target.value)}
                        placeholder="예: 버스,기차,택시" className={inputCls} />
                    <p className="text-xs text-neutral-400 mt-1">쉼표(,)로 항목을 구분하세요.</p>
                </Field_>
            )}

            <Field_ label="정렬순서">
                <input type="number" value={정렬순서} onChange={e => set정렬순서(Number(e.target.value))}
                    className={inputCls} />
            </Field_>

            <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={필수여부} onChange={e => set필수여부(e.target.checked)}
                    className="w-4 h-4 rounded accent-indigo-600" />
                <span className="text-sm font-semibold text-neutral-700">필수 입력 칸</span>
            </label>
        </Modal>
    );
}

// ── 비목 모달 ─────────────────────────────────────────────────────────────────
function CategoryModal({ open, onClose, onSave, initial, processing }: {
    open: boolean;
    onClose: () => void;
    onSave: (data: Omit<Category, 'id' | '생성일시' | '사용여부'>) => void;
    initial?: Category | null;
    processing?: boolean;
}) {
    const [비목명, set비목명] = useState('');
    const [결제방식, set결제방식] = useState('');
    const [정산패턴, set정산패턴] = useState('');
    const [정렬순서, set정렬순서] = useState(0);

    useEffect(() => {
        if (open) {
            set비목명(initial?.비목명 ?? '');
            set결제방식(initial?.결제방식 ?? '');
            set정산패턴(initial?.정산패턴 ?? '');
            set정렬순서(initial?.정렬순서 ?? 0);
        }
    }, [open, initial]);

    const handleSave = () => {
        if (!비목명.trim()) return;
        onSave({ 비목명: 비목명.trim(), 결제방식, 정산패턴, 정렬순서 });
    };

    return (
        <Modal open={open} onClose={onClose}
            title={initial ? '비목 수정' : '새 비목 추가'}
            footer={
                <>
                    <button onClick={onClose} disabled={processing}
                        className="px-4 py-2 text-sm font-bold text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50 transition-colors">
                        취소
                    </button>
                    <button onClick={handleSave} disabled={processing || !비목명.trim()}
                        className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                        <Save className="w-3.5 h-3.5" />
                        {processing ? '저장 중...' : (initial ? '수정 완료' : '추가')}
                    </button>
                </>
            }>
            <Field_ label="비목명">
                <input value={비목명} onChange={e => set비목명(e.target.value)}
                    placeholder="예: 재료비" className={inputCls} />
            </Field_ >

            <Field_ label="결제방식">
                <input value={결제방식} onChange={e => set결제방식(e.target.value)}
                    placeholder="예: 대리결제" className={inputCls} />
            </Field_>

            <Field_ label="정산패턴">
                <div className="relative">
                    <select value={정산패턴} onChange={e => set정산패턴(e.target.value)}
                        className={selectCls}>
                        <option value="">선택 안 함</option>
                        <option value="송금형">송금형</option>
                        <option value="대리결제형">대리결제형</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                </div>
            </Field_>

            <Field_ label="정렬순서">
                <input type="number" value={정렬순서} onChange={e => set정렬순서(Number(e.target.value))}
                    className={inputCls} />
            </Field_>
        </Modal>
    );
}

// ── 질문칸 행 ─────────────────────────────────────────────────────────────────
function FieldRow({ field, onEdit, onDelete }: {
    field: Field;
    onEdit: (f: Field) => void;
    onDelete: (f: Field) => void;
}) {
    return (
        <div className="flex items-center justify-between px-4 py-3 hover:bg-neutral-50 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs text-neutral-400 w-5 text-right flex-shrink-0">{field.정렬순서}</span>
                <div className="min-w-0">
                    <span className="text-sm font-semibold text-neutral-800">{field.칸이름}</span>
                    {field.필수여부 && (
                        <span className="ml-1.5 text-[10px] font-bold text-red-500 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-full">필수</span>
                    )}
                    <span className="ml-2 text-xs text-neutral-400">
                        {FIELD_TYPE_LABELS[field.칸종류] || field.칸종류}
                        {field.칸종류 === 'select' && field.선택지 && (
                            <span className="text-neutral-300"> · {field.선택지}</span>
                        )}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-3">
                <button onClick={() => onEdit(field)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title="수정">
                    <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => onDelete(field)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="삭제">
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}

// ── 비목 카드 (펼치기/접기 + 질문칸 목록) ────────────────────────────────────
function CategoryCard({ category, onEdit, onToggleActive, onFieldsChanged, onInfo }: {
    category: Category;
    onEdit: (c: Category) => void;
    onToggleActive: (c: Category) => void;
    onFieldsChanged: () => void;
    onInfo: (msg: string) => void;
}) {
    const [expanded, setExpanded] = useState(false);
    const [fields, setFields] = useState<Field[]>([]);
    const [fieldsLoaded, setFieldsLoaded] = useState(false);
    const [fieldLoading, setFieldLoading] = useState(false);

    // 질문칸 모달
    const [fieldModalOpen, setFieldModalOpen] = useState(false);
    const [editingField, setEditingField] = useState<Field | null>(null);
    const [fieldProcessing, setFieldProcessing] = useState(false);

    // 질문칸 삭제 확인
    const [deleteField, setDeleteField] = useState<Field | null>(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);

    const loadFields = async () => {
        if (!category.id) return;
        setFieldLoading(true);
        try {
            setFields(await apiGetFields(category.id));
            setFieldsLoaded(true);
        } catch { /* 무시 */ } finally {
            setFieldLoading(false);
        }
    };

    const handleExpand = () => {
        const next = !expanded;
        setExpanded(next);
        if (next && !fieldsLoaded) loadFields();
    };

    const openFieldModal = (f?: Field) => {
        setEditingField(f || null);
        setFieldModalOpen(true);
    };

    const handleFieldSave = async (data: Omit<Field, 'id' | '비목id'>) => {
        if (!category.id) return;
        setFieldProcessing(true);
        try {
            if (editingField?.id) {
                await apiUpdateField(editingField.id, data);
            } else {
                await apiCreateField({ 비목id: category.id, ...data });
            }
            setFieldModalOpen(false);
            setEditingField(null);
            await loadFields();
            onFieldsChanged();
        } catch (err: any) {
            onInfo(err.message || '저장 중 오류가 발생했습니다.');
        } finally {
            setFieldProcessing(false);
        }
    };

    const handleFieldDelete = async () => {
        if (!deleteField?.id) return;
        setDeleteProcessing(true);
        try {
            await apiDeleteField(deleteField.id);
            setDeleteField(null);
            await loadFields();
            onFieldsChanged();
        } catch (err: any) {
            onInfo(err.message || '삭제 중 오류가 발생했습니다.');
            setDeleteField(null);
        } finally {
            setDeleteProcessing(false);
        }
    };

    return (
        <>
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                {/* 비목 헤더 */}
                <div
                    className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-neutral-50 transition-colors select-none"
                    onClick={handleExpand}
                >
                    <div className="flex items-center gap-3 min-w-0">
                        {expanded
                            ? <ChevronDown className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                            : <ChevronRight className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                        }
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-neutral-800 text-sm">{category.비목명}</span>
                                {!category.사용여부 && (
                                    <span className="text-[10px] font-bold text-neutral-400 bg-neutral-100 border border-neutral-200 px-1.5 py-0.5 rounded-full">숨김</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                {category.결제방식 && (
                                    <span className="text-[11px] text-neutral-500">{category.결제방식}</span>
                                )}
                                {category.정산패턴 && (
                                    <span className="text-[11px] text-indigo-500 font-semibold">{category.정산패턴}</span>
                                )}
                                <span className="text-[11px] text-neutral-400">순서 {category.정렬순서 ?? 0}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-3" onClick={e => e.stopPropagation()}>
                        <button onClick={() => onEdit(category)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title="수정">
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onToggleActive(category)}
                            className={`p-1.5 rounded-lg transition-colors ${category.사용여부
                                ? 'text-neutral-400 hover:text-amber-600 hover:bg-amber-50'
                                : 'text-neutral-400 hover:text-green-600 hover:bg-green-50'
                                }`}
                            title={category.사용여부 ? '숨기기' : '표시하기'}
                        >
                            {category.사용여부 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* 질문칸 목록 */}
                {expanded && (
                    <div className="border-t border-neutral-100">
                        {fieldLoading ? (
                            <p className="px-5 py-4 text-xs text-neutral-400">불러오는 중...</p>
                        ) : fields.length === 0 ? (
                            <p className="px-5 py-4 text-xs text-neutral-400">등록된 질문칸이 없습니다.</p>
                        ) : (
                            <div className="divide-y divide-neutral-100">
                                {fields.map(f => (
                                    <FieldRow key={f.id} field={f}
                                        onEdit={f => openFieldModal(f)}
                                        onDelete={f => setDeleteField(f)}
                                    />
                                ))}
                            </div>
                        )}
                        <div className="px-4 py-3 border-t border-neutral-100 bg-neutral-50/50">
                            <button
                                onClick={() => openFieldModal()}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5" /> 질문칸 추가
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <FieldModal
                open={fieldModalOpen}
                onClose={() => { setFieldModalOpen(false); setEditingField(null); }}
                onSave={handleFieldSave}
                initial={editingField}
                processing={fieldProcessing}
            />

            <ConfirmModal
                open={!!deleteField}
                message={`'${deleteField?.칸이름}' 질문칸을 삭제하시겠습니까?`}
                onConfirm={handleFieldDelete}
                onCancel={() => setDeleteField(null)}
                loading={deleteProcessing}
            />
        </>
    );
}

// ── 메인 페이지 ───────────────────────────────────────────────────────────────
export default function CategoryManagement() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    // 비목 모달
    const [catModalOpen, setCatModalOpen] = useState(false);
    const [editingCat, setEditingCat] = useState<Category | null>(null);
    const [catProcessing, setCatProcessing] = useState(false);

    // 공통 안내 모달
    const [infoMsg, setInfoMsg] = useState<string | null>(null);

    const loadCategories = async () => {
        setLoading(true);
        try {
            setCategories(await apiGetCategories());
        } catch (err: any) {
            setInfoMsg(err.message || '비목 목록을 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadCategories(); }, []);

    const openCatModal = (c?: Category) => {
        setEditingCat(c || null);
        setCatModalOpen(true);
    };

    const handleCatSave = async (data: Omit<Category, 'id' | '생성일시' | '사용여부'>) => {
        setCatProcessing(true);
        try {
            if (editingCat?.id) {
                await apiUpdateCategory(editingCat.id, data);
            } else {
                await apiCreateCategory(data);
            }
            setCatModalOpen(false);
            setEditingCat(null);
            await loadCategories();
        } catch (err: any) {
            setInfoMsg(err.message || '저장 중 오류가 발생했습니다.');
        } finally {
            setCatProcessing(false);
        }
    };

    const handleToggleActive = async (c: Category) => {
        if (!c.id) return;
        try {
            await apiSetCategoryActive(c.id, !c.사용여부);
            await loadCategories();
        } catch (err: any) {
            setInfoMsg(err.message || '사용여부 변경 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* 헤더 */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-neutral-900 flex items-center">
                        <Tag className="w-6 h-6 mr-2 text-indigo-600" /> 비목 관리
                    </h1>
                    <button
                        onClick={() => openCatModal()}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> 새 비목 추가
                    </button>
                </div>

                <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-5 py-3 text-sm text-indigo-800 font-medium flex items-center gap-2">
                    <List className="w-4 h-4 flex-shrink-0" />
                    비목을 클릭하면 해당 비목의 질문칸 목록을 볼 수 있습니다.
                </div>

                {/* 비목 목록 */}
                {loading ? (
                    <div className="text-center py-12 text-neutral-400 text-sm">불러오는 중...</div>
                ) : categories.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
                        <Tag className="mx-auto w-10 h-10 text-neutral-300 mb-3" />
                        <p className="text-neutral-400 text-sm">등록된 비목이 없습니다. 새 비목을 추가해보세요.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {categories.map(c => (
                            <CategoryCard
                                key={c.id}
                                category={c}
                                onEdit={openCatModal}
                                onToggleActive={handleToggleActive}
                                onFieldsChanged={loadCategories}
                                onInfo={setInfoMsg}
                            />
                        ))}
                    </div>
                )}
            </div>

            <CategoryModal
                open={catModalOpen}
                onClose={() => { setCatModalOpen(false); setEditingCat(null); }}
                onSave={handleCatSave}
                initial={editingCat}
                processing={catProcessing}
            />

            <InfoModal msg={infoMsg} onClose={() => setInfoMsg(null)} />
        </div>
    );
}
