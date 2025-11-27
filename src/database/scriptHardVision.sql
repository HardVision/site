DROP DATABASE IF EXISTS hardvision;
CREATE DATABASE hardvision;
USE hardvision;


CREATE TABLE endereco (
    idEndereco INT PRIMARY KEY AUTO_INCREMENT,
    cep CHAR(8) NOT NULL,
    cidade VARCHAR(45) NOT NULL,
    logradouro VARCHAR(45) NOT NULL,
    numero VARCHAR(45) NOT NULL,
    uf CHAR(2) NOT NULL,
    complemento VARCHAR(45)
);

CREATE TABLE empresa (
    idEmpresa INT PRIMARY KEY AUTO_INCREMENT,
    fkEndereco INT,
    razaoSocial VARCHAR(45) NOT NULL,
    nomeFantasia VARCHAR(45) NOT NULL,
    cnpj CHAR(14) NOT NULL UNIQUE,
    token CHAR(5) NOT NULL,
    FOREIGN KEY (fkEndereco) REFERENCES endereco(idEndereco) ON DELETE CASCADE
);


CREATE TABLE tipo (
    idTipo INT PRIMARY KEY AUTO_INCREMENT,
    permissao VARCHAR(45) NOT NULL
);

CREATE TABLE usuario (
    idFuncionario INT PRIMARY KEY AUTO_INCREMENT,
    fkEmpresa INT,
    fkTipo INT,
    nome VARCHAR(45) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    cpf CHAR(11) NOT NULL UNIQUE,
    telefone CHAR(13),
    FOREIGN KEY (fkEmpresa) REFERENCES empresa(idEmpresa) ON DELETE CASCADE,
    FOREIGN KEY (fkTipo) REFERENCES tipo(idTipo) ON DELETE CASCADE
);

CREATE TABLE auditoria (
	idAuditoria INT PRIMARY KEY AUTO_INCREMENT,
    fkFuncionario INT,
    fkEmpresa INT,
    tipoAcao VARCHAR(45) NOT NULL,
    dtHora DATETIME DEFAULT CURRENT_TIMESTAMP,
    descricao VARCHAR(255) NOT NULL,
    FOREIGN KEY (fkFuncionario) REFERENCES usuario(idFuncionario) ON DELETE CASCADE,
    FOREIGN KEY (fkEmpresa) REFERENCES empresa(idEmpresa) ON DELETE CASCADE
);
    

CREATE TABLE redefinicaoSenha (
    idRedefSenha INT PRIMARY KEY AUTO_INCREMENT,
    fkUsuario INT,
    token CHAR(5) UNIQUE NOT NULL,
    expiracao DATETIME NOT NULL,
    utilizacao TINYINT DEFAULT 0,
    FOREIGN KEY (fkUsuario) REFERENCES usuario(idFuncionario) ON DELETE CASCADE
);


CREATE TABLE incidente (
    idIncidente INT PRIMARY KEY AUTO_INCREMENT,
    fkFuncionario INT,
    fkEmpresa INT,
    titulo VARCHAR(45) NOT NULL,
    descricao VARCHAR(255),
    dtIncidente DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fkFuncionario) REFERENCES usuario(idFuncionario) ON DELETE CASCADE,
    FOREIGN KEY (fkEmpresa) REFERENCES empresa(idEmpresa) ON DELETE CASCADE
);



CREATE TABLE sistemaOperacional (
    idSistema INT PRIMARY KEY AUTO_INCREMENT,
    tipo VARCHAR(45) NOT NULL,
    versao VARCHAR(50),
    distribuicao VARCHAR(45)
);


CREATE TABLE maquina (
    idMaquina INT PRIMARY KEY AUTO_INCREMENT,
    fkEmpresa INT,
    fkSistema INT,
    macAddress CHAR(17) NOT NULL UNIQUE,
    localizacao VARCHAR(45),
    uptime BIGINT,
    FOREIGN KEY (fkEmpresa) REFERENCES empresa(idEmpresa) ON DELETE CASCADE,
    FOREIGN KEY (fkSistema) REFERENCES sistemaOperacional(idSistema) ON DELETE CASCADE
);


