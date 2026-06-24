import { useState } from 'react';
import { Info, AlertCircle, FileText, Plane, Box, Briefcase, UserCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

// Design Components
const SectionBadge = ({ title, color = "indigo" }: { title: string, color?: "indigo" | "blue" | "green" | "purple" | "orange" }) => {
    const colorMap = {
        indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
        blue: "bg-blue-50 text-blue-700 border-blue-200",
        green: "bg-green-50 text-green-700 border-green-200",
        purple: "bg-purple-50 text-purple-700 border-purple-200",
        orange: "bg-orange-50 text-orange-700 border-orange-200"
    };
    return (
        <span className={`inline-flex items-center px-4 py-1.5 mb-3 rounded-full text-[15px] font-bold border ${colorMap[color]} shadow-sm`}>
            {title}
        </span>
    );
};

const NoticeCard = ({ children, color = "neutral" }: { children: React.ReactNode, color?: "neutral" | "red" | "blue" | "green" | "purple" | "orange" }) => {
    const colorMap = {
        neutral: "bg-white border-neutral-200 text-neutral-800",
        red: "bg-white border-red-200 text-neutral-800",
        blue: "bg-white border-blue-200 text-neutral-800",
        green: "bg-white border-green-200 text-neutral-800",
        purple: "bg-white border-purple-200 text-neutral-800",
        orange: "bg-white border-orange-200 text-neutral-800"
    };
    const iconColorMap = {
        neutral: "text-neutral-500",
        red: "text-red-500",
        blue: "text-blue-500",
        green: "text-green-500",
        purple: "text-purple-500",
        orange: "text-orange-500"
    };

    return (
        <div className={`p-5 mb-5 rounded-xl border flex items-start gap-3 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] ${colorMap[color]}`}>
            <AlertCircle className={`w-6 h-6 flex-shrink-0 mt-0.5 ${iconColorMap[color]}`} />
            <div className="flex-1 space-y-2">
                {children}
            </div>
        </div>
    );
};

const ProcessFlow = ({ steps, theme = "neutral" }: { steps: string[], theme?: "neutral" | "blue" | "orange" }) => {
    const themeMap = {
        neutral: { bg: "bg-white", text: "text-neutral-800", border: "border-neutral-200", arrow: "text-neutral-400" },
        blue: { bg: "bg-white", text: "text-blue-800", border: "border-blue-200", arrow: "text-blue-500" },
        orange: { bg: "bg-white", text: "text-orange-800", border: "border-orange-200", arrow: "text-orange-500" }
    };
    const t = themeMap[theme];

    return (
        <div className="flex flex-wrap items-center gap-2 mb-4">
            {steps.map((step, index) => (
                <div key={index} className="flex items-center mt-2">
                    <span className={`font-bold text-[14px] ${t.text} ${t.bg} px-4 py-2 rounded-full shadow-sm border ${t.border}`}>
                        {step}
                    </span>
                    {index < steps.length - 1 && (
                        <ArrowRight className={`w-5 h-5 mx-1 flex-shrink-0 ${t.arrow}`} />
                    )}
                </div>
            ))}
        </div>
    );
};

const DocumentTable = ({ headers, rows, color = "indigo" }: { headers: string[], rows: (string | React.ReactNode)[][], color?: string }) => {
    const bgHeaderMap: Record<string, string> = {
        indigo: "bg-[#3949AB]", blue: "bg-[#0288D1]", green: "bg-[#2E7D32]", purple: "bg-[#7B1FA2]", orange: "bg-[#E65100]"
    };
    const headerClass = bgHeaderMap[color] || "bg-neutral-800";

    return (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm mb-5">
            <table className="min-w-full text-[15px] border-collapse text-left">
                <thead className={`${headerClass} text-white`}>
                    <tr>
                        {headers.map((h, i) => (
                            <th key={i} scope="col" className={`px-4 py-3.5 font-semibold ${i === 0 ? 'w-20 sm:w-28 text-center border-r border-white/20' : ''}`}>
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="text-neutral-800 divide-y divide-neutral-100">
                    {rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-neutral-50/50 transition-colors">
                            {row.map((cell, cIdx) => (
                                <td key={cIdx} className={`px-4 py-5 font-medium ${cIdx === 0 ? 'text-center text-neutral-600 border-r border-neutral-100 font-bold whitespace-nowrap' : 'border-r border-neutral-100 last:border-r-0 leading-loose'}`}>
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default function ProgramGuide() {
    const [openModal, setOpenModal] = useState<string | null>(null);

    const Modal = ({ category, title, color, children }: { category: string, title: string, color: string, children: React.ReactNode }) => {
        if (openModal !== category) return null;
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setOpenModal(null)}>
                <div className="bg-white rounded-2xl shadow-xl w-[90vw] md:w-[85vw] max-w-none max-h-[90vh] overflow-y-auto transform transition-all animate-in fade-in zoom-in-95 duration-200 whitespace-pre-wrap break-keep" onClick={e => e.stopPropagation()}>
                    <div className="sticky top-0 bg-white border-b border-neutral-200 p-5 sm:p-6 flex justify-between items-start sm:items-center z-10 shadow-sm">
                        <div className="flex flex-col gap-1.5">
                            <h2 className={`text-2xl sm:text-3xl font-bold text-${color}-800`}>{title}</h2>
                        </div>
                        <button onClick={() => setOpenModal(null)} className="text-neutral-400 hover:text-neutral-900 font-bold p-1 text-3xl leading-none">&times;</button>
                    </div>
                    <div className="p-6 sm:p-8 text-neutral-800 text-[15px] sm:text-base leading-[1.7]">
                        {children}
                    </div>
                    <div className="border-t border-neutral-200 p-5 sm:p-6 bg-neutral-50 flex justify-end sticky bottom-0 z-10 shadow-inner">
                        <button onClick={() => setOpenModal(null)} className="px-8 py-3 bg-neutral-800 text-white rounded-xl font-bold hover:bg-neutral-900 transition-colors">
                            닫기
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-neutral-50 py-8 px-4 sm:px-6 lg:px-8 font-sans whitespace-pre-wrap break-keep">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 text-center">
                    <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 flex justify-center items-center">
                        <Info className="w-8 h-8 mr-3 text-indigo-600 flex-shrink-0" />
                        프로그램 안내 및 유의사항
                    </h1>
                </div>

                {/* Section 1: 공통 주의사항 및 지원금 성격 */}
                <div className="bg-white border text-[15px] sm:text-[16px] border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-sm text-neutral-800 leading-[1.7]">
                    <h2 className="text-2xl font-bold text-neutral-900 mb-6 pb-3 border-b border-neutral-100 flex items-center">
                        <CheckCircle2 className="w-6 h-6 mr-3 text-indigo-600" /> 공통 안내사항
                    </h2>

                    <div className="mb-8">
                        <SectionBadge title="개요" color="indigo" />
                        <div className="font-semibold text-neutral-800 p-5 bg-indigo-50/50 rounded-xl border border-indigo-100">여러분들이 받게 되는 ‘성장 지원금’은 단순한 장학금이거나 지원금이 아니며 정부(중소벤처기업부) 예산으로 집행되는 ‘<span className="text-red-600 font-bold">사업비</span>’입니다. 따라서 모든 지출(비용)은 사업계획서에 명시된 창업아이템의 개발·사업화 목적에 직접 연관 되어야 하며, ‘<span className="text-red-600 font-bold">사업단이 대신 결제(구매대행)</span>’하는 방식으로만 집행됩니다.{"\n\n"}<span className="text-red-600 font-bold">양산 목적의 물품·용역 구매는 불가, 시제품 제작 및 시장조사 관련 사항만 집행 가능.</span>{"\n"}모든 거래의 세금계산서나 영수증은 ‘경상국립대학교 산학협력단’ 명의로 발행되어야 합니다.{"\n"}만약 참가자가 개인 신용·체크카드로 선결제하거나, 개인 계좌로 송금한 경우 사업비로 인정하지 않습니다.</div>
                    </div>

                    <div className="mb-8">
                        <SectionBadge title="지원금 사용" color="indigo" />
                        <div className="font-semibold text-neutral-800 p-5 bg-indigo-50/50 rounded-xl border border-indigo-100">현금을 참가자에게 지급하는 것이 아닌 참가자의 요청을 받고 <span className="text-red-600 font-bold">사업단에서 대리 결제</span>하는 방식.{"\n"}즉, 참가자가 ‘필요한 품목’을 제안하면, <span className="text-red-600 font-bold">사업단이 승인 후 직접 결제</span>하는 구조{"\n"}(외상 거래 기본, <span className="text-red-600 font-bold">선결제 불가</span>)</div>
                    </div>

                    <div className="mb-8">
                        <SectionBadge title="기본 진행 절차" color="indigo" />

                        <div className="space-y-4 mt-2">
                            <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl shadow-sm">
                                <div className="mb-2"><SectionBadge title="지원금 사용 (1~3주 소요)" color="blue" /></div>
                                <ProcessFlow steps={['사전 신청(월)', '내부 검토', '승인 후 진행', '결제 및 지급']} theme="blue" />
                            </div>

                            <div className="p-6 bg-orange-50 border border-orange-100 rounded-2xl shadow-sm">
                                <div className="mb-2"><SectionBadge title="계획 변경 (1~2주 소요)" color="orange" /></div>
                                <ProcessFlow steps={['사전 신청(목)', '내부 검토', '승인 후 결재', '완료 및 반영']} theme="orange" />
                            </div>
                        </div>
                    </div>

                    <NoticeCard color="red">
                        <strong className="block text-red-900 text-xl mb-3">유의사항</strong>
                        <ul className="list-disc pl-6 space-y-2 font-semibold text-[15px]">
                            <li>회차당 사업비 사용 금액 최대한 크게</li>
                            <li>파일명 규칙: 날짜_팀명_비목_금액</li>
                            <li>사업계획서 미기재 건 신청 불가</li>
                            <li><span className="text-red-600 font-bold">타 사업 중복지급 불가</span></li>
                            <li>원본서류 관리 철저</li>
                            <li>기자재(PC, 노트북 등 <span className="text-red-600 font-bold">자산성 물품) 구매 불가</span></li>
                            <li><span className="text-red-600 font-bold">개인 명의 결제 불가</span>, 사업단 직접 결제(법인카드, 계좌이체) 원칙</li>
                            <li>불명확한 지출은 추후 부적정 판정 가능</li>
                            <li>견적서, 거래명세서, 영수증 등의 명의는 ‘사업단’ 또는 ‘참가자 본인’으로 통일</li>
                        </ul>
                    </NoticeCard>
                </div>

                {/* Section 2: 비목별 퀵 버튼 Grid (4 categories, 2x2 layout) */}
                <div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center justify-center">
                        <FileText className="w-6 h-6 mr-3 text-indigo-600 flex-shrink-0" />
                        지원 비목별 상세 안내 (클릭 시 팝업)
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <button onClick={() => setOpenModal('여비')} className="group flex flex-col items-center justify-center p-8 bg-white border-2 border-[#0288D1]/20 rounded-2xl shadow-sm hover:shadow-lg hover:border-[#0288D1] hover:bg-[#E1F5FE]/30 transition-all duration-300 transform hover:-translate-y-1">
                            <Plane className="w-10 h-10 text-[#0288D1] mb-4 group-hover:scale-110 transition-transform flex-shrink-0" />
                            <span className="text-xl font-extrabold text-[#0277BD]">여비</span>
                        </button>

                        <button onClick={() => setOpenModal('재료비')} className="group flex flex-col items-center justify-center p-8 bg-white border-2 border-[#2E7D32]/20 rounded-2xl shadow-sm hover:shadow-lg hover:border-[#2E7D32] hover:bg-[#E8F5E9]/30 transition-all duration-300 transform hover:-translate-y-1">
                            <Box className="w-10 h-10 text-[#2E7D32] mb-4 group-hover:scale-110 transition-transform flex-shrink-0" />
                            <span className="text-xl font-extrabold text-[#1B5E20]">재료비</span>
                        </button>

                        <button onClick={() => setOpenModal('외주용역비')} className="group flex flex-col items-center justify-center p-8 bg-white border-2 border-[#7B1FA2]/20 rounded-2xl shadow-sm hover:shadow-lg hover:border-[#7B1FA2] hover:bg-[#F3E5F5]/30 transition-all duration-300 transform hover:-translate-y-1">
                            <Briefcase className="w-10 h-10 text-[#7B1FA2] mb-4 group-hover:scale-110 transition-transform flex-shrink-0" />
                            <span className="text-xl font-extrabold text-[#4A148C]">외주용역비</span>
                        </button>

                        <button onClick={() => setOpenModal('지급수수료')} className="group flex flex-col items-center justify-center p-8 bg-white border-2 border-[#F57F17]/20 rounded-2xl shadow-sm hover:shadow-lg hover:border-[#F57F17] hover:bg-[#FFF8E1]/30 transition-all duration-300 transform hover:-translate-y-1">
                            <UserCheck className="w-10 h-10 text-[#F57F17] mb-4 group-hover:scale-110 transition-transform flex-shrink-0" />
                            <span className="text-xl font-extrabold text-[#E65100]">지급수수료(멘토링)</span>
                        </button>

                    </div>
                </div>

                {/* Modals */}
                <Modal category="여비" title="여비" color="blue">
                    <div className="mb-8">
                        <SectionBadge title="정의" color="blue" />
                        <div className="font-semibold text-blue-900 p-4 bg-blue-50/50 rounded-xl border border-blue-100">소재지를 벗어나 타 지역 출장 등의 사유로 집행하는 비용.</div>
                    </div>

                    <NoticeCard color="blue">
                        <strong className="block text-xl mb-3 text-blue-900">유의사항</strong>
                        <ul className="list-disc pl-6 space-y-2 font-semibold mt-1">
                            <li>교통영수증은 사업단 승인 이후 개인카드로 결제(출장 신청일과 탑승일 동일 필수).</li>
                            <li>진주-출장지 왕복 영수증(실제 금액 표기) 제출 및 대중교통 이용 원칙(우등/일반실 기준, <span className="text-red-600 font-bold">KTX 특실 등 불가</span>).</li>
                            <li><span className="text-red-600 font-bold">단순 미팅 목적 출장(전시회 관람 등 명확한 목적 없는 경우) 여비 지급 불가</span>.</li>
                        </ul>
                    </NoticeCard>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 mt-8">
                        <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center">
                            <FileText className="w-5 h-5 mr-3 text-blue-600" /> 지출 필요 서류 목록
                        </h3>
                        <ProcessFlow steps={['사전신청', '검토', '출장', '증빙제출']} />
                        <DocumentTable color="blue" headers={["순번", "상세 서류"]} rows={[
                            ["1", "출장계획서"],
                            ["2", "보고서"],
                            ["3", "영수증"],
                            ["4", "증빙사진"],
                            ["5", "신분증 사본 / 통장 사본"]
                        ]} />
                    </div>
                </Modal>

                <Modal category="재료비" title="재료비" color="green">
                    <div className="mb-8">
                        <SectionBadge title="정의" color="green" />
                        <div className="font-semibold text-green-900 p-4 bg-green-50/50 rounded-xl border border-green-100">사업계획서 상의 사업화를 위해 소모되는 재료 또는 원료 등을 구매하는 비용.</div>
                    </div>

                    <NoticeCard color="green">
                        <strong className="block text-xl mb-3 text-green-900">유의사항</strong>
                        <ul className="list-disc pl-6 space-y-2 font-semibold mt-1">
                            <li>취득시 자산화(기계·장치) 및 MVP 제작에 소모되지 않는 품목 불가.</li>
                            <li><span className="text-red-600 font-bold">해외 직구 상품 및 구독 서비스 구매 불가</span>.</li>
                            <li>매주 화요일 신청 건 대상 수~목요일 구매 진행. 구매품목과 구매수량이 모두 보이게 검수 사진 촬영 필수.</li>
                        </ul>
                    </NoticeCard>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 mt-8">
                        <h3 className="text-xl font-bold text-green-800 mb-6 flex items-center border-b pb-3 border-green-100">
                            <FileText className="w-5 h-5 mr-3 text-green-600" /> 지출 필요 서류 목록 (온라인/오프라인)
                        </h3>

                        <div className="space-y-8">
                            <div>
                                <strong className="block text-lg text-green-700 mb-4 bg-green-50 px-4 py-2 rounded-lg"><SectionBadge title="온라인 결제 시 서류" color="green" /></strong>
                                <DocumentTable color="green" headers={["구분", "제출해야 할 서류"]} rows={[
                                    ["필수", "구매 요청 계획서(사전 검토 필수)"],
                                    ["필수", "물품 구입 요청서"],
                                    ["필수", "물품 증빙사진"]
                                ]} />
                            </div>

                            <div>
                                <strong className="block text-lg text-green-700 mb-4 bg-green-50 px-4 py-2 rounded-lg"><SectionBadge title="오프라인 결제 시 서류" color="green" /></strong>
                                <DocumentTable color="green" headers={["구분", "제출해야 할 서류"]} rows={[
                                    ["입증", "구매 요청 계획서(사전 검토 필수)"],
                                    ["증빙", "거래명세서"],
                                    ["확인", "물품 증빙사진"],
                                    ["업체", "사업자등록증, 승낙사항, 청렴계약 이행서약서, 수의계약 체결 제한여부 확인서, 통장사본 등"]
                                ]} />
                            </div>
                        </div>
                    </div>
                </Modal>

                <Modal category="외주용역비" title="외주용역비" color="purple">
                    <div className="mb-8">
                        <SectionBadge title="정의" color="purple" />
                        <div className="font-semibold text-purple-900 p-4 bg-purple-50/50 rounded-xl border border-purple-100">사업계획서 상의 창업아이템을 고도화하거나 사업계획을 수행하기 위한 목적으로 일부 공정을 외부 업체에 의뢰하여 제작하고, 이에 대한 대가를 지급하는 비용.</div>
                    </div>

                    <NoticeCard color="purple">
                        <strong className="block text-xl mb-3 text-purple-900">유의사항</strong>
                        <ul className="list-disc pl-6 space-y-2 font-semibold mt-1">
                            <li>외부 전문업체는 1년 이상의 해당 분야 종사경력 및 외주용역대상 창업아이템과 유사한 아이템의 제작 경험 보유 필요(업체의 사업자등록증 상 적정 업종 확인).</li>
                            <li>프리랜서 중개 서비스(크몽, 위시켓 등) 통한 집행 <span className="text-red-600 font-bold">절대 불가</span>. <span className="text-red-600 font-bold">양산목적 금형제작 집행 불가</span>.</li>
                            <li>절차 소요시간(1~2주) 감안하여 사전 신청 필요.</li>
                        </ul>
                    </NoticeCard>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 mt-8">
                        <h3 className="text-xl font-bold text-purple-800 mb-6 flex items-center border-b pb-3 border-purple-100">
                            <FileText className="w-5 h-5 mr-3 text-purple-600" /> 지출 필요 서류 목록
                        </h3>

                        <div className="space-y-8">
                            <div>
                                <strong className="block text-lg text-purple-700 mb-4 bg-purple-50 px-4 py-2 rounded-lg"><SectionBadge title="계약 시 상세 서류" color="purple" /></strong>
                                <DocumentTable color="purple" headers={["분류", "상세 제출 서류 목록"]} rows={[
                                    ["기본", "표준 계약서, 과업지시서, 견적서, 비교견적서, 계약보증금 면제각서"],
                                    ["규정", "수의계약 체결 제한여부 확인서, 청렴계약 이행 서약서"],
                                    ["업체", "사업자등록증, 통장사본, 인감증명서, 국세/지방세/4대보험 완납증명서"]
                                ]} />
                            </div>

                            <div>
                                <strong className="block text-lg text-purple-700 mb-4 bg-purple-50 px-4 py-2 rounded-lg"><SectionBadge title="대금 지급 시 상세 서류" color="purple" /></strong>
                                <DocumentTable color="purple" headers={["요건", "상세 제출 서류 목록"]} rows={[
                                    ["대금", "거래명세서, 착수계, 완료계, 용역 결과보고서"]
                                ]} />
                            </div>
                        </div>
                    </div>
                </Modal>

                <Modal category="지급수수료" title="지급수수료(멘토링)" color="orange">
                    <div className="mb-8">
                        <SectionBadge title="정의" color="orange" />
                        <div className="font-semibold text-orange-900 p-4 bg-orange-50/50 rounded-xl border border-orange-100">전문가활용비(멘토링)는 사업모델 개발, 제품 개선 등을 위한 멘토링 진행 시 지급하는 비용을 말한다.</div>
                    </div>

                    <NoticeCard color="orange">
                        <strong className="block text-xl mb-3 text-orange-900">유의사항</strong>
                        <p className="mb-4 font-semibold text-[15px]">사업아이템 고도화를 위한 창업 전문가 또는, 사업자등록증 출원 등 법률/행정/세무 전문가를 초빙할시 소요되는 비용이어야함 (멘토 자격 충족 必)</p>

                        <strong className="block text-lg mb-3 text-orange-800 border-l-4 border-orange-500 pl-3">멘토 자격 요건 (다음 중 하나 이상)</strong>
                        <ol className="list-decimal pl-6 space-y-3 font-semibold bg-orange-50/50 p-5 rounded-xl border border-orange-100 mt-2 text-orange-900 leading-[1.6]">
                            <li>박사학위 소지자</li>
                            <li>석사학위 소지자 중 해당 분야 5년 이상 경력자</li>
                            <li>학사학위 소지자 중 해당 분야 7년 이상 경력자</li>
                            <li>조교수 이상인 대학교원</li>
                            <li>5급 또는 이에 상당하는 공무원으로 해당분야 5년 이상 경력자</li>
                            <li>기술사, 변리사, 기술지도사, 경영지도사, 공인회계사, 세무사, 변호사, 공인노무사 등 전문직 종사자</li>
                        </ol>
                    </NoticeCard>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 mt-8">
                        <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center border-b pb-3 border-orange-100">
                            <FileText className="w-5 h-5 mr-3 text-orange-600" /> 지출 필요 서류 목록
                        </h3>
                        <DocumentTable color="orange" headers={["번호", "상세 서류"]} rows={[
                            ["1", "전문가 초빙동의서 6부"],
                            ["2", "멘토링보고서(현장사진 필수, 온라인 멘토링은 시작/끝 시간이 보이게 캡쳐)"],
                            ["3", "멘토 신분증, 통장사본"],
                            ["4", "이력서"]
                        ]} />
                    </div>
                </Modal>

            </div>
        </div>
    );
}
