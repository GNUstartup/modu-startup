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
                        <div className="bg-[#E1F5FE]/60 p-5 rounded-xl border border-[#81D4FA] flex flex-col gap-3 shadow-sm">
                            <div className="flex items-center">
                                <Info className="w-5 h-5 text-[#0288D1] mr-2 flex-shrink-0" />
                                <strong className="text-base text-[#01579B]">집행 원칙</strong>
                            </div>
                            <ul className="list-disc pl-8 text-sm text-[#01579B] font-medium space-y-1">
                                <li>교통영수증은 사업단 승인 이후 <strong>개인카드로 결제</strong> (출장 신청일과 탑승일 동일 필수).</li>
                                <li><strong>진주-출장지 왕복 영수증(실제 금액 표기) 제출 및 대중교통 이용 필수.</strong> (개인차량 이동 시 통행료/주유비 지급 불가)</li>
                                <li><strong>단순 미팅 목적의 여비는 지급 불가.</strong></li>
                            </ul>

                            <hr className="border-[#B3E5FC] my-2" />

                            <div className="flex items-center">
                                <Info className="w-5 h-5 text-[#0288D1] mr-2 flex-shrink-0" />
                                <strong className="text-base text-[#01579B]">지급 기준</strong>
                            </div>
                            <ul className="list-disc pl-8 text-sm text-[#01579B] font-medium space-y-1">
                                <li><strong>버스</strong>: 우등요금 이하 실비 (프리미엄 이용 시에도 우등가로 지급).</li>
                                <li><strong>철도</strong>: KTX/SRT/새마을호 일반실 이하 (특실/비즈니스석 불가).</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-[#0288D1] mb-3 flex items-center">
                                <span className="mr-2 text-base">📋</span> 제출 서류 4종
                            </h3>
                            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
                                <table className="min-w-full text-sm border-collapse">
                                    <thead className="bg-[#0288D1] text-white">
                                        <tr>
                                            <th scope="col" className="px-4 py-3 text-center font-semibold w-16 border-r border-[#0277BD]">순번</th>
                                            <th scope="col" className="px-4 py-3 text-left font-semibold">서류명</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-neutral-800">
                                        <tr className="even:bg-neutral-50/70 hover:bg-[#E1F5FE]/30 transition-colors border-b border-neutral-100 last:border-0">
                                            <td className="px-4 py-3 text-center font-medium text-neutral-500 border-r border-neutral-200">1</td>
                                            <td className="px-4 py-3 font-medium text-neutral-900">① 출장 세부 계획서(사전)</td>
                                        </tr>
                                        <tr className="even:bg-neutral-50/70 hover:bg-[#E1F5FE]/30 transition-colors border-b border-neutral-100 last:border-0">
                                            <td className="px-4 py-3 text-center font-medium text-neutral-500 border-r border-neutral-200">2</td>
                                            <td className="px-4 py-3 font-medium text-neutral-900">② 출장보고서(사후)</td>
                                        </tr>
                                        <tr className="even:bg-neutral-50/70 hover:bg-[#E1F5FE]/30 transition-colors border-b border-neutral-100 last:border-0">
                                            <td className="px-4 py-3 text-center font-medium text-neutral-500 border-r border-neutral-200">3</td>
                                            <td className="px-4 py-3 font-medium text-neutral-900">③ 영수증 및 증빙 사진 첨부철</td>
                                        </tr>
                                        <tr className="even:bg-neutral-50/70 hover:bg-[#E1F5FE]/30 transition-colors border-b border-neutral-100 last:border-0">
                                            <td className="px-4 py-3 text-center font-medium text-neutral-500 border-r border-neutral-200">4</td>
                                            <td className="px-4 py-3 font-medium text-neutral-900">④ 통장 및 신분증 사본</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </Modal>

                <Modal
                    category="재료비"
                    title="[재료비]"
                    definition="사업계획서 상의 사업화를 위해 소모되는 재료 또는 원료 등을 구매하는 비용."
                >
                    <div className="space-y-6">
                        <div className="bg-[#E8F5E9]/60 p-5 rounded-xl border border-[#A5D6A7] flex flex-col gap-3 shadow-sm">
                            <div className="flex items-center">
                                <Info className="w-5 h-5 text-[#2E7D32] mr-2 flex-shrink-0" />
                                <strong className="text-base text-[#1B5E20]">집행 원칙</strong>
                            </div>
                            <ProcessFlow steps={['매주 월요일 신청', '화~수 사업단 일괄 구매', '목~금 검수 및 수령']} />
                            <ul className="list-disc pl-8 text-sm text-[#1B5E20] font-medium space-y-1 mt-3">
                                <li><strong>양산 목적 물품 구매 불가</strong>, 시제품 제작 관련 소모품만 가능.</li>
                                <li className="text-red-600"><strong>자산성 물품(PC, 태블릿, 모니터 등) 절대 구매 불가.</strong></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-[#2E7D32] mb-3 flex items-center">
                                <span className="mr-2 text-base">📋</span> 제출 서류 10종
                            </h3>
                            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
                                <table className="min-w-full text-sm border-collapse">
                                    <thead className="bg-[#2E7D32] text-white">
                                        <tr>
                                            <th scope="col" className="px-4 py-3 text-center font-semibold w-16 border-r border-[#1B5E20]">순번</th>
                                            <th scope="col" className="px-4 py-3 text-left font-semibold">서류명</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-neutral-800">
                                        {[
                                            "① 구매계획서",
                                            "② 물품구입요청서",
                                            "③ 견적서",
                                            "④ 비교견적서(2곳 이상)",
                                            "⑤ 영수증",
                                            "⑥ 검수사진",
                                            "⑦ 사업자등록증",
                                            "⑧ 통장사본",
                                            "⑨ 거래명세서",
                                            "⑩ 청구서"
                                        ].map((doc, idx) => (
                                            <tr key={idx} className="even:bg-neutral-50/70 hover:bg-[#E8F5E9]/30 transition-colors border-b border-neutral-100 last:border-0">
                                                <td className="px-4 py-3 text-center font-medium text-neutral-500 border-r border-neutral-200">{idx + 1}</td>
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
                    definition="창업아이템 고도화 및 사업계획 수행을 위해 일부 공정을 외부 업체에 의뢰하여 제작하는 비용."
                >
                    <div className="space-y-6">
                        <div className="bg-purple-50 p-5 rounded-xl border border-purple-200 flex flex-col gap-3 shadow-sm">
                            <div className="flex items-center">
                                <Briefcase className="w-5 h-5 text-purple-700 mr-2 flex-shrink-0" />
                                <strong className="text-base text-purple-900">업체 자격 요건</strong>
                            </div>
                            <ul className="list-disc pl-8 text-sm text-purple-900 font-medium space-y-1">
                                <li><strong>1년 이상</strong> 해당 분야 종사 경력 및 유사 아이템 제작 경험 보유 업체. (증빙 필요)</li>
                                <li className="text-red-600"><strong>프리랜서 중개 서비스(크몽, 위시켓 등) 이용 불가.</strong></li>
                                <li>시금형 제작은 가능하나 양산 목적 금형 제작은 불가.</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-[#7B1FA2] mb-3 flex items-center">
                                <span className="mr-2 text-base">📋</span> 제출 서류
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

                                        <tr className="even:bg-neutral-50/70 hover:bg-[#F3E5F5]/30 border-b border-neutral-200">
                                            <td className="px-4 py-4 text-center font-bold text-[#4A148C] bg-neutral-50/50 border-r border-neutral-200">
                                                계약 전 서류
                                            </td>
                                            <td className="px-4 py-4 font-medium leading-relaxed">
                                                표준계약서(<strong>간인 필수</strong>), 과업지시서, 견적서, 계약보증금 면제각서, 수의계약 체결 제한 여부 확인서, 청렴계약 이행서약서, 사업자등록증 사본, 통장사본, 인감증명서, 납세증명서(국세/지방세/4대보험)
                                            </td>
                                        </tr>

                                        <tr className="even:bg-neutral-50/70 hover:bg-[#F3E5F5]/30">
                                            <td className="px-4 py-4 text-center font-bold text-[#4A148C] bg-neutral-50/50 border-r border-neutral-200">
                                                검수 후 서류
                                            </td>
                                            <td className="px-4 py-4 font-medium leading-relaxed">
                                                전자세금계산서, 거래명세서, 착수계, 완료계, 용역결과보고서, 증빙 사진 및 결과물 자료
                                            </td>
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
                                <span className="mr-2 text-base">👨‍🏫</span> 멘토 자격
                            </h3>
                            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-[#E65100] text-white">
                                        <tr>
                                            <th scope="col" className="px-4 py-3 text-center font-semibold border-r border-[#EF6C00] w-16">구분</th>
                                            <th scope="col" className="px-4 py-3 text-left font-semibold">자격 기준 명세</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-neutral-800">
                                        {[
                                            "박사학위 소지자",
                                            "석사학위 소지 후 5년 경력자",
                                            "학사학위 소지 후 7년 경력자",
                                            "대학교수",
                                            "국가기술자격법상 기술사",
                                            "전문직(변리사, 회계사, 변호사 등)"
                                        ].map((item, idx) => (
                                            <tr key={idx} className="even:bg-neutral-50/70 hover:bg-[#FFF8E1]/40 transition-colors border-b border-neutral-100 last:border-0">
                                                <td className="px-4 py-3 text-center font-bold text-neutral-500 border-r border-neutral-200">{idx + 1}</td>
                                                <td className="px-4 py-3 font-medium text-neutral-900">{item}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-[#E65100] mb-3 flex items-center">
                                <span className="mr-2 text-base">📋</span> 제출 서류
                            </h3>
                            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
                                <table className="min-w-full text-sm border-collapse">
                                    <thead className="bg-[#E65100] text-white">
                                        <tr>
                                            <th scope="col" className="px-4 py-3 text-center font-semibold w-16 border-r border-[#EF6C00]">순번</th>
                                            <th scope="col" className="px-4 py-3 text-left font-semibold">서류명</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-neutral-800">
                                        {[
                                            "① 전문가 위촉동의서",
                                            "② 멘토링보고서(현장사진 포함)",
                                            "③ 멘토 이력서",
                                            "④ 신분증 및 통장 사본"
                                        ].map((doc, idx) => (
                                            <tr key={idx} className="even:bg-neutral-50/70 hover:bg-[#FFF8E1]/30 transition-colors border-b border-neutral-100 last:border-0">
                                                <td className="px-4 py-3 text-center font-medium text-neutral-500 border-r border-neutral-200">{idx + 1}</td>
                                                <td className="px-4 py-3 font-medium text-neutral-900">{doc}</td>
                                            </tr>
                                        ))}
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
