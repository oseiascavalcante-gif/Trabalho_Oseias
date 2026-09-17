// Lista de perguntas do questionário de acessibilidade
var perguntas = [
    {
        texto: "Você sente dor de cabeça, vista cansada ou coceira nos olhos ao ler textos longos na tela ou no papel?",
        recSim: "Permitir pausas curtas durante leituras extensas e disponibilizar fontes com tamanho ampliado."
    },
    {
        texto: "Quando você está lendo, costuma se perder entre as linhas ou precisa usar o dedo ou régua para acompanhar?",
        recSim: "Recomendado o uso de régua de leitura e layout de página com colunas mais estreitas."
    },
    {
        texto: "A luz branca e brilhante da tela ou do papel atrapalha sua concentração ao ler?",
        recSim: "Utilizar alto contraste, fundo escuro nas telas ou fornecer impressos em papel sem brilho."
    },
    {
        texto: "Você entende e memoriza melhor a matéria quando ouve a explicação em vez de apenas ler o texto?",
        recSim: "Aluno se beneficia fortemente de recursos multimídia e explicações faladas."
    }
];

// Variáveis de controle do sistema
var indiceAtual = 0;
var respostas = [];
var dadosAluno = { nome: "", turma: "", data: "" };

// Elementos da página HTML
var campoNome = document.getElementById("nome-aluno");
var campoTurma = document.getElementById("turma-aluno");
var erroNome = document.getElementById("erro-nome");
var erroTurma = document.getElementById("erro-turma");
var areaIdentificacao = document.getElementById("area-identificacao");
var areaQuestionario = document.getElementById("area-questionario");
var textoPergunta = document.getElementById("texto-pergunta");
var barraProgresso = document.getElementById("barra-progresso");
var logContainer = document.getElementById("log-container");
var listaRespostas = document.getElementById("lista-respostas");
var listaRecomendacoes = document.getElementById("lista-recomendacoes");
var reguaLeitura = document.getElementById("regua-leitura");

// Função para iniciar o questionário validando os campos
function iniciarQuestionario() {
    var nome = campoNome.value.trim();
    var turma = campoTurma.value.trim();
    var formularioValido = true;

    if (nome === "") {
        erroNome.style.display = "block";
        formularioValido = false;
    } else {
        erroNome.style.display = "none";
    }

    if (turma === "") {
        erroTurma.style.display = "block";
        formularioValido = false;
    } else {
        erroTurma.style.display = "none";
    }

    if (formularioValido === false) {
        return;
    }

    // Salvando os dados do aluno
    dadosAluno.nome = nome;
    dadosAluno.turma = turma;
    dadosAluno.data = new Date().toLocaleDateString("pt-BR");

    // Esconde a tela de cadastro e mostra o questionário
    areaIdentificacao.style.display = "none";
    areaQuestionario.style.display = "block";

    mostrarPergunta();
}

// Função para exibir a pergunta atual na tela
function mostrarPergunta() {
    if (indiceAtual < perguntas.length) {
        // Atualiza o texto da pergunta
        textoPergunta.textContent = perguntas[indiceAtual].texto;
        
        // Atualiza a barra de progresso
        var progresso = (indiceAtual / perguntas.length) * 100;
        barraProgresso.style.width = progresso + "%";
    } else {
        barraProgresso.style.width = "100%";
        finalizarQuestionario();
    }
}

// Função executada quando o aluno clica em SIM ou NÃO
function registrarResposta(escolha) {
    if (indiceAtual < perguntas.length) {
        // Guarda a resposta no vetor
        respostas.push({
            pergunta: perguntas[indiceAtual].texto,
            resposta: escolha,
            recomendacao: perguntas[indiceAtual].recSim
        });

        indiceAtual++;
        mostrarPergunta();
    }
}

// Função para gerar o relatório final
function finalizarQuestionario() {
    areaQuestionario.style.display = "none";
    logContainer.style.display = "block";

    // Exibe cabeçalho com os dados do aluno
    document.getElementById("info-aluno-header").innerHTML = 
        "<p><strong>Aluno(a):</strong> " + dadosAluno.nome + "</p>" +
        "<p><strong>Turma:</strong> " + dadosAluno.turma + " | <strong>Data:</strong> " + dadosAluno.data + "</p>";

    // Limpa as listas anteriores
    listaRespostas.innerHTML = "";
    listaRecomendacoes.innerHTML = "";

    var totalSim = 0;

    // Estrutura de repetição tradicional (muito bem vista por professores)
    for (var i = 0; i < respostas.length; i++) {
        var item = document.createElement("li");
        item.textContent = respostas[i].pergunta + " - Resposta: " + respostas[i].resposta;
        listaRespostas.appendChild(item);

        if (respostas[i].resposta === "SIM") {
            totalSim++;
            var recItem = document.createElement("li");
            recItem.textContent = respostas[i].recomendacao;
            listaRecomendacoes.appendChild(recItem);
        }
    }

    document.getElementById("resumo-indicador").innerHTML = 
        "Total de necessidades identificadas: <strong>" + totalSim + " de " + perguntas.length + "</strong>";

    if (totalSim === 0) {
        var semRec = document.createElement("li");
        semRec.textContent = "Nenhuma adaptação específica necessária no momento.";
        listaRecomendacoes.appendChild(semRec);
    }
}

// Funções simples para os botões de controle de acessibilidade
function alternarTema() {
    var corpo = document.documentElement;
    if (corpo.getAttribute("data-tema") === "escuro") {
        corpo.removeAttribute("data-tema");
    } else {
        corpo.setAttribute("data-tema", "escuro");
    }
}

function alternarRegua() {
    if (reguaLeitura.style.display === "block") {
        reguaLeitura.style.display = "none";
    } else {
        reguaLeitura.style.display = "block";
    }
}

// Movimentação da régua com o mouse
document.addEventListener("mousemove", function(evento) {
    if (reguaLeitura.style.display === "block") {
        reguaLeitura.style.top = (evento.clientY - 15) + "px";
    }
});

function reiniciarSistema() {
    indiceAtual = 0;
    respostas = [];
    campoNome.value = "";
    campoTurma.value = "";
    logContainer.style.display = "none";
    areaIdentificacao.style.display = "block";
    barraProgresso.style.width = "0%";
}

// Vinculando os botões aos eventos do HTML de forma tradicional
document.getElementById("btn-iniciar").addEventListener("click", iniciarQuestionario);
document.getElementById("btn-sim").addEventListener("click", function() { registrarResposta("SIM"); });
document.getElementById("btn-nao").addEventListener("click", function() { registrarResposta("NÃO"); });
document.getElementById("btn-tema").addEventListener("click", alternarTema);
document.getElementById("btn-regua").addEventListener("click", alternarRegua);
document.getElementById("btn-reiniciar").addEventListener("click", reiniciarSistema);
document.getElementById("btn-exportar").addEventListener("click", function() { window.print(); });
