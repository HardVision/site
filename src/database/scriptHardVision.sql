create database HardVision;
use HardVision;
-- Criação da tabela 'endereco'

CREATE TABLE endereco (
    idEndereco INT PRIMARY KEY auto_increment,
    rua VARCHAR(45) NOT NULL,
    numero VARCHAR(45) NOT NULL,
    logradouro VARCHAR(45) NOT NULL,
    cidade VARCHAR(45) NOT NULL,
    uf VARCHAR(2) NOT NULL,
    cep CHAR(8) NOT NULL,
    complemento VARCHAR(45)
);

-- Criação da tabela 'empresa'
CREATE TABLE empresa (
    idEmpresa INT PRIMARY KEY auto_increment,
    razaoSocial VARCHAR(45) NOT NULL,
    nomeFantasia varchar(45) not null,
    cnpj CHAR(14) NOT NULL UNIQUE,
    fkEndereco INT,
    telefone VARCHAR(15) NOT NULL,
    email VARCHAR(100) NOT NULL,
    token char(5),
    FOREIGN KEY (fkEndereco) REFERENCES endereco(idEndereco)
);
-- Criação da tabela 'sistemaOperacional'
CREATE TABLE sistemaOperacional (
    idSistema INT PRIMARY KEY auto_increment,
    tipo VARCHAR(45) NOT NULL,
    versao VARCHAR(50) NOT NULL,
    distribuicao varchar(45) not NULL 
);

-- Criação da tabela 'maquina'
CREATE TABLE maquina (
    idMaquina INT auto_increment,
    fkEmpresa INT,
    fkSistema INT,
    constraint pkMaq PRIMARY KEY (idMaquina, fkSistema),
    macAddress char(17) NOT NULL,
    localizacao varchar(45),
    FOREIGN KEY (fkEmpresa) REFERENCES empresa(idEmpresa),
    FOREIGN KEY (fkSistema) REFERENCES sistemaOperacional(idSistema)
);

-- Criação da tabela 'tipo'
CREATE TABLE tipo (
    idTipo INT PRIMARY KEY auto_increment,
    permissao VARCHAR(45) NOT NULL
);

-- Criação da tabela 'usuario'
CREATE TABLE usuario (
    idUsuario INT auto_increment,
    nome VARCHAR(45) NOT NULL,
    email VARCHAR(45) NOT NULL UNIQUE,
    senha VARCHAR(45) NOT NULL,
    cpf char(11) not null unique,
    telefone char(13) not null unique,
    fkEmpresa INT,
    fkTipo int,
    CONSTRAINT pkUsu primary key (idUsuario, fkEmpresa),
    FOREIGN KEY (fkEmpresa) REFERENCES empresa(idEmpresa),
	FOREIGN KEY (fkTipo) REFERENCES tipo(idTipo)
);

-- Criação da tabela 'metricasComponente'
CREATE TABLE metricaComponente (
    idMetrica INT PRIMARY KEY auto_increment,
    nome varchar(45) not null,
    medida varchar(45) not NULL,
    min float not null,
    max float not null
);

-- Criação da tabela 'metricasRede'
CREATE TABLE metricaRede (
    idMetricaRede INT PRIMARY KEY auto_increment,
    nome VARCHAR(45) NOT NULL,
    medida varchar(45) not NULL,
    min FLOAT NOT NULL,
    max float not NULL 
);


-- Criação da tabela 'componenteRede'
CREATE TABLE componenteRede (
    idComponenteRede INT auto_increment,
    nome varchar(45) not null,
    interfaceRede varchar(45) not null,
    fkMetricaRede int,
    constraint pkCompRede PRIMARY key (idComponenteRede, fkMetricaRede),
    FOREIGN KEY (fkMetricaRede) REFERENCES metricaRede(idMetricaRede)
);


-- Criação da tabela 'componente'
CREATE TABLE componente (
    idComponente INT auto_increment,
    tipo VARCHAR(45) NOT NULL,
    modelo varchar(45) NOT NULL,
    fabricante VARCHAR(45) NOT NULL,
    capacidade varchar(45) NOT NULL,
    fkMetrica int,
    CONSTRAINT pkComp PRIMARY KEY (idComponente, fkMetrica),
    FOREIGN KEY (fkMetrica) REFERENCES metricaComponente(idMetrica)
);

-- Criação da tabela 'alertaComponente'
CREATE TABLE alertaComponente (
    idAlerta INT auto_increment,
    fkMetrica INT,
    constraint pkAlertaComp primary key(idAlerta, fkMetrica),
    dtHora timestamp default current_timestamp(),
    estado varchar(45) not NULL,
    FOREIGN KEY (fkMetrica) REFERENCES metricaComponente(idMetrica)
);


-- Criação da tabela 'alertaRede'
CREATE TABLE alertaRede (
    idAlertaRede INT auto_increment,
    fkMetricaRede INT,
    constraint pkAlertaCompRede primary key(idAlertaRede, fkMetricaRede),
    dtHora timestamp default current_timestamp(),
    estado varchar(45) not NULL,
    FOREIGN KEY (fkMetricaRede) REFERENCES metricaRede(idMetricaRede)
);


-- Criação da tabela 'logMonitoramentoRede'
CREATE TABLE logMonitoramento (
    idMonitoramento INT auto_increment,
    fkMaquina int,
    fkComponente int,
    fkMetrica int,
    fkAlerta int,
    constraint pkLogMonitoramento 
    primary key(idMonitoramento, 
    fkMaquina, fkComponente, fkMetrica),
    valor INT NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    dtHora timestamp default CURRENT_TIMESTAMP(),
    FOREIGN KEY (fkMaquina) REFERENCES maquina(idMaquina),
	FOREIGN KEY (fkComponente) REFERENCES componente(idComponente),
	FOREIGN KEY (fkMetrica) REFERENCES metricaComponente(idMetrica),
    FOREIGN KEY (fkAlerta) REFERENCES alertaComponente(idAlerta)
    );

