import { useState } from 'react';
import { Info, AlertCircle, FileText, Plane, Box, Briefcase, UserCheck, ArrowRight } from 'lucide-react';

export default function ProgramGuide() {
    const [openModal, setOpenModal] = useState<string | null>(null);

    const ProcessFlow = ({ steps }: { steps: string[] }) => (
        <div className="flex flex-wrap items-center justify-center gap-2 mt-2 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50">
            {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                    <span className="font-bold text-sm text-indigo-900 bg-white px-4 py-2 rounded-full shadow-sm border border-indigo-200 break-keep break-words">
                        {step}
                    </span>
                    {index < steps.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-indigo-400 mx-2 flex-shrink-0" />
                    )}
                </div>
            ))}
        </div>
    );

    const Modal = ({ category, title, definition, children }: { category: string, title: string, definition: string, children: React.ReactNode }) => {
        if (openModal !== category) return null;
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setOpenModal(null)}>
                <div className="bg-white rounded-2xl shadow-xl w-[90vw] md:w-[80vw] max-w-none max-h-[90vh] overflow-y-auto transform transition-all animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                    <div className="sticky top-0 bg-white border-b border-neutral-200 p-5 sm:p-6 flex justify-between items-start sm:items-center z-10 shadow-sm">
                        <div className="flex flex-col gap-1.5">
                            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 break-keep break-words">{title} 상세 안내</h2>
                            <p className="text-sm text-indigo-700 font-medium break-keep break-words bg-indigo-50 inline-block px-3 py-1 rounded-md">
                                {definition}
                            </p>
                        </div>
                        <button onClick={() => setOpenModal(null)} className="text-neutral-400 hover:text-neutral-900 font-bold p-1 text-2xl leading-none">&times;</button>
                    </div>
                    <div className="p-5 sm:p-8 break-keep break-words">
                        {children}
                    </div>
                    <div className="border-t border-neutral-200 p-5 sm:p-6 bg-neutral-50 flex justify-end sticky bottom-0 z-10 shadow-inner">
                        <button onClick={() => setOpenModal(null)} className="px-6 py-2 bg-neutral-900 text-white rounded-lg font-medium hover:bg-black transition-colors text-sm shadow-sm">
                            닫기
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-neutral-50 py-8 px-4 sm:px-6 lg:px-8 font-sans break-keep break-words">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Header Section */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-neutral-200 text-center">
                    <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 flex justify-center items-center">
                        <Info className="w-6 h-6 mr-2 text-indigo-600" />
                        프로그램 안내 및 유의사항
                    </h1>
                </div>

                {/* Section 1: 공통 주의사항 및 지원금 성격 */}
                <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-xl p-6 sm:p-8 shadow-sm">
                    <div className="flex flex-col items-center mb-5 text-center">
                        <AlertCircle className="w-8 h-8 text-red-600 mb-2" />
                        <h2 className="text-xl font-bold text-red-900 mb-1">[필독] 공통 유의사항</h2>
                        <p className="text-sm text-red-800 font-medium">
                            본 성장 지원금은 단순 장학금이 아닌 정부 예산 '사업비'이므로 아래 원칙을 반드시 준수해야 합니다.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl border border-red-300 shadow-sm overflow-hidden mt-4">
                        <ul className="divide-y divide-red-100 text-red-800 p-1 text-sm">
                            <li className="px-5 py-3 flex items-start">
                                <span className="mr-3 font-bold text-red-500 text-lg flex-shrink-0">•</span>
                                <div>
                                    <strong className="block mb-0.5 text-red-900 text-base">사업단 구매대행 원칙, 개인 결제 불가</strong>
                                    <span className="font-medium text-neutral-700">모든 지출은 사업단 직접 결제(구매대행)가 원칙이며 사후 환급 불가.</span>
                                </div>
                            </li>
                            <li className="px-5 py-3 flex items-start">
                                <span className="mr-3 font-bold text-red-500 text-lg flex-shrink-0">•</span>
                                <div>
                                    <strong className="block mb-0.5 text-red-900 text-base">명의 준수</strong>
                                    <span className="font-medium text-neutral-700">모든 증빙은 <strong>'경상국립대학교 산학협력단'</strong> 명의 발행 필수.</span>
                                </div>
                            </li>
                            <li className="px-5 py-3 flex items-start">
                                <span className="mr-3 font-bold text-red-500 text-lg flex-shrink-0">•</span>
                                <div>
                                    <strong className="block mb-0.5 text-red-900 text-base">양산 목적 및 자산성 물품 구매 불가 / 12/31 집행 마감</strong>
                                    <span className="font-medium text-neutral-700">종료 후 결과보고서 제출 필수. 모든 예산 집행은 12월 31일 마감.</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Section 2: 비목별 큰 버튼 Grid (4 categories, 2x2 layout) */}
                <div>
                    <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center justify-center">
                        <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                        지원 비목별 상세 안내 (클릭 시 팝업)
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        <button onClick={() => setOpenModal('여비')} className="group flex flex-col items-center justify-center p-6 bg-white border border-[#0288D1]/30 rounded-xl shadow-sm hover:shadow-md hover:border-[#0288D1] hover:bg-[#E1F5FE]/30 transition-all duration-200">
                            <Plane className="w-8 h-8 text-[#0288D1] mb-3 group-hover:scale-110 transition-transform" />
                            <span className="text-lg font-bold text-[#0277BD] mb-1">여비</span>
                            <span className="text-xs text-neutral-500 font-medium text-center">증빙 기반 실비 지급<br />(출장 서류 5종)</span>
                        </button>

                        <button onClick={() => setOpenModal('재료비')} className="group flex flex-col items-center justify-center p-6 bg-white border border-[#2E7D32]/30 rounded-xl shadow-sm hover:shadow-md hover:border-[#2E7D32] hover:bg-[#E8F5E9]/30 transition-all duration-200">
                            <Box className="w-8 h-8 text-[#2E7D32] mb-3 group-hover:scale-110 transition-transform" />
                            <span className="text-lg font-bold text-[#1B5E20] mb-1">재료비</span>
                            <span className="text-xs text-neutral-500 font-medium text-center">시제품 제작 소모품<br />(필수 서류 10종)</span>
                        </button>

                        <button onClick={() => setOpenModal('외주용역비')} className="group flex flex-col items-center justify-center p-6 bg-white border border-[#7B1FA2]/30 rounded-xl shadow-sm hover:shadow-md hover:border-[#7B1FA2] hover:bg-[#F3E5F5]/30 transition-all duration-200">
                            <Briefcase className="w-8 h-8 text-[#7B1FA2] mb-3 group-hover:scale-110 transition-transform" />
                            <span className="text-lg font-bold text-[#4A148C] mb-1">외주용역비</span>
                            <span className="text-xs text-neutral-500 font-medium text-center">시제품 고도화 외부 계약<br />(필수 서류 18종)</span>
                        </button>

                        <button onClick={() => setOpenModal('지급수수료')} className="group flex flex-col items-center justify-center p-6 bg-white border border-[#F57F17]/30 rounded-xl shadow-sm hover:shadow-md hover:border-[#F57F17] hover:bg-[#FFF8E1]/30 transition-all duration-200">
                            <UserCheck className="w-8 h-8 text-[#F57F17] mb-3 group-hover:scale-110 transition-transform" />
                            <span className="text-lg font-bold text-[#E65100] mb-1">지급수수료 (멘토링)</span>
                            <span className="text-xs text-neutral-500 font-medium text-center">멘토 자격 요건 및<br />필수 서류 4종</span>
                        </button>

                    </div>
                </div>

                {/* Modals */}
                <Modal
                    category="여비"
                    title="[여비]"
                    definition="소재지를 벗어나 타 지역 출장 등의 사유로 집행하는 비용."
                >
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-[#0288D1] mb-3 flex items-center">
                                <span className="mr-2 text-base">📍</span> 여비 처리 프로세스
                            </h3>
                            <ProcessFlow steps={['사전신청', '검토', '출장', '증빙제출']} />
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-[#0288D1] mb-3 flex items-center">
                                <span className="mr-2 text-base">📋</span> 필수 제출 서류 5종
                            </h3>
                            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-[#0288D1] text-white">
                                        <tr>
                                            <th scope="col" className="px-4 py-3 text-center font-semibold w-16">순번</th>
                                            <th scope="col" className="px-4 py-3 text-left font-semibold">서류명</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-neutral-800">
                                        {[
                                            "출장계획서",
                                            "출장보고서",
                                            "영수증",
                                            "증빙사진",
                                            "통장/신분증 사본"
                                        ].map((doc, idx) => (
                                            <tr key={idx} className="even:bg-neutral-50/70 hover:bg-[#E1F5FE]/30 transition-colors border-b border-neutral-100 last:border-0">
                                                <td className="px-4 py-3 text-center font-medium text-neutral-500">{idx + 1}</td>
                                                <td className="px-4 py-3 font-medium text-neutral-900">{doc}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bg-[#E1F5FE]/50 p-4 rounded-xl border border-[#81D4FA] flex items-start shadow-sm mt-2">
                            <Info className="w-5 h-5 text-[#0288D1] mr-2 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-[#01579B] font-medium leading-relaxed">
                                <strong>💰 여비 실비 지급 기준 안내</strong><br />
                                • KTX의 경우 <strong>일반실 이하</strong> 운임만 지원 가능합니다.<br />
                                • 고속버스의 경우 <strong>우등버스 이하</strong> 실비 기준만 명시되어 지급됩니다.
                            </p>
                        </div>
                    </div>
                </Modal>

                <Modal
                    category="재료비"
                    title="[재료비]"
                    definition="사업계획서 상의 사업화를 위해 소모되는 재료 또는 원료 등을 구매하는 비용."
                >
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-[#2E7D32] mb-3 flex items-center">
                                <span className="mr-2 text-base">📍</span> 재료비 구매 프로세스
                            </h3>
                            <ProcessFlow steps={['월요일 신청', '화~수 일괄구매', '검수', '서류제출']} />
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-[#2E7D32] mb-3 flex items-center">
                                <span className="mr-2 text-base">📋</span> 10종 필수 제출 서류 목록
                            </h3>
                            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-[#2E7D32] text-white">
                                        <tr>
                                            <th scope="col" className="px-4 py-3 text-center font-semibold w-16">순번</th>
                                            <th scope="col" className="px-4 py-3 text-left font-semibold">서류명</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-neutral-800">
                                        {[
                                            "구매계획서",
                                            "물품구입요청서",
                                            "견적서",
                                            "비교견적서(2곳)",
                                            "영수증",
                                            "검수사진",
                                            "사업자등록증",
                                            "통장사본",
                                            "거래명세서",
                                            "청구서"
                                        ].map((doc, idx) => (
                                            <tr key={idx} className="even:bg-neutral-50/70 hover:bg-[#E8F5E9]/30 transition-colors border-b border-neutral-100 last:border-0">
                                                <td className="px-4 py-3 text-center font-medium text-neutral-500">{idx + 1}</td>
                                                <td className="px-4 py-3 font-medium text-neutral-900">{doc}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </Modal>

                <Modal
                    category="외주용역비"
                    title="[외주용역비]"
                    definition="사업계획서 상의 창업아이템을 고도화하거나 사업계획을 수행하기 위한 목적으로 일부 공정을 외부 업체에 의뢰하여 제작하고 그 대가를 지급하는 비용."
                >
                    <div className="space-y-6">
                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 flex items-start shadow-sm">
                            <Briefcase className="w-5 h-5 text-purple-700 mr-2 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-purple-900 font-medium leading-relaxed">
                                <strong>업체 자격 요건 안내</strong><br />
                                외부 전문업체는 1년 이상의 해당 분야 종사 경력 및 외주용역 대상 창업아이템과 유사한 아이템의 제작 경험 보유 필수. <strong className="text-red-600">(크몽 등 중개서비스 불가)</strong>
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-[#7B1FA2] mb-3 flex items-center">
                                <span className="mr-2 text-base">📍</span> 외주용역 계약 프로세스
                            </h3>
                            <ProcessFlow steps={['신청', '계약검토', '계약진행', '완료보고']} />
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-[#7B1FA2] mb-3 flex items-center">
                                <span className="mr-2 text-base">📋</span> 18종 필수 제출 서류 목록
                            </h3>
                            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
                                <table className="min-w-full text-sm border-collapse">
                                    <thead className="bg-[#7B1FA2] text-white">
                                        <tr>
                                            <th scope="col" className="px-4 py-3 text-center font-semibold w-24 border-r border-[#6A1B9A]">구분</th>
                                            <th scope="col" className="px-4 py-3 text-left font-semibold">상세 서류명</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-neutral-800">
                                        <tr className="even:bg-neutral-50/70 hover:bg-[#F3E5F5]/30">
                                            <td className="px-4 py-3 text-center font-bold text-[#4A148C] bg-neutral-50/50 border-r border-neutral-200 border-b border-neutral-100" rowSpan={4}>계약 전<br />필요 서류</td>
                                            <td className="px-4 py-3 font-medium border-b border-neutral-100"><span className="text-red-500 font-bold mr-2">1.</span>표준계약서 (양식에 맞추어 모든 장 <strong>간인 필수</strong>)</td>
                                        </tr>
                                        <tr className="even:bg-neutral-50/70 hover:bg-[#F3E5F5]/30">
                                            <td className="px-4 py-3 font-medium border-b border-neutral-100"><span className="text-red-500 font-bold mr-2">2.</span>과업지시서 및 세부산출내역서</td>
                                        </tr>
                                        <tr className="even:bg-neutral-50/70 hover:bg-[#F3E5F5]/30">
                                            <td className="px-4 py-3 font-medium border-b border-neutral-100"><span className="text-red-500 font-bold mr-2">3.</span>견적서 및 비교견적서</td>
                                        </tr>
                                        <tr className="even:bg-neutral-50/70 hover:bg-[#F3E5F5]/30">
                                            <td className="px-4 py-3 font-medium border-b border-neutral-200"><span className="text-red-500 font-bold mr-2">4.</span>업체 관련 서류: 사업자등록증, 통장사본, 인감증명서, 사용인감계, 업체이력서(포트폴리오)</td>
                                        </tr>

                                        <tr className="bg-red-50/30 hover:bg-red-50/60">
                                            <td className="px-4 py-3 text-center font-bold text-[#4A148C] bg-neutral-50/50 border-r border-neutral-200 border-b border-neutral-200">완납 증명<br />(필수)</td>
                                            <td className="px-4 py-3 font-semibold text-red-900 border-b border-neutral-200">
                                                국세 완납증명서, 지방세 완납증명서, 4대보험 완납증명서 등 3종
                                            </td>
                                        </tr>

                                        <tr className="even:bg-neutral-50/70 hover:bg-[#F3E5F5]/30">
                                            <td className="px-4 py-3 text-center font-bold text-[#4A148C] bg-neutral-50/50 border-r border-neutral-200 border-b border-neutral-100" rowSpan={3}>용역 완료 시<br />(종료 시점)</td>
                                            <td className="px-4 py-3 font-medium border-b border-neutral-100"><span className="text-indigo-600 font-bold mr-2">1.</span>완료보고서 및 완료 사진 자료</td>
                                        </tr>
                                        <tr className="even:bg-neutral-50/70 hover:bg-[#F3E5F5]/30">
                                            <td className="px-4 py-3 font-medium border-b border-neutral-100"><span className="text-indigo-600 font-bold mr-2">2.</span>검수확인서</td>
                                        </tr>
                                        <tr className="even:bg-neutral-50/70 hover:bg-[#F3E5F5]/30">
                                            <td className="px-4 py-3 font-medium"><span className="text-indigo-600 font-bold mr-2">3.</span>전자 세금계산서, 거래명세서, 청구서</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </Modal>

                <Modal
                    category="지급수수료"
                    title="[지급수수료 (멘토링)]"
                    definition="사업모델 개발, 제품 개선 등을 위한 멘토링 진행 후 지급하는 비용."
                >
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-[#E65100] mb-3 flex items-center">
                                <span className="mr-2 text-base">👨‍🏫</span> 멘토링 전문가 자격 요건
                            </h3>
                            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-[#E65100] text-white">
                                        <tr>
                                            <th scope="col" className="px-4 py-3 text-center font-semibold">자격 기준 명세 (6가지)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-neutral-800">
                                        {[
                                            "1. 관련 분야 박사학위 소지자",
                                            "2. 대학 조교수 이상 전임 교원",
                                            "3. 관련 분야 전문직(기술사, 건축사, 공인회계사, 세무사, 변호사, 변리사 등) 자격증 소지자",
                                            "4. 관련 분야 석사학위 소지 후 5년 이상 경력자",
                                            "5. 관련 분야 학사학위 소지 후 7년 이상 경력자",
                                            "6. 기타 위 항목과 동등한 자격이 있다고 사업단이 인정하는 자"
                                        ].map((item, idx) => (
                                            <tr key={idx} className="even:bg-neutral-50/70 hover:bg-[#FFF8E1]/40 transition-colors border-b border-neutral-100 last:border-0">
                                                <td className="px-4 py-3 font-medium text-neutral-900">{item}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-[#E65100] mb-3 flex items-center">
                                <span className="mr-2 text-base">📋</span> 멘토링 필수 제출 서류 4종
                            </h3>
                            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
                                <table className="min-w-full text-sm border-collapse">
                                    <thead className="bg-[#E65100] text-white">
                                        <tr>
                                            <th scope="col" className="px-4 py-3 text-center font-semibold w-24 border-r border-[#EF6C00]">구분</th>
                                            <th scope="col" className="px-4 py-3 text-left font-semibold">상세 서류명 및 필요 항목</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-neutral-800">
                                        <tr className="hover:bg-[#FFF8E1]/30">
                                            <td className="px-4 py-5 text-center font-bold text-[#E65100] bg-neutral-50/50 border-r border-neutral-200">
                                                멘토링 서류<br />(4종)
                                            </td>
                                            <td className="px-4 py-5 font-medium">
                                                <ul className="space-y-2 font-medium text-neutral-900">
                                                    <li className="flex items-center"><span className="text-[#FFB300] mr-2 text-lg">■</span>전문가 위촉동의서</li>
                                                    <li className="flex items-center"><span className="text-[#FFB300] mr-2 text-lg">■</span>멘토링보고서 (현장사진 포함)</li>
                                                    <li className="flex items-center"><span className="text-[#FFB300] mr-2 text-lg">■</span>멘토 이력서</li>
                                                    <li className="flex items-center"><span className="text-[#FFB300] mr-2 text-lg">■</span>신분증/통장 사본</li>
                                                </ul>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </Modal>

            </div>
        </div>
    );
}
