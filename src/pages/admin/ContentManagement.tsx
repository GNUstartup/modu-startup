import { useState, useEffect } from 'react';
import { Bell, FileText, Plus, Edit2, Trash2, Save, Info } from 'lucide-react';
import { apiGetSetting, apiUpdateSetting, apiGetNotices, apiCreateNotice, apiUpdateNotice, apiDeleteNotice } from '../../api';
import type { Notice } from '../../api';
import { type GuideData, DEFAULT_GUIDE_DATA, parseGuideData } from '../student/ProgramGuide';

export default function ContentManagement() {
    const [activeTab, setActiveTab] = useState<'notices' | 'guide'>('notices');

    // ── 공지사항 관리 ──
    const [notices, setNotices] = useState<Notice[]>([]);
    const [noticesLoading, setNoticesLoading] = useState(true);
    const [noticeModalOpen, setNoticeModalOpen] = useState(false);
    const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
    const [noticeTitle, setNoticeTitle] = useState('');
    const [noticeContent, setNoticeContent] = useState('');
    const [noticeProcessing, setNoticeProcessing] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<Notice | null>(null);
    const [noticeInfoMsg, setNoticeInfoMsg] = useState<string | null>(null);

    // ── 프로그램 안내 수정 ──
    const [guideData, setGuideData] = useState<GuideData>(DEFAULT_GUIDE_DATA);
    const [guideSaving, setGuideSaving] = useState(false);
    const [guideSaveMsg, setGuideSaveMsg] = useState<string | null>(null);

    useEffect(() => {
        loadNotices();
        apiGetSetting('프로그램안내').then(raw => {
            const parsed = parseGuideData(raw);
            if (parsed) setGuideData(parsed);
            // 파싱 실패 시 DEFAULT_GUIDE_DATA 그대로 사용
        }).catch(() => {});
    }, []);

    const loadNotices = async () => {
        setNoticesLoading(true);
        try {
            setNotices(await apiGetNotices());
        } catch { /* 무시 */ } finally {
            setNoticesLoading(false);
        }
    };

    const formatDate = (d?: string) => {
        if (!d) return '';
        try {
            const dt = new Date(d);
            if (isNaN(dt.getTime())) return d;
            return `${dt.getFullYear()}.${String(dt.getMonth() + 1).padStart(2, '0')}.${String(dt.getDate()).padStart(2, '0')}`;
        } catch { return ''; }
    };

    // ── 공지 모달 ──
    const openNoticeModal = (n?: Notice) => {
        setEditingNotice(n || null);
        setNoticeTitle(n ? n.제목 : '');
        setNoticeContent(n ? n.내용 : '');
        setNoticeModalOpen(true);
    };
    const closeNoticeModal = () => {
        setNoticeModalOpen(false);
        setEditingNotice(null);
        setNoticeTitle('');
        setNoticeContent('');
    };

    const handleNoticeSave = async () => {
        if (!noticeTitle.trim()) { setNoticeInfoMsg('제목을 입력해 주세요.'); return; }
        if (!noticeContent.trim()) { setNoticeInfoMsg('내용을 입력해 주세요.'); return; }
        setNoticeProcessing(true);
        try {
            if (editingNotice?.id) {
                await apiUpdateNotice(editingNotice.id, noticeTitle.trim(), noticeContent.trim());
            } else {
                await apiCreateNotice(noticeTitle.trim(), noticeContent.trim());
            }
            closeNoticeModal();
            await loadNotices();
        } catch (err: any) {
            setNoticeInfoMsg(err.message || '공지 저장 중 오류가 발생했습니다.');
        } finally {
            setNoticeProcessing(false);
        }
    };

    const handleNoticeDelete = async () => {
        if (!deleteConfirm?.id) return;
        setNoticeProcessing(true);
        try {
            await apiDeleteNotice(deleteConfirm.id);
            setDeleteConfirm(null);
            await loadNotices();
        } catch (err: any) {
            setNoticeInfoMsg(err.message || '삭제 중 오류가 발생했습니다.');
            setDeleteConfirm(null);
        } finally {
            setNoticeProcessing(false);
        }
    };

    const handleGuideSave = async () => {
        setGuideSaving(true);
        try {
            await apiUpdateSetting('프로그램안내', JSON.stringify(guideData));
            setGuideSaveMsg('저장되었습니다. 참가자 화면에 즉시 반영됩니다.');
        } catch (err: any) {
            setGuideSaveMsg(err.message || '저장 중 오류가 발생했습니다.');
        } finally {
            setGuideSaving(false);
        }
    };

    const updateGuide = (field: keyof GuideData, value: string) =>
        setGuideData(prev => ({ ...prev, [field]: value }));

    return (
        <div className="min-h-screen bg-neutral-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* 헤더 */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
                    <h1 className="text-2xl font-bold text-neutral-900 flex items-center">
                        <FileText className="w-6 h-6 mr-2 text-indigo-600" /> 게시물 작성
                    </h1>
                </div>

                {/* 서브 탭 */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('notices')}
                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition-colors ${activeTab === 'notices' ? 'bg-amber-500 text-white border-amber-500 shadow-sm' : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'}`}
                    >
                        <Bell className="w-4 h-4" /> 공지사항 관리
                    </button>
                    <button
                        onClick={() => setActiveTab('guide')}
                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition-colors ${activeTab === 'guide' ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'}`}
                    >
                        <FileText className="w-4 h-4" /> 프로그램 안내 수정
                    </button>
                </div>

                {/* ── 공지사항 관리 탭 ── */}
                {activeTab === 'notices' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                                <Bell className="w-4 h-4 text-amber-500" /> 공지사항 관리
                            </h2>
                            <button
                                onClick={() => openNoticeModal()}
                                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-amber-500 rounded-xl hover:bg-amber-600 transition-colors"
                            >
                                <Plus className="w-4 h-4" /> 새 공지 작성
                            </button>
                        </div>
                        <div className="divide-y divide-neutral-100">
                            {noticesLoading ? (
                                <p className="px-6 py-8 text-center text-sm text-neutral-400">불러오는 중...</p>
                            ) : notices.length === 0 ? (
                                <p className="px-6 py-8 text-center text-sm text-neutral-400">등록된 공지사항이 없습니다.</p>
                            ) : notices.map(n => (
                                <div key={n.id} className="px-6 py-4 flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="font-semibold text-neutral-800 text-sm truncate">{n.제목}</p>
                                        <p className="text-xs text-neutral-400 mt-0.5">{formatDate(n.작성일시)}</p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button onClick={() => openNoticeModal(n)}
                                            className="p-1.5 rounded-lg text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title="수정">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => setDeleteConfirm(n)}
                                            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="삭제">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── 프로그램 안내 수정 탭 ── */}
                {activeTab === 'guide' && (
                    <div className="space-y-4">
                        <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-5 py-3 text-sm text-indigo-800 font-medium">
                            각 섹션의 텍스트를 수정하고 저장하면 참가자 화면에 즉시 반영됩니다. 디자인 틀은 고정이며, 텍스트 내용만 수정됩니다.
                        </div>

                        {/* 개요 */}
                        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-neutral-100 bg-indigo-50/50">
                                <h2 className="text-base font-bold text-indigo-900 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" /> 개요
                                </h2>
                            </div>
                            <div className="px-6 py-5">
                                <textarea
                                    value={guideData.개요}
                                    onChange={e => updateGuide('개요', e.target.value)}
                                    rows={6}
                                    className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-y font-sans leading-relaxed"
                                />
                            </div>
                        </div>

                        {/* 지원금 사용 */}
                        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-neutral-100 bg-indigo-50/50">
                                <h2 className="text-base font-bold text-indigo-900 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" /> 지원금 사용
                                </h2>
                            </div>
                            <div className="px-6 py-5">
                                <textarea
                                    value={guideData.지원금사용}
                                    onChange={e => updateGuide('지원금사용', e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-y font-sans leading-relaxed"
                                />
                            </div>
                        </div>

                        {/* 유의사항 */}
                        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-neutral-100 bg-red-50/50">
                                <h2 className="text-base font-bold text-red-900 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> 유의사항
                                </h2>
                                <p className="text-xs text-neutral-400 mt-1">한 줄에 항목 하나씩 입력하세요. 각 줄이 글머리 기호(·) 항목으로 표시됩니다.</p>
                            </div>
                            <div className="px-6 py-5">
                                <textarea
                                    value={guideData.유의사항}
                                    onChange={e => updateGuide('유의사항', e.target.value)}
                                    rows={10}
                                    className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:ring-2 focus:ring-red-400 text-sm resize-y font-sans leading-relaxed"
                                />
                            </div>
                        </div>

                        {/* 기본 진행 절차 안내 */}
                        <div className="bg-neutral-50 border border-neutral-200 rounded-xl px-5 py-3 text-xs text-neutral-500">
                            <strong className="text-neutral-600">기본 진행 절차</strong> 섹션(지원금 사용 / 계획 변경 단계 흐름)은 디자인 고정 요소로 수정 대상에서 제외됩니다.
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={handleGuideSave}
                                disabled={guideSaving}
                                className="inline-flex items-center gap-1.5 px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                            >
                                <Save className="w-4 h-4" />
                                {guideSaving ? '저장 중...' : '전체 저장'}
                            </button>
                        </div>
                    </div>
                )}

            </div>

            {/* ── 공지 작성/수정 모달 ── */}
            {noticeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                    onClick={closeNoticeModal}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
                        onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                                <Bell className="w-4 h-4 text-amber-500" />
                                {editingNotice ? '공지 수정' : '새 공지 작성'}
                            </h3>
                            <button onClick={closeNoticeModal} className="text-neutral-400 hover:text-neutral-600">✕</button>
                        </div>
                        <div className="px-6 py-5 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-neutral-600 mb-1.5">제목</label>
                                <input type="text" value={noticeTitle} onChange={e => setNoticeTitle(e.target.value)}
                                    placeholder="공지 제목을 입력하세요"
                                    className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:ring-2 focus:ring-amber-400 text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-600 mb-1.5">내용</label>
                                <textarea value={noticeContent} onChange={e => setNoticeContent(e.target.value)}
                                    placeholder="공지 내용을 입력하세요" rows={6}
                                    className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:ring-2 focus:ring-amber-400 text-sm resize-y" />
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-neutral-100 flex justify-end gap-2">
                            <button onClick={closeNoticeModal} disabled={noticeProcessing}
                                className="px-4 py-2 text-sm font-bold text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50 transition-colors">
                                취소
                            </button>
                            <button onClick={handleNoticeSave} disabled={noticeProcessing}
                                className="px-5 py-2 text-sm font-bold text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors">
                                {noticeProcessing ? '저장 중...' : (editingNotice ? '수정 완료' : '작성 완료')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── 공지 삭제 확인 모달 ── */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                    onClick={() => setDeleteConfirm(null)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
                        onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                                <Trash2 className="w-4 h-4 text-red-500" /> 공지 삭제 확인
                            </h3>
                            <button onClick={() => setDeleteConfirm(null)} className="text-neutral-400 hover:text-neutral-600">✕</button>
                        </div>
                        <div className="px-6 py-5">
                            <p className="text-sm text-neutral-700 leading-relaxed">
                                '<span className="font-semibold">{deleteConfirm.제목}</span>' 공지를 삭제하시겠습니까?
                            </p>
                            <p className="text-xs text-red-500 mt-2">삭제 후 복구할 수 없습니다.</p>
                        </div>
                        <div className="px-6 py-4 border-t border-neutral-100 flex justify-end gap-2">
                            <button onClick={() => setDeleteConfirm(null)} disabled={noticeProcessing}
                                className="px-4 py-2 text-sm font-bold text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50 transition-colors">
                                취소
                            </button>
                            <button onClick={handleNoticeDelete} disabled={noticeProcessing}
                                className="px-5 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors">
                                {noticeProcessing ? '삭제 중...' : '삭제'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── 공지/안내 작업 결과 안내 모달 ── */}
            {(noticeInfoMsg || guideSaveMsg) && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                    onClick={() => { setNoticeInfoMsg(null); setGuideSaveMsg(null); }}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
                        onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                                <Info className="w-4 h-4 text-indigo-500" /> 안내
                            </h3>
                            <button onClick={() => { setNoticeInfoMsg(null); setGuideSaveMsg(null); }}
                                className="text-neutral-400 hover:text-neutral-600">✕</button>
                        </div>
                        <div className="px-6 py-5">
                            <p className="text-sm text-neutral-700 leading-relaxed">{noticeInfoMsg || guideSaveMsg}</p>
                        </div>
                        <div className="px-6 py-4 border-t border-neutral-100 flex justify-end">
                            <button onClick={() => { setNoticeInfoMsg(null); setGuideSaveMsg(null); }}
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
