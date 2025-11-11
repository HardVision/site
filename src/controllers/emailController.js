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

    await emailModel.enviarToken(token, data, email).then((resultado) => {
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


module.exports = { enviar, enviarToken, atualizarToken };
