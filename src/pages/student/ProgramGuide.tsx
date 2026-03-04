import { useState } from 'react';
import { Info, AlertCircle, FileText, CheckCircle2, ChevronRight, ChevronDown, ArrowRight } from 'lucide-react';

export default function ProgramGuide() {
    const [openSection, setOpenSection] = useState<string | null>('재료비'); // Default open

    const toggleSection = (section: string) => {
        setOpenSection(openSection === section ? null : section);
    };

    // Helper component for Process Flow
    const ProcessFlow = ({ steps }: { steps: string[] }) => (
        <div className="flex flex-wrap items-center gap-2 mb-4 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100/50">
            {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                    <span className="font-semibold text-sm text-indigo-800 bg-white px-3 py-1.5 rounded-full shadow-sm border border-indigo-100">
                        {step}
                    </span>
                    {index < steps.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-indigo-400 mx-2" />
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-neutral-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Header Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
                    <h1 className="text-2xl font-bold text-neutral-900 flex items-center mb-4">
                        <Info className="w-6 h-6 mr-2 text-indigo-600" />
                        프로그램 안내 및 유의사항
                    </h1>

                    <div className="mb-4">
                        <h4 className="text-sm font-bold text-neutral-700 mb-2">공통 진행 프로세스</h4>
                        <ProcessFlow steps={['신청(참가자)', '검토(사업단)', '진행(사업단)', '보고(참가자)']} />
                    </div>

                    <p className="mt-2 text-sm text-neutral-500">
                        성장 지원금 집행을 위한 상세 가이드라인과 필수 제출 서류 안내입니다.
                    </p>
                </div>

                {/* Section 1: 사업 안내 및 공통 주의사항 (상시 노출) */}
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start mb-4">
                        <AlertCircle className="w-6 h-6 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                            <h2 className="text-lg font-bold text-red-900 mb-2">[필독] 공통 주의사항 및 지원금 성격</h2>
                            <p className="text-base text-red-800 leading-relaxed font-medium">
                                본 사업의 지원금은 단순 지원금이 아닌 <strong>정부 예산 '사업비'</strong>입니다.<br />
                            </p>
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white/80 p-4 rounded-xl border border-red-200/50 flex flex-col items-center text-center">
                                    <span className="text-red-700 font-bold mb-1">💸 구매대행 원칙</span>
                                    <span className="text-sm text-red-600">모든 집행은 <strong>사업단 구매대행(직접 결제)</strong> 원칙. 개인 카드 결제 및 계좌 이체 <strong>절대 불가</strong></span>
                                </div>
                                <div className="bg-white/80 p-4 rounded-xl border border-red-200/50 flex flex-col items-center text-center">
                                    <span className="text-red-700 font-bold mb-1">⏳ 1~3주 소요</span>
                                    <span className="text-sm text-red-600">신청 승인 후 실제 대금 지급/결제까지 약 1~3주 소요되므로 <strong>미리 신청 요망</strong></span>
                                </div>
                                <div className="bg-white/80 p-4 rounded-xl border border-red-200/50 flex flex-col items-center text-center">
                                    <span className="text-red-700 font-bold mb-1">📅 12월 31일 마감</span>
                                    <span className="text-sm text-red-600">모든 지원금 지출은 당해 <strong>12월 31일까지 필수적으로 완료</strong>되어야 함</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: 비목별 프로세스 및 서류 */}
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                    <div className="bg-indigo-50 border-b border-indigo-100 p-5">
                        <h3 className="text-lg font-bold text-indigo-900 flex items-center">
                            <FileText className="w-5 h-5 mr-2" />
                            [비목별 상세 안내 및 필수 제출 서류]
                        </h3>
                        <p className="text-sm text-indigo-700 mt-1 ml-7">아래 각 비목 버튼을 클릭하여 상세 서류 목록을 확인하세요.</p>
                    </div>
                    <div className="divide-y divide-neutral-100">

                        {/* 여비 Accordion */}
                        <div>
                            <button
                                onClick={() => toggleSection('여비')}
                                className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors focus:outline-none"
                            >
                                <div className="flex items-center">
                                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold text-[#0288D1] bg-[#E1F5FE] border border-[#B3E5FC]">
                                        여비
                                    </span>
                                    <span className="ml-3 text-sm font-bold text-neutral-700">시외 출장에 한정하여 지원</span>
                                </div>
                                {openSection === '여비' ? <ChevronDown className="w-5 h-5 text-neutral-400" /> : <ChevronRight className="w-5 h-5 text-neutral-400" />}
                            </button>
                            {openSection === '여비' && (
                                <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-200">
                                    <div className="mb-4">
                                        <h4 className="text-sm font-bold text-neutral-700 mb-2">진행 프로세스</h4>
                                        <ProcessFlow steps={['사전신청', '검토', '출장', '증빙제출', '지급']} />
                                    </div>
                                    <div className="bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden">
                                        <table className="min-w-full divide-y divide-neutral-200 text-sm">
                                            <thead className="bg-neutral-100">
                                                <tr>
                                                    <th scope="col" className="px-4 py-3 text-center font-bold text-neutral-600 w-16">순번</th>
                                                    <th scope="col" className="px-4 py-3 text-left font-bold text-neutral-600">여비 필수 제출 서류</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-neutral-200">
                                                {[
                                                    "출장계획서", "보고서", "영수증", "증빙사진", "통장/신분증 사본"
                                                ].map((doc, idx) => (
                                                    <tr key={idx} className="hover:bg-neutral-50">
                                                        <td className="px-4 py-2.5 text-center font-medium text-neutral-500">{idx + 1}</td>
                                                        <td className="px-4 py-2.5 text-neutral-800 font-medium">{doc}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 재료비 Accordion */}
                        <div>
                            <button
                                onClick={() => toggleSection('재료비')}
                                className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors focus:outline-none"
                            >
                                <div className="flex items-center">
                                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold text-[#2E7D32] bg-[#E8F5E9] border border-[#C8E6C9]">
                                        재료비
                                    </span>
                                    <span className="ml-3 text-sm font-bold text-neutral-700">시제품 제작을 위한 소모품 (10종)</span>
                                </div>
                                {openSection === '재료비' ? <ChevronDown className="w-5 h-5 text-neutral-400" /> : <ChevronRight className="w-5 h-5 text-neutral-400" />}
                            </button>
                            {openSection === '재료비' && (
                                <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-200">
                                    <div className="mb-4">
                                        <h4 className="text-sm font-bold text-neutral-700 mb-2">진행 프로세스</h4>
                                        <ProcessFlow steps={['매주 월요일 신청', '화~수 일괄구매', '검수 및 사진촬영', '서류제출']} />
                                    </div>
                                    <div className="bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden">
                                        <table className="min-w-full divide-y divide-neutral-200 text-sm">
                                            <thead className="bg-neutral-100">
                                                <tr>
                                                    <th scope="col" className="px-4 py-3 text-center font-bold text-neutral-600 w-16">순번</th>
                                                    <th scope="col" className="px-4 py-3 text-left font-bold text-neutral-600">재료비 필수 제출 서류 (10종)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-neutral-200">
                                                {[
                                                    "구매계획서", "물품구입요청서", "견적서", "비교견적서 (2곳 이상)", "영수증",
                                                    "검수사진", "사업자등록증", "통장사본", "거래명세서", "청구서"
                                                ].map((doc, idx) => (
                                                    <tr key={idx} className="hover:bg-neutral-50">
                                                        <td className="px-4 py-2.5 text-center font-medium text-neutral-500">{idx + 1}</td>
                                                        <td className="px-4 py-2.5 text-neutral-800 font-medium">{doc}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <p className="mt-3 text-xs text-neutral-500">* 견적 및 온라인 링크 제출 후 담당자가 물품구입요청서를 확인하여 대행 구매합니다.</p>
                                </div>
                            )}
                        </div>

                        {/* 외주용역비 Accordion */}
                        <div>
                            <button
                                onClick={() => toggleSection('외주용역비')}
                                className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors focus:outline-none"
                            >
                                <div className="flex items-center">
                                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold text-[#7B1FA2] bg-[#F3E5F5] border border-[#E1BEE7]">
                                        외주용역비
                                    </span>
                                    <span className="ml-3 text-sm font-bold text-neutral-700">시제품 고도화 목적 외부 업체 의뢰 (14종)</span>
                                </div>
                                {openSection === '외주용역비' ? <ChevronDown className="w-5 h-5 text-neutral-400" /> : <ChevronRight className="w-5 h-5 text-neutral-400" />}
                            </button>
                            {openSection === '외주용역비' && (
                                <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-200">
                                    <div className="mb-4">
                                        <h4 className="text-sm font-bold text-neutral-700 mb-2">진행 프로세스</h4>
                                        <ProcessFlow steps={['용역신청', '계약검토', '계약진행', '완료보고', '비용지출']} />
                                    </div>
                                    <div className="bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden">
                                        <table className="min-w-full divide-y divide-neutral-200 text-sm">
                                            <thead className="bg-neutral-100">
                                                <tr>
                                                    <th scope="col" className="px-4 py-3 text-center font-bold text-neutral-600 w-16">순번</th>
                                                    <th scope="col" className="px-4 py-3 text-left font-bold text-neutral-600">외주용역비 필수 제출 서류 (14종)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-neutral-200">
                                                {[
                                                    "표준계약서 (모든 장에 간인 필수)", "과업지시서", "비교견적서", "업체이력서 (포트폴리오 등)",
                                                    "완납증명서 (국세)", "완납증명서 (지방세)", "완납증명서 (4대보험)", "결과보고서",
                                                    "전자세금계산서", "사업자등록증", "통장사본", "세부 산출내역서", "검수확인서", "청구서"
                                                ].map((doc, idx) => (
                                                    <tr key={idx} className="hover:bg-neutral-50">
                                                        <td className="px-4 py-2.5 text-center font-medium text-neutral-500">{idx + 1}</td>
                                                        <td className="px-4 py-2.5 text-neutral-800 font-medium">{doc}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <p className="mt-3 text-xs text-neutral-500">* 사업단, 학생, 외주업체 간 3자 계약 체결이 필수이며 결과물 검수 후 잔금이 지급됩니다.</p>
                                </div>
                            )}
                        </div>

                        {/* 지급수수료 Accordion */}
                        <div>
                            <button
                                onClick={() => toggleSection('지급수수료')}
                                className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors focus:outline-none"
                            >
                                <div className="flex items-center">
                                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold text-[#F57F17] bg-[#FFF8E1] border border-[#FFECB3]">
                                        지급수수료
                                    </span>
                                    <span className="ml-3 text-sm font-bold text-neutral-700">전문가 활용비 등 수수료</span>
                                </div>
                                {openSection === '지급수수료' ? <ChevronDown className="w-5 h-5 text-neutral-400" /> : <ChevronRight className="w-5 h-5 text-neutral-400" />}
                            </button>
                            {openSection === '지급수수료' && (
                                <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-200">
                                    <div className="bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden">
                                        <table className="min-w-full divide-y divide-neutral-200 text-sm">
                                            <thead className="bg-neutral-100">
                                                <tr>
                                                    <th scope="col" className="px-4 py-3 text-left font-bold text-neutral-600">구분</th>
                                                    <th scope="col" className="px-4 py-3 text-left font-bold text-neutral-600">상세 내용 및 필수 제출 서류</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-neutral-200">
                                                <tr className="hover:bg-neutral-50">
                                                    <td className="px-4 py-3 font-bold text-neutral-700 bg-neutral-50/50 align-top">전문가 자격요건</td>
                                                    <td className="px-4 py-3 text-neutral-800 font-medium whitespace-pre-line leading-relaxed">
                                                        • 박사학위 소지자, 대학 조교수 이상 등<br />
                                                        • 석사학위 소지 후 관련 분야 3년 이상 경력자<br />
                                                        • 학사학위 소지 후 관련 분야 5년 이상 경력자<br />
                                                        • 기타 위와 동등한 자격이 있다고 인정되는 자
                                                    </td>
                                                </tr>
                                                <tr className="hover:bg-neutral-50">
                                                    <td className="px-4 py-3 font-bold text-neutral-700 bg-neutral-50/50 align-top">필수 제출 서류</td>
                                                    <td className="px-4 py-3 text-neutral-800 font-medium whitespace-pre-line leading-relaxed">
                                                        • <strong>전문가 이력서</strong> (자격 증빙 포트폴리오 포함)<br />
                                                        • <strong>멘토링 계획서</strong> (사전 제출 및 승인 필요)<br />
                                                        • <strong>멘토링 결과보고서</strong><br />
                                                        • 전문가 신분증 사본 및 통장 사본
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 무형자산취득비 Accordion */}
                        <div>
                            <button
                                onClick={() => toggleSection('무형자산취득비')}
                                className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors focus:outline-none"
                            >
                                <div className="flex items-center">
                                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold text-[#E65100] bg-[#FFF3E0] border border-[#FFE0B2]">
                                        무형자산취득비
                                    </span>
                                    <span className="ml-3 text-sm font-bold text-neutral-700">특허, 상표권, 디자인권 등 지식재산권 출원/등록</span>
                                </div>
                                {openSection === '무형자산취득비' ? <ChevronDown className="w-5 h-5 text-neutral-400" /> : <ChevronRight className="w-5 h-5 text-neutral-400" />}
                            </button>
                            {openSection === '무형자산취득비' && (
                                <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-200">
                                    <div className="bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden">
                                        <table className="min-w-full divide-y divide-neutral-200 text-sm">
                                            <thead className="bg-neutral-100">
                                                <tr>
                                                    <th scope="col" className="px-4 py-3 text-left font-bold text-neutral-600">구분</th>
                                                    <th scope="col" className="px-4 py-3 text-left font-bold text-neutral-600">상세 내용 및 필수 제출 서류</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-neutral-200">
                                                <tr className="hover:bg-neutral-50">
                                                    <td className="px-4 py-3 font-bold text-neutral-700 bg-neutral-50/50 align-top">비용 지원 대상</td>
                                                    <td className="px-4 py-3 text-neutral-800 font-medium whitespace-pre-line leading-relaxed">
                                                        • 사업기간 내 발생한 지식재산권(특허, 상표, 디자인 등) <strong>출원/등록 대리인 비용</strong><br />
                                                        • 특허청 관납료 등(단, 심사청구료 제외될 수 있음)
                                                    </td>
                                                </tr>
                                                <tr className="hover:bg-neutral-50">
                                                    <td className="px-4 py-3 font-bold text-neutral-700 bg-neutral-50/50 align-top">필수 제출 서류</td>
                                                    <td className="px-4 py-3 text-neutral-800 font-medium whitespace-pre-line leading-relaxed">
                                                        • <strong>출원사실증명원</strong> (또는 출원번호통지서)<br />
                                                        • 견적서 및 전자세금계산서<br />
                                                        • 위임계약서<br />
                                                        • 청구서(대리인 사무소 내부 양식)
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <p className="mt-3 text-xs text-neutral-500">* 지식재산권은 지원사업 규정에 따라 사업단 명의 포함 등 관련 규정 숙지가 필요할 수 있습니다.</p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>

                {/* Section 3: 절대 금지 사항 */}
                <div className="md:col-span-2 bg-[#FFF3E0] border border-[#FFE0B2] rounded-2xl p-6 flex items-start mt-8">
                    <CheckCircle2 className="w-6 h-6 text-[#E65100] mr-4 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-lg font-bold text-[#E65100] mb-2">구매 불가 품목 안내 (자산성 물품)</h4>
                        <p className="text-base text-[#E65100] font-medium leading-relaxed">
                            사업비 규정상 <strong>PC, 노트북, 태블릿, 소프트웨어 영구 라이선스 등 자산성 물품 기기</strong>는 어떠한 비목으로도 <strong>절대 구매 불가</strong>합니다.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
