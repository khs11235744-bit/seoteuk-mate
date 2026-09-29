/* Seoteuk Mate v3.9 Lite - scanner extracted from official-2026.js */
(function(){'use strict';
const CHECKS=[
  {id:'lang',severity:'hard',title:'공인어학시험·성적·수상',rx:/(TOEIC|TOEFL|TEPS|IELTS|토익|토플|텝스|아이엘츠|공인어학시험)/i,why:'공인어학시험 참여사실·성적·수상은 기재금지'},
  {id:'contest',severity:'review',title:'대회·수상 관련 표현',rx:/(교내\s*대회|교외\s*대회|대회\s*(참가|참여|수상)|수상\s*(실적|경력)|최우수상|우수상|금상|은상|동상)/i,why:'교내·외 대회 참여사실과 성적·수상실적은 세특 등에 기재 불가'},
  {id:'external-award',severity:'hard',title:'교외상',rx:/(표창장|감사장|공로상|교외상)/,why:'교외 기관·단체의 수상은 기재금지'},
  {id:'cert-exam',severity:'hard',title:'인증·자격 시험',rx:/(인증시험|한국사능력검정시험|한능검|컴퓨터활용능력|정보처리기사|자격증\s*(취득|합격)|자격증명)/i,why:'인증시험 및 자격증 명칭·취득 사실은 제한됨'},
  {id:'mock',severity:'hard',title:'모의고사·전국연합 성적',rx:/(모의고사|전국연합학력평가|학력평가|모평|학평).{0,20}(점수|등급|백분위|석차|성적)?/i,why:'모의고사·전국연합학력평가 성적 관련 내용은 기재금지'},
  {id:'paper',severity:'hard',title:'논문 등재·발표 실적',rx:/(논문|학회지).{0,18}(투고|게재|등재|발표)|(학회).{0,15}(발표|논문)/i,why:'논문 투고·등재·학회 발표 사실은 기재금지'},
  {id:'bookpub',severity:'hard',title:'도서 출간 실적',rx:/(도서|책).{0,10}(출간|출판)|출간\s*사실/i,why:'도서출간 사실은 기재금지'},
  {id:'ip',severity:'hard',title:'지식재산권 실적',rx:/(특허|실용신안|상표|디자인).{0,12}(출원|등록)/i,why:'지식재산권 출원·등록 사실은 기재금지'},
  {id:'abroad',severity:'hard',title:'해외 활동실적',rx:/(해외|국외).{0,14}(봉사|어학연수|캠프|활동|대회)/i,why:'해외 활동실적 관련 내용은 기재금지'},
  {id:'parent',severity:'hard',title:'부모·친인척 사회경제적 지위',rx:/(아버지|어머니|부모|부친|모친|친인척).{0,25}(교수|의사|변호사|공무원|교사|대표|사장|직장|직위|직업)/i,why:'부모·친인척의 사회·경제적 지위 암시 내용은 기재금지'},
  {id:'scholarship',severity:'hard',title:'장학생·장학금',rx:/(장학생|장학금)/,why:'장학생·장학금 관련 내용은 기재금지'},
  {id:'univ',severity:'review',title:'구체적인 대학명',rx:/([가-힣A-Za-z]{2,20}(대학교|대학)|서울대|연세대|고려대|성균관대|한양대|포항공대|POSTECH|KAIST)/i,why:'구체적인 특정 대학명은 기재금지. 단, 도서명·저자명에 포함된 기관명 등은 2026 예외 규정을 확인'},
  {id:'institution',severity:'review',title:'기관명·상호명',rx:/(유네스코|OECD|UN|IMF|통계청|국회도서관|구글|네이버|삼성|카카오|유튜브|오픈AI|OpenAI|마이크로소프트|Microsoft)/i,why:'구체적인 기관명·상호명은 원칙적으로 기재금지. 교육관련기관 및 도서명·저자명 예외 등 맥락 확인 필요'},
  {id:'lecturer',severity:'hard',title:'강사명',rx:/강사\s*[가-힣]{2,4}(?:\s|님|의|가|이|은|는)/,why:'강사명은 기재금지'},
  {id:'mooc',severity:'hard',title:'온라인 공개강좌',rx:/(K-?MOOC|MOOC|KOCW)/i,why:'K-MOOC·MOOC·KOCW 관련 사항은 세특 입력불가'},
  {id:'after',severity:'hard',title:'방과후학교 활동',rx:/방과후\s*학교|방과후학교/,why:'방과후학교 활동은 세특 입력불가'},
  {id:'schoolblind',severity:'review',title:'학교 식별정보',rx:/(포항고등학교|포항고|[가-힣]{2,12}고등학교|학교\s*축제|재단명|학교\s*별칭)/,why:'학교명·재단명·학교 축제명·학교 별칭 등 고교를 특정할 수 있는 정보는 블라인드 규정 점검 필요'}
];

function officialScan(text){
  text=String(text||'');const out=[];
  for(const c of CHECKS){const m=text.match(c.rx);if(m)out.push({...c,match:m[0]});}
  const latin=(text.match(/[A-Za-z]{4,}/g)||[]).filter(x=>!/^(CEO|PAPS|SNS|PPT|POP|UCC)$/i.test(x));
  if(latin.length>=3)out.push({id:'foreign',severity:'review',title:'영문·외국어 사용 점검',match:[...new Set(latin)].slice(0,6).join(', '),why:'한글 입력 원칙에 따라 부득이한 고유명사·일반화된 명사·단위인지 확인'});
  if(/[①②③④⑤⑥⑦⑧⑨⑩★▶→◆■□●○]/.test(text))out.push({id:'symbols',severity:'review',title:'특수문자·문단기호',match:'특수문자',why:'서술형 항목의 특수문자·문단구분 기호 사용은 지양'});
  return out;
}
window.scanOfficial2026=officialScan;
window.__SEOTEUK_OFFICIAL_LITE__=true;
})();
