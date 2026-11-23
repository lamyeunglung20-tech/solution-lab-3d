import {createScene3D} from './scene3d.js';

const $ = id => document.getElementById(id);
const experiments = {
  milkTea: {
    photo: 'Fairwood restaurant',
    stages: [
      {art:'water', item:'HOT WATER', zh:'熱水', title:'What is hot water?', questionZh:'熱水屬於哪一類？', answer:'solvent'},
      {art:'powder', item:'MILK TEA POWDER', zh:'奶茶粉', title:'What is milk tea powder?', questionZh:'奶茶粉屬於哪一類？', answer:'solute'}
    ],
    mixArt:'mix', mixingItem:'MIXING', mixingZh:'觀察混合', mixingTitle:'Watch the mixing', mixingQuestionZh:'觀察奶茶粉加入熱水。', observation:'Observe the mixture', mixingStatus:'Milk tea powder is being poured into hot water.',
    outcomeItem:'MILK TEA', outcomeZh:'奶茶',
    explanation:'The soluble ingredients in the milk tea powder dissolved in hot water. This is a simplified model of instant milk tea.'
  },
  hospital: {
    photo: 'Hospital room',
    stages: [
      {art:'hospitalWater', item:'HOT WATER', zh:'熱水', title:'What is hot water?', questionZh:'熱水屬於哪一類？', answer:'solvent'},
      {art:'hospitalTablet', item:'CALCIUM + C TABLET', zh:'康鈣C水溶片', title:"What is the tablet's role?", questionZh:'康鈣C水溶片屬於哪一類？', answer:'solute'}
    ],
    mixArt:'hospitalMix', mixingItem:'DISSOLVING', mixingZh:'觀察溶解', mixingTitle:'Watch the tablet', mixingQuestionZh:'觀察水溶片加入熱水。', observation:'Observe the tablet', mixingStatus:'The effervescent tablet is being added to hot water.',
    outcomeItem:'AFTER MIXING', outcomeZh:'混合後',
    explanation:'The tablet’s soluble ingredients dissolved in water, forming a solution. The bubbles appeared as the tablet dissolved.'
  }
};
const roleChoices = [
  {value:'solute', en:'Solute', zh:'溶質'},
  {value:'solvent', en:'Solvent', zh:'溶劑'}
];
const outcomeChoices = [
  {value:'formed', en:'Solution formed', zh:'形成溶液'},
  {value:'not-formed', en:'Solution is not formed', zh:'沒有形成溶液'}
];
let selected = 'milkTea', stage = 0, answered = false, scene3D, transitionTimer;
try {scene3D = createScene3D($('model-wrap'));}
catch (error) {console.error('3D model unavailable', error); $('model-fallback').hidden = false; $('rotate-hint').hidden = true;}
const experiment = () => experiments[selected];

