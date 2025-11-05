// LÓGICA DA APLICAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    const questionGrid = document.getElementById('question-grid');
    const filterButtons = document.querySelectorAll('.filter-btn');

    let questionData = [];

    // Carregar dados salvos do localStorage
    function loadData() {
        const savedData = localStorage.getItem('enemReviewData');
        // 'questions' é a variável global do arquivo questions.js
        const sourceData = questions; 
        
        if (savedData) {
            // Se houver dados salvos, mescla com os dados-fonte para
            // caso o questions.js tenha sido atualizado com mais questões.
            const savedQuestions = JSON.parse(savedData);
            const savedMap = new Map(savedQuestions.map(q => [q.id, q]));
            
            questionData = sourceData.map(q => {
                const savedQ = savedMap.get(q.id);
                return savedQ ? savedQ : q; // Usa o salvo (com status) se existir
            });

        } else {
            questionData = sourceData; // Usa os dados-fonte
        }
    }
    
    // Salvar dados no localStorage
    function saveData() {
        localStorage.setItem('enemReviewData', JSON.stringify(questionData));
    }

    // Renderizar os cards na tela
    function renderQuestions(filter = 'all') {
        questionGrid.innerHTML = ''; // Limpa o grid
        const filteredQuestions = filter === 'all' 
            ? questionData 
            : questionData.filter(q => q.area === filter);

        filteredQuestions.forEach(q => {
            // Cria o card
            const card = document.createElement('div');
            card.className = 'card';
            card.dataset.id = q.id;
            card.dataset.area = q.area;

            // Cria as opções de resposta
            let optionsHTML = '';
            q.options.forEach(opt => {
                let itemClass = 'option-item';
                if (opt.letter === q.userAnswer) {
                    itemClass += ' user';
                }
                if (opt.letter === q.correctAnswer) {
                    itemClass += ' correct';
                }
                optionsHTML += `<li class="${itemClass}"><b>(${opt.letter})</b> ${opt.text}</li>`;
            });
            
            // Popula o card com a estrutura completa
            card.innerHTML = `
                <div class="card-header">
                    <h3>Q${q.number}: ${q.topic}</h3>
                    <span class="q-subject">${q.area_name}</span>
                </div>
                <div class="card-body">
                    <div class="question-content">${q.questionText}</div>
                    <ol class="question-options">${optionsHTML}</ol>
                    
                    <div class="analysis-block">
                        <h4>❌ Diagnóstico do Erro</h4>
                        <p>${q.analysis}</p>
                    </div>
                    <div class="concept-block">
                        <h4>💡 Conceito-Chave para Revisar</h4>
                        <p>${q.concept}</p>
                    </div>
                </div>
                <div class="card-footer">
                    <button class="status-btn">Marcar como Revisado</button>
                </div>
            `;
            
            // Atualiza o status do botão
            const statusBtn = card.querySelector('.status-btn');
            updateButtonStatus(statusBtn, q.status);

            // Adiciona o card ao grid
            questionGrid.appendChild(card);
        });
    }
    
    function updateButtonStatus(button, status) {
        if (status === 'reviewed') {
            button.classList.add('reviewed');
            button.textContent = 'Revisado';
        } else {
            button.classList.remove('reviewed');
            button.textContent = 'Marcar como Revisado';
        }
    }
    
    // Lidar com cliques nos botões de filtro
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            renderQuestions(button.dataset.filter);
        });
    });

    // Lidar com cliques nos botões de status (delegação de evento)
    questionGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('status-btn')) {
            const card = e.target.closest('.card');
            const questionId = card.dataset.id;
            const question = questionData.find(q => q.id === questionId);

            question.status = question.status === 'reviewed' ? 'not-reviewed' : 'reviewed';
            updateButtonStatus(e.target, question.status);
            saveData();
        }
    });

    // Tema Dark/Light
    const toggleDark = document.getElementById('toggle-dark');
    if (toggleDark) {
        toggleDark.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            // Salva preferência
            localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
        });
        // Aplica preferência salva
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark-mode');
        }
    }

    // Iniciar a aplicação
    loadData();
    renderQuestions();
});