-- Criação da tabela 'logMonitoramentoRede'
CREATE TABLE logMonitoramentoRede (
    idMonitoramentoRede INT auto_increment,
    fkAlertaRede INT,
    fkComponenteRede int,
    fkMaquina int,
    fkMetricaRede int ,
    constraint pkLogMonitoramentoRede 
    primary key(idMonitoramentoRede, 
    fkMaquina, fkComponenteRede, fkAlertaRede),
    ipv4 char(15) NOT NULL,
    velocidadeMbps decimal(10,2) NOT NULL,
    mbEnviados decimal(10,2) not NULL,
    mbRecebidos decimal(10,2) not NULL,
    pacotesEnviados decimal(10,2) not null,
    pacotesRecebidos decimal(10,2)not null,
    dtHora timestamp default CURRENT_TIMESTAMP(),
    FOREIGN KEY (fkMaquina) REFERENCES maquina(idMaquina),
	FOREIGN KEY (fkComponenteRede) REFERENCES componenteRede(idComponenteRede),
	FOREIGN KEY (fkMetricaRede) REFERENCES metricaRede(idMetricaRede),
    FOREIGN KEY (fkAlertaRede) REFERENCES alertaRede(idAlertaRede)
   );

-- Inserir dados na tabela 'endereco'
INSERT INTO endereco (rua, numero, logradouro, cidade, uf, cep, complemento)
VALUES
    ('Rua das Flores', '123', 'Avenida', 'São Paulo', 'SP', '12345678', 'Apto 101'),
    ('Rua da Paz', '456', 'Beco', 'Rio de Janeiro', 'RJ', '23456789', 'Casa 10'),
    ('Avenida Brasil', '789', 'Centro', 'Belo Horizonte', 'MG', '34567890', NULL);

-- Inserir dados na tabela 'empresa'
INSERT INTO empresa (razaoSocial, nomeFantasia, cnpj, fkEndereco, telefone, email, token)
VALUES
    ('Empresa A Ltda', 'Empresa A', '12345678000199', 1, '1123456789', 'contato@empresaA.com', 'ABCDE'),
    ('Empresa B S.A.', 'Empresa B', '98765432000110', 2, '21987654321', 'contato@empresaB.com', 'XYZ12'),
    ('Empresa C', 'Empresa C', '19283746000188', 3, '3134567890', 'contato@empresaC.com', 'PQR34');

-- Inserir dados na tabela 'sistemaOperacional'
INSERT INTO sistemaOperacional (tipo, versao, distribuicao)
VALUES
    ('Linux', '20.04', 'Ubuntu'),
    ('Windows', '10 Pro', 'Microsoft'),
    ('MacOS', '11.3', 'Apple');

-- Inserir dados na tabela 'maquina'
INSERT INTO maquina (fkEmpresa, fkSistema, macAddress, localizacao)
VALUES
    (1, 1, '00:1A:2B:3C:4D:5E', 'Sala 101'),
    (2, 2, '00:5F:6G:7H:8I:9J', 'Sala 202'),
    (3, 3, '01:2A:3B:4C:5D:6E', 'Sala 303');

-- Inserir dados na tabela 'tipo'
INSERT INTO tipo (permissao)
VALUES
    ('Admin'),
    ('Membro');

INSERT INTO metricaComponente (nome, medida, min, max)
VALUES
    ('Uso de CPU', '%', 20, 85),
    ('Uso de Memória', '%', 5, 75),
    ('Uso de Disco', '%', 0, 90);

-- Inserir dados na tabela 'metricaRede'
INSERT INTO metricaRede (nome, medida, min, max)
VALUES
    ('Velocidade de Download', 'Mbps', 0, 1000),
    ('Velocidade de Upload', 'Mbps', 0, 1000),
    ('Latência', 'ms', 0, 300);

-- Inserir dados na tabela 'componente'
INSERT INTO componente (tipo, modelo, fabricante, capacidade, fkMetrica)
VALUES
    ('RAM', 'Vengeance LPX', 'Corsair', '16GB', 2),
    ('Disco', '970 EVO Plus', 'Samsung', '1TB', 3);

INSERT INTO componente (tipo, modelo, fabricante, capacidade, fkMetrica)
VALUES 	('CPU Núcleo 1', 'Ryzen 5 5600X', 'AMD', '3.7GHz', 1),
		('CPU Núcleo 2', 'Ryzen 5 5600X', 'AMD', '3.7GHz', 1),
		('CPU Núcleo 3', 'Ryzen 5 5600X', 'AMD', '3.7GHz', 1),
		('CPU Núcleo 4', 'Ryzen 5 5600X', 'AMD', '3.7GHz', 1);

-- Inserir dados na tabela 'componenteRede'
INSERT INTO componenteRede (nome, interfaceRede, fkMetricaRede)
VALUES
    ('Adaptador Ethernet Intel', 'eth0', 1),
    ('Placa de Rede Wi-Fi TP-Link', 'wlan0', 2),
    ('Interface Virtual VPN', 'tun0', 3);


-- Inserir dados na tabela 'alertaComponente'
INSERT INTO alertaComponente (fkMetrica, estado)
VALUES
    (1, 'Crítico'),
    (2, 'Atenção'),
    (3, 'Normal');

-- Inserir dados na tabela 'alertaRede'
INSERT INTO alertaRede (fkMetricaRede, estado)
VALUES
    (1, 'Normal'),
    (2, 'Atenção'),
    (3, 'Crítico');


select * from logMonitoramento;
    