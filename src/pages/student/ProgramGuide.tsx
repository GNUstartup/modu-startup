import { useState } from 'react';
import { Info, AlertCircle, FileText, Plane, Box, Briefcase, UserCheck } from 'lucide-react';

export default function ProgramGuide() {
    const [openModal, setOpenModal] = useState<string | null>(null);

    const ProcessFlow = ({ steps }: { steps: string[] }) => (
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4 bg-indigo-50/50 p-4 rounded-lg border border-indigo-100/50">
            {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                    <span className="font-bold text-[15px] text-indigo-900 bg-white px-4 py-2 rounded-full shadow-sm border border-indigo-200">
                        {step}
                    </span>
                    {index < steps.length - 1 && (
                        <span className="text-indigo-400 mx-3 font-black text-xl">⇨</span>
                    )}
                </div>
            ))}
        </div>
    );

    const Modal = ({ category, title, headerColor, children }: { category: string, title: string, headerColor: string, children: React.ReactNode }) => {
        if (openModal !== category) return null;
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setOpenModal(null)}>
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto transform transition-all animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                    <div className="sticky top-0 bg-white border-b border-neutral-100 p-6 flex justify-between items-center z-10">
                        <h2 className="text-3xl font-extrabold text-neutral-900">{title} 상세 안내</h2>
                        <button onClick={() => setOpenModal(null)} className="text-neutral-400 hover:text-neutral-900 font-bold p-2 text-3xl">&times;</button>
                    </div>
                    <div className="p-8">
                        {children}
                    </div>
                    <div className="border-t border-neutral-100 p-6 bg-neutral-50 flex justify-end sticky bottom-0 z-10">
                        <button onClick={() => setOpenModal(null)} className="px-8 py-3 bg-neutral-800 text-white rounded-xl font-bold hover:bg-neutral-900 transition-colors text-lg">
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
                    <h1 className="text-3xl font-extrabold text-neutral-900 flex justify-center items-center">
                        <Info className="w-8 h-8 mr-3 text-indigo-600" />
                        프로그램 안내 및 유의사항
                    </h1>
                </div>

                {/* Section 1: 공통 주의사항 및 지원금 성격 */}
                <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-3xl p-8 shadow-sm">
                    <div className="flex flex-col items-center mb-6 text-center">
                        <AlertCircle className="w-10 h-10 text-red-600 mb-3" />
                        <h2 className="text-2xl font-bold text-red-900 mb-2">[필독] 공통 주의사항</h2>
                        <p className="text-base text-red-800 font-medium">
                            성장 지원금은 단순 장학금이 아닌 <strong>정부(중기부) 예산 '사업비'</strong>입니다.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white p-6 rounded-2xl border border-red-200 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                            <span className="text-3xl mb-3">💳</span>
                            <span className="text-red-800 font-bold text-lg mb-2">구매대행 원칙</span>
                            <span className="text-sm text-red-600 font-medium">사업단 직접 결제만 가능<br />(개인 카드/계좌이체 <strong>절대 불가</strong>)</span>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-red-200 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                            <span className="text-3xl mb-3">🏢</span>
                            <span className="text-red-800 font-bold text-lg mb-2">명의 통일</span>
                            <span className="text-sm text-red-600 font-medium">모든 증빙은<br /><strong>'경상국립대학교 산학협력단'</strong><br />명의 발행 필수</span>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-red-200 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                            <span className="text-3xl mb-3">⏳</span>
                            <span className="text-red-800 font-bold text-lg mb-2">기한 및 소요 시간</span>
                            <span className="text-sm text-red-600 font-medium">12월 31일 집행 마감<br />실제 지급까지 <strong>1~3주 소요</strong></span>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-red-200 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                            <span className="text-3xl mb-3">🚫</span>
                            <span className="text-red-800 font-bold text-lg mb-2">금지사항</span>
                            <span className="text-sm text-red-600 font-medium">PC, 노트북 등<br />자산성 물품 구매 불가</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-red-300 shadow-sm overflow-hidden">
                        <div className="bg-red-100 px-6 py-4 border-b border-red-200">
                            <h3 className="text-lg font-bold text-red-900">추가 유의사항 (필수 숙지)</h3>
                        </div>
                        <ul className="divide-y divide-red-100 text-red-800 p-2">
                            <li className="px-6 py-4 flex items-start">
                                <span className="mr-3 font-bold text-red-500">•</span>
                                <div>
                                    <strong className="block mb-1 text-red-900">양산 목적 구매 불가</strong>
                                    <span className="text-sm font-medium">시제품 제작 및 시장조사 목적의 건에 한해서만 집행이 가능합니다. (판매 목적 양산 불가)</span>
                                </div>
                            </li>
                            <li className="px-6 py-4 flex items-start">
                                <span className="mr-3 font-bold text-red-500">•</span>
                                <div>
                                    <strong className="block mb-1 text-red-900">중복 수혜 금지</strong>
                                    <span className="text-sm font-medium">타 예비창업패키지, 초기창업패키지 등 정부지원사업과 <strong className="underline">동일한 아이템으로 중복 지원을 받을 수 없습니다.</strong></span>
                                </div>
                            </li>
                            <li className="px-6 py-4 flex items-start">
                                <span className="mr-3 font-bold text-red-500">•</span>
                                <div>
                                    <strong className="block mb-1 text-red-900">결과물 제출 의무</strong>
                                    <span className="text-sm font-medium">사업 종료 시 사업자등록증 및 최종 결과보고서를 반드시 제출해야 하며, <strong>미제출 시 지원금이 전액 환수</strong>될 수 있습니다.</span>
                                </div>
                            </li>
                            <li className="px-6 py-4 flex items-start">
                                <span className="mr-3 font-bold text-red-500">•</span>
                                <div>
                                    <strong className="block mb-1 text-red-900">원본 서류 관리 철저</strong>
                                    <span className="text-sm font-medium">모든 증빙 서류는 원본 제출이 원칙입니다. 분실되지 않도록 각별히 유의해 주세요.</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Section 2: 비목별 큰 버튼 Grid (4 categories, 2x2 layout) */}
                <div>
                    <h3 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center justify-center">
                        <FileText className="w-6 h-6 mr-3 text-indigo-600" />
                        지원 비목별 상세 안내 (클릭 시 펼쳐집니다)
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        <button onClick={() => setOpenModal('여비')} className="group flex flex-col items-center justify-center p-10 bg-white border-2 border-[#B3E5FC] rounded-3xl shadow-sm hover:shadow-2xl hover:bg-[#E1F5FE] hover:border-[#0288D1] transition-all duration-300 transform hover:-translate-y-1">
                            <Plane className="w-16 h-16 text-[#0288D1] mb-4 group-hover:scale-110 transition-transform" />
                            <span className="text-2xl font-extrabold text-[#0277BD] mb-2">여비</span>
                            <span className="text-base text-neutral-500 font-medium text-center">증빙 기반 실비 지급<br />(출장 신청 절차)</span>
                        </button>

                        <button onClick={() => setOpenModal('재료비')} className="group flex flex-col items-center justify-center p-10 bg-white border-2 border-[#C8E6C9] rounded-3xl shadow-sm hover:shadow-2xl hover:bg-[#E8F5E9] hover:border-[#2E7D32] transition-all duration-300 transform hover:-translate-y-1">
                            <Box className="w-16 h-16 text-[#2E7D32] mb-4 group-hover:scale-110 transition-transform" />
                            <span className="text-2xl font-extrabold text-[#1B5E20] mb-2">재료비</span>
                            <span className="text-base text-neutral-500 font-medium text-center">시제품 제작 소모품<br />(필수 서류 표 10종)</span>
                        </button>

                        <button onClick={() => setOpenModal('외주용역비')} className="group flex flex-col items-center justify-center p-10 bg-white border-2 border-[#E1BEE7] rounded-3xl shadow-sm hover:shadow-2xl hover:bg-[#F3E5F5] hover:border-[#7B1FA2] transition-all duration-300 transform hover:-translate-y-1">
                            <Briefcase className="w-16 h-16 text-[#7B1FA2] mb-4 group-hover:scale-110 transition-transform" />
                            <span className="text-2xl font-extrabold text-[#4A148C] mb-2">외주용역비</span>
                            <span className="text-base text-neutral-500 font-medium text-center">시제품 고도화 외부 계약<br />(계약/완료 총 18종)</span>
                        </button>

                        <button onClick={() => setOpenModal('지급수수료')} className="group flex flex-col items-center justify-center p-10 bg-white border-2 border-[#FFECB3] rounded-3xl shadow-sm hover:shadow-2xl hover:bg-[#FFF8E1] hover:border-[#F57F17] transition-all duration-300 transform hover:-translate-y-1">
                            <UserCheck className="w-16 h-16 text-[#F57F17] mb-4 group-hover:scale-110 transition-transform" />
                            <span className="text-2xl font-extrabold text-[#E65100] mb-2">지급수수료 (멘토링)</span>
                            <span className="text-base text-neutral-500 font-medium text-center">멘토 자격 요건 및<br />시험·인증비 유의사항</span>
                        </button>

                    </div>
                </div>

                {/* Modals */}
                <Modal category="여비" title="[여비]" headerColor="bg-[#0288D1]">
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-2xl font-extrabold text-[#0288D1] mb-4">📍 여비 처리 프로세스</h3>
                            <ProcessFlow steps={['사전신청', '검토', '출장', '증빙제출']} />
                        </div>

                        <div>
                            <h3 className="text-2xl font-extrabold text-[#0288D1] mb-4">📋 필수 제출 서류 목록</h3>
                            <div className="bg-neutral-50 rounded-2xl border border-neutral-300 overflow-hidden shadow-sm">
                                <table className="min-w-full divide-y divide-neutral-300 text-base">
                                    <thead className="bg-[#E1F5FE]">
                                        <tr>
                                            <th scope="col" className="px-6 py-4 text-center font-extrabold text-[#0277BD] w-20 text-lg">순번</th>
                                            <th scope="col" className="px-6 py-4 text-left font-extrabold text-[#0277BD] text-lg">서류명</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-neutral-200 text-neutral-800">
                                        {[
                                            "출장계획서 (사전 제출)",
                                            "출장보고서",
                                            "영수증 (실비 내역서 포함)",
                                            "증빙사진",
                                            "통장 사본 및 신분증 사본"
                                        ].map((doc, idx) => (
                                            <tr key={idx} className="hover:bg-[#E1F5FE]/30 transition-colors">
                                                <td className="px-6 py-4 text-center font-bold text-neutral-400 text-lg">{idx + 1}</td>
                                                <td className="px-6 py-4 font-bold text-neutral-900">{doc}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bg-[#E1F5FE]/80 p-6 rounded-2xl border-2 border-[#81D4FA] flex items-start shadow-sm mt-4">
                            <Info className="w-6 h-6 text-[#0288D1] mr-3 flex-shrink-0 mt-0.5" />
                            <p className="text-base text-[#01579B] font-medium leading-relaxed">
                                <strong className="text-lg">💰 여비 실비 지급 기준 안내</strong><br />
                                • KTX의 경우 <strong>일반실</strong> 운임만 지원 가능합니다. (특실 불가)<br />
                                • 고속버스의 경우 <strong>우등버스 이하</strong> 실비 기준만 명시되어 지급됩니다. (프리미엄 불가)<br />
                                초과로 비용을 지불하신 경우, 해당 금액은 지원 불가하며 자비로 부담하셔야 합니다.
                            </p>
                        </div>
                    </div>
                </Modal>

                <Modal category="재료비" title="[재료비]" headerColor="bg-[#2E7D32]">
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-2xl font-extrabold text-[#2E7D32] mb-4">📍 재료비 구매 프로세스</h3>
                            <ProcessFlow steps={['월요일 신청', '화~수 일괄구매', '검수', '서류제출']} />
                        </div>

                        <div>
                            <h3 className="text-2xl font-extrabold text-[#2E7D32] mb-4">📋 10종 필수 제출 서류 목록</h3>
                            <div className="bg-neutral-50 rounded-2xl border border-neutral-300 overflow-hidden shadow-sm">
                                <table className="min-w-full divide-y divide-neutral-300 text-base">
                                    <thead className="bg-[#E8F5E9]">
                                        <tr>
                                            <th scope="col" className="px-6 py-4 text-center font-extrabold text-[#1B5E20] w-20 text-lg">순번</th>
                                            <th scope="col" className="px-6 py-4 text-left font-extrabold text-[#1B5E20] text-lg">서류명</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-neutral-200 text-neutral-800">
                                        {[
                                            "구매계획서",
                                            "물품 구입요청서",
                                            "견적서",
                                            "비교견적서 (동일 사양, 타 업체 1곳 이상의 견적서 / 총 2곳 이상)",
                                            "영수증 (카드매출전표 또는 현금영수증)",
                                            "검수사진 (물품 도착 후 촬영)",
                                            "사업자등록증 (업체)",
                                            "통장사본 (업체)",
                                            "거래명세서",
                                            "청구서"
                                        ].map((doc, idx) => (
                                            <tr key={idx} className="hover:bg-[#E8F5E9]/50 transition-colors">
                                                <td className="px-6 py-4 text-center font-bold text-neutral-400 text-lg">{idx + 1}</td>
                                                <td className="px-6 py-4 font-bold text-neutral-900">{doc}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <p className="text-sm font-bold text-[#2E7D32] text-right mt-2">
                            * 비교견적서 등 일부 서류는 금액이나 물품 특성에 따라 면제될 수 있습니다. 문의 바람.
                        </p>
                    </div>
                </Modal>

                <Modal category="외주용역비" title="[외주용역비]" headerColor="bg-[#7B1FA2]">
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-2xl font-extrabold text-[#7B1FA2] mb-4">📍 외주용역 계약 프로세스</h3>
                            <ProcessFlow steps={['신청', '계약검토', '계약진행', '완료보고']} />
                        </div>

                        <div>
                            <h3 className="text-2xl font-extrabold text-[#7B1FA2] mb-4">📋 18종 필수 제출 서류 목록</h3>
                            <div className="bg-neutral-50 rounded-2xl border border-neutral-300 overflow-hidden shadow-sm">
                                <table className="min-w-full divide-y divide-neutral-300 text-base border-collapse">
                                    <thead className="bg-[#F3E5F5]">
                                        <tr>
                                            <th scope="col" className="px-6 py-4 text-center font-extrabold text-[#4A148C] w-32 border-r border-[#E1BEE7] text-lg">구분</th>
                                            <th scope="col" className="px-6 py-4 text-left font-extrabold text-[#4A148C] text-lg">상세 서류명</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-neutral-200 text-neutral-800">
                                        <tr className="hover:bg-[#F3E5F5]/30">
                                            <td className="px-6 py-4 text-center font-extrabold text-neutral-700 bg-neutral-50 border-r border-neutral-200" rowSpan={4}>계약 전<br />필요 서류</td>
                                            <td className="px-6 py-4 font-bold border-b border-neutral-100"><span className="text-red-600 font-black mr-2">1.</span>표준계약서 (양식에 맞추어 모든 장 <strong>간인 필수</strong>)</td>
                                        </tr>
                                        <tr className="hover:bg-[#F3E5F5]/30">
                                            <td className="px-6 py-4 font-bold border-b border-neutral-100"><span className="text-red-600 font-black mr-2">2.</span>과업지시서 및 세부산출내역서</td>
                                        </tr>
                                        <tr className="hover:bg-[#F3E5F5]/30">
                                            <td className="px-6 py-4 font-bold border-b border-neutral-100"><span className="text-red-600 font-black mr-2">3.</span>견적서 및 비교견적서 (타 업체 견적서 필수)</td>
                                        </tr>
                                        <tr className="hover:bg-[#F3E5F5]/30">
                                            <td className="px-6 py-4 font-bold border-b border-neutral-200"><span className="text-red-600 font-black mr-2">4.</span>업체 관련 서류: 사업자등록증, 통장사본, 인감증명서, 사용인감계, 업체이력서(포트폴리오)</td>
                                        </tr>

                                        <tr className="hover:bg-[#F3E5F5]/30">
                                            <td className="px-6 py-4 text-center font-extrabold text-neutral-700 bg-neutral-50 border-r border-neutral-200">완납 증명<br />(필수)</td>
                                            <td className="px-6 py-4 font-bold border-b border-neutral-200 bg-red-50/30">
                                                국세 완납증명서, 지방세 완납증명서, 4대보험 완납증명서 등 3종 <strong className="text-red-600">(유효기간 확인 필수)</strong>
                                            </td>
                                        </tr>

                                        <tr className="hover:bg-[#F3E5F5]/30">
                                            <td className="px-6 py-4 text-center font-extrabold text-neutral-700 bg-neutral-50 border-r border-neutral-200" rowSpan={3}>용역 완료 시<br />(종료 시점)</td>
                                            <td className="px-6 py-4 font-bold border-b border-neutral-100"><span className="text-indigo-600 font-black mr-2">1.</span>완료보고서 및 완료 사진 자료 (결과물 검증용)</td>
                                        </tr>
                                        <tr className="hover:bg-[#F3E5F5]/30">
                                            <td className="px-6 py-4 font-bold border-b border-neutral-100"><span className="text-indigo-600 font-black mr-2">2.</span>검수확인서</td>
                                        </tr>
                                        <tr className="hover:bg-[#F3E5F5]/30">
                                            <td className="px-6 py-4 font-bold"><span className="text-indigo-600 font-black mr-2">3.</span>전자 세금계산서 (산학협력단 앞 발행), 거래명세서, 청구서</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </Modal>

                <Modal category="지급수수료" title="[지급수수료 (멘토링)]" headerColor="bg-[#F57F17]">
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-2xl font-extrabold text-[#E65100] mb-4">👨‍🏫 멘토링 전문가 자격 요건 (다음 중 1개 이상 필수 충족)</h3>
                            <div className="bg-neutral-50 rounded-2xl border border-neutral-300 overflow-hidden shadow-sm">
                                <table className="min-w-full divide-y divide-neutral-300 text-base">
                                    <thead className="bg-[#FFF8E1]">
                                        <tr>
                                            <th scope="col" className="px-6 py-4 text-center font-extrabold text-[#E65100] text-lg">자격 기준 명세</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-neutral-200 text-neutral-800">
                                        {[
                                            "1. 관련 분야 박사학위 소지자",
                                            "2. 대학 조교수 이상 전임 교원",
                                            "3. 관련 분야 기술사, 건축사, 공인회계사, 세무사, 변호사, 변리사 등 공인 자격증 소지자",
                                            "4. 관련 분야 석사학위 소지 후 5년 이상 경력자",
                                            "5. 관련 분야 학사학위 소지 후 5년 이상 경력자 (학사)",
                                            "6. 기타 위 항목과 동등한 자격이 있다고 사업단이 명확히 인정하는 자"
                                        ].map((item, idx) => (
                                            <tr key={idx} className="hover:bg-[#FFF8E1]/40 transition-colors">
                                                <td className="px-6 py-4 font-bold text-neutral-800 text-[15px]">{item}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-2xl font-extrabold text-[#E65100] mb-4">📋 멘토링 및 시험·인증비 제출 서류</h3>
                            <div className="bg-neutral-50 rounded-2xl border border-neutral-300 overflow-hidden shadow-sm">
                                <table className="min-w-full divide-y divide-neutral-300 text-base border-collapse">
                                    <thead className="bg-[#FFF8E1]">
                                        <tr>
                                            <th scope="col" className="px-6 py-4 text-center font-extrabold text-[#E65100] w-1/4 border-r border-[#FFECB3] text-lg">구분</th>
                                            <th scope="col" className="px-6 py-4 text-left font-extrabold text-[#E65100] text-lg">상세 서류 및 유의사항</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-neutral-200 text-neutral-800">
                                        <tr className="hover:bg-[#FFF8E1]/30">
                                            <td className="px-6 py-6 text-center font-extrabold text-[#E65100] bg-neutral-50/50 border-r border-neutral-200 text-lg">
                                                멘토링 서류<br />(전문가 활용비)
                                            </td>
                                            <td className="px-6 py-6 font-medium">
                                                <ul className="space-y-3 font-bold text-neutral-800">
                                                    <li className="flex items-center"><span className="text-[#FFB300] mr-2 text-xl">■</span>위촉동의서</li>
                                                    <li className="flex items-center"><span className="text-[#FFB300] mr-2 text-xl">■</span>이력서 (포트폴리오 등 자격 증빙 자료 반드시 첨부)</li>
                                                    <li className="flex items-center"><span className="text-[#FFB300] mr-2 text-xl">■</span>자문(멘토링) 신청 및 계획서 <span className="text-red-500 text-sm ml-2">*사전 승인 필수</span></li>
                                                    <li className="flex items-center"><span className="text-[#FFB300] mr-2 text-xl">■</span>전문가 자문(멘토링) 결과보고서</li>
                                                    <li className="flex items-center"><span className="text-[#FFB300] mr-2 text-xl">■</span>전문가 본인 명의 통장 사본 및 신분증 사본</li>
                                                </ul>
                                            </td>
                                        </tr>
                                        <tr className="hover:bg-[#FFF8E1]/30">
                                            <td className="px-6 py-6 text-center font-extrabold text-neutral-700 bg-neutral-50/50 border-r border-neutral-200 text-lg">
                                                시험·인증비
                                            </td>
                                            <td className="px-6 py-6 font-medium">
                                                <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-100">
                                                    <span className="text-red-700 font-bold block mb-1">🚨 필수 유의사항</span>
                                                    <span className="text-sm font-medium text-red-600">시제품 제작과 직접적으로 관련된 필수적인 시험 및 공인 인증 비용에 한정하여 지원합니다.</span>
                                                </div>
                                                <ul className="space-y-3 font-bold text-neutral-800 mt-2">
                                                    <li className="flex items-center"><span className="text-neutral-400 mr-2 text-xl">■</span>견적서 및 비교견적서</li>
                                                    <li className="flex items-center"><span className="text-neutral-400 mr-2 text-xl">■</span>전자세금계산서, 청구서, 거래명세서</li>
                                                    <li className="flex items-center"><span className="text-neutral-400 mr-2 text-xl">■</span>결과(인증) 증빙 서류</li>
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