CREATE TABLE processo (
    idProcesso INT PRIMARY KEY AUTO_INCREMENT,
    fkMaquina INT NOT NULL,
    usuario varchar(45),
    pid varchar(45) NOT NUll,
    nome VARCHAR(225) NOT NULL,
    usoCPU DECIMAL(10,2),
    discoLido DECIMAL(10,2),
    discoRecebido DECIMAL(10, 2),
    usoRam DECIMAL(10,2),
    FOREIGN KEY (fkMaquina) REFERENCES maquina(idMaquina) ON DELETE CASCADE
);


CREATE TABLE metricaComponente (
    idMetrica INT PRIMARY KEY AUTO_INCREMENT,
    fkEmpresa INT,
    nome VARCHAR(45) NOT NULL,
    medida VARCHAR(45) NOT NULL,
    min FLOAT NOT NULL,
    max FLOAT NOT NULL,
    unidade VARCHAR(20),
    FOREIGN KEY (fkEmpresa) REFERENCES empresa(idEmpresa) ON DELETE CASCADE
);

CREATE TABLE componente (
    idComponente INT PRIMARY KEY AUTO_INCREMENT,
    tipo VARCHAR(45) NOT NULL,
    modelo VARCHAR(45),
    fabricante VARCHAR(45),
    capacidade VARCHAR(45),
    fkMetrica INT,
    FOREIGN KEY (fkMetrica) REFERENCES metricaComponente(idMetrica) ON DELETE CASCADE
);

CREATE TABLE alertaComponente (
    idAlerta INT PRIMARY KEY AUTO_INCREMENT,
    fkMetrica INT,
    dtHora DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(45) NOT NULL,
    FOREIGN KEY (fkMetrica) REFERENCES metricaComponente(idMetrica) ON DELETE CASCADE
);

CREATE TABLE logMonitoramento (
    idMonitoramento INT PRIMARY KEY AUTO_INCREMENT,
    fkMaquina INT,
    fkComponente INT,
    fkMetrica INT,
    fkAlerta INT,
    valor INT,
    descricao VARCHAR(225),
    dtHora DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fkMaquina) REFERENCES maquina(idMaquina) ON DELETE CASCADE,
    FOREIGN KEY (fkComponente) REFERENCES componente(idComponente) ON DELETE CASCADE,
    FOREIGN KEY (fkMetrica) REFERENCES metricaComponente(idMetrica) ON DELETE CASCADE,
    FOREIGN KEY (fkAlerta) REFERENCES alertaComponente(idAlerta) ON DELETE CASCADE
);

CREATE TABLE metricaRede (
    idMetricaRede INT PRIMARY KEY AUTO_INCREMENT,
    fkEmpresa INT,
    nome VARCHAR(45) NOT NULL,
    medida VARCHAR(45) NOT NULL,
    min FLOAT NOT NULL,
    media FLOAT,
    max FLOAT NOT NULL,
    FOREIGN KEY (fkEmpresa) REFERENCES empresa(idEmpresa) ON DELETE CASCADE
);

CREATE TABLE componenteRede (
    idComponenteRede INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(45) NOT NULL,
    interfaceRede VARCHAR(45),
    fkMetricaRede INT,
    FOREIGN KEY (fkMetricaRede) REFERENCES metricaRede(idMetricaRede) ON DELETE CASCADE
);

CREATE TABLE alertaRede (
    idAlertaRede INT PRIMARY KEY AUTO_INCREMENT,
    fkMetricaRede INT,
    dtHora DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(45) NOT NULL,
    FOREIGN KEY (fkMetricaRede) REFERENCES metricaRede(idMetricaRede) ON DELETE CASCADE
);

CREATE TABLE logMonitoramentoRede (
    idMonitoramentoRede INT PRIMARY KEY AUTO_INCREMENT,
    fkComponenteRede INT,
    fkMaquina INT,
    fkMetricaRede INT,
    fkAlertaRede INT,
    ipv4 CHAR(15),
    descricao varchar(255),
    velocidadeMbps DECIMAL(10,2),
    mbEnviados DECIMAL(10,2),
    mbRecebidos DECIMAL(10,2),
    pacotesEnviados DECIMAL(10,2),
    pacotesRecebidos DECIMAL(10,2),
    dtHora DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fkMaquina) REFERENCES maquina(idMaquina) ON DELETE CASCADE,
    FOREIGN KEY (fkComponenteRede) REFERENCES componenteRede(idComponenteRede) ON DELETE CASCADE,
    FOREIGN KEY (fkMetricaRede) REFERENCES metricaRede(idMetricaRede) ON DELETE CASCADE,
    FOREIGN KEY (fkAlertaRede) REFERENCES alertaRede(idAlertaRede) ON DELETE CASCADE
);

