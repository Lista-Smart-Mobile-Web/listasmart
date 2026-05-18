"use client";

import { useState } from "react";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div
      className="contact-form reveal"
      id="contact"
      style={{ transitionDelay: ".1s" }}
    >
      <div className="cf-title">Seja um supermercado parceiro</div>
      <div className="cf-sub">
        Preencha o formulário e nossa equipe entrará em contato em até 1 dia
        útil.
      </div>
      <div className="cf-grid">
        <div className="cf-field">
          <label className="cf-label">Nome do estabelecimento</label>
          <input
            className="cf-input"
            type="text"
            placeholder="Ex: Supermercado Bom Preço"
          />
        </div>
        <div className="cf-field">
          <label className="cf-label">Cidade / Estado</label>
          <input
            className="cf-input"
            type="text"
            placeholder="Ex: São Paulo, SP"
          />
        </div>
        <div className="cf-field">
          <label className="cf-label">Nome do responsável</label>
          <input
            className="cf-input"
            type="text"
            placeholder="Seu nome completo"
          />
        </div>
        <div className="cf-field">
          <label className="cf-label">Telefone / WhatsApp</label>
          <input
            className="cf-input"
            type="tel"
            placeholder="(11) 99999-9999"
          />
        </div>
        <div className="cf-field full">
          <label className="cf-label">E-mail corporativo</label>
          <input
            className="cf-input"
            type="email"
            placeholder="contato@supermercado.com"
          />
        </div>
        <div className="cf-field full">
          <label className="cf-label">Número de lojas</label>
          <select className="cf-select" defaultValue="">
            <option value="" disabled>
              Selecione
            </option>
            <option>1 loja</option>
            <option>2 a 5 lojas</option>
            <option>6 a 20 lojas</option>
            <option>Mais de 20 lojas</option>
          </select>
        </div>
        <div className="cf-field full">
          <label className="cf-label">Mensagem (opcional)</label>
          <textarea
            className="cf-textarea"
            placeholder="Conte um pouco sobre o seu negócio ou suas principais dúvidas..."
          />
        </div>
      </div>
      <button
        className="cf-submit"
        disabled={submitted}
        onClick={() => setSubmitted(true)}
        style={
          submitted
            ? {
                background: "var(--green-subtle)",
                color: "var(--green-lt)",
                border: "1px solid var(--green-border)",
              }
            : {}
        }
      >
        {submitted
          ? "Mensagem enviada! Entraremos em contato em breve."
          : "Enviar mensagem — Quero ser parceiro"}
      </button>
    </div>
  );
}
