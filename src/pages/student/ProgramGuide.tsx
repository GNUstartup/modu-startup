import { useState } from 'react';
import { Info, AlertCircle, FileText, Plane, Box, Briefcase, UserCheck, ArrowRight } from 'lucide-react';

export default function ProgramGuide() {
    const [openModal, setOpenModal] = useState<string | null>(null);

    const ProcessFlow = ({ steps }: { steps: string[] }) => (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-4 bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100/50">
            {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                    <span className="font-bold text-base text-indigo-900 bg-white px-5 py-2.5 rounded-full shadow-sm border border-indigo-200 break-keep break-words">
                        {step}
                    </span>
                    {index < steps.length - 1 && (
                        <ArrowRight className="w-5 h-5 text-indigo-400 mx-3 flex-shrink-0" />
                    )}
                </div>
            ))}
        </div>
    );

    const Modal = ({ category, title, definition, children }: { category: string, title: string, definition: string, children: React.ReactNode }) => {
        if (openModal !== category) return null;
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setOpenModal(null)}>
                <div className="bg-white rounded-3xl shadow-2xl w-[90vw] md:w-[80vw] max-w-none max-h-[90vh] overflow-y-auto transform transition-all animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                    <div className="sticky top-0 bg-white border-b border-neutral-200 p-6 sm:p-8 flex justify-between items-center z-10 shadow-sm">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 break-keep break-words">{title} 상세 안내</h2>
                            <p className="text-sm sm:text-base text-indigo-700 font-medium break-keep break-words bg-indigo-50 inline-block px-3 py-1 rounded-lg">
                                {definition}
                            </p>
                        </div>
                        <button onClick={() => setOpenModal(null)} className="text-neutral-400 hover:text-neutral-900 font-bold p-2 text-3xl leading-none">&times;</button>
                    </div>
                    <div className="p-6 sm:p-10 break-keep break-words">
                        {children}
                    </div>
                    <div className="border-t border-neutral-200 p-6 sm:p-8 bg-neutral-50 flex justify-end sticky bottom-0 z-10 shadow-inner">
                        <button onClick={() => setOpenModal(null)} className="px-8 py-3 bg-neutral-900 text-white rounded-xl font-bold hover:bg-black transition-colors text-lg shadow-sm">
                            닫기
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-neutral-50 py-10 px-4 sm:px-6 lg:px-8 font-sans break-keep break-words">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 text-center">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 flex justify-center items-center">
                        <Info className="w-8 h-8 mr-3 text-indigo-600" />
                        프로그램 안내 및 유의사항
                    </h1>
                </div>

                {/* Section 1: 공통 주의사항 및 지원금 성격 */}
                <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                    <div className="flex flex-col items-center mb-6 text-center">
                        <AlertCircle className="w-10 h-10 text-red-600 mb-3" />
                        <h2 className="text-2xl font-bold text-red-900 mb-2">[필독] 공통 유의사항</h2>
                        <p className="text-base text-red-800 font-medium">
                            본 성장 지원금은 단순 장학금이 아닌 정부 예산 '사업비'이므로 아래 원칙을 반드시 준수해야 합니다.
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl border border-red-300 shadow-sm overflow-hidden mt-6">
                        <ul className="divide-y divide-red-100 text-red-800 p-2 text-base">
                            <li className="px-6 py-4 flex items-start">
                                <span className="mr-3 font-bold text-red-500 text-xl flex-shrink-0">•</span>
                                <div>
                                    <strong className="block mb-1 text-red-900 text-lg">지출 원칙</strong>
                                    <span className="font-medium">모든 지출은 사업단 직접 결제(구매대행)가 원칙이며 사후 환급 불가.</span>
                                </div>
                            </li>
                            <li className="px-6 py-4 flex items-start">
                                <span className="mr-3 font-bold text-red-500 text-xl flex-shrink-0">•</span>
                                <div>
                                    <strong className="block mb-1 text-red-900 text-lg">명의 준수</strong>
                                    <span className="font-medium">모든 증빙은 <strong>'경상국립대학교 산학협력단'</strong> 명의 발행 필수.</span>
                                </div>
                            </li>
                            <li className="px-6 py-4 flex items-start">
                                <span className="mr-3 font-bold text-red-500 text-xl flex-shrink-0">•</span>
                                <div>
                                    <strong className="block mb-1 text-red-900 text-lg">금지/의무</strong>
                                    <span className="font-medium">양산 목적 및 자산성 물품 구매 불가 / 종료 후 결과보고서 제출 필수.</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Section 2: 비목별 큰 버튼 Grid (4 categories, 2x2 layout) */}
                <div>
                    <h3 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center justify-center">
                        <FileText className="w-6 h-6 mr-3 text-indigo-600" />
                        지원 비목별 상세 안내 (클릭 시 팝업)
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <button onClick={() => setOpenModal('여비')} className="group flex flex-col items-center justify-center p-8 bg-white border border-[#0288D1]/30 rounded-2xl shadow-sm hover:shadow-lg hover:border-[#0288D1] hover:bg-[#E1F5FE]/30 transition-all duration-300 transform hover:-translate-y-1">
                            <Plane className="w-12 h-12 text-[#0288D1] mb-4 group-hover:scale-110 transition-transform" />
                            <span className="text-xl font-bold text-[#0277BD] mb-2">여비</span>
                            <span className="text-sm text-neutral-500 font-medium text-center">증빙 기반 실비 지급<br />(출장 서류 5종)</span>
                        </button>

                        <button onClick={() => setOpenModal('재료비')} className="group flex flex-col items-center justify-center p-8 bg-white border border-[#2E7D32]/30 rounded-2xl shadow-sm hover:shadow-lg hover:border-[#2E7D32] hover:bg-[#E8F5E9]/30 transition-all duration-300 transform hover:-translate-y-1">
                            <Box className="w-12 h-12 text-[#2E7D32] mb-4 group-hover:scale-110 transition-transform" />
                            <span className="text-xl font-bold text-[#1B5E20] mb-2">재료비</span>
                            <span className="text-sm text-neutral-500 font-medium text-center">시제품 제작 소모품<br />(필수 서류 10종)</span>
                        </button>

                        <button onClick={() => setOpenModal('외주용역비')} className="group flex flex-col items-center justify-center p-8 bg-white border border-[#7B1FA2]/30 rounded-2xl shadow-sm hover:shadow-lg hover:border-[#7B1FA2] hover:bg-[#F3E5F5]/30 transition-all duration-300 transform hover:-translate-y-1">
                            <Briefcase className="w-12 h-12 text-[#7B1FA2] mb-4 group-hover:scale-110 transition-transform" />
                            <span className="text-xl font-bold text-[#4A148C] mb-2">외주용역비</span>
                            <span className="text-sm text-neutral-500 font-medium text-center">시제품 고도화 외부 계약<br />(필수 서류 18종)</span>
                        </button>

                        <button onClick={() => setOpenModal('지급수수료')} className="group flex flex-col items-center justify-center p-8 bg-white border border-[#F57F17]/30 rounded-2xl shadow-sm hover:shadow-lg hover:border-[#F57F17] hover:bg-[#FFF8E1]/30 transition-all duration-300 transform hover:-translate-y-1">
                            <UserCheck className="w-12 h-12 text-[#F57F17] mb-4 group-hover:scale-110 transition-transform" />
                            <span className="text-xl font-bold text-[#E65100] mb-2">지급수수료 (멘토링)</span>
                            <span className="text-sm text-neutral-500 font-medium text-center">멘토 자격 요건 및<br />필수 서류 4종</span>
                        </button>

                    </div>
                </div>

                {/* Modals */}
                <Modal
                    category="여비"
                    title="[여비]"
                    definition="타 지역 창업 활동(미팅, 박람회 등)을 위한 시외 교통비 지원"
                >
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-2xl font-bold text-[#0288D1] mb-5 flex items-center">
                                <span className="mr-2">📍</span> 여비 처리 프로세스
                            </h3>
                            <ProcessFlow steps={['사전신청', '검토', '출장', '증빙제출']} />
                        </div>

                        <div>
                            <h3 className="text-2xl font-bold text-[#0288D1] mb-5 flex items-center">
                                <span className="mr-2">📋</span> 5종 필수 제출 서류 목록
                            </h3>
                            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
                                <table className="min-w-full text-base">
                                    <thead className="bg-[#0288D1] text-white">
                                        <tr>
                                            <th scope="col" className="px-6 py-4 text-center font-bold w-20">순번</th>
                                            <th scope="col" className="px-6 py-4 text-left font-bold">서류명</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-neutral-800">
                                        {[
                                            "출장계획서 (사전 제출)",
                                            "출장보고서",
                                            "영수증 (실비 내역서 포함)",
                                            "증빙사진",
                                            "신분증 및 통장 사본"
                                        ].map((doc, idx) => (
                                            <tr key={idx} className="even:bg-neutral-50/70 hover:bg-[#E1F5FE]/30 transition-colors border-b border-neutral-100 last:border-0">
                                                <td className="px-6 py-4 text-center font-medium text-neutral-500">{idx + 1}</td>
                                                <td className="px-6 py-4 font-semibold text-neutral-900">{doc}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bg-[#E1F5FE]/50 p-6 rounded-xl border border-[#81D4FA] flex items-start shadow-sm mt-4">
                            <Info className="w-6 h-6 text-[#0288D1] mr-3 flex-shrink-0 mt-0.5" />
                            <p className="text-base text-[#01579B] font-medium leading-relaxed">
                                <strong>💰 여비 실비 지급 기준 안내</strong><br />
                                • KTX의 경우 <strong>일반실</strong> 운임만 지원 가능합니다. (특실 불가)<br />
                                • 고속버스의 경우 <strong>우등버스 이하</strong> 실비 기준만 명시되어 지급됩니다. (프리미엄 불가)<br />
                                초과로 비용을 지불하신 경우, 해당 금액은 지원 불가하며 자비로 부담하셔야 합니다.
                            </p>
                        </div>
                    </div>
                </Modal>

                <Modal
                    category="재료비"
                    title="[재료비]"
                    definition="MVP(시제품) 제작에 직접 소요되는 원재료 및 소모품 구매 비용"
                >
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-2xl font-bold text-[#2E7D32] mb-5 flex items-center">
                                <span className="mr-2">📍</span> 재료비 구매 프로세스
                            </h3>
                            <ProcessFlow steps={['월요일 신청', '화~수 구매', '검수', '서류제출']} />
                        </div>

                        <div>
                            <h3 className="text-2xl font-bold text-[#2E7D32] mb-5 flex items-center">
                                <span className="mr-2">📋</span> 10종 필수 제출 서류 목록
                            </h3>
                            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
                                <table className="min-w-full text-base">
                                    <thead className="bg-[#2E7D32] text-white">
                                        <tr>
                                            <th scope="col" className="px-6 py-4 text-center font-bold w-20">순번</th>
                                            <th scope="col" className="px-6 py-4 text-left font-bold">서류명</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-neutral-800">
                                        {[
                                            "구매계획서",
                                            "구입요청서",
                                            "견적서",
                                            "비교견적서",
                                            "영수증",
                                            "검수사진",
                                            "사업자등록증",
                                            "통장사본",
                                            "거래명세서",
                                            "청구서"
                                        ].map((doc, idx) => (
                                            <tr key={idx} className="even:bg-neutral-50/70 hover:bg-[#E8F5E9]/30 transition-colors border-b border-neutral-100 last:border-0">
                                                <td className="px-6 py-4 text-center font-medium text-neutral-500">{idx + 1}</td>
                                                <td className="px-6 py-4 font-semibold text-neutral-900">{doc}</td>
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
                    definition="자체 제작이 어려운 시제품 고도화 및 개발을 외부 업체에 의뢰하는 비용"
                >
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-2xl font-bold text-[#7B1FA2] mb-5 flex items-center">
                                <span className="mr-2">📍</span> 외주용역 계약 프로세스
                            </h3>
                            <ProcessFlow steps={['신청', '계약검토', '계약진행', '완료보고']} />
                        </div>

                        <div>
                            <h3 className="text-2xl font-bold text-[#7B1FA2] mb-5 flex items-center">
                                <span className="mr-2">📋</span> 18종 필수 제출 서류 목록
                            </h3>
                            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
                                <table className="min-w-full text-base border-collapse">
                                    <thead className="bg-[#7B1FA2] text-white">
                                        <tr>
                                            <th scope="col" className="px-6 py-4 text-center font-bold w-32 border-r border-[#6A1B9A]">구분</th>
                                            <th scope="col" className="px-6 py-4 text-left font-bold">상세 서류명</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-neutral-800">
                                        <tr className="even:bg-neutral-50/70 hover:bg-[#F3E5F5]/30">
                                            <td className="px-6 py-5 text-center font-bold text-[#4A148C] bg-neutral-50/50 border-r border-neutral-200 border-b border-neutral-100" rowSpan={4}>계약 전<br />필요 서류</td>
                                            <td className="px-6 py-5 font-medium border-b border-neutral-100"><span className="text-red-500 font-bold mr-2">1.</span>표준계약서 (양식에 맞추어 모든 장 <strong>간인 필수</strong>)</td>
                                        </tr>
                                        <tr className="even:bg-neutral-50/70 hover:bg-[#F3E5F5]/30">
                                            <td className="px-6 py-5 font-medium border-b border-neutral-100"><span className="text-red-500 font-bold mr-2">2.</span>과업지시서 및 세부산출내역서</td>
                                        </tr>
                                        <tr className="even:bg-neutral-50/70 hover:bg-[#F3E5F5]/30">
                                            <td className="px-6 py-5 font-medium border-b border-neutral-100"><span className="text-red-500 font-bold mr-2">3.</span>견적서 및 비교견적서</td>
                                        </tr>
                                        <tr className="even:bg-neutral-50/70 hover:bg-[#F3E5F5]/30">
                                            <td className="px-6 py-5 font-medium border-b border-neutral-200"><span className="text-red-500 font-bold mr-2">4.</span>업체 관련 서류: 사업자등록증, 통장사본, 인감증명서, 사용인감계, 업체이력서(포트폴리오)</td>
                                        </tr>

                                        <tr className="bg-red-50/30 hover:bg-red-50/60">
                                            <td className="px-6 py-5 text-center font-bold text-[#4A148C] bg-neutral-50/50 border-r border-neutral-200 border-b border-neutral-200">완납 증명<br />(필수)</td>
                                            <td className="px-6 py-5 font-semibold text-red-900 border-b border-neutral-200">
                                                국세 완납증명서, 지방세 완납증명서, 4대보험 완납증명서 등 3종
                                            </td>
                                        </tr>

                                        <tr className="even:bg-neutral-50/70 hover:bg-[#F3E5F5]/30">
                                            <td className="px-6 py-5 text-center font-bold text-[#4A148C] bg-neutral-50/50 border-r border-neutral-200 border-b border-neutral-100" rowSpan={3}>용역 완료 시<br />(종료 시점)</td>
                                            <td className="px-6 py-5 font-medium border-b border-neutral-100"><span className="text-indigo-600 font-bold mr-2">1.</span>완료보고서 및 완료 사진 자료</td>
                                        </tr>
                                        <tr className="even:bg-neutral-50/70 hover:bg-[#F3E5F5]/30">
                                            <td className="px-6 py-5 font-medium border-b border-neutral-100"><span className="text-indigo-600 font-bold mr-2">2.</span>검수확인서</td>
                                        </tr>
                                        <tr className="even:bg-neutral-50/70 hover:bg-[#F3E5F5]/30">
                                            <td className="px-6 py-5 font-medium border-b border-neutral-100"><span className="text-indigo-600 font-bold mr-2">3.</span>전자 세금계산서, 거래명세서, 청구서</td>
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
                    definition="전문가로부터 창업 아이템 검증 및 사업화 자문을 받는 비용"
                >
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-2xl font-bold text-[#E65100] mb-5 flex items-center">
                                <span className="mr-2">👨‍🏫</span> 멘토링 전문가 자격 요건 (다음 중 1개 이상 필수 충족)
                            </h3>
                            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
                                <table className="min-w-full text-base">
                                    <thead className="bg-[#E65100] text-white">
                                        <tr>
                                            <th scope="col" className="px-6 py-4 text-center font-bold">자격 기준 명세 (6가지)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-neutral-800">
                                        {[
                                            "1. 관련 분야 박사학위 소지자",
                                            "2. 대학 조교수 이상 전임 교원",
                                            "3. 관련 분야 기술사, 건축사, 공인회계사, 세무사, 변호사, 변리사 등 공인 자격증 소지자",
                                            "4. 관련 분야 석사학위 소지 후 5년 이상 경력자",
                                            "5. 관련 분야 학사학위 소지 후 5년 이상 경력자",
                                            "6. 기타 위 항목과 동등한 자격이 있다고 사업단이 인정하는 자"
                                        ].map((item, idx) => (
                                            <tr key={idx} className="even:bg-neutral-50/70 hover:bg-[#FFF8E1]/40 transition-colors border-b border-neutral-100 last:border-0">
                                                <td className="px-6 py-4 font-medium text-neutral-900">{item}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-2xl font-bold text-[#E65100] mb-5 flex items-center">
                                <span className="mr-2">📋</span> 멘토링 필수 제출 서류 4종
                            </h3>
                            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
                                <table className="min-w-full text-base border-collapse">
                                    <thead className="bg-[#E65100] text-white">
                                        <tr>
                                            <th scope="col" className="px-6 py-4 text-center font-bold w-32 border-r border-[#EF6C00]">구분</th>
                                            <th scope="col" className="px-6 py-4 text-left font-bold">상세 서류명 및 필요 항목</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-neutral-800">
                                        <tr className="hover:bg-[#FFF8E1]/30">
                                            <td className="px-6 py-6 text-center font-bold text-[#E65100] bg-neutral-50/50 border-r border-neutral-200 text-lg">
                                                멘토링 서류<br />(4종)
                                            </td>
                                            <td className="px-6 py-6 font-medium">
                                                <ul className="space-y-3 font-semibold text-neutral-900">
                                                    <li className="flex items-center"><span className="text-[#FFB300] mr-3 text-2xl">■</span>위촉동의서</li>
                                                    <li className="flex items-center"><span className="text-[#FFB300] mr-3 text-2xl">■</span>멘토링보고서</li>
                                                    <li className="flex items-center"><span className="text-[#FFB300] mr-3 text-2xl">■</span>이력서</li>
                                                    <li className="flex items-center"><span className="text-[#FFB300] mr-3 text-2xl">■</span>통장/신분증 사본</li>
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
