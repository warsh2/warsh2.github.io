/* ============================================================
   Shared logic: progress tracking (localStorage) + quiz engine.
   Include this file on every page.
   ============================================================ */

const PROGRESS_KEY = 'tajweed-course-progress';

function getProgress(){
  try{
    return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {};
  }catch(e){ return {}; }
}

function markComplete(chapterId){
  const progress = getProgress();
  progress[chapterId] = true;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  paintSidebarProgress();
}

function paintSidebarProgress(){
  const progress = getProgress();
  document.querySelectorAll('.sidebar .chapter[data-chapter]').forEach(el => {
    const id = el.getAttribute('data-chapter');
    if(progress[id]){ el.classList.add('done'); }
  });
}

document.addEventListener('DOMContentLoaded', paintSidebarProgress);

/* ---------------- Lessons dropdown toggle ---------------- */
function toggleLessons(){
  const list = document.getElementById('lessons-list');
  const btn = document.getElementById('lessons-toggle-btn');
  if(!list || !btn) return;
  const isOpen = list.classList.toggle('open');
  btn.classList.toggle('open', isOpen);
  localStorage.setItem('tajweed-lessons-open', isOpen ? '1' : '0');
}

document.addEventListener('DOMContentLoaded', () => {
  const list = document.getElementById('lessons-list');
  const btn = document.getElementById('lessons-toggle-btn');
  if(list && btn && localStorage.getItem('tajweed-lessons-open') === '1'){
    list.classList.add('open');
    btn.classList.add('open');
  }
});

/* ---------------- Quiz engine ----------------
   Expects a container: <div id="quiz" data-chapter="noon-sakinah"></div>
   and a QUIZ_DATA array defined on the page before this script runs:
   const QUIZ_DATA = [
     { q: "Question text", options: ["A","B","C"], correct: 1 },
     ...
   ];
------------------------------------------------- */

function renderQuiz(containerId, quizData, chapterId){
  const container = document.getElementById(containerId);
  if(!container) return;

  let html = '';
  quizData.forEach((item, qi) => {
    html += `<div class="quiz-question" data-qindex="${qi}">
      <p class="q-text">${qi+1}. ${item.q}</p>
      <div class="options">`;
    item.options.forEach((opt, oi) => {
      html += `<label data-oi="${oi}">
        <input type="radio" name="q${qi}" value="${oi}">
        <span>${opt}</span>
      </label>`;
    });
    html += `</div></div>`;
  });

  html += `<div class="quiz-actions">
      <button class="primary" id="submit-quiz">تحقّق من إجاباتي</button>
      <span id="quiz-result"></span>
    </div>`;

  container.innerHTML = html;

  document.getElementById('submit-quiz').addEventListener('click', () => {
    let score = 0;
    quizData.forEach((item, qi) => {
      const selected = container.querySelector(`input[name="q${qi}"]:checked`);
      const labels = container.querySelectorAll(`.quiz-question[data-qindex="${qi}"] label`);
      labels.forEach(l => l.classList.remove('correct','wrong'));

      if(selected){
        const chosen = parseInt(selected.value, 10);
        const correctLabel = container.querySelector(`.quiz-question[data-qindex="${qi}"] label[data-oi="${item.correct}"]`);
        correctLabel.classList.add('correct');
        if(chosen === item.correct){
          score++;
        } else {
          const wrongLabel = container.querySelector(`.quiz-question[data-qindex="${qi}"] label[data-oi="${chosen}"]`);
          wrongLabel.classList.add('wrong');
        }
      }
    });

    const resultEl = document.getElementById('quiz-result');
    const pct = Math.round((score / quizData.length) * 100);
    resultEl.textContent = `النتيجة: ${score} من ${quizData.length} (${pct}٪)`;

    if(pct >= 70 && chapterId){
      markComplete(chapterId);
    }
  });
}
