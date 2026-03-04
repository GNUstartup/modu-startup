import { useState } from 'react';
import { X, Save, Clock, Wallet, UserCog, CheckCircle2, TrendingUp, User, RefreshCw, Trash2, AlertTriangle } from 'lucide-react';

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

interface TeamDetailProps {
    isOpen: boolean;
    onClose: () => void;
    teamId: string;
    teamName: string;
    teamLeaderName: string;
    accountId: string;
    accountPw: string;
    budgetPlan: {
        total: number;
        travel: number;        // 여비
        material: number;      // 재료비
        outsourcing: number;   // 외주용역비
        fee: number;           // 지급수수료
    };
    businessPlanDoc?: Array<{ url: string, filename: string }>;
    recentRequests: AirtableRecord[];
    onSaveAccount: (id: string, pw: string) => Promise<void>;
    onSaveBudget: (budget: { travel: number, material: number, outsourcing: number, fee: number }) => Promise<void>;
    onDeleteTeam: () => Promise<void>;
}

export default function TeamDetailModal({
    isOpen, onClose, teamName, teamLeaderName, accountId, accountPw, budgetPlan, businessPlanDoc, recentRequests, onSaveAccount, onSaveBudget, onDeleteTeam
}: TeamDetailProps) {
    const [editAccountPw, setEditAccountPw] = useState(accountPw);

    const [editTravel, setEditTravel] = useState(budgetPlan.travel.toString());
    const [editMaterial, setEditMaterial] = useState(budgetPlan.material.toString());
    const [editOutsourcing, setEditOutsourcing] = useState(budgetPlan.outsourcing.toString());
    const [editFee, setEditFee] = useState(budgetPlan.fee.toString());

    const [isSavingAccount, setIsSavingAccount] = useState(false);
    const [isSavingBudget, setIsSavingBudget] = useState(false);

    // Add custom toast state
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const displayToast = (msg: string) => {
        setToastMessage(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    if (!isOpen) return null;

    const handleSaveAccount = async () => {
        setIsSavingAccount(true);
        try {
            await onSaveAccount(accountId, editAccountPw);
            displayToast("계정 정보가 성공적으로 수정되었습니다.");
        } finally {
            setIsSavingAccount(false);
        }
    };

    const handleSaveBudget = async () => {
        setIsSavingBudget(true);
        await onSaveBudget({
            travel: parseInt(editTravel.replace(/[^0-9]/g, ''), 10) || 0,
            material: parseInt(editMaterial.replace(/[^0-9]/g, ''), 10) || 0,
            outsourcing: parseInt(editOutsourcing.replace(/[^0-9]/g, ''), 10) || 0,
            fee: parseInt(editFee.replace(/[^0-9]/g, ''), 10) || 0,
        });
        setIsSavingBudget(false);
        displayToast("예산 정보가 성공적으로 수정되었습니다.");
    };

    const handleDeleteTeam = async () => {
        setIsDeleting(true);
        try {
            await onDeleteTeam();
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
    };

    const formatNumberInput = (value: string) => {
        const num = parseInt(value.replace(/[^0-9]/g, ''), 10);
        return isNaN(num) ? '0' : num.toLocaleString();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            {/* Custom Dark Toast */}
            {showToast && (
                <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="bg-neutral-900 border border-neutral-800 shadow-2xl rounded-full px-6 py-3 flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <span className="text-white text-sm font-medium">{toastMessage}</span>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 border border-neutral-200">
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
                                <AlertTriangle className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 mb-2">팀 삭제</h3>
                            <p className="text-sm text-neutral-500 mb-8 leading-relaxed">
                                정말로 이 팀을 삭제하시겠습니까?<br />삭제된 데이터는 복구할 수 없습니다.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={isDeleting}
                                    className="flex-1 py-3 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl transition-colors disabled:opacity-50"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleDeleteTeam}
                                    disabled={isDeleting}
                                    className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center"
                                >
                                    {isDeleting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    삭제
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center bg-slate-800 sticky top-0 z-10 text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">{teamName} <span className="text-slate-300 font-medium text-lg">/ {teamLeaderName}</span></h2>
                            <p className="text-sm text-slate-400">팀별 통합 관리 컨트롤 타워</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-300" />
                    </button>
                </div>

                {/* Body scrollable */}
                <div className="p-6 overflow-y-auto flex-1 space-y-8 bg-neutral-50/50">

                    {/* Section 1: Account Info */}
                    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-neutral-200 flex justify-between items-center bg-neutral-100">
                            <h3 className="text-base font-bold text-neutral-800 flex items-center">
                                <UserCog className="w-4 h-4 mr-2 text-indigo-600" />계정 정보
                            </h3>
                            <button
                                onClick={handleSaveAccount}
                                disabled={isSavingAccount || (editAccountPw === accountPw)}
                                className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSavingAccount ? <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />}
                                저장
                            </button>
                        </div>
                        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-neutral-700 mb-1 flex justify-center">팀명</label>
                                <input
                                    type="text"
                                    value={teamName}
                                    disabled
                                    className="w-full text-center border-gray-100 bg-neutral-50 text-neutral-500 rounded-xl shadow-sm sm:text-sm px-4 py-2"
                                    placeholder="팀명 (수정 불가)"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-neutral-700 mb-1 flex justify-center">비밀번호</label>
                                <input
                                    type="text"
                                    value={editAccountPw}
                                    onChange={(e) => setEditAccountPw(e.target.value)}
                                    className="w-full text-center border-gray-300 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2"
                                    placeholder="비밀번호 입력"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Budget Plan */}
                    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-neutral-200 flex justify-between items-center bg-neutral-100">
                            <div className="flex items-center gap-3">
                                <h3 className="text-base font-bold text-neutral-800 flex items-center">
                                    <Wallet className="w-4 h-4 mr-2 text-indigo-600" />비목별 예산 계획
                                </h3>
                                {businessPlanDoc && businessPlanDoc.length > 0 && (
                                    <a
                                        href={businessPlanDoc[0].url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                                    >
                                        사업 계획 변경 신청서 보기
                                    </a>
                                )}
                            </div>
                            <button
                                onClick={handleSaveBudget}
                                disabled={isSavingBudget}
                                className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSavingBudget ? <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />}
                                저장
                            </button>
                        </div>
                        <div className="p-5 grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-neutral-700 mb-1 text-center">여비</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formatNumberInput(editTravel)}
                                        onChange={(e) => setEditTravel(e.target.value)}
                                        className="w-full text-right border-gray-300 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 pr-8 font-bold text-neutral-900"
                                    />
                                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs text-neutral-400 font-semibold">원</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-neutral-700 mb-1 text-center">재료비</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formatNumberInput(editMaterial)}
                                        onChange={(e) => setEditMaterial(e.target.value)}
                                        className="w-full text-right border-gray-300 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 pr-8 font-bold text-neutral-900"
                                    />
                                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs text-neutral-400 font-semibold">원</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-neutral-700 mb-1 text-center">외주용역비</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formatNumberInput(editOutsourcing)}
                                        onChange={(e) => setEditOutsourcing(e.target.value)}
                                        className="w-full text-right border-gray-300 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 pr-8 font-bold text-neutral-900"
                                    />
                                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs text-neutral-400 font-semibold">원</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-neutral-700 mb-1 text-center">지급수수료</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formatNumberInput(editFee)}
                                        onChange={(e) => setEditFee(e.target.value)}
                                        className="w-full text-right border-gray-300 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 pr-8 font-bold text-neutral-900"
                                    />
                                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs text-neutral-400 font-semibold">원</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Request History */}
                    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-neutral-200 bg-neutral-100">
                            <h3 className="text-base font-bold text-neutral-800 flex items-center">
                                <Clock className="w-4 h-4 mr-2 text-indigo-600" />최근 신청 이력
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-neutral-200">
                                <thead className="bg-white">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-center text-[13px] font-bold text-neutral-500">신청일시</th>
                                        <th scope="col" className="px-6 py-3 text-center text-[13px] font-bold text-neutral-500">비목</th>
                                        <th scope="col" className="px-6 py-3 text-right pr-6 text-[13px] font-bold text-neutral-500">신청 금액</th>
                                        <th scope="col" className="px-6 py-3 text-center text-[13px] font-bold text-neutral-500">현재 상태</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 bg-white">
                                    {recentRequests.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-sm text-neutral-400">
                                                신청 내역이 없습니다.
                                            </td>
                                        </tr>
                                    ) : (
                                        recentRequests.map(req => (
                                            <tr key={req.id} className="hover:bg-neutral-50/50 transition-colors">
                                                <td className="px-6 py-3 whitespace-nowrap text-center text-sm font-medium text-neutral-600">
                                                    {formatDate(req.createdTime)}
                                                </td>
                                                <td className="px-6 py-3 whitespace-nowrap text-center">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
                                                        {req.fields["비목"] || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 whitespace-nowrap text-right pr-6">
                                                    <div className="text-sm font-bold text-neutral-900">
                                                        {(req.fields["신청금액"] || 0).toLocaleString()}<span className="text-xs font-semibold text-neutral-400 ml-1">원</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 whitespace-nowrap text-center">
                                                    {req.fields["상태"] === '최종 완료' ? (
                                                        <span className="inline-flex items-center text-xs font-bold text-green-600">
                                                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />{req.fields["상태"]}
                                                        </span>
                                                    ) : req.fields["상태"] === '진행 중' || req.fields["상태"]?.includes('대기') ? (
                                                        <span className="inline-flex items-center text-xs font-bold text-orange-600">
                                                            <TrendingUp className="w-3.5 h-3.5 mr-1" />{req.fields["상태"]}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center text-xs font-bold text-neutral-600">
                                                            {req.fields["상태"] || '-'}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

                {/* Footer Component */}
                <div className="px-6 py-4 border-t border-neutral-100 bg-white flex justify-between items-center shrink-0">
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="inline-flex items-center px-4 py-2 text-sm font-bold rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-colors focus:outline-none"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        팀 삭제
                    </button>
                    <div className="w-4 h-4"></div>
                </div>

            </div>
        </div>
    );
}
