document.addEventListener("DOMContentLoaded", () => {

let etapa = 0;
let dados = {};

// ===== DADOS =====
const horariosFixos = [
    "08:00","09:00","10:00","11:00",
    "13:00","14:00","15:00","16:00"
];

const veiculos = [
    "Hatch","Sedã","SUV","Pickup","Moto","Van"
];

// ===== BANCO =====
let agenda = JSON.parse(localStorage.getItem("agenda")) || [];

// ===== ELEMENTOS =====
const chat = document.getElementById("chat");
const input = document.getElementById("input");

// ===== FUNÇÕES =====
function addMsg(texto, tipo) {
    const div = document.createElement("div");
    div.className = "msg " + tipo;
    div.innerHTML = texto;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

function responder(texto) {
    setTimeout(() => addMsg(texto, "bot"), 400);
}

// interpretar grau
function interpretarGrau(texto) {
    texto = texto.toLowerCase().trim();

    if (["1","2","3"].includes(texto)) return "Grau " + texto;
    if (texto.includes("1")) return "Grau 1";
    if (texto.includes("2")) return "Grau 2";
    if (texto.includes("3")) return "Grau 3";

    return null;
}

// interpretar data
function interpretarData(texto) {
    texto = texto.trim();

    if (/^\d{1,2}$/.test(texto)) {
        let hoje = new Date();
        let mes = String(hoje.getMonth() + 1).padStart(2, "0");
        let dia = texto.padStart(2, "0");
        return `${dia}/${mes}`;
    }

    return texto;
}

// interpretar horário
function interpretarHorario(texto) {
    texto = texto.trim();

    if (/^\d{1,2}$/.test(texto)) {
        let hora = texto.padStart(2, "0");
        return `${hora}:00`;
    }

    if (/^\d{2}:\d{2}$/.test(texto)) {
        return texto;
    }

    return null;
}

// gerar datas
function gerarDatas() {
    let datas = [];

    for (let i = 0; i < 5; i++) {
        let d = new Date();
        d.setDate(d.getDate() + i);

        let dia = String(d.getDate()).padStart(2, "0");
        let mes = String(d.getMonth() + 1).padStart(2, "0");

        datas.push(`${dia}/${mes}`);
    }

    return datas;
}

// horários disponíveis
function horariosDisponiveis(data) {
    let ocupados = agenda
        .filter(a => a.data === data)
        .map(a => a.horario);

    return horariosFixos.filter(h => !ocupados.includes(h));
}

// salvar
function salvarAgendamento(d) {
    agenda.push(d);
    localStorage.setItem("agenda", JSON.stringify(agenda));
}

// listar horários com risco
function listarHorarios(data) {
    let ocupados = agenda
        .filter(a => a.data === data)
        .map(a => a.horario);

    return horariosFixos.map(h => {
        return ocupados.includes(h)
            ? `<span class="ocupado">${h}</span>`
            : h;
    }).join("<br>");
}

// listar datas com risco
function listarDatas() {
    let datas = gerarDatas();

    return datas.map(d => {
        let livres = horariosDisponiveis(d);
        return livres.length === 0
            ? `<span class="ocupado">${d}</span>`
            : d;
    }).join("<br>");
}

// ===== INPUT =====
input.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        const texto = input.value.trim();
        if (!texto) return;

        addMsg(texto, "user");
        input.value = "";

        // ETAPA 0
        if (etapa === 0) {
            dados.nome = texto;
            responder("Qual serviço deseja?<br>- Lavagem<br>- Polimento");
            etapa = 1;
        }

        // ETAPA 1
        else if (etapa === 1) {
            dados.servico = texto.toLowerCase();

            if (dados.servico.includes("lavagem")) {
                responder("Escolha o tipo de lavagem:<br>- Grau 1<br>- Grau 2<br>- Grau 3");
                etapa = 2;
            } else {
                responder("Escolha o tipo de veículo:<br>" + veiculos.join("<br>"));
                etapa = 3;
            }
        }

        // ETAPA 2
        else if (etapa === 2) {
            let grau = interpretarGrau(texto);

            if (!grau) {
                responder("❌ Grau inválido. Use Grau 1, 2 ou 3.");
                return;
            }

            dados.grau = grau;
            responder("Escolha o tipo de veículo:<br>" + veiculos.join("<br>"));
            etapa = 3;
        }

        // ETAPA 3
        else if (etapa === 3) {
            dados.veiculo = texto;
            responder("Escolha uma data:<br>" + listarDatas());
            etapa = 4;
        }

        // ETAPA 4
        else if (etapa === 4) {
            let data = interpretarData(texto);

            let disponiveis = horariosDisponiveis(data);

            if (disponiveis.length === 0) {
                responder("❌ Data sem horários disponíveis.");
                return;
            }

            dados.data = data;

            responder("Horários:<br>" + listarHorarios(data));
            etapa = 5;
        }

        // ETAPA 5
        else if (etapa === 5) {
            let horario = interpretarHorario(texto);

            if (!horario) {
                responder("❌ Formato inválido. Use 13 ou 13:00.");
                return;
            }

            let disponiveis = horariosDisponiveis(dados.data);

            if (!disponiveis.includes(horario)) {
                responder("❌ Horário inválido ou ocupado.");
                return;
            }

            dados.horario = horario;
            salvarAgendamento(dados);

            responder(`
            ✅ Agendado!<br><br>
            Nome: ${dados.nome}<br>
            Serviço: ${dados.servico}<br>
            ${dados.grau ? "Lavagem: " + dados.grau + "<br>" : ""}
            Veículo: ${dados.veiculo}<br>
            Data: ${dados.data}<br>
            Horário: ${dados.horario}
            `);

            etapa = 0;
            dados = {};

            setTimeout(() => {
                responder("Novo agendamento? Digite seu nome 😊");
            }, 1500);
        }
    }
});

// início
responder("Olá! 👋 Bem-vindo à estética automotiva.");
setTimeout(() => responder("Qual seu nome?"), 800);

});