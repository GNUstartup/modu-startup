import { useState } from 'react';
import { Info, AlertCircle, FileText, ChevronRight, ArrowRight, Plane, Box, Briefcase, UserCheck, Megaphone } from 'lucide-react';

export default function ProgramGuide() {
    const [openModal, setOpenModal] = useState<string | null>(null);

    const ProcessFlow = ({ steps }: { steps: string[] }) => (
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4 bg-indigo-50/50 p-4 rounded-lg border border-indigo-100/50">
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

    const Modal = ({ category, title, children }: { category: string, title: string, children: React.ReactNode }) => {
        if (openModal !== category) return null;
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setOpenModal(null)}>
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                    <div className="sticky top-0 bg-white border-b border-neutral-100 p-6 flex justify-between items-center z-10">
                        <h2 className="text-2xl font-bold text-neutral-900">{title} ?곸꽭 ?덈궡</h2>
                        <button onClick={() => setOpenModal(null)} className="text-neutral-500 hover:text-neutral-900 font-bold p-2 text-xl">&times;</button>
                    </div>
                    <div className="p-6">
                        {children}
                    </div>
                    <div className="border-t border-neutral-100 p-6 bg-neutral-50 flex justify-end sticky bottom-0 z-10">
                        <button onClick={() => setOpenModal(null)} className="px-6 py-2.5 bg-neutral-800 text-white rounded-xl font-bold hover:bg-neutral-900 transition-colors">
                            ?リ린
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
                    <h1 className="text-3xl font-extrabold text-neutral-900 flex justify-center items-center mb-4">
                        <Info className="w-8 h-8 mr-3 text-indigo-600" />
                        ?꾨줈洹몃옩 ?덈궡 諛??좎쓽?ы빆
                    </h1>
                    <p className="mt-4 text-base font-medium text-neutral-600 bg-indigo-50 inline-block px-6 py-3 rounded-2xl border border-indigo-100">
                        湲곗〈??移댄넚 ?묒닔 諛⑹떇? 醫낅즺?섏뿀?듬땲??<br />
                        <strong className="text-indigo-800 text-lg">?뱁럹?댁? ?곷떒 [???좎껌???묒꽦] 硫붾돱?먯꽌 ?묒닔</strong>??二쇱떆湲?諛붾엻?덈떎.
                    </p>
                </div>

                {/* Section 1: 怨듯넻 二쇱쓽?ы빆 諛?吏?먭툑 ?깃꺽 */}
                <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-3xl p-8 shadow-sm">
                    <div className="flex flex-col items-center mb-6 text-center">
                        <AlertCircle className="w-10 h-10 text-red-600 mb-3" />
                        <h2 className="text-2xl font-bold text-red-900 mb-2">[?꾨룆] 怨듯넻 二쇱쓽?ы빆</h2>
                        <p className="text-base text-red-800 font-medium">
                            ?깆옣 吏?먭툑? ?⑥닚 ?ν븰湲덉씠 ?꾨땶 <strong>?뺣?(以묎린遺) ?덉궛 '?ъ뾽鍮?</strong>?낅땲??
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-6 rounded-2xl border border-red-200 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                            <span className="text-3xl mb-3">?뮩</span>
                            <span className="text-red-800 font-bold text-lg mb-2">援щℓ????먯튃</span>
                            <span className="text-sm text-red-600 font-medium">?ъ뾽??吏곸젒 寃곗젣留?媛??br />(媛쒖씤 移대뱶/怨꾩쥖?댁껜 ?덈? 遺덇?)</span>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-red-200 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                            <span className="text-3xl mb-3">?룫</span>
                            <span className="text-red-800 font-bold text-lg mb-2">紐낆쓽 ?듭씪</span>
                            <span className="text-sm text-red-600 font-medium">紐⑤뱺 利앸튃?<br /><strong>'寃쎌긽援?┰??숆탳 ?고븰?묐젰??</strong><br />紐낆쓽 諛쒗뻾 ?꾩닔</span>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-red-200 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                            <span className="text-3xl mb-3">??/span>
                            <span className="text-red-800 font-bold text-lg mb-2">湲고븳 諛??뚯슂 ?쒓컙</span>
                            <span className="text-sm text-red-600 font-medium">12??31??吏묓뻾 留덇컧<br />?ㅼ젣 吏湲됯퉴吏 1~3二??뚯슂</span>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-red-200 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                            <span className="text-3xl mb-3">?슟</span>
                            <span className="text-red-800 font-bold text-lg mb-2">湲덉??ы빆</span>
                            <span className="text-sm text-red-600 font-medium">PC, ?명듃遺???br />?먯궛??臾쇳뭹 援щℓ 遺덇?</span>
                        </div>
                    </div>
                </div>

                {/* Section 2: 鍮꾨ぉ蹂???踰꾪듉 Grid */}
                <div>
                    <h3 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center justify-center">
                        <FileText className="w-6 h-6 mr-3 text-indigo-600" />
                        吏??鍮꾨ぉ蹂??곸꽭 ?덈궡
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">

                        <button onClick={() => setOpenModal('?щ퉬')} className="group flex flex-col items-center justify-center p-8 bg-white border-2 border-[#B3E5FC] rounded-3xl shadow-sm hover:shadow-xl hover:bg-[#E1F5FE] hover:border-[#0288D1] transition-all duration-300 transform hover:-translate-y-1">
                            <Plane className="w-12 h-12 text-[#0288D1] mb-4 group-hover:scale-110 transition-transform" />
                            <span className="text-xl font-extrabold text-[#0277BD] mb-2">?щ퉬</span>
                            <span className="text-sm text-neutral-500 font-medium text-center">利앸튃 湲곕컲 ?ㅻ퉬 吏湲?br />(異쒖옣 ?좎껌 ?덉감)</span>
                        </button>

                        <button onClick={() => setOpenModal('?щ즺鍮?)} className="group flex flex-col items-center justify-center p-8 bg-white border-2 border-[#C8E6C9] rounded-3xl shadow-sm hover:shadow-xl hover:bg-[#E8F5E9] hover:border-[#2E7D32] transition-all duration-300 transform hover:-translate-y-1">
                            <Box className="w-12 h-12 text-[#2E7D32] mb-4 group-hover:scale-110 transition-transform" />
                            <span className="text-xl font-extrabold text-[#1B5E20] mb-2">?щ즺鍮?/span>
                            <span className="text-sm text-neutral-500 font-medium text-center">?쒖젣???쒖옉 ?뚮え??br />(?꾩닔 ?쒕쪟 10醫?</span>
                        </button>

                        <button onClick={() => setOpenModal('?몄＜?⑹뿭鍮?)} className="group flex flex-col items-center justify-center p-8 bg-white border-2 border-[#E1BEE7] rounded-3xl shadow-sm hover:shadow-xl hover:bg-[#F3E5F5] hover:border-[#7B1FA2] transition-all duration-300 transform hover:-translate-y-1">
                            <Briefcase className="w-12 h-12 text-[#7B1FA2] mb-4 group-hover:scale-110 transition-transform" />
                            <span className="text-xl font-extrabold text-[#4A148C] mb-2">?몄＜?⑹뿭鍮?/span>
                            <span className="text-sm text-neutral-500 font-medium text-center">?쒖젣??怨좊룄???몃? 怨꾩빟<br />(怨꾩빟 12醫?/ ?꾨즺 6醫?</span>
                        </button>

                        <button onClick={() => setOpenModal('吏湲됱닔?섎즺')} className="group flex flex-col items-center justify-center p-8 bg-white border-2 border-[#FFECB3] rounded-3xl shadow-sm hover:shadow-xl hover:bg-[#FFF8E1] hover:border-[#F57F17] transition-all duration-300 transform hover:-translate-y-1 lg:col-start-2">
                            <UserCheck className="w-12 h-12 text-[#F57F17] mb-4 group-hover:scale-110 transition-transform" />
                            <span className="text-xl font-extrabold text-[#E65100] mb-2">吏湲됱닔?섎즺</span>
                            <span className="text-sm text-neutral-500 font-medium text-center">?꾨Ц媛 硫섑넗留?鍮꾩슜<br />諛??쒗뿕쨌?몄쬆鍮?/span>
                        </button>

                        <button onClick={() => setOpenModal('愿묎퀬?좎쟾鍮?)} className="group flex flex-col items-center justify-center p-8 bg-white border-2 border-[#B2DFDB] rounded-3xl shadow-sm hover:shadow-xl hover:bg-[#E0F2F1] hover:border-[#00695C] transition-all duration-300 transform hover:-translate-y-1">
                            <Megaphone className="w-12 h-12 text-[#00695C] mb-4 group-hover:scale-110 transition-transform" />
                            <span className="text-xl font-extrabold text-[#004D40] mb-2">愿묎퀬?좎쟾鍮?/span>
                            <span className="text-sm text-neutral-500 font-medium text-center">?덊럹?댁?, ?곸긽 ?쒖옉,<br />?띾낫臾??몄뇙 ??(9醫?</span>
                        </button>
                    </div>
                </div>

                {/* Modals */}
                <Modal category="?щ퉬" title="[?щ퉬]">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-[#0288D1] mb-2">?щ퉬 ?꾨줈?몄뒪</h3>
                            <ProcessFlow steps={['?ъ쟾?좎껌', '異쒖옣', '利앸튃?쒖텧', '?ㅻ퉬吏湲?]} />
                        </div>
                        <div className="bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden">
                            <table className="min-w-full divide-y divide-neutral-200 text-sm">
                                <thead className="bg-[#E1F5FE]">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 text-center font-bold text-[#0277BD] w-16">?쒕쾲</th>
                                        <th scope="col" className="px-4 py-3 text-left font-bold text-[#0277BD]">?꾩닔 ?쒖텧 ?쒕쪟</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-neutral-200 text-neutral-800">
                                    <tr className="hover:bg-neutral-50">
                                        <td className="px-4 py-3 text-center font-medium text-neutral-500">1</td>
                                        <td className="px-4 py-3 font-medium">異쒖옣怨꾪쉷??/td>
                                    </tr>
                                    <tr className="hover:bg-neutral-50">
                                        <td className="px-4 py-3 text-center font-medium text-neutral-500">2</td>
                                        <td className="px-4 py-3 font-medium">蹂닿퀬??/td>
                                    </tr>
                                    <tr className="hover:bg-neutral-50">
                                        <td className="px-4 py-3 text-center font-medium text-neutral-500">3</td>
                                        <td className="px-4 py-3 font-medium">?곸닔利?/td>
                                    </tr>
                                    <tr className="hover:bg-neutral-50">
                                        <td className="px-4 py-3 text-center font-medium text-neutral-500">4</td>
                                        <td className="px-4 py-3 font-medium">利앸튃?ъ쭊</td>
                                    </tr>
                                    <tr className="hover:bg-neutral-50">
                                        <td className="px-4 py-3 text-center font-medium text-neutral-500">5</td>
                                        <td className="px-4 py-3 font-medium">?좊텇利??щ낯 / ?듭옣 ?щ낯</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-start">
                            <Info className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-blue-900 font-medium">
                                <strong>[?ㅻ퉬 湲곗?]</strong> KTX ?쇰컲?? ?곕벑踰꾩뒪 ?댄븯 ?깃툒???ㅻ퉬留?吏湲됰맗?덈떎. (珥덇낵 鍮꾩슜 吏??遺덇?)
                            </p>
                        </div>
                    </div>
                </Modal>

                <Modal category="?щ즺鍮? title="[?щ즺鍮?">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-[#2E7D32] mb-2">?щ즺鍮??꾨줈?몄뒪</h3>
                            <ProcessFlow steps={['?붿슂???좎껌', '????援щℓ', '寃??, '?쒕쪟 ?쒖텧']} />
                        </div>
                        <div className="bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden">
                            <table className="min-w-full divide-y divide-neutral-200 text-sm">
                                <thead className="bg-[#E8F5E9]">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 text-center font-bold text-[#1B5E20] w-16">?쒕쾲</th>
                                        <th scope="col" className="px-4 py-3 text-left font-bold text-[#1B5E20]">?꾩닔 ?쒖텧 ?쒕쪟 (10醫?</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-neutral-200 text-neutral-800">
                                    {[
                                        "援щℓ怨꾪쉷??, "援ъ엯?붿껌??, "寃ъ쟻??, "鍮꾧탳寃ъ쟻??(2怨??댁긽)", "?곸닔利?,
                                        "寃?섏궗吏?, "?ъ뾽?먮벑濡앹쬆", "?듭옣?щ낯", "嫄곕옒紐낆꽭??, "泥?뎄??
                                    ].map((doc, idx) => (
                                        <tr key={idx} className="hover:bg-neutral-50">
                                            <td className="px-4 py-3 text-center font-medium text-neutral-500">{idx + 1}</td>
                                            <td className="px-4 py-3 font-medium">{doc}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Modal>

                <Modal category="?몄＜?⑹뿭鍮? title="[?몄＜?⑹뿭鍮?">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-[#7B1FA2] mb-2">?몄＜?⑹뿭鍮??꾨줈?몄뒪</h3>
                            <ProcessFlow steps={['?좎껌', '怨꾩빟', '吏꾪뻾', '?꾨즺蹂닿퀬']} />
                        </div>
                        <div className="bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden">
                            <table className="min-w-full divide-y divide-neutral-200 text-sm">
                                <thead className="bg-[#F3E5F5]">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 text-center font-bold text-[#4A148C] w-16">?쒕쾲</th>
                                        <th scope="col" className="px-4 py-3 text-left font-bold text-[#4A148C]">?꾩닔 ?쒖텧 ?쒕쪟 (珥?18醫?</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-neutral-200 text-neutral-800">
                                    {[
                                        "?쒖?怨꾩빟??(媛꾩씤 ?꾩닔)", "怨쇱뾽吏?쒖꽌", "寃ъ쟻??, "鍮꾧탳寃ъ쟻??,
                                        "?ъ뾽?먮벑濡앹쬆", "?듭옣?щ낯", "?멸컧利앸챸??, "援?꽭 ?꾨궔利앸챸??,
                                        "吏諛⑹꽭 ?꾨궔利앸챸??, "4?蹂댄뿕 ?꾨궔利앸챸??,
                                        "?멸툑怨꾩궛??, "?꾨즺蹂닿퀬??,
                                        "?몃??곗텧?댁뿭??, "?낆껜?대젰??(?ы듃?대━???ы븿)", "?ъ슜?멸컧怨?,
                                        "?꾨즺 ?ъ쭊 ?먮즺 (?꾨즺 ??", "寃?섑솗?몄꽌 (?꾨즺 ??", "嫄곕옒紐낆꽭??/ 泥?뎄??(?꾨즺 ??"
                                    ].map((doc, idx) => (
                                        <tr key={idx} className="hover:bg-neutral-50">
                                            <td className="px-4 py-2.5 text-center font-medium text-neutral-500">{idx + 1}</td>
                                            <td className="px-4 py-2.5 font-medium">{doc}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Modal>

                <Modal category="吏湲됱닔?섎즺" title="[吏湲됱닔?섎즺]">
                    <div className="space-y-6">

                        <div className="bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden">
                            <table className="min-w-full divide-y divide-neutral-200 text-sm">
                                <thead className="bg-[#FFF8E1]">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 text-center font-bold text-[#E65100]">硫섑넗留??꾨Ц媛 ?먭꺽 ?붽굔 (?ㅼ쓬 以??섎굹 ?댁긽 異⑹”: 6媛吏)</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-neutral-200 text-neutral-800">
                                    {[
                                        "1. 愿??遺꾩빞 諛뺤궗?숈쐞 ?뚯???,
                                        "2. ???議곌탳???댁긽 ?꾩엫 援먯썝",
                                        "3. 愿??遺꾩빞 湲곗닠?? 怨듭씤?뚭퀎?? ?몃Т?? 蹂?몄궗, 蹂由ъ궗 ??怨듭씤 ?먭꺽利??뚯???,
                                        "4. 愿??遺꾩빞 ?앹궗?숈쐞 ?뚯? ??5???댁긽 寃쎈젰??,
                                        "5. 愿??遺꾩빞 ?숈궗?숈쐞 ?뚯? ??5???댁긽 寃쎈젰??,
                                        "6. 湲고? ????ぉ怨??숇벑???먭꺽???덈떎怨??ъ뾽?⑥씠 ?몄젙?섎뒗 ??
                                    ].map((item, idx) => (
                                        <tr key={idx} className="hover:bg-neutral-50">
                                            <td className="px-4 py-2.5 font-medium">{item}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden">
                            <table className="min-w-full divide-y divide-neutral-200 text-sm">
                                <thead className="bg-[#FFF8E1]">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 text-center font-bold text-[#E65100] w-1/4">援щ텇</th>
                                        <th scope="col" className="px-4 py-3 text-left font-bold text-[#E65100]">?좎쓽?ы빆 諛??쒕쪟</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-neutral-200 text-neutral-800">
                                    <tr className="hover:bg-neutral-50">
                                        <td className="px-4 py-3 text-center font-bold text-neutral-700 bg-neutral-50/50">硫섑넗留??쒕쪟 (4醫?</td>
                                        <td className="px-4 py-3 font-medium">
                                            <ul className="list-disc list-inside space-y-1">
                                                <li>?꾩큺?숈쓽??/li>
                                                <li>?대젰??/li>
                                                <li>?먮Ц ?좎껌 諛?怨꾪쉷??/li>
                                                <li>寃곌낵蹂닿퀬??(?듭옣/?좊텇利??щ낯 ?ы븿)</li>
                                            </ul>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-neutral-50">
                                        <td className="px-4 py-3 text-center font-bold text-neutral-700 bg-neutral-50/50">?쒗뿕쨌?몄쬆鍮?(6醫?</td>
                                        <td className="px-4 py-3 font-medium">
                                            <p className="mb-2 text-sm text-neutral-500">???쒖젣???쒖옉怨?吏곸젒?곸쑝濡?愿?⑤맂 ?꾩닔 ?몄쬆 鍮꾩슜留?吏??/p>
                                            <ul className="list-disc list-inside space-y-1">
                                                <li>寃ъ쟻??/li>
                                                <li>鍮꾧탳寃ъ쟻??/li>
                                                <li>?멸툑怨꾩궛??/li>
                                                <li>泥?뎄??/li>
                                                <li>嫄곕옒紐낆꽭??/li>
                                                <li>寃곌낵(?몄쬆)?쒕튃</li>
                                            </ul>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                    </div>
                </Modal>

                <Modal category="愿묎퀬?좎쟾鍮? title="[愿묎퀬?좎쟾鍮?">
                    <div className="space-y-6">
                        <div className="bg-[#E0F2F1]/50 p-4 rounded-xl text-sm text-[#00695C] border border-[#B2DFDB]">
                            <strong>[吏??踰붿쐞 ?덈궡]</strong><br />
                            ?꾩씠???띾낫瑜??꾪븳 ?덊럹?댁? 援ъ텞, ?띾낫 ?곸긽 ?쒖옉 愿由? 釉뚮줈?덉뼱 諛??명뵆由??몄뇙 ??                        </div>

                        <div className="bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden">
                            <table className="min-w-full divide-y divide-neutral-200 text-sm">
                                <thead className="bg-[#E0F2F1]">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 text-center font-bold text-[#004D40] w-16">?쒕쾲</th>
                                        <th scope="col" className="px-4 py-3 text-left font-bold text-[#004D40]">?꾩닔 ?쒖텧 ?쒕쪟 (9醫?</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-neutral-200 text-neutral-800">
                                    {[
                                        "?멸툑怨꾩궛??,
                                        "寃ъ쟻??,
                                        "鍮꾧탳寃ъ쟻??,
                                        "嫄곕옒紐낆꽭??,
                                        "寃?섏“??,
                                        "?ъ뾽?먮벑濡앹쬆",
                                        "?듭옣?щ낯",
                                        "吏묓뻾怨꾪쉷??諛??덉쓽??,
                                        "怨쇱뾽吏?쒖꽌 諛?3??怨꾩빟??(?꾩슂 ??/ ?깃낵臾??ы븿)"
                                    ].map((doc, idx) => (
                                        <tr key={idx} className="hover:bg-neutral-50">
                                            <td className="px-4 py-2.5 text-center font-medium text-neutral-500">{idx + 1}</td>
                                            <td className="px-4 py-2.5 font-medium">{doc}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Modal>

            </div>
        </div>
    );
}
