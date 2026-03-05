import { useState } from 'react';
import { Info, AlertCircle, FileText, Plane, Box, Briefcase, UserCheck } from 'lucide-react';

export default function ProgramGuide() {
    const [openModal, setOpenModal] = useState<string | null>(null);

    const ProcessFlow = ({ steps }: { steps: string[] }) => (
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4 bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100/50">
            {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                    <span className="font-extrabold text-lg text-indigo-900 bg-white px-6 py-3 rounded-full shadow-md border border-indigo-200">
                        {step}
                    </span>
                    {index < steps.length - 1 && (
                        <span className="text-indigo-500 mx-4 font-black text-2xl">⇨</span>
                    )}
                </div>
            ))}
        </div>
    );

    const Modal = ({ category, title, children }: { category: string, title: string, children: React.ReactNode }) => {
        if (openModal !== category) return null;
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setOpenModal(null)}>
                <div className="bg-white rounded-3xl shadow-2xl w-[90vw] md:w-[80vw] max-w-none max-h-[90vh] overflow-y-auto transform transition-all animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                    <div className="sticky top-0 bg-white border-b border-neutral-200 p-8 flex justify-between items-center z-10 shadow-sm">
                        <h2 className="text-4xl font-extrabold text-neutral-900">{title} 상세 안내</h2>
                        <button onClick={() => setOpenModal(null)} className="text-neutral-400 hover:text-neutral-900 font-bold p-2 text-4xl leading-none">&times;</button>
                    </div>
                    <div className="p-10">
                        {children}
                    </div>
                    <div className="border-t border-neutral-200 p-8 bg-neutral-50 flex justify-end sticky bottom-0 z-10 shadow-inner">
                        <button onClick={() => setOpenModal(null)} className="px-10 py-4 bg-neutral-900 text-white rounded-2xl font-bold hover:bg-black transition-colors text-xl shadow-md">
                            닫기
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-neutral-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-200 text-center">
                    <h1 className="text-4xl font-extrabold text-neutral-900 flex justify-center items-center">
                        <Info className="w-10 h-10 mr-4 text-indigo-600" />
                        프로그램 안내 및 유의사항
                    </h1>
                </div>

                {/* Section 1: 공통 주의사항 및 지원금 성격 */}
                <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-3xl p-8 shadow-sm">
                    <div className="flex flex-col items-center mb-6 text-center">
                        <AlertCircle className="w-12 h-12 text-red-600 mb-4" />
                        <h2 className="text-3xl font-extrabold text-red-900 mb-2">[필독] 공통 유의사항</h2>
                        <p className="text-lg text-red-800 font-bold">
                            본 성장 지원금은 단순 장학금이 아닌 정부 예산 '사업비'이므로 아래 원칙을 반드시 준수해야 합니다.
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl border border-red-300 shadow-sm overflow-hidden mt-6">
                        <ul className="divide-y divide-red-100 text-red-800 p-4 text-lg">
                            <li className="px-6 py-5 flex items-start">
                                <span className="mr-4 font-black text-red-600 text-2xl">•</span>
                                <div>
                                    <strong className="block mb-2 text-red-900 text-xl font-extrabold">지출 원칙</strong>
                                    <span className="text-lg font-medium">개인 결제 절대 불가, 모든 영수증 명의는 <strong>'경상국립대학교 산학협력단'</strong> 발행 필수.</span>
                                </div>
                            </li>
                            <li className="px-6 py-5 flex items-start">
                                <span className="mr-4 font-black text-red-600 text-2xl">•</span>
                                <div>
                                    <strong className="block mb-2 text-red-900 text-xl font-extrabold">금지 사항</strong>
                                    <span className="text-lg font-medium">양산 목적 구매 및 자산성 물품(PC, 노트북 등) 구매 불가.</span>
                                </div>
                            </li>
                            <li className="px-6 py-5 flex items-start">
                                <span className="mr-4 font-black text-red-600 text-2xl">•</span>
                                <div>
                                    <strong className="block mb-2 text-red-900 text-xl font-extrabold">의무 사항</strong>
                                    <span className="text-lg font-medium">사업 종료 시 결과보고서 및 사업자등록증 제출 필수 (미제출 시 환수).</span>
                                </div>
                            </li>
                            <li className="px-6 py-5 flex items-start">
                                <span className="mr-4 font-black text-red-600 text-2xl">•</span>
                                <div>
                                    <strong className="block mb-2 text-red-900 text-xl font-extrabold">기한</strong>
                                    <span className="text-lg font-medium">12월 31일 집행 마감 준수.</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Section 2: 비목별 큰 버튼 Grid (4 categories, 2x2 layout) */}
                <div>
                    <h3 className="text-3xl font-extrabold text-neutral-900 mb-8 flex items-center justify-center">
                        <FileText className="w-8 h-8 mr-4 text-indigo-600" />
                        지원 비목별 상세 안내 (클릭 시 팝업)
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        <button onClick={() => setOpenModal('여비')} className="group flex flex-col items-center justify-center p-12 bg-white border-2 border-[#0288D1] rounded-[2rem] shadow-md hover:shadow-2xl hover:bg-[#E1F5FE] transition-all duration-300 transform hover:-translate-y-2">
                            <Plane className="w-20 h-20 text-[#0288D1] mb-6 group-hover:scale-110 transition-transform" />
                            <span className="text-3xl font-extrabold text-[#0277BD] mb-3">여비</span>
                            <span className="text-lg text-neutral-500 font-bold text-center">증빙 기반 실비 지급<br />(출장 서류 5종)</span>
                        </button>

                        <button onClick={() => setOpenModal('재료비')} className="group flex flex-col items-center justify-center p-12 bg-white border-2 border-[#2E7D32] rounded-[2rem] shadow-md hover:shadow-2xl hover:bg-[#E8F5E9] transition-all duration-300 transform hover:-translate-y-2">
                            <Box className="w-20 h-20 text-[#2E7D32] mb-6 group-hover:scale-110 transition-transform" />
                            <span className="text-3xl font-extrabold text-[#1B5E20] mb-3">재료비</span>
                            <span className="text-lg text-neutral-500 font-bold text-center">시제품 제작 소모품<br />(필수 서류 10종)</span>
                        </button>

                        <button onClick={() => setOpenModal('외주용역비')} className="group flex flex-col items-center justify-center p-12 bg-white border-2 border-[#7B1FA2] rounded-[2rem] shadow-md hover:shadow-2xl hover:bg-[#F3E5F5] transition-all duration-300 transform hover:-translate-y-2">
                            <Briefcase className="w-20 h-20 text-[#7B1FA2] mb-6 group-hover:scale-110 transition-transform" />
                            <span className="text-3xl font-extrabold text-[#4A148C] mb-3">외주용역비</span>
                            <span className="text-lg text-neutral-500 font-bold text-center">시제품 고도화 외부 계약<br />(필수 서류 18종)</span>
                        </button>

                        <button onClick={() => setOpenModal('지급수수료')} className="group flex flex-col items-center justify-center p-12 bg-white border-2 border-[#F57F17] rounded-[2rem] shadow-md hover:shadow-2xl hover:bg-[#FFF8E1] transition-all duration-300 transform hover:-translate-y-2">
                            <UserCheck className="w-20 h-20 text-[#F57F17] mb-6 group-hover:scale-110 transition-transform" />
                            <span className="text-3xl font-extrabold text-[#E65100] mb-3">지급수수료 (멘토링)</span>
                            <span className="text-lg text-neutral-500 font-bold text-center">멘토 자격 요건 및<br />필수 서류 4종</span>
                        </button>

                    </div>
                </div>

                {/* Modals */}
                <Modal category="여비" title="[여비]">
                    <div className="space-y-10">
                        <div>
                            <h3 className="text-3xl font-extrabold text-[#0288D1] mb-6 flex items-center">
                                <span className="mr-3">📍</span> 여비 처리 프로세스
                            </h3>
                            <ProcessFlow steps={['사전신청', '검토', '출장', '증빙제출']} />
                        </div>

                        <div>
                            <h3 className="text-3xl font-extrabold text-[#0288D1] mb-6 flex items-center">
                                <span className="mr-3">📋</span> 5종 필수 제출 서류 목록
                            </h3>
                            <div className="bg-white rounded-3xl border border-neutral-300 overflow-hidden shadow-lg">
                                <table className="min-w-full divide-y divide-neutral-300 text-lg">
                                    <thead className="bg-[#0288D1] text-white">
                                        <tr>
                                            <th scope="col" className="px-8 py-5 text-center font-extrabold w-24 text-xl tracking-wider">순번</th>
                                            <th scope="col" className="px-8 py-5 text-left font-extrabold text-xl tracking-wider">서류명</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-200 text-neutral-800">
                                        {[
                                            "출장계획서 (사전 제출)",
                                            "출장보고서",
                                            "영수증 (실비 내역서 포함)",
                                            "증빙사진",
                                            "신분증 및 통장 사본"
                                        ].map((doc, idx) => (
                                            <tr key={idx} className="hover:bg-neutral-50 transition-colors">
                                                <td className="px-8 py-5 text-center font-bold text-neutral-500 text-xl">{idx + 1}</td>
                                                <td className="px-8 py-5 font-bold text-neutral-900 text-xl">{doc}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bg-[#E1F5FE]/80 p-8 rounded-2xl border-2 border-[#81D4FA] flex items-start shadow-sm mt-6">
                            <Info className="w-8 h-8 text-[#0288D1] mr-4 flex-shrink-0 mt-1" />
                            <p className="text-lg text-[#01579B] font-bold leading-relaxed">
                                <strong className="text-xl">💰 여비 실비 지급 기준 안내</strong><br />
                                • KTX의 경우 <strong>일반실</strong> 운임만 지원 가능합니다. (특실 불가)<br />
                                • 고속버스의 경우 <strong>우등버스 이하</strong> 실비 기준만 명시되어 지급됩니다. (프리미엄 불가)<br />
                                초과로 비용을 지불하신 경우, 해당 금액은 지원 불가하며 자비로 부담하셔야 합니다.
                            </p>
                        </div>
                    </div>
                </Modal>

                <Modal category="재료비" title="[재료비]">
                    <div className="space-y-10">
                        <div>
                            <h3 className="text-3xl font-extrabold text-[#2E7D32] mb-6 flex items-center">
                                <span className="mr-3">📍</span> 재료비 구매 프로세스
                            </h3>
                            <ProcessFlow steps={['월요일 신청', '화~수 구매', '검수', '서류제출']} />
                        </div>

                        <div>
                            <h3 className="text-3xl font-extrabold text-[#2E7D32] mb-6 flex items-center">
                                <span className="mr-3">📋</span> 10종 필수 제출 서류 목록
                            </h3>
                            <div className="bg-white rounded-3xl border border-neutral-300 overflow-hidden shadow-lg">
                                <table className="min-w-full divide-y divide-neutral-300 text-lg">
                                    <thead className="bg-[#2E7D32] text-white">
                                        <tr>
                                            <th scope="col" className="px-8 py-5 text-center font-extrabold w-24 text-xl tracking-wider">순번</th>
                                            <th scope="col" className="px-8 py-5 text-left font-extrabold text-xl tracking-wider">서류명</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-200 text-neutral-800">
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
                                            <tr key={idx} className="hover:bg-[#E8F5E9]/30 transition-colors">
                                                <td className="px-8 py-5 text-center font-bold text-neutral-500 text-xl">{idx + 1}</td>
                                                <td className="px-8 py-5 font-bold text-neutral-900 text-xl">{doc}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </Modal>

                <Modal category="외주용역비" title="[외주용역비]">
                    <div className="space-y-10">
                        <div>
                            <h3 className="text-3xl font-extrabold text-[#7B1FA2] mb-6 flex items-center">
                                <span className="mr-3">📍</span> 외주용역 계약 프로세스
                            </h3>
                            <ProcessFlow steps={['신청', '계약검토', '계약진행', '완료보고']} />
                        </div>

                        <div>
                            <h3 className="text-3xl font-extrabold text-[#7B1FA2] mb-6 flex items-center">
                                <span className="mr-3">📋</span> 18종 필수 제출 서류 목록
                            </h3>
                            <div className="bg-white rounded-3xl border border-neutral-300 overflow-hidden shadow-lg">
                                <table className="min-w-full divide-y divide-neutral-300 text-lg border-collapse">
                                    <thead className="bg-[#7B1FA2] text-white">
                                        <tr>
                                            <th scope="col" className="px-8 py-5 text-center font-extrabold w-48 border-r border-[#6A1B9A] text-xl tracking-wider">구분</th>
                                            <th scope="col" className="px-8 py-5 text-left font-extrabold text-xl tracking-wider">상세 서류명</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-200 text-neutral-800">
                                        <tr className="hover:bg-[#F3E5F5]/30">
                                            <td className="px-8 py-6 text-center font-extrabold text-[#4A148C] bg-[#F3E5F5]/50 border-r border-neutral-200 text-xl" rowSpan={4}>계약 전<br />필요 서류</td>
                                            <td className="px-8 py-6 font-bold border-b border-neutral-200 text-xl"><span className="text-red-500 font-black mr-3">1.</span>표준계약서 (양식에 맞추어 모든 장 <strong>간인 필수</strong>)</td>
                                        </tr>
                                        <tr className="hover:bg-[#F3E5F5]/30">
                                            <td className="px-8 py-6 font-bold border-b border-neutral-200 text-xl"><span className="text-red-500 font-black mr-3">2.</span>과업지시서 및 세부산출내역서</td>
                                        </tr>
                                        <tr className="hover:bg-[#F3E5F5]/30">
                                            <td className="px-8 py-6 font-bold border-b border-neutral-200 text-xl"><span className="text-red-500 font-black mr-3">3.</span>견적서 및 비교견적서</td>
                                        </tr>
                                        <tr className="hover:bg-[#F3E5F5]/30">
                                            <td className="px-8 py-6 font-bold border-b border-neutral-300 text-xl"><span className="text-red-500 font-black mr-3">4.</span>업체 관련 서류: 사업자등록증, 통장사본, 인감증명서, 사용인감계, 업체이력서(포트폴리오)</td>
                                        </tr>

                                        <tr className="hover:bg-[#F3E5F5]/30">
                                            <td className="px-8 py-6 text-center font-extrabold text-[#4A148C] bg-[#F3E5F5]/50 border-r border-neutral-200 text-xl">완납 증명<br />(필수)</td>
                                            <td className="px-8 py-6 font-bold border-b border-neutral-300 bg-red-50 text-xl">
                                                국세 완납증명서, 지방세 완납증명서, 4대보험 완납증명서 등 3종
                                            </td>
                                        </tr>

                                        <tr className="hover:bg-[#F3E5F5]/30">
                                            <td className="px-8 py-6 text-center font-extrabold text-[#4A148C] bg-[#F3E5F5]/50 border-r border-neutral-200 text-xl" rowSpan={3}>용역 완료 시<br />(종료 시점)</td>
                                            <td className="px-8 py-6 font-bold border-b border-neutral-200 text-xl"><span className="text-indigo-600 font-black mr-3">1.</span>완료보고서 및 완료 사진 자료</td>
                                        </tr>
                                        <tr className="hover:bg-[#F3E5F5]/30">
                                            <td className="px-8 py-6 font-bold border-b border-neutral-200 text-xl"><span className="text-indigo-600 font-black mr-3">2.</span>검수확인서</td>
                                        </tr>
                                        <tr className="hover:bg-[#F3E5F5]/30">
                                            <td className="px-8 py-6 font-bold text-xl"><span className="text-indigo-600 font-black mr-3">3.</span>전자 세금계산서, 거래명세서, 청구서</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </Modal>

                <Modal category="지급수수료" title="[지급수수료 (멘토링)]">
                    <div className="space-y-10">
                        <div>
                            <h3 className="text-3xl font-extrabold text-[#E65100] mb-6 flex items-center">
                                <span className="mr-3">👨‍🏫</span> 멘토링 전문가 자격 요건 (다음 중 1개 이상 필수 충족)
                            </h3>
                            <div className="bg-white rounded-3xl border border-neutral-300 overflow-hidden shadow-lg">
                                <table className="min-w-full divide-y divide-neutral-300 text-lg">
                                    <thead className="bg-[#E65100] text-white">
                                        <tr>
                                            <th scope="col" className="px-8 py-5 text-center font-extrabold text-xl tracking-wider">자격 기준 명세 (6가지)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-200 text-neutral-800">
                                        {[
                                            "1. 관련 분야 박사학위 소지자",
                                            "2. 대학 조교수 이상 전임 교원",
                                            "3. 관련 분야 기술사, 건축사, 공인회계사, 세무사, 변호사, 변리사 등 공인 자격증 소지자",
                                            "4. 관련 분야 석사학위 소지 후 5년 이상 경력자",
                                            "5. 관련 분야 학사학위 소지 후 5년 이상 경력자",
                                            "6. 기타 위 항목과 동등한 자격이 있다고 사업단이 인정하는 자"
                                        ].map((item, idx) => (
                                            <tr key={idx} className="hover:bg-[#FFF8E1]/60 transition-colors">
                                                <td className="px-8 py-5 font-bold text-neutral-900 text-xl">{item}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-3xl font-extrabold text-[#E65100] mb-6 flex items-center">
                                <span className="mr-3">📋</span> 멘토링 필수 제출 서류 4종
                            </h3>
                            <div className="bg-white rounded-3xl border border-neutral-300 overflow-hidden shadow-lg">
                                <table className="min-w-full divide-y divide-neutral-300 text-lg border-collapse">
                                    <thead className="bg-[#E65100] text-white">
                                        <tr>
                                            <th scope="col" className="px-8 py-5 text-center font-extrabold w-48 border-r border-[#EF6C00] text-xl tracking-wider">구분</th>
                                            <th scope="col" className="px-8 py-5 text-left font-extrabold text-xl tracking-wider">상세 서류명 및 필요 항목</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-200 text-neutral-800">
                                        <tr className="hover:bg-[#FFF8E1]/30">
                                            <td className="px-8 py-8 text-center font-extrabold text-[#E65100] bg-[#FFF8E1]/50 border-r border-neutral-200 text-2xl">
                                                멘토링 서류<br />(4종)
                                            </td>
                                            <td className="px-8 py-8 font-medium">
                                                <ul className="space-y-4 font-bold text-neutral-900 text-xl">
                                                    <li className="flex items-center"><span className="text-[#FFB300] mr-4 text-3xl">■</span>위촉동의서</li>
                                                    <li className="flex items-center"><span className="text-[#FFB300] mr-4 text-3xl">■</span>멘토링보고서</li>
                                                    <li className="flex items-center"><span className="text-[#FFB300] mr-4 text-3xl">■</span>이력서</li>
                                                    <li className="flex items-center"><span className="text-[#FFB300] mr-4 text-3xl">■</span>통장/신분증 사본</li>
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
