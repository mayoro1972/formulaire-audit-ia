# Template EmailJS - Retour du formulaire

Ce template peut etre colle dans le dashboard EmailJS pour le fallback de `send-form-email`.

Variables attendues :

- `preheader`
- `intro_title`
- `status_line`
- `subject`
- `respondent_name`
- `respondent_email`
- `respondent_role`
- `respondent_entity`
- `respondent_domain`
- `sent_datetime`
- `recipient_email`
- `cc_email`
- `response_reference`
- `format_label`
- `attachment_filename`
- `attachment_included`
- `custom_message`
- `verification_steps`
- `message_text`
- `attachment_file`
- `attachment_content_type`

Configuration EmailJS recommandee dans l'onglet `Attachments` :

1. Ajouter une piece jointe de type `Variable Attachment`
2. `Filename` : `{{attachment_filename}}`
3. `Content type` :
   - recommande pour un template unique : `application/octet-stream`
   - soit fixe sur `application/vnd.openxmlformats-officedocument.wordprocessingml.document` pour un template dedie Word
   - soit fixe sur `text/csv` pour un template dedie CSV
4. `Parameter name` : `attachment_file`

Le backend envoie deja `attachment_file` sous forme de data URL base64.

Template HTML :

```html
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
  {{preheader}}
</div>

<div style="margin:0;padding:24px;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
  <div style="max-width:720px;margin:0 auto;background:#ffffff;border:1px solid #d8dee8;border-radius:16px;overflow:hidden;">
    <div style="background:#042c53;padding:24px 28px;color:#ffffff;">
      <div style="font-size:12px;opacity:.8;margin-bottom:6px;">Audit IA · Retour de formulaire</div>
      <div style="font-size:26px;line-height:1.2;font-weight:700;">{{intro_title}}</div>
      <div style="font-size:14px;opacity:.9;margin-top:8px;">{{status_line}}</div>
    </div>

    <div style="padding:28px;">
      <p style="margin:0 0 16px 0;">Bonjour,</p>
      <p style="margin:0 0 16px 0;">
        Un formulaire d'audit IA complete vient d'etre transmis. Vous trouverez ci-dessous le resume du repondant et les informations utiles pour son traitement.
      </p>

      <div style="background:#e6f1fb;border:1px solid #185fa5;border-radius:12px;padding:16px 18px;margin:18px 0;">
        <div style="font-size:14px;font-weight:700;color:#042c53;margin-bottom:8px;">Informations d'envoi</div>
        <div style="font-size:14px;line-height:1.7;">
          <div><strong>Sujet :</strong> {{subject}}</div>
          <div><strong>Format demande :</strong> {{format_label}}</div>
          <div><strong>Piece jointe attendue :</strong> {{attachment_filename}}</div>
          <div><strong>Piece jointe incluse :</strong> {{attachment_included}}</div>
          <div><strong>Date d'envoi :</strong> {{sent_datetime}}</div>
          <div><strong>Reference de reponse :</strong> {{response_reference}}</div>
        </div>
      </div>

      <div style="margin:22px 0 12px 0;font-size:18px;font-weight:700;color:#042c53;">
        Resume du repondant
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr>
          <td style="padding:8px 0;color:#6b7280;width:220px;">Nom</td>
          <td style="padding:8px 0;"><strong>{{respondent_name}}</strong></td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6b7280;">Email</td>
          <td style="padding:8px 0;">{{respondent_email}}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6b7280;">Poste</td>
          <td style="padding:8px 0;">{{respondent_role}}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6b7280;">Entite</td>
          <td style="padding:8px 0;">{{respondent_entity}}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6b7280;">Domaine principal</td>
          <td style="padding:8px 0;">{{respondent_domain}}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6b7280;">Destinataire principal</td>
          <td style="padding:8px 0;">{{recipient_email}}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6b7280;">Copie</td>
          <td style="padding:8px 0;">{{cc_email}}</td>
        </tr>
      </table>

      <div style="margin-top:24px;background:#faeeda;border:1px solid #ba7517;border-radius:12px;padding:16px 18px;">
        <div style="font-size:15px;font-weight:700;color:#854f0b;margin-bottom:8px;">Message du repondant</div>
        <div style="white-space:pre-line;font-size:14px;line-height:1.7;">{{custom_message}}</div>
      </div>

      <div style="margin-top:24px;">
        <div style="font-size:15px;font-weight:700;color:#042c53;margin-bottom:8px;">Verifications conseillees</div>
        <div style="white-space:pre-line;font-size:14px;line-height:1.7;">{{verification_steps}}</div>
      </div>

      <div style="margin-top:24px;background:#f7f7f5;border:1px solid #e5e7eb;border-radius:12px;padding:16px 18px;">
        <div style="font-size:15px;font-weight:700;color:#042c53;margin-bottom:8px;">Contenu texte de secours</div>
        <div style="white-space:pre-line;font-size:13px;line-height:1.7;color:#374151;">{{message_text}}</div>
      </div>
    </div>
  </div>
</div>
```
