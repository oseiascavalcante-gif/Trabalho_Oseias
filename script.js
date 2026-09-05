const perguntas = [
    {
        id: 'cansaco',
        texto: "Você sente dor de cabeça, vista cansada ou coceira nos olhos ao ler textos longos na tela ou no papel?",
        recSim: "Permitir pausas curtas durante leituras extensas e disponibilizar fontes com tamanho ampliado ou espaçamento 1.5x.",
        recNao: "Conforto visual adequado para extensões padrão de texto."
    },
    {
        id: 'rastreamento',
        texto: "Quando você está lendo, costuma se perder entre as linhas ou precisa usar o dedo/régua para acompanhar o texto?",
        recSim: "Recomendado o uso de régua de leitura (física/digital) e layout de página com colunas mais estreitas ou margens amplas.",
        recNao: "Rastreamento visual contínuo sem necessidade de guias físicas."
    },
    {
        id: 'luz',
        texto: "A luz branca e brilhante da tela ou do papel atrapalha sua concentração ao ler?",
        recSim: "Utilizar alto contraste, fundo escuro/sépias nas telas ou fornecer impressos em papel sem brilho (offset).",
        recNao: "Adaptação normal a ambientes com iluminação brilhante."
    },
    {
        id: 'audio',
        texto: "Você entende e memoriza melhor a matéria quando ouve a explicação em áudio em vez de apenas ler o texto?",
        recSim: "Aluno se beneficia fortemente de recursos multimídia, leitor de voz sintetizada ou áudios complementares.",
        recNao: "Preferência ou boa assimilação por meio da leitura textual direta."
    }
];

let indiceAtual = 0;
let respostas = [];
let encerrado = false; 
let percentualZoom = 100;
let velocidadeVoz = 1.0;
let dadosAluno = { nome: '', turma: '', data: '' };

const elementoPergunta = document.getElementById('texto-pergunta');
const areaIdentificacao = document.getElementById('area-identificacao');
const areaQuestionario = document.getElementById('area-questionario');
const logContainer = document.getElementById('log-container');
const listaRespostas = document.getElementById('lista-respostas');
const listaRecomendacoes = document.getElementById('lista-recomendacoes');
const barraProgresso = document.getElementById('barra-progresso');
const btnTema = document.getElementById('btn-tema');
const btnVelocidade = document.getElementById('btn-velocidade');
const regua = document.getElementById('regua-leitura');
const erroNome = document.getElementById('erro-nome');
const erroTurma = document.getElementById('erro-turma');

let audioCtx;

function inicializarAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function tocarSomSintetizado(tipo) {
    inicializarAudio();
    const oscilador = audioCtx.createOscillator();
    const ganho = audioCtx.createGain();

    oscilador.connect(ganho);
    ganho.connect(audioCtx.destination);

    if (tipo === 'sim') {
        oscilador.frequency.setValueAtTime(520, audioCtx.currentTime);
        ganho.gain.setValueAtTime(0.08, audioCtx.currentTime);
        ganho.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
        oscilador.start();
        oscilador.stop(audioCtx.currentTime + 0.15);
    } else if (tipo === 'nao') {
        oscilador.frequency.setValueAtTime(260, audioCtx.currentTime);
        ganho.gain.setValueAtTime(0.08, audioCtx.currentTime);
        ganho.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
        oscilador.start();
        oscilador.stop(audioCtx.currentTime + 0.2);
    } else if (tipo === 'concluido') {
        oscilador.frequency.setValueAtTime(440, audioCtx.currentTime);
        oscilador.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3);
        ganho.gain.setValueAtTime(0.08, audioCtx.currentTime);
        ganho.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        oscilador.start();
        oscilador.stop(audioCtx.currentTime + 0.3);
    }
}

document.addEventListener('mousemove', (e) => {
    if (regua.style.display === 'block') {
        regua.style.top = `${e.clientY - 20}px`;
    }
});