INSERT INTO endereco (cep, cidade, logradouro, numero, uf, complemento) VALUES
('12345678', 'São Paulo', 'Rua das Flores', '123', 'SP', 'Apto 101'),
('23456789', 'Rio de Janeiro', 'Rua da Paz', '456', 'RJ', 'Casa 10'),
('34567890', 'Belo Horizonte', 'Avenida Brasil', '789', 'MG', NULL);

INSERT INTO empresa (fkEndereco, razaoSocial, nomeFantasia, cnpj, token) VALUES
(1, 'Empresa A LTDA', 'Empresa A', '12345678000199', 'ABCDE'),
(2, 'Empresa B S.A.', 'Empresa B', '98765432000110', 'XYZ12'),
(3, 'Empresa C LTDA', 'Empresa C', '19283746000188', 'PQR34');

INSERT INTO tipo (permissao) VALUES
('Admin'),
('Membro');

INSERT INTO usuario (fkEmpresa, fkTipo, nome, email, senha, cpf, telefone) VALUES
(1, 1, 'João Silva', 'joao@empresaA.com', 'senha123', '11122233344', '11988887777'),
(2, 2, 'Maria Souza', 'maria@empresaB.com', 'senha456', '55566677788', '21999998888'),
(3, 2, 'Pedro Lima', 'pedro@empresaC.com', 'senha789', '99900011122', '31977776666');

INSERT INTO sistemaOperacional (tipo, versao, distribuicao) VALUES
('Linux', '20.04', 'Ubuntu'),
('Windows', '11 Pro', 'Microsoft'),
('MacOS', '13.0', 'Apple');


INSERT INTO maquina (fkEmpresa, fkSistema, macAddress, localizacao) VALUES
(1, 1, '00:1A:2B:3C:4D:5E', 'Sala 101'),
(2, 2, '00:5F:6A:7B:8C:9D', 'Sala 202'),
(3, 3, '01:2A:3B:4C:5D:6E', 'Sala 303');

INSERT INTO metricaComponente (fkEmpresa, nome, medida, min, max, unidade) VALUES
(1, 'Uso de CPU', '%', 20, 85, '%'),
(1, 'Uso de Memória', '%', 10, 75, '%'),
(1, 'Uso de Disco', '%', 0, 90, '%');

INSERT INTO componente (tipo, modelo, fabricante, capacidade, fkMetrica) VALUES
('RAM', 'Vengeance LPX', 'Corsair', '16GB', 2),
('Disco', '978 EVO Plus', 'Samsung', '1TB', 3),
('Disco', '978 EVO Plus', 'Samsung', '1TB', 3),
('CPU Núcleo 1', 'Ryzen 5 5600X', 'AMD', '3.7GHz', 1),
('CPU Núcleo 2', 'Ryzen 5 5600X', 'AMD', '3.7GHz', 1), 
('CPU Núcleo 3', 'Ryzen 5 5600X', 'AMD', '3.7GHz', 1),
('CPU Núcleo 4', 'Ryzen 5 5600X', 'AMD', '3.7GHz', 1),
('CPU Núcleo 5', 'Ryzen 5 5600X', 'AMD', '3.7GHz', 1),
('CPU Núcleo 6', 'Ryzen 5 5600X', 'AMD', '3.7GHz', 1),
('CPU Núcleo 7', 'Ryzen 5 5600X', 'AMD', '3.7GHz', 1),
('CPU Núcleo 8', 'Ryzen 5 5600X', 'AMD', '3.7GHz', 1);


INSERT INTO alertaComponente (fkMetrica, estado) VALUES
(1, 'Crítico'),
(2, 'Atenção'),
(3, 'Normal');

INSERT INTO metricaRede (fkEmpresa, nome, medida, min, max) VALUES
(1, 'Velocidade de Download', 'Mbps', 0, 1000),
(1, 'Velocidade de Upload', 'Mbps', 0, 1000),
(1, 'Latência', 'ms', 0, 300);

INSERT INTO componenteRede (nome, interfaceRede, fkMetricaRede) VALUES
('Adaptador Ethernet Intel', 'eth0', 1),
('Placa de Rede Wi-Fi TP-Link', 'wlan0', 2),
('Interface Virtual VPN', 'tun0', 3);

