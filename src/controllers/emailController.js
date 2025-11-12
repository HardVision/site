const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend");
var emailModel = require("../models/emailModel");
require("dotenv").config();

async function enviar(req, res) {
  try {
    const mailerSend = new MailerSend({
      apiKey: process.env.API_KEY
    });

    const nome = req.body.nomeServer;
    const email = req.body.emailServer;
    const contato = req.body.contatoServer;
    const msg = req.body.msgServer;

    console.log("📨 Cheguei no controller do email!");
    console.log("Dados enviados:", nome, email, contato, msg);

    const sentFrom = new Sender(email, nome);
    const recipients = [
      new Recipient("hardvisionmonitoramento@gmail.com", "Hardvision")
    ];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setReplyTo(sentFrom)
      .setSubject("Nos interessamos pelo seu serviço!")
      .setHtml(`<p><strong>${nome}</strong> entrou em contato:</p>
                <p>${msg}</p>
                <p>📞 Contato: ${contato}</p>`)
      .setText(`${msg}\n\nContato: ${contato} - ${nome}`);

    const response = await mailerSend.email.send(emailParams);
    console.log("✅ Email enviado com sucesso!", response);

    res.status(200).json({ sucesso: true, mensagem: "E-mail enviado com sucesso!" });
  } catch (error) {
    console.error("❌ Erro ao enviar e-mail:", error);
    res.status(500).json({ sucesso: false, erro: error.message || error });
  }
}

async function enviarToken(req, res) {
  try {
    const mailerSend = new MailerSend({
      apiKey: process.env.API_KEY
    });

    const token = req.body.tokenServer;
    const data = req.body.dataServer;
    const email = req.body.emailServer;

    console.log("📨 Cheguei no controller do email!");
    console.log("Dados enviados:", data, token, email);

    // remetente e destinatário
    const sentFrom = new Sender("hardvisionmonitoramento@test-2p0347zm1x9lzdrn.mlsender.net", "Hardvision");
    const recipients = [ new Recipient(email) ];

    // conteúdo do e-mail
    const assunto = "🔐 Redefinição de senha - Hardvision";
    const linkRedefinicao = `https://seusite.com/redefinir.html?token=${token}`; // ajuste a URL conforme seu front

    const html = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color:#01303F;">Olá!</h2>
        <p>Recebemos uma solicitação para redefinir sua senha na plataforma <strong>Hardvision</strong>.</p>
        <p>Use o token abaixo para continuar o processo de redefinição:</p>
        <div style="background-color:#01303F;color:#fff;padding:10px 20px;border-radius:8px;font-size:18px;display:inline-block;margin:10px 0;">
          <strong>${token}</strong>
        </div>
      </div>
    `;

    const textoSimples = `
Olá! 
Recebemos uma solicitação para redefinir sua senha na plataforma Hardvision.

Token de redefinição: ${token}


⚠️ Este código expira em 2 minutos. Caso não tenha solicitado, ignore este e-mail.

Equipe Hardvision
`;

    // cria parâmetros do email
    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setReplyTo(sentFrom)
      .setSubject(assunto)
      .setHtml(html)
      .setText(textoSimples);

    // salva no banco antes de enviar
    await emailModel.enviarToken(token, data, email);

    // envia o e-mail
    const response = await mailerSend.email.send(emailParams);
    console.log("✅ E-mail enviado com sucesso!", response);

    res.status(200).json({ sucesso: true, mensagem: "E-mail enviado com sucesso!" });
  } catch (error) {
    console.error("❌ Erro ao enviar e-mail:", error);
    res.status(500).json({ sucesso: false, erro: error.message || error });
  }
}


async function atualizarToken(params) {
   try {
    const mailerSend = new MailerSend({
      apiKey: process.env.API_KEY
    });

    const token = req.body.tokenServer;
    const data = req.body.dataServer;
    const email = req.body.emailServer;

    console.log("📨 Cheguei no controller do email!");
    console.log("Dados enviados:", data, token, email);

    const sentFrom = new Sender(data, token, email);
    const recipients = [
      new Recipient("hardvisionmonitoramento@gmail.com", "Hardvision")
    ];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setReplyTo(sentFrom)
      .setSubject("Nos interessamos pelo seu serviço!")
      .setHtml()
      .setText();

    await emailModel.atualizarToken.then((resultado) => {
        res.status(200).json(resultado);
      });
    const response = await mailerSend.email.send(emailParams);
    console.log("✅ Email enviado com sucesso!", response);

    res.status(200).json({ sucesso: true, mensagem: "E-mail enviado com sucesso!" });
  } catch (error) {
    console.error("❌ Erro ao enviar e-mail:", error);
    res.status(500).json({ sucesso: false, erro: error.message || error });
  }
}

async function verificarToken(req, res){
  var tokenCtrl = req.params.token;
  
      emailModel.verificarToken(tokenCtrl)
          .then(
              function (resultado) {
                  if (resultado) {
                      res.status(200).json(resultado);
                  } else {
                      res.status(204).send("Nenhum resultado encontrado!");
                  }
              }
          ).catch(
              function (erro) {
                  console.log(erro);
                  console.log("Houve um erro ao buscar o token: ", erro.sqlMessage);
                  res.status(500).json(erro.sqlMessage);
              }
          );
}


module.exports = { enviar, enviarToken, atualizarToken, verificarToken };