function alternarReguaLeitura() {
    const ativa = regua.style.display === 'block';
    regua.style.display = ativa ? 'none' : 'block';
    falarTexto(!ativa ? "Régua ativada" : "Régua desativada");
}

function alternarFonteDislexia() {
    document.body.classList.toggle('fonte-dislexia');
    const ativa = document.body.classList.contains('fonte-dislexia');
    localStorage.setItem('fonteDislexia', ativa ? 'true' : 'false');
    falarTexto(ativa ? "Fonte para dislexia ativada" : "Fonte padrão ativada");
}

function alterarZoom(delta) {
    percentualZoom = Math.min(Math.max(percentualZoom + delta, 80), 150);
    document.documentElement.style.setProperty('--tamanho-base', `${percentualZoom}%`);
    falarTexto(`Tamanho ${percentualZoom} porcento`);
}

function redefinirZoom() {
    percentualZoom = 100;
    document.documentElement.style.setProperty('--tamanho-base', '100%');
    falarTexto("Tamanho padrão restaurado");
}

function alternarVelocidadeVoz() {
    if (velocidadeVoz === 1.0) velocidadeVoz = 1.25;
    else if (velocidadeVoz === 1.25) velocidadeVoz = 1.5;
    else velocidadeVoz = 1.0;

    btnVelocidade.textContent = `Voz: ${velocidadeVoz}x`;
    falarTexto(`Velocidade da voz ${velocidadeVoz}`);
}

function alternarTema() {
    const temaAtual = document.documentElement.getAttribute('data-tema');
    if (temaAtual === 'escuro') {
        document.documentElement.removeAttribute('data-tema');
        btnTema.textContent = '🌙 Escuro';
        localStorage.setItem('temaEscuro', 'false');
        falarTexto("Modo claro ativado");
    } else {
        document.documentElement.setAttribute('data-tema', 'escuro');
        btnTema.textContent = '☀️ Claro';
        localStorage.setItem('temaEscuro', 'true');
        falarTexto("Modo escuro ativado");
    }
}

function falarTexto(texto) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const mensagem = new SpeechSynthesisUtterance(texto);
        mensagem.lang = 'pt-BR';
        mensagem.rate = velocidadeVoz;
        window.speechSynthesis.speak(mensagem);
    }
}

function iniciarQuestionario() {
    const nomeInput = document.getElementById('nome-aluno').value.trim();
    const turmaInput = document.getElementById('turma-aluno').value.trim();

    let valido = true;

    if (nomeInput === '') {
        erroNome.style.display = 'block';
        valido = false;
    } else {
        erroNome.style.display = 'none';
    }

    if (turmaInput === '') {
        erroTurma.style.display = 'block';
        valido = false;
    } else {
        erroTurma.style.display = 'none';
    }

    if (!valido) {
        if (nomeInput === '') {
            document.getElementById('nome-aluno').focus();
        } else {
            document.getElementById('turma-aluno').focus();
        }
        falarTexto("Por favor, preencha o nome e a turma do aluno para continuar.");
        return;
    }

    dadosAluno.nome = nomeInput;
    dadosAluno.turma = turmaInput;
    dadosAluno.data = new Date().toLocaleDateString('pt-BR');

    areaIdentificacao.style.display = 'none';
    areaQuestionario.style.display = 'block';

    atualizarPergunta();
}

function atualizarPergunta() {
    if (indiceAtual < perguntas.length) {
        const pct = ((indiceAtual) / perguntas.length) * 100;
        barraProgresso.style.width = `${pct}%`;
        
        const proxima = perguntas[indiceAtual].texto;
        elementoPergunta.textContent = proxima;
        falarTexto(proxima);
    } else {
        barraProgresso.style.width = '100%';
        exibirResultados();
    }
}

function registrarResposta(resposta) {
    if (indiceAtual < perguntas.length && !encerrado) {
        tocarSomSintetizado(resposta === 'SIM' ? 'sim' : 'nao');
        respostas.push({ 
            item: perguntas[indiceAtual], 
            resposta: resposta 
        });
        indiceAtual++;
        setTimeout(atualizarPergunta, 150);
    }
}

