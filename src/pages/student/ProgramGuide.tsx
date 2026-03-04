import { Info, AlertCircle, Clock, Calendar, FileText, CheckCircle2 } from 'lucide-react';

export default function ProgramGuide() {
    return (
        <div className="min-h-screen bg-neutral-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Header Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
                    <h1 className="text-2xl font-bold text-neutral-900 flex items-center">
                        <Info className="w-6 h-6 mr-2 text-indigo-600" />
                        프로그램 안내 및 유의사항
                    </h1>
                    <p className="mt-2 text-sm text-neutral-500">
                        성장 지원금 집행을 위한 상세 가이드라인과 필수 제출 서류 안내입니다.
                    </p>
                </div>

                {/* Section 1: 사업 안내 */}
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start mb-4">
                        <AlertCircle className="w-6 h-6 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                            <h2 className="text-lg font-bold text-red-900 mb-2">[사업 안내] 지원금 성격 및 결제 원칙</h2>
                            <p className="text-base text-red-800 leading-relaxed font-medium">
                                본 프로그램의 성장 지원금은 단순 장학금이 아닌 <strong>중기부 예산 '사업비'</strong>입니다.<br />
                                <span className="block mt-2 text-red-700 bg-red-100/50 p-3 rounded-xl border border-red-200/50">
                                    따라서 모든 예산 집행은 <strong>'사업단 구매대행(직접 결제)'</strong>이 원칙이며, 학생(팀) 개인 카드 결제나 계좌 이체 후 청구하는 방식은 <strong>절대 인정되지 않으므로</strong> 각별히 유의하시기 바랍니다.
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Section 2: 비목별 프로세스 및 서류 */}
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                    <div className="bg-indigo-50 border-b border-indigo-100 p-5">
                        <h3 className="text-lg font-bold text-indigo-900 flex items-center">
                            <FileText className="w-5 h-5 mr-2" />
                            [비목별 상세 가이드 및 필수 서류]
                        </h3>
                    </div>
                    <div className="p-6 space-y-8">

                        {/* 여비 */}
                        <div>
                            <div className="flex items-center mb-3">
                                <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold text-[#0288D1] bg-[#E1F5FE] border border-[#B3E5FC]">
                                    여비
                                </span>
                                <span className="ml-3 text-sm font-bold text-neutral-700">시외 출장에 한정하여 지원</span>
                            </div>
                            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                                <p className="text-sm text-neutral-700 mb-3"><strong className="text-neutral-900">필수 서류:</strong> 신청서, 보고서, 증빙사진, 영수증(버스/기차 실비), 통장/신분증 사본</p>
                                <ol className="list-decimal list-inside text-sm text-neutral-600 space-y-1.5 ml-1">
                                    <li>목적지 및 일정을 포함한 <span className="font-semibold text-neutral-900">출장 신청서</span> 사전 제출</li>
                                    <li>담당자 확인 및 승인</li>
                                    <li>출장 다녀온 후 <span className="font-semibold text-neutral-900">출장 보고서 및 증빙사진</span> 제출</li>
                                    <li>실비 영수증(시외버스, KTX 등) 및 본인 명의 통장/신분증 사본 제출 후 정산</li>
                                </ol>
                            </div>
                        </div>

                        {/* 재료비 */}
                        <div>
                            <div className="flex items-center mb-3">
                                <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold text-[#2E7D32] bg-[#E8F5E9] border border-[#C8E6C9]">
                                    재료비
                                </span>
                                <span className="ml-3 text-sm font-bold text-neutral-700">시제품 제작을 위한 소모품에 한정</span>
                            </div>
                            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                                <p className="text-sm text-neutral-700 mb-3"><strong className="text-neutral-900">필수 서류 요약 (10종):</strong> 견적서, 물품구입요청서, 영수증, 검수사진, 사업자등록증 등</p>
                                <ol className="list-decimal list-inside text-sm text-neutral-600 space-y-1.5 ml-1">
                                    <li>구매 희망 물품의 <span className="font-semibold text-neutral-900">견적서 및 온라인 링크</span> 폼 제출</li>
                                    <li>사업단 내 담당자가 <span className="font-semibold text-neutral-900">물품구입요청서</span> 확인 후 <strong>직접 대행 구매</strong> 진행</li>
                                    <li>물품 수령 후 학생이 직접 검수하고 <span className="font-semibold text-neutral-900">검수사진 포함된 결과보고서</span> 제출</li>
                                </ol>
                            </div>
                        </div>

                        {/* 외주용역비 */}
                        <div>
                            <div className="flex items-center mb-3">
                                <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold text-[#7B1FA2] bg-[#F3E5F5] border border-[#E1BEE7]">
                                    외주용역비
                                </span>
                                <span className="ml-3 text-sm font-bold text-neutral-700">시제품 고도화 목적 (디자인, 개발 등 외부 업체 의뢰)</span>
                            </div>
                            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                                <p className="text-sm text-neutral-700 mb-3"><strong className="text-neutral-900">필수 서류 요약 (14종):</strong> 계약서(간인 필수), 과업지시서, 비교견적서, 결과보고서 등</p>
                                <ol className="list-decimal list-inside text-sm text-neutral-600 space-y-1.5 ml-1">
                                    <li>업체 발굴 후 <span className="font-semibold text-neutral-900">과업지시서 및 타 업체 비교견적서</span> 제출</li>
                                    <li>사업단, 학생, 외주업체 간 <span className="font-semibold text-neutral-900">3자 계약 체결 (모든 장에 간인 필수)</span></li>
                                    <li>용역 완료 후 결과물 검수 및 <span className="font-semibold text-neutral-900">결과보고서</span> 제출 시 잔금 지급</li>
                                </ol>
                            </div>
                        </div>

                        {/* 무형자산취득비 & 지급수수료 */}
                        <div>
                            <div className="flex items-center mb-3 space-x-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold text-[#F57F17] bg-[#FFF8E1] border border-[#FFECB3]">
                                    기타 (무형자산 / 지급수수료)
                                </span>
                                <span className="ml-3 text-sm font-bold text-neutral-700">특허 출원비, 전문가 멘토링, 인증 수수료 등</span>
                            </div>
                            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                                <p className="text-sm text-neutral-700 mb-3">
                                    <strong className="text-neutral-900">무형자산 필수 서류:</strong> 세금계산서, 견적서, 위임계약서, 출원사실증명원 등<br />
                                    <strong className="text-neutral-900">수수료 필수 서류:</strong> 전문가 이력서(포트폴리오), 멘토링 계획서 및 결과보고서
                                </p>
                                <ul className="list-disc list-inside text-sm text-neutral-600 space-y-1.5 ml-1">
                                    <li>진행 전 계획안 사전 제출 후 승인 절차 필수</li>
                                    <li>특허 등은 사업단 명의 포함 등 관련 규정 숙지 필요</li>
                                </ul>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Section 3: 일정 및 유의사항 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
                    <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 flex flex-col items-start transition-all hover:shadow-md">
                        <div className="bg-white p-3 rounded-full shadow-sm mb-4 border border-neutral-100">
                            <Clock className="w-7 h-7 text-indigo-500" />
                        </div>
                        <h4 className="text-lg font-bold text-neutral-900 mb-2">총 소요 시간 안내</h4>
                        <p className="text-base text-neutral-600 leading-relaxed">
                            신청서 접수 및 검토, 승인을 거쳐 <strong>실제 대금 결제 및 지급까지 약 1~3주 가량 소요</strong>됩니다. 일정을 넉넉히 고려하여 기한 내 미리 신청해 주시기 바랍니다.
                        </p>
                    </div>

                    <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 flex flex-col items-start transition-all hover:shadow-md">
                        <div className="bg-white p-3 rounded-full shadow-sm mb-4 border border-neutral-100">
                            <Calendar className="w-7 h-7 text-indigo-500" />
                        </div>
                        <h4 className="text-lg font-bold text-neutral-900 mb-2">최종 집행 기한 통보</h4>
                        <p className="text-base text-neutral-600 leading-relaxed">
                            본 프로그램의 <strong>모든 예산 지출은 당해 12월 31일까지 필수적으로 완료</strong>되어야 합니다. 마감일 이후에는 이월 및 결제가 절대 불가합니다.
                        </p>
                    </div>

                    <div className="md:col-span-2 bg-[#FFF3E0] border border-[#FFE0B2] rounded-2xl p-6 flex items-start mt-2">
                        <CheckCircle2 className="w-6 h-6 text-[#E65100] mr-4 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-lg font-bold text-[#E65100] mb-2">구매 불가 품목 안내 (자산성 물품)</h4>
                            <p className="text-base text-[#E65100] font-medium">
                                사업비 규정상 <strong>PC, 노트북, 태블릿, 소프트웨어 영구 라이선스 등 자산성 물품 기기</strong>는 어떠한 비목으로도 <strong>절대 구매 불가</strong>합니다.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