INSERT INTO alertaRede (fkMetricaRede, estado) VALUES
(1, 'Normal'),
(2, 'Atenção'),
(3, 'Crítico');

INSERT INTO incidente (fkFuncionario, fkEmpresa, titulo, descricao) VALUES
(1, 1, 'Falha no servidor', 'Servidor principal não responde'),
(2, 2, 'Rede lenta', 'Usuários reportam lentidão'),
(3, 3, 'Erro de login', 'Falha no acesso ao sistema');

-- ===== ALERTAS DIA 10 =====
INSERT INTO alertaComponente (fkMetrica, dtHora, estado) VALUES
(1, '2025-01-10 09:30:00', 'Atenção'),
(2, '2025-01-10 14:12:00', 'Crítico'),
(3, '2025-01-10 18:05:00', 'Normal');

-- ===== ALERTAS DIA 11 =====
INSERT INTO alertaComponente (fkMetrica, dtHora, estado) VALUES
(1, '2025-01-11 10:18:00', 'Crítico'),
(2, '2025-01-11 16:40:00', 'Normal'),
(3, '2025-01-11 21:55:00', 'Atenção');

-- ===== ALERTAS DIA 12 =====
INSERT INTO alertaComponente (fkMetrica, dtHora, estado) VALUES
(1, '2025-01-12 08:22:00', 'Normal'),
(2, '2025-01-12 13:41:00', 'Atenção'),
(3, '2025-01-12 19:33:00', 'Crítico');

-- ===== ALERTAS DIA 13 =====
INSERT INTO alertaComponente (fkMetrica, dtHora, estado) VALUES
(1, '2025-01-13 07:50:00', 'Crítico'),
(2, '2025-01-13 15:10:00', 'Atenção'),
(3, '2025-01-13 22:08:00', 'Normal');

-- ===== REDE DIA 10 =====
INSERT INTO alertaRede (fkMetricaRede, dtHora, estado) VALUES
(1, '2025-01-10 09:45:00', 'Normal'),
(2, '2025-01-10 14:20:00', 'Crítico'),
(3, '2025-01-10 19:10:00', 'Atenção');

-- ===== REDE DIA 11 =====
INSERT INTO alertaRede (fkMetricaRede, dtHora, estado) VALUES
(1, '2025-01-11 08:33:00', 'Atenção'),
(2, '2025-01-11 15:22:00', 'Normal'),
(3, '2025-01-11 20:45:00', 'Crítico');

-- ===== REDE DIA 12 =====
INSERT INTO alertaRede (fkMetricaRede, dtHora, estado) VALUES
(1, '2025-01-12 10:55:00', 'Crítico'),
(2, '2025-01-12 16:02:00', 'Atenção'),
(3, '2025-01-12 18:28:00', 'Normal');

-- ===== REDE DIA 13 =====
INSERT INTO alertaRede (fkMetricaRede, dtHora, estado) VALUES
(1, '2025-01-13 07:01:00', 'Normal'),
(2, '2025-01-13 14:58:00', 'Crítico'),
(3, '2025-01-13 21:33:00', 'Atenção');

-- ===== LOGS DIA 10 =====
INSERT INTO logMonitoramento (fkMaquina, fkComponente, fkMetrica, fkAlerta, valor, descricao, dtHora)
VALUES
(1, 4, 1, 1, 78, 'CPU acima do normal', '2025-01-10 09:31:00'),
(1, 1, 2, 2, 82, 'RAM crítica', '2025-01-10 14:15:00'),
(1, 2, 3, 3, 55, 'Disco estável', '2025-01-10 18:06:00');

-- ===== LOGS DIA 11 =====
INSERT INTO logMonitoramento VALUES
(NULL, 1, 1, 1, 4, 95, 'CPU no limite', '2025-01-11 10:20:00'),
(NULL, 1, 2, 2, 2, 50, 'RAM normal', '2025-01-11 16:45:00'),
(NULL, 1, 3, 3, 3, 60, 'Disco acima da média', '2025-01-11 21:58:00');