function exibirResultados() {
    encerrado = true;
    tocarSomSintetizado('concluido');
    areaQuestionario.style.display = 'none';
    logContainer.style.display = 'block';
    logContainer.focus();
    
    document.getElementById('info-aluno-header').innerHTML = `
        <p><strong>Aluno(a):</strong> ${dadosAluno.nome}</p>
        <p><strong>Turma:</strong> ${dadosAluno.turma} | <strong>Data da Avaliação:</strong> ${dadosAluno.data}</p>
    `;

    const totalSim = respostas.filter(r => r.resposta === 'SIM').length;
    document.getElementById('resumo-indicador').innerHTML = `
        📊 Diagnóstico Pedagógico: <strong>${totalSim} de ${perguntas.length}</strong> necessidades de adaptação identificadas.
    `;

    listaRespostas.innerHTML = '';
    listaRecomendacoes.innerHTML = '';
    
    falarTexto("Questionário concluído. O relatório pedagógico está pronto.");
    
    respostas.forEach((res) => {
        const liResp = document.createElement('li');
        liResp.innerHTML = `<strong>${res.item.texto}</strong><br>Resposta: <strong>${res.resposta}</strong>`;
        listaRespostas.appendChild(liResp);

        if (res.resposta === 'SIM') {
            const liRec = document.createElement('li');
            liRec.textContent = res.item.recSim;
            listaRecomendacoes.appendChild(liRec);
        }
    });

    if (listaRecomendacoes.children.length === 0) {
        const liRec = document.createElement('li');
        liRec.textContent = "Nenhuma adaptação específica identificada. Manter configurações de ensino padrão.";
        listaRecomendacoes.appendChild(liRec);
    }
}

function reiniciarAvaliacao() {
    indiceAtual = 0;
    respostas = [];
    encerrado = false;
    
    document.getElementById('nome-aluno').value = '';
    document.getElementById('turma-aluno').value = '';
    erroNome.style.display = 'none';
    erroTurma.style.display = 'none';
    barraProgresso.style.width = '0%';
    
    logContainer.style.display = 'none';
    areaIdentificacao.style.display = 'flex';
    falarTexto("Nova avaliação iniciada.");
}

// Vinculando Eventos aos Botões do HTML
document.getElementById('btn-zoom-menos').addEventListener('click', () => alterarZoom(-10));
document.getElementById('btn-zoom-reset').addEventListener('click', redefinirZoom);
document.getElementById('btn-zoom-mais').addEventListener('click', () => alterarZoom(10));
document.getElementById('btn-fonte-dislexia').addEventListener('click', alternarFonteDislexia);
document.getElementById('btn-regua').addEventListener('click', alternarReguaLeitura);
document.getElementById('btn-velocidade').addEventListener('click', alternarVelocidadeVoz);
document.getElementById('btn-tema').addEventListener('click', alternarTema);
document.getElementById('btn-iniciar').addEventListener('click', iniciarQuestionario);
document.getElementById('btn-nao').addEventListener('click', () => registrarResposta('NÃO'));
document.getElementById('btn-sim').addEventListener('click', () => registrarResposta('SIM'));
document.getElementById('btn-exportar').addEventListener('click', () => window.print());
document.getElementById('btn-reiniciar').addEventListener('click', reiniciarAvaliacao);

window.addEventListener('keydown', function(e) {
    if (encerrado || areaQuestionario.style.display === 'none') return;
    const tecla = e.key.toLowerCase();
    if (tecla === 's' || e.key === 'ArrowRight') registrarResposta('SIM');
    if (tecla === 'n' || e.key === 'ArrowLeft') registrarResposta('NÃO');
});

window.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('temaEscuro') === 'true') {
        document.documentElement.setAttribute('data-tema', 'escuro');
        btnTema.textContent = '☀️ Claro';
    }
    if (localStorage.getItem('fonteDislexia') === 'true') {
        document.body.classList.add('fonte-dislexia');
    }
});
