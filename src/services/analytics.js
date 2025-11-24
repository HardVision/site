const { LogisticRegression, LinearRegression } = require("machinelearn/linear_model");

function alertasKpi(resultado) {
    console.log("Cheguei no services alertasKpi()", resultado);

    const totalAlertas = resultado.length;

    const totalCriticos = resultado.filter(item => item.estado === "Crítico").length;

    const probCriticoGeral = totalAlertas > 0 ? totalCriticos / totalAlertas : 0;

    const taxaCriticosPercent = (probCriticoGeral * 100).toFixed(1) + "%";

    const datas = resultado.map(item => item.dtHora.split(" ")[0]);

    const contagemPorDia = datas.reduce((acc, data) => {
        acc[data] = (acc[data] || 0) + 1;
        return acc;
    }, {});

    const diaMaisCritico = Object.entries(contagemPorDia)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    const qtdDias = Object.keys(contagemPorDia).length;

    const mediaPorDia = qtdDias > 0
        ? (totalAlertas / qtdDias).toFixed(1)
        : "0.0";

    const contagemPorComponente = resultado.reduce((acc, item) => {
        const tipo = item.tipoComponente || "Desconhecido";
        acc[tipo] = (acc[tipo] || 0) + 1;
        return acc;
    }, {});

    const componenteMais = Object.entries(contagemPorComponente)
        .sort((a, b) => b[1] - a[1])[0];

    const componenteMaisAlertas = componenteMais ? componenteMais[0] : null;

    const contagemPorHora = {};
    const contagemPorDiaReg = {};

    resultado.forEach(item => {
        const [data, horaStr] = item.dtHora.split(" ");
        const [dia, mes, ano] = data.split("/").map(Number);
        const [hora] = horaStr.split(":");
        const horaNum = Number(hora);

        contagemPorDiaReg[dia] = (contagemPorDiaReg[dia] || 0) + 1;
        if (!isNaN(horaNum)) {
            contagemPorHora[horaNum] = (contagemPorHora[horaNum] || 0) + 1;
        }
    });

    const valoresDias = Object.values(contagemPorDiaReg);
    const X = valoresDias.map((_, i) => [i + 1]);
    const y = valoresDias;


    let previsao = null;
        const regLinear = new LinearRegression();
        regLinear.fit(X, y);
        previsao = regLinear.predict([[X.length + 1]])[0];


    const piorHora = Object.entries(contagemPorHora)
        .sort((a, b) => b[1] - a[1])[0];

    const periodoMaiorRisco = piorHora ? Number(piorHora[0]) : null;

    return {
        totalAlertas,
        totalCriticos,
        probCriticoGeral,
        taxaCriticosPercent, 
        diaMaisCritico,
        qtdDias,
        mediaPorDia,
        componenteMaisAlertas,
        periodoMaiorRisco,
        previsao
    };
}

module.exports = {
    alertasKpi
};
