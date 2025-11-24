const { LogisticRegression, LinearRegression } = require("machinelearn");

function alertasKpi(resultado) {
    console.log("Cheguei no services alertasKpi()", resultado);

    const totalAlertas = resultado.length;

    const totalCriticos = resultado.filter(item => item.estado === "Crítico").length;

    const taxaCriticos = totalAlertas > 0
        ? ((totalCriticos / totalAlertas) * 100).toFixed(1)
        : "0.0";

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

    // Encontrar componente com mais alertas
    const componenteMais = Object.entries(contagemPorComponente)
        .sort((a, b) => b[1] - a[1])[0];

    const componenteMaisAlertas = componenteMais ? componenteMais[0] : null;

    return {
        totalAlertas,
        totalCriticos,
        taxaCriticos,
        diaMaisCritico,
        qtdDias,
        mediaPorDia,
        componenteMaisAlertas
    };
}

module.exports = {
    alertasKpi
};