-- ===== LOGS DIA 12 =====
INSERT INTO logMonitoramento VALUES
(NULL, 1, 4, 1, 1, 30, 'CPU baixa', '2025-01-12 08:25:00'),
(NULL, 1, 1, 2, 2, 70, 'RAM atenção', '2025-01-12 13:44:00'),
(NULL, 1, 2, 3, 3, 92, 'Disco crítico', '2025-01-12 19:35:00');

-- ===== LOGS DIA 13 =====
INSERT INTO logMonitoramento VALUES
(NULL, 1, 4, 1, 1, 88, 'CPU crítica', '2025-01-13 07:55:00'),
(NULL, 1, 1, 2, 2, 74, 'RAM atenção', '2025-01-13 15:12:00'),
(NULL, 1, 2, 3, 3, 40, 'Disco estável', '2025-01-13 22:10:00');

-- ===== LOGS DIA 10 =====
INSERT INTO logMonitoramentoRede (fkComponenteRede, fkMaquina, fkMetricaRede, fkAlertaRede, ipv4, descricao, velocidadeMbps, mbEnviados, mbRecebidos, pacotesEnviados, pacotesRecebidos, dtHora)
VALUES
(1, 1, 1, 1, '192.168.0.10', 'Download normal', 250, 120, 980, 500, 430, '2025-01-10 09:46:00'),
(1, 1, 1, 2, '192.168.0.10', 'Upload crítico', 40, 300, 400, 800, 700, '2025-01-10 14:22:00'),
(1, 1, 1, 3, '192.168.0.10', 'Latência aumentada', 10, 50, 70, 120, 110, '2025-01-10 19:12:00');

-- ===== LOGS DIA 11 =====
INSERT INTO logMonitoramentoRede (
  fkComponenteRede, fkMaquina, fkMetricaRede, fkAlertaRede,
  ipv4, descricao,
  velocidadeMbps, mbEnviados, mbRecebidos,
  pacotesEnviados, pacotesRecebidos,
  dtHora
)
VALUES
(1, 1, 1, 1, '192.168.0.10', 'Download com atraso', 180, 210, 850, 430, 380, '2025-01-11 08:35:00'),
(1, 1, 1, 2, '192.168.0.10', 'Upload normalizado', 90, 200, 620, 600, 550, '2025-01-11 15:24:00'),
(1, 1, 1, 3, '192.168.0.10', 'Latência crítica', 5, 30, 40, 200, 180, '2025-01-11 20:47:00');


-- ===== LOGS DIA 12 =====
INSERT INTO logMonitoramentoRede (
  fkComponenteRede, fkMaquina, fkMetricaRede, fkAlertaRede,
  ipv4, descricao,
  velocidadeMbps, mbEnviados, mbRecebidos,
  pacotesEnviados, pacotesRecebidos,
  dtHora
)
VALUES
(1, 1, 1, 1, '192.168.0.10', 'Download crítico', 500, 350, 1200, 900, 870, '2025-01-12 10:58:00'),
(1, 1, 1, 2, '192.168.0.10', 'Upload atenção', 70, 250, 710, 700, 680, '2025-01-12 16:05:00'),
(1, 1, 1, 3, '192.168.0.10', 'Latência elevada', 15, 60, 80, 190, 200, '2025-01-12 18:30:00');


-- ===== LOGS DIA 13 =====
INSERT INTO logMonitoramentoRede (
  fkComponenteRede, fkMaquina, fkMetricaRede, fkAlertaRede,
  ipv4, descricao,
  velocidadeMbps, mbEnviados, mbRecebidos,
  pacotesEnviados, pacotesRecebidos,
  dtHora
)
VALUES
(1, 1, 1, 1, '192.168.0.10', 'Download estável', 300, 140, 900, 540, 520, '2025-01-13 07:03:00'),
(1, 1, 1, 2, '192.168.0.10', 'Upload crítico', 25, 500, 450, 890, 870, '2025-01-13 15:00:00'),
(1, 1, 1, 3, '192.168.0.10', 'Latência atenção', 12, 40, 60, 170, 160, '2025-01-13 21:35:00');


INSERT INTO processo (fkMaquina, usuario, pid, nome, usoCPU, discoLido, discoRecebido, usoRam) VALUES
(1, 'usuario1', '1001', 'Chrome', 12.5, 0, 0, 2800.00),
(1, 'usuario1', '1002', 'Code - VSCode', 9.2, 0, 0, 1500.00),
(1, 'usuario1', '1003', 'Spotify', 1.8, 0, 0, 600.00);