function progress(value) {
  $('progress-track').setAttribute('aria-valuenow', String(value));
  $('progress-fill').style.width = `${value / 3 * 100}%`;
}
function setSceneText(en, zh) {$('item-title').textContent = en; $('item-subtitle').textContent = zh;}
function setQuestion(en, zh) {$('question-title').textContent = en; $('question-zh').textContent = zh;}
function setStageLabel(value) {$('step-label').textContent = `${String(value).padStart(2,'0')} / 03`;}
function choices(items) {
  const group = $('choices'); group.replaceChildren(); group.hidden = false;
  for (const item of items) {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'choice'; button.dataset.choice = item.value;
    const copy = document.createElement('span'); copy.className = 'choice-copy';
    const en = document.createElement('strong'); en.textContent = item.en;
    const zh = document.createElement('small'); zh.textContent = item.zh;
    copy.append(en, zh);
    const mark = document.createElement('span'); mark.className = 'choice-status'; mark.setAttribute('aria-hidden','true');
    button.append(copy, mark); group.appendChild(button);
  }
}
function clearActions() {$('question-actions').hidden = true; $('next-button').hidden = true; $('replay-button').hidden = true;}
function showStage(index) {
  stage = index; answered = false; clearTimeout(transitionTimer);
  const q = experiment().stages[index]; setStageLabel(index + 1); progress(index);
  setSceneText(q.item, q.zh); setQuestion(q.title, q.questionZh);
  choices(roleChoices); $('observation').hidden = true; clearActions();
  $('model-wrap').classList.remove('is-mixing'); $('rotate-hint').hidden = !scene3D;
  scene3D?.setItem(q.art); $('status').textContent = '';
}
function startMix() {
  stage = 2; answered = false; setStageLabel(3); progress(2);
  const data=experiment();
  setSceneText(data.mixingItem, data.mixingZh); setQuestion(data.mixingTitle, data.mixingQuestionZh);
  $('choices').hidden = true; $('observation').hidden = false; clearActions();
  $('observation-label').textContent = data.observation;
  $('observation-percent').textContent = '0%'; $('observation-fill').style.width = '0%';
  $('rotate-hint').hidden = true; $('model-wrap').classList.add('is-mixing');
  $('status').textContent = data.mixingStatus;
  if (!scene3D) {showOutcome(); return;}
  let lastPercent = -1;
  scene3D.playMix(data.mixArt, showOutcome, value => {
    const percent = Math.round(value * 100);
    if (percent !== lastPercent) {
      $('observation-percent').textContent = `${percent}%`;
      $('observation-fill').style.width = `${percent}%`;
      lastPercent = percent;
    }
  });
}
function showOutcome() {
  const data=experiment();
  setSceneText(data.outcomeItem, data.outcomeZh); setQuestion('Did a solution form?', '有沒有形成溶液？');
  $('observation').hidden = true; choices(outcomeChoices);
  $('question-actions').hidden = false; $('replay-button').hidden = false; $('next-button').hidden = true;
  $('model-wrap').classList.remove('is-mixing'); $('rotate-hint').hidden = !scene3D;
  $('status').textContent = 'The experiment animation has finished. Choose whether a solution formed.';
}
function selectScenario(name) {
  if (!experiments[name] || selected === name) return;
  selected = name; $('result-overlay').hidden = true;
  $('app').classList.toggle('hospital', name === 'hospital');
  $('game-card').classList.toggle('hospital', name === 'hospital');
  $('photo-backdrop').setAttribute('aria-label', experiment().photo);
  document.querySelectorAll('.scenario-switch button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.scenario === name)));
  showStage(0);
}
$('choices').addEventListener('click', event => {
  const button = event.target.closest('.choice'); if (!button || answered || $('choices').hidden) return;
  const correct = stage === 2 ? 'formed' : experiment().stages[stage].answer;
  $('choices').querySelectorAll('.choice').forEach(item => item.classList.remove('wrong'));
  if (button.dataset.choice !== correct) {button.classList.add('wrong'); $('status').textContent = 'Try again.'; return;}
  button.classList.add('correct'); answered = true;
  $('choices').querySelectorAll('.choice').forEach(item => item.disabled = true);
  progress(stage + 1); $('status').textContent = 'Correct.';
  if (stage === 1) {transitionTimer = setTimeout(startMix, 650); return;}
  $('question-actions').hidden = false; $('next-button').hidden = false;
  $('next-button').textContent = stage === 2 ? 'See result' : 'Continue';
});
$('next-button').addEventListener('click', () => {
  if (!answered) return;
  if (stage === 0) showStage(1);
  else if (stage === 2) {$('result-explanation').textContent = experiment().explanation; $('result-overlay').hidden = false; $('restart-button').focus();}
});
$('replay-button').addEventListener('click', startMix);
$('restart-button').addEventListener('click', () => {$('result-overlay').hidden = true; showStage(0); window.scrollTo({top:0,behavior:'smooth'});});
document.querySelector('.scenario-switch').addEventListener('click', event => selectScenario(event.target.closest('button[data-scenario]')?.dataset.scenario));
document.addEventListener('keydown', event => {if (event.key === 'Escape' && !$('result-overlay').hidden) {$('result-overlay').hidden = true; $('next-button').focus();}});
showStage(0);
