import { useState } from 'react';
import { Info, AlertCircle, FileText, CheckCircle2, ArrowRight, X, MapPin, Box, Briefcase, Wallet, Megaphone } from 'lucide-react';

export default function ProgramGuide() {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const ProcessFlow = ({ steps }: { steps: string[] }) => (
        <div className="flex flex-wrap items-center gap-2 mb-6 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50">
            {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                    <span className="font-bold text-sm text-indigo-800 bg-white px-4 py-2 rounded-full shadow-sm border border-indigo-100">
                        {step}
                    </span>
                    {index < steps.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-indigo-400 mx-2" />
                    )}
                </div>
            ))}
        </div>
    );

    const GuideModal = ({ isOpen, onClose, title, children }: any) => {
        if (!isOpen) return null;
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-neutral-900/60 backdrop-blur-sm" onClick={onClose} style={{ animation: 'fadeIn 0.2s ease-out' }}>
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden transform transition-all" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between p-6 border-b border-neutral-100 bg-neutral-50/50 shrink-0">
                        <h2 className="text-2xl font-bold text-neutral-900 flex items-center">
                            <FileText className="w-6 h-6 mr-3 text-indigo-600" />
                            {title} 상세 안내
                        </h2>
                        <button onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="p-6 sm:p-8 overflow-y-auto">
                        {children}
                    </div>
                </div>
            </div>
        );
    };

    const renderModalContent = () => {
        switch (selectedCategory) {
            case '여비':
                return (
                    <>
                        <h4 className="text-lg font-bold text-neutral-800 mb-3">진행 프로세스</h4>
                        <ProcessFlow steps={['사전신청', '검토', '출장', '증빙제출', '지급']} />

                        <h4 className="text-lg font-bold text-neutral-800 mb-3 mt-8">여비 필수 제출 서류 (5종)</h4>
                        <div className="bg-neutral-50 rounded-2xl border border-neutral-200 overflow-hidden mb-6">
                            <table className="min-w-full divide-y divide-neutral-200 text-sm">
                                <thead className="bg-[#E1F5FE]/50">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 text-center font-bold text-[#0288D1] w-20">순번</th>
                                        <th scope="col" className="px-4 py-3 text-left font-bold text-[#0288D1]">서류명</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-neutral-200">
                                    {["출장계획서", "보고서", "영수증", "증빙사진", "신분증/통장사본"].map((doc, idx) => (
                                        <tr key={idx} className="hover:bg-neutral-50 transition-colors">
                                            <td className="px-4 py-3 text-center font-bold text-neutral-500">{idx + 1}</td>
                                            <td className="px-4 py-3 text-neutral-800 font-medium">{doc}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="bg-[#E1F5FE]/30 p-5 rounded-2xl border border-[#B3E5FC]/50 text-base text-[#0277BD]">
                            <strong className="text-lg mb-2 block">📌 실비 지급 기준 명시</strong>
                            KTX는 <strong>일반실</strong>에 한하며, 버스는 <strong>우등버스 이하</strong> 등급 실비만 지급됩니다. (특실, 프리미엄 버스 초과 비용 지원 불가)
                        </div>
                    </>
                );
            case '재료비':
                return (
                    <>
                        <h4 className="text-lg font-bold text-neutral-800 mb-3">진행 프로세스</h4>
                        <ProcessFlow steps={['월요일 신청', '화~수 구매', '검수', '서류제출']} />

                        <h4 className="text-lg font-bold text-neutral-800 mb-3 mt-8">재료비 필수 제출 서류 (10종)</h4>
                        <div className="bg-neutral-50 rounded-2xl border border-neutral-200 overflow-hidden mb-2">
                            <table className="min-w-full divide-y divide-neutral-200 text-sm">
                                <thead className="bg-[#E8F5E9]/50">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 text-center font-bold text-[#2E7D32] w-20">순번</th>
                                        <th scope="col" className="px-4 py-3 text-left font-bold text-[#2E7D32]">서류명</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-neutral-200">
                                    {[
                                        "구매계획서", "구입요청서", "견적서", "비교견적서", "영수증",
                                        "검수사진", "사업자등록증", "통장사본", "거래명세서", "청구서"
                                    ].map((doc, idx) => (
                                        <tr key={idx} className="hover:bg-neutral-50 transition-colors">
                                            <td className="px-4 py-3 text-center font-bold text-neutral-500">{idx + 1}</td>
                                            <td className="px-4 py-3 text-neutral-800 font-medium">{doc}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                );
            case '외주용역비':
                return (
                    <>
                        <h4 className="text-lg font-bold text-neutral-800 mb-3">진행 프로세스</h4>
                        <ProcessFlow steps={['신청', '계약', '진행', '완료보고']} />

                        <h4 className="text-lg font-bold text-neutral-800 mb-3 mt-8">외주용역비 필수 제출 서류 (18종)</h4>
                        <div className="bg-neutral-50 rounded-2xl border border-neutral-200 overflow-hidden mb-2">
                            <table className="min-w-full divide-y divide-neutral-200 text-sm">
                                <thead className="bg-[#F3E5F5]/50">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 text-center font-bold text-[#7B1FA2] w-20">순번</th>
                                        <th scope="col" className="px-4 py-3 text-left font-bold text-[#7B1FA2]">서류명</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-neutral-200">
                                    {[
                                        "표준계약서 (간인 필수)", "과업지시서", "견적서", "비교견적서", "사업자등록증",
                                        "통장사본", "인감증명서", "국세 완납증명서", "지방세 완납증명서",
                                        "4대보험 완납증명서", "세금계산서", "세부산출내역서", "완료보고서", "검수확인서",
                                        "완료 사진 자료", "거래명세서", "청구서", "사용인감계"
                                    ].map((doc, idx) => (
                                        <tr key={idx} className="hover:bg-neutral-50 transition-colors">
                                            <td className="px-4 py-3 text-center font-bold text-neutral-500">{idx + 1}</td>
                                            <td className="px-4 py-3 text-neutral-800 font-medium">{doc}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                );
            case '지급수수료':
                return (
                    <>
                        <h4 className="text-lg font-bold text-neutral-800 mb-3 block">1. 시험·인증비 유의사항 및 서류 6종</h4>
                        <div className="bg-[#FFF8E1]/40 p-5 rounded-2xl border border-[#FFECB3]/50 text-base text-[#F57F17] mb-4">
                            시제품 제작과 직접적으로 관련된 필수 시험 및 공인 인증 비용에 한하여 지원 가능합니다.
                        </div>
                        <div className="bg-neutral-50 rounded-2xl border border-neutral-200 overflow-hidden mb-10">
                            <table className="min-w-full divide-y divide-neutral-200 text-sm">
                                <thead className="bg-[#FFF8E1]/80">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 text-center font-bold text-[#F57F17] w-20">순번</th>
                                        <th scope="col" className="px-4 py-3 text-left font-bold text-[#F57F17]">시험·인증비 필수 서류 (6종)</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-neutral-200">
                                    {[
                                        "인증계획서 (사전의뢰서)", "견적서", "전자세금계산서", "거래명세서", "청구서", "시험/결과(인증)서빙 증빙"
                                    ].map((doc, idx) => (
                                        <tr key={idx} className="hover:bg-neutral-50 transition-colors">
                                            <td className="px-4 py-3 text-center font-bold text-neutral-500">{idx + 1}</td>
                                            <td className="px-4 py-3 text-neutral-800 font-medium">{doc}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <h4 className="text-lg font-bold text-neutral-800 mb-3 block">2. 전문가활용(멘토링) 요건 및 제출 서류</h4>
                        <div className="bg-neutral-50 rounded-2xl border border-neutral-200 overflow-hidden mb-6">
                            <table className="min-w-full divide-y divide-neutral-200 text-sm">
                                <thead className="bg-[#FFF8E1]/80">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 text-center font-bold text-[#F57F17] w-20">순번</th>
                                        <th scope="col" className="px-4 py-3 text-left font-bold text-[#F57F17]">전문가 자격 요건 (6가지)</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-neutral-200">
                                    {[
                                        "관련 분야 박사학위 소지자",
                                        "대학 조교수 이상 전임 교원",
                                        "관련 분야 공인 자격증 소지자 (기술사, 변호사 등)",
                                        "관련 분야 석사학위 소지 후 3년 이상 경력자",
                                        "관련 분야 학사학위 소지 후 5년 이상 경력자",
                                        "기타 동등한 자격이 있다고 인정되는 자"
                                    ].map((req, idx) => (
                                        <tr key={idx} className="hover:bg-neutral-50 transition-colors">
                                            <td className="px-4 py-3 text-center font-bold text-neutral-500">{idx + 1}</td>
                                            <td className="px-4 py-3 text-neutral-800 font-medium">{req}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="bg-neutral-50 rounded-2xl border border-neutral-200 overflow-hidden">
                            <table className="min-w-full divide-y divide-neutral-200 text-sm">
                                <thead className="bg-[#FFF8E1]/80">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 text-center font-bold text-[#F57F17] w-20">순번</th>
                                        <th scope="col" className="px-4 py-3 text-left font-bold text-[#F57F17]">멘토링 제출 서류 (4종)</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-neutral-200">
                                    {[
                                        "위촉동의서", "전문가 이력서", "전문가 신분증 사본", "전문가 통장 사본"
                                    ].map((doc, idx) => (
                                        <tr key={idx} className="hover:bg-neutral-50 transition-colors">
                                            <td className="px-4 py-3 text-center font-bold text-neutral-500">{idx + 1}</td>
                                            <td className="px-4 py-3 text-neutral-800 font-medium">{doc}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                );
            case '광고선전비':
                return (
                    <>
                        <div className="bg-[#E0F2F1]/40 p-5 rounded-2xl border border-[#B2DFDB]/50 text-base text-[#00695C] mb-8">
                            <strong className="text-lg mb-2 block">📌 상세 범위 안내</strong>
                            창업 아이템홍보 목적의 <strong>홈페이지 및 랜딩페이지 구축, 홍보 영상 제작, 브로슈어/팸플릿 등 인쇄물 제작</strong> 비용을 지원합니다.
                        </div>

                        <h4 className="text-lg font-bold text-neutral-800 mb-3 mt-4">광고선전비 필수 제출 서류 (9종)</h4>
                        <div className="bg-neutral-50 rounded-2xl border border-neutral-200 overflow-hidden mb-2">
                            <table className="min-w-full divide-y divide-neutral-200 text-sm">
                                <thead className="bg-[#E0F2F1]/80">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 text-center font-bold text-[#00695C] w-20">순번</th>
                                        <th scope="col" className="px-4 py-3 text-left font-bold text-[#00695C]">서류명</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-neutral-200">
                                    {[
                                        "집행계획서 및 품의서 (시방서 포함)", "견적서", "비교견적서", "세금계산서",
                                        "거래명세서", "청구서", "사업자등록증", "통장사본", "검수조서 및 결과보고서 (완성품 증빙)"
                                    ].map((doc, idx) => (
                                        <tr key={idx} className="hover:bg-neutral-50 transition-colors">
                                            <td className="px-4 py-3 text-center font-bold text-neutral-500">{idx + 1}</td>
                                            <td className="px-4 py-3 text-neutral-800 font-medium">{doc}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                );
            default:
                return null;
        }
    };

    const categories = [
        { id: '여비', title: '여비', desc: '출장 실비 지원', icon: MapPin },
        { id: '재료비', title: '재료비', desc: '시제품 소모품 구매', icon: Box },
        { id: '외주용역비', title: '외주용역비', desc: '외부 업체 계약 (디자인 등)', icon: Briefcase },
        { id: '지급수수료', title: '지급수수료', desc: '자문 및 시험·인증 비용', icon: Wallet },
        { id: '광고선전비', title: '광고선전비', desc: '홈페이지, 홍보 영상 제작', icon: Megaphone }
    ];

    return (
        <div className="min-h-screen bg-neutral-50/50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-10">

                {/* Common Header / Rules */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-200 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
                    <h1 className="text-3xl font-extrabold text-neutral-900 flex items-center mb-5">
                        <Info className="w-8 h-8 mr-3 text-indigo-600" />
                        공통 주의사항 및 프로그램 가이드
                    </h1>
                    <p className="text-base text-neutral-600 mb-8 border-l-4 border-neutral-200 pl-4 py-2 font-medium bg-neutral-50 rounded-r-2xl">
                        기존의 카톡 접수 방식은 종료되었습니다. 모든 신청은 <strong>웹페이지 내 [새 신청서 작성] 메뉴에서 접수</strong>해 주시기 바랍니다.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-red-50/80 p-6 rounded-2xl border border-red-100 flex items-start">
                            <AlertCircle className="w-6 h-6 text-red-500 mr-4 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-bold text-red-900 text-lg mb-2">구매대행 원칙</h3>
                                <p className="text-sm text-red-800/80 leading-relaxed">
                                    지원금은 중기부 예산 '사업비'로, 사업단이 <strong>직접 결제</strong>만 가능합니다. (개인 카드/계좌이체 <strong>절대 불가</strong>)
                                </p>
                            </div>
                        </div>
                        <div className="bg-indigo-50/80 p-6 rounded-2xl border border-indigo-100 flex items-start">
                            <CheckCircle2 className="w-6 h-6 text-indigo-500 mr-4 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-bold text-indigo-900 text-lg mb-2">명의 통일</h3>
                                <p className="text-sm text-indigo-800/80 leading-relaxed">
                                    세금계산서 등 모든 발행 증빙은 <strong>'경상국립대학교 산학협력단'</strong> 명의로 통일하여 발행되어야 합니다.
                                </p>
                            </div>
                        </div>
                        <div className="bg-orange-50/80 p-6 rounded-2xl border border-orange-100 flex items-start">
                            <AlertCircle className="w-6 h-6 text-orange-500 mr-4 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-bold text-orange-900 text-lg mb-2">기한 및 소요 시간</h3>
                                <p className="text-sm text-orange-800/80 leading-relaxed">
                                    모든 집행은 <strong>당해 12월 31일 완전 마감</strong>됩니다. 서류 접수 후 실제 지급까지 <strong>약 1~3주 가량 소요</strong>됩니다.
                                </p>
                            </div>
                        </div>
                        <div className="bg-neutral-100/80 p-6 rounded-2xl border border-neutral-200 flex items-start">
                            <X className="w-6 h-6 text-neutral-500 mr-4 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-bold text-neutral-900 text-lg mb-2">금지사항</h3>
                                <p className="text-sm text-neutral-600 leading-relaxed">
                                    <strong>PC, 노트북, 태블릿</strong> 및 소프트웨어 영구 라이선스 등 자산성 물품은 어떠한 경우에도 <strong>구매 불가</strong>합니다.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Category Grid Selection */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-2xl font-bold text-neutral-900">비목별 상세 안내 (버튼 클릭)</h2>
                    </div>
                    {/* Centering a 5 card grid -> 3 top, 2 bottom for LG/XL screens */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                        {categories.map((cat, index) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`group relative flex flex-col items-center justify-center p-8 bg-white rounded-3xl shadow-sm border border-neutral-200 hover:shadow-xl hover:border-indigo-400 hover:-translate-y-1 transition-all text-center focus:outline-none focus:ring-4 focus:ring-indigo-500/20 ${index >= 3 ? 'lg:col-span-1 lg:ml-auto lg:mr-auto' : ''}`}
                            >
                                <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mb-5 group-hover:bg-indigo-100 transition-colors">
                                    <cat.icon className="w-10 h-10 text-indigo-600" />
                                </div>
                                <h3 className="text-xl font-bold text-neutral-900 mb-2">{cat.title}</h3>
                                <p className="text-sm text-neutral-500 h-10">{cat.desc}</p>
                            </button>
                        ))}
                    </div>
                </div>

            </div>

            {/* Pop-up Modal Rendering */}
            <GuideModal
                isOpen={!!selectedCategory}
                onClose={() => setSelectedCategory(null)}
                title={selectedCategory}
            >
                {renderModalContent()}
            </GuideModal>
        </div>
    );
}
