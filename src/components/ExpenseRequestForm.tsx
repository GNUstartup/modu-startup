import React, { useState } from 'react';
import { Tag, ChevronDown, CheckCircle2, Navigation, UploadCloud, ShoppingCart, Briefcase, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiGetApplications, apiCreateApplication } from '../api';
import type { Application } from '../api';

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
    return result.join('');
}

export default function ExpenseRequestForm() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [categoryUsed, setCategoryUsed] = useState<Record<string, number>>({
        '여비': 0,
        '재료비': 0,
        '외주용역비': 0,
        '지급수수료': 0
    });

    // Shared Form State
    const projectName = user?.projectName || '';
    const [expenseCategory, setExpenseCategory] = useState('');
    const [amountStr, setAmountStr] = useState('');

    React.useEffect(() => {
        const fetchUsage = async () => {
            if (!projectName) return;
            try {
                const apps = await apiGetApplications(projectName, 'student');
                const used: Record<string, number> = {
                    '여비': 0, '재료비': 0, '외주용역비': 0, '지급수수료': 0
                };
                apps.forEach((rec) => {
                    const cat = rec['비목'];
                    const amt = Number(rec['신청금액']) || 0;
                    // 반려된 건은 사용액에서 제외
                    if (cat && used[cat] !== undefined && rec['상태'] !== '반려') {
                        used[cat] += amt;
                    }
                });
                setCategoryUsed(used);
            } catch (err) {
                console.error('사용 금액 조회 실패:', err);
            }
        };

        fetchUsage();
    }, [projectName]);

    // Financial Validation Tracking
    const getCategoryBudgetInfo = () => {
        if (!expenseCategory || !user) return { allocated: 0, used: 0, remain: 0 };

        let allocated = 0;
        if (expenseCategory === '여비') allocated = user.budgetYubi || 0;
        if (expenseCategory === '재료비') allocated = user.budgetJaeryo || 0;
        if (expenseCategory === '외주용역비') allocated = user.budgetOiju || 0;
        if (expenseCategory === '지급수수료') allocated = user.budgetJigeup || 0;

        const used = categoryUsed[expenseCategory] || 0;
        const remain = allocated - used;
        return { allocated, used, remain };
    };

    const { remain: currentRemain } = getCategoryBudgetInfo();
    const isExceeded = expenseCategory && Number(amountStr.replace(/,/g, '')) > currentRemain;

    // Detailed Text Fields State
    const [details, setDetails] = useState<Record<string, string>>({});

    // Detailed Files State (Only Phase 1: file1)
    const [files, setFiles] = useState<Record<string, File | null>>({
        file1: null
    });

    const handleDetailChange = (key: string, value: string) => {
        setDetails(prev => ({ ...prev, [key]: value }));
    };

    const handleFileChange = (key: string, file: File | null) => {
        setFiles(prev => ({ ...prev, [key]: file }));
    };

    const validateForm = () => {
        if (!expenseCategory || expenseCategory === '선택') return '비목을 선택해주세요.';
        if (!amountStr) return '신청금액을 입력해주세요.';

        if (expenseCategory === '여비') {
            if (!details.origin || !details.destination) return '출발지와 도착지를 입력해주세요.';
            if (!details.transportType || details.transportType === '선택') return '대중교통을 선택해주세요.';
        } else if (expenseCategory === '재료비') {
            if (!details.itemName || !details.vendorName || details.vendorName === '선택' || !details.itemDescription || !details.firmName) return '모든 재료비 필수 입력 항목을 채워주세요.';
        } else if (expenseCategory === '외주용역비') {
            if (!details.contractName || !details.firmName || !details.outsourceDescription) return '모든 외주용역비 필수 입력 항목을 채워주세요.';
        } else if (expenseCategory === '지급수수료') {
            if (!details.mentorName || !details.mentorAffiliation || !details.mentorRole || !details.mentoringTime || !details.mentoringDescription) return '모든 지급수수료 필수 입력 항목을 채워주세요.';
        }
        return null; // Valid
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMsg('');

        const validationError = validateForm();
        if (validationError) {
            setErrorMsg(validationError);
            setIsSubmitting(false);
            return;
        }

        if (isExceeded) {
            setErrorMsg('사업계획서 예산을 초과하여 신청할 수 없습니다.');
            setIsSubmitting(false);
            return;
        }

        const numericAmount = Number(amountStr.replace(/,/g, ''));

        // 새 신청 한 건을 구성 (구글 시트 '신청내역' 칸 이름에 맞춤)
        const application: Application = {
            참가자명: projectName,
            비목: expenseCategory,
            신청금액: numericAmount,
        };

        if (expenseCategory === '여비') {
            application.출발지 = details.origin;
            application.도착지 = details.destination;
            application.대중교통 = details.transportType;
        } else if (expenseCategory === '재료비') {
            application.구매품목 = details.itemName;
            application.구매처 = details.vendorName;
            application.구매품목설명 = details.itemDescription;
            application.업체명 = details.firmName;
        } else if (expenseCategory === '외주용역비') {
            application.계약명 = details.contractName;
            application.업체명 = details.firmName;
            application.외주용역설명 = details.outsourceDescription;
        } else if (expenseCategory === '지급수수료') {
            application.멘토명 = details.mentorName;
            application.멘토소속 = details.mentorAffiliation;
            application.멘토직급 = details.mentorRole;
            application.멘토링시간 = details.mentoringTime;
            application.멘토링주제 = details.mentoringDescription;
        }

        try {
            // 실제 저장이 성공했는지 확인한 뒤에 완료 표시 (저장 실패를 숨기지 않음)
            await apiCreateApplication(application);

            setIsSubmitting(false);
            setIsSuccess(true);
            setExpenseCategory('');
            setAmountStr('');
            setDetails({});
            setFiles({ file1: null });

            setTimeout(() => {
                setIsSuccess(false);
                navigate('/dashboard');
            }, 2000);
        } catch (err: any) {
            console.error('[신청 저장 에러]:', err);
            setErrorMsg(err.message || '신청 저장 중 오류가 발생했습니다. 다시 시도해주세요.');
            setIsSubmitting(false);
        }
    };

    const renderAmountField = (labelStr: string, isFullWidth: boolean = true) => (
        <div className={`space-y-2 ${isFullWidth ? 'md:col-span-2 mt-4' : ''}`}>
            <label className="flex items-center text-sm font-semibold text-neutral-700">
                <span className="w-4 h-4 mr-2 text-indigo-500 font-bold flex items-center justify-center">₩</span>
                {labelStr}
            </label>
            <div className="relative">
                <input
                    type="text"
                    value={amountStr}
                    onChange={(e) => {
                        const rawValue = e.target.value.replace(/[^0-9]/g, '');
                        if (rawValue) setAmountStr(Number(rawValue).toLocaleString());
                        else setAmountStr('');
                    }}
                    placeholder="0"
                    className="w-full h-[48px] box-border pl-4 pr-12 rounded-xl bg-neutral-50 border border-neutral-200 shadow-sm text-neutral-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none text-right font-medium text-lg"
                />
                <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none text-neutral-500 font-medium">원</div>
            </div>
            {amountStr && (
                <p className="text-sm font-medium text-neutral-400 mt-1 text-right">
                    금 {numberToKorean(Number(amountStr.replace(/,/g, '')))}원
                </p>
            )}
        </div>
    );

    const renderFileInput = (labelStr: string, fileKey: string) => (
        <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-neutral-700 min-h-[20px]">
                <UploadCloud className="w-4 h-4 mr-2 text-indigo-500" />
                {labelStr} <span className="ml-2 text-xs font-normal text-neutral-400">(첨부 기능 준비 중)</span>
            </label>
            <input
                type="file"
                onChange={e => handleFileChange(fileKey, e.target.files?.[0] || null)}
                className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 shadow-sm text-neutral-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {files[fileKey] && (
                <p className="text-xs text-neutral-500">선택됨: {files[fileKey]?.name}</p>
            )}
        </div>
    );

    const renderTextInput = (labelStr: string, detailKey: string, placeholder = "") => (
        <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-neutral-700 min-h-[20px]">{labelStr}</label>
            <input
                type="text"
                value={details[detailKey] || ''}
                onChange={e => handleDetailChange(detailKey, e.target.value)}
                placeholder={placeholder}
                className="w-full h-[48px] box-border px-4 rounded-xl bg-neutral-50 border border-neutral-200 shadow-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none text-neutral-900 placeholder-neutral-400"
            />
        </div>
    );

    const renderTextArea = (labelStr: string, detailKey: string, placeholder = "") => (
        <div className="space-y-2 md:col-span-2">
            <label className="flex items-center text-sm font-semibold text-neutral-700 min-h-[20px]">{labelStr}</label>
            <textarea
                value={details[detailKey] || ''}
                onChange={e => handleDetailChange(detailKey, e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 shadow-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none text-neutral-900 placeholder-neutral-400 resize-y min-h-[200px]"
            />
        </div>
    );

    const renderCategoryFields = () => {
        if (!expenseCategory || expenseCategory === '선택') return null;

        return (
            <div className="md:col-span-2 space-y-6 mt-4 pt-6 border-t border-neutral-100 animate-in fade-in duration-500">
                <h3 className="text-lg font-bold text-neutral-800 flex items-center mb-4">
                    {expenseCategory === '여비' && <Navigation className="w-5 h-5 mr-2 text-indigo-500" />}
                    {expenseCategory === '재료비' && <ShoppingCart className="w-5 h-5 mr-2 text-indigo-500" />}
                    {expenseCategory === '외주용역비' && <Briefcase className="w-5 h-5 mr-2 text-indigo-500" />}
                    {expenseCategory === '지급수수료' && <UserCheck className="w-5 h-5 mr-2 text-indigo-500" />}
                    {expenseCategory} 세부 정보
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {expenseCategory === '여비' && (
                        <>
                            {renderTextInput('출발지', 'origin', '예: 진주')}
                            {renderTextInput('도착지', 'destination', '예: 서울')}

                            <div className="space-y-2 md:col-span-2">
                                <label className="flex items-center text-sm font-semibold text-neutral-700 min-h-[20px]">대중교통</label>
                                <div className="relative">
                                    <select
                                        value={details.transportType || ''}
                                        onChange={e => handleDetailChange('transportType', e.target.value)}
                                        className={`w-full pl-4 pr-10 py-3 rounded-xl bg-neutral-50 border border-neutral-200 shadow-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all duration-200 outline-none appearance-none cursor-pointer ${!details.transportType ? 'text-neutral-400' : 'text-neutral-900'}`}
                                    >
                                        <option value="" className="text-neutral-400">선택</option>
                                        <option value="버스" className="text-neutral-900">버스</option>
                                        <option value="기차" className="text-neutral-900">기차</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-neutral-400">
                                        <ChevronDown className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>

                            {renderAmountField('신청금액')}
                            {renderFileInput('교통비 영수증', 'file1')}
                        </>
                    )}

                    {expenseCategory === '재료비' && (
                        <>
                            {renderTextInput('구매 품목', 'itemName', '예: 3D 프린터 필라멘트')}

                            <div className="space-y-2">
                                <label className="flex items-center text-sm font-semibold text-neutral-700 min-h-[20px]">구매처</label>
                                <div className="relative">
                                    <select
                                        value={details.vendorName || ''}
                                        onChange={e => handleDetailChange('vendorName', e.target.value)}
                                        className={`w-full pl-4 pr-10 py-3 rounded-xl bg-neutral-50 border border-neutral-200 shadow-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all duration-200 outline-none appearance-none cursor-pointer ${!details.vendorName ? 'text-neutral-400' : 'text-neutral-900'}`}
                                    >
                                        <option value="" className="text-neutral-400">선택</option>
                                        <option value="온라인" className="text-neutral-900">온라인</option>
                                        <option value="오프라인" className="text-neutral-900">오프라인</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-neutral-400">
                                        <ChevronDown className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 items-start w-full">
                                {renderAmountField('신청금액', false)}
                                {renderTextInput('업체명', 'firmName', '예: ABC전자')}
                            </div>

                            {renderTextArea('구매 품목 상세 설명 (MVP 제작과의 연관성 및 필요성 상세 기재)', 'itemDescription', '재료의 용도 및 MVP 제작 시 어떻게 활용될 것인지 구체적으로 기재해주세요.')}

                            {renderFileInput('재료 구매 계획서', 'file1')}
                        </>
                    )}

                    {expenseCategory === '외주용역비' && (
                        <>
                            {renderTextInput('계약 명', 'contractName', '예: 시제품 앱 개발')}
                            {renderTextInput('업체명', 'firmName', '예: (주)테스트소프트')}
                            <div className="md:col-span-2">
                                {renderTextInput('외주용역 설명', 'outsourceDescription', '어떤 용역인지 설명')}
                            </div>

                            {renderAmountField('신청금액')}

                            {renderFileInput('외주용역 계약서', 'file1')}
                        </>
                    )}

                    {expenseCategory === '지급수수료' && (
                        <>
                            {renderTextInput('멘토명', 'mentorName')}
                            {renderTextInput('멘토 소속', 'mentorAffiliation')}
                            {renderTextInput('멘토 직급', 'mentorRole')}
                            {renderTextInput('멘토링 시간', 'mentoringTime', '예: 2시간')}
                            <div className="md:col-span-2">
                                {renderTextInput('멘토링 예정 내용', 'mentoringDescription')}
                            </div>

                            {renderAmountField('신청금액')}

                            {renderFileInput('멘토링 신청서', 'file1')}
                        </>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-neutral-100">

                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-10 text-white relative">

                        <h2 className="text-3xl font-bold mb-2">MVP 제작비 신청서</h2>
                        <p className="text-blue-100/80">
                            성공적인 시제품 제작을 위한 비용 신청을 빠르고 간편하게 진행하세요.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="px-8 py-10 space-y-8">
                        {errorMsg && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                                {errorMsg}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="flex items-center justify-between text-sm font-semibold text-neutral-700">
                                    <div className="flex items-center">
                                        <Tag className="w-4 h-4 mr-2 text-indigo-500" />
                                        참가자명
                                    </div>
                                    {expenseCategory && (
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-md border ${isExceeded ? 'text-red-700 bg-red-50 border-red-200' : 'text-indigo-600 bg-indigo-50 border-indigo-100'}`}>
                                            [{expenseCategory}] 추가 가능: {currentRemain.toLocaleString()}원
                                        </span>
                                    )}
                                </label>
                                <input
                                    type="text"
                                    value={projectName}
                                    readOnly
                                    className="w-full px-4 py-3 rounded-xl bg-neutral-100 border border-neutral-200 shadow-inner text-neutral-600 font-medium outline-none cursor-not-allowed select-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center text-sm font-semibold text-neutral-700">
                                    <Tag className="w-4 h-4 mr-2 text-indigo-500" />
                                    신청 비목 (분류)
                                </label>
                                <div className="relative">
                                    <select
                                        value={expenseCategory}
                                        onChange={e => {
                                            setExpenseCategory(e.target.value);
                                            setDetails({});
                                            setFiles({ file1: null });
                                            setAmountStr('');
                                            setErrorMsg('');
                                        }}
                                        required
                                        className={`w-full pl-4 pr-10 py-3 rounded-xl bg-neutral-50 border border-neutral-200 shadow-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none appearance-none cursor-pointer ${!expenseCategory || expenseCategory === '선택' ? 'text-neutral-400' : 'text-neutral-900'}`}
                                    >
                                        <option value="" className="text-neutral-400">선택</option>
                                        <option value="여비" className="text-neutral-900">여비</option>
                                        <option value="재료비" className="text-neutral-900">재료비</option>
                                        <option value="외주용역비" className="text-neutral-900">외주용역비</option>
                                        <option value="지급수수료" className="text-neutral-900">지급수수료</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-neutral-400">
                                        <ChevronDown className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>

                            {renderCategoryFields()}
                        </div>

                        <div className="pt-6 border-t border-neutral-100 flex items-center justify-between">
                            <p className="text-xs text-neutral-400">
                                신청 내역은 관리자 승인 후 처리됩니다.
                            </p>
                            <button
                                type="submit"
                                disabled={isSubmitting || isSuccess || validateForm() !== null || !!isExceeded}
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        처리 중...
                                    </span>
                                ) : isSuccess ? (
                                    <span className="flex items-center text-green-100">
                                        <CheckCircle2 className="w-5 h-5 mr-2" />
                                        신청서 제출 완료!
                                    </span>
                                ) : (
                                    '신청서 제출'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            {/* Success Modal */}
            {isSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 text-center p-8">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-neutral-900 mb-2">신청 완료</h3>
                        <p className="text-sm font-medium text-neutral-500 mb-2">
                            신청이 정상적으로 완료되었습니다.
                        </p>
                        <p className="text-xs text-neutral-400">
                            잠시 후 대시보드로 이동합니다...
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
