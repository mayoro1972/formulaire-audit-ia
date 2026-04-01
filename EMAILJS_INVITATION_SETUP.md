# EmailJS Template Setup for Invitations

## Quick Setup Instructions

### Option 1: Update Your Existing Template (Recommended)

1. Go to [EmailJS Dashboard](https://dashboard.emailjs.com/admin)
2. Click on **Email Templates**
3. Find your template `template_sg8b9kc`
4. Click **Edit**
5. Replace the content with:

**Subject:**
```
Formulaire d'Audit IA - À compléter
```

**Content:**
```html
Bonjour {{to_name}},

Vous êtes invité à compléter le formulaire d'audit IA. Veuillez cliquer sur le lien ci-dessous pour commencer :

{{invite_link}}

Le formulaire :
- Se sauvegarde automatiquement toutes les 30 secondes
- Peut être rempli en plusieurs fois
- Prend environ 30-45 minutes à compléter
- Comporte 9 sections principales + récapitulatif

Instructions :
1. Cliquez sur le lien ci-dessus
2. Remplissez les sections dans l'ordre ou selon vos préférences
3. Vos réponses sont automatiquement sauvegardées
4. Une fois terminé, allez à la section "Envoi & récapitulatif"
5. Cliquez sur "Envoyer" pour transmettre vos réponses

Cordialement
```

6. Make sure these variables are used in your template:
   - `{{to_email}}` - Recipient email
   - `{{to_name}}` - Recipient name
   - `{{invite_link}}` - Invitation link

7. Click **Save**

### Option 2: Create a New Template for Invitations

If you want to keep your existing template for form submissions and create a separate one for invitations:

1. Go to [EmailJS Dashboard](https://dashboard.emailjs.com/admin)
2. Click **Email Templates** → **Create New Template**
3. Name it: `Invitation Template`
4. Use the same subject and content as above
5. **Save** and copy the new Template ID
6. Update `.env` file with a new variable (you'll need two template IDs):
   ```
   VITE_EMAILJS_INVITATION_TEMPLATE_ID=your_new_template_id
   ```

## Current Configuration

Your current EmailJS setup:
- Service ID: `service_8wabdlk`
- Template ID: `template_sg8b9kc`
- Public Key: `rTRq0yRaxs7pdgvsw`

## Testing

After updating the template:
1. Go to the "Envoyer des invitations" page
2. Add a recipient name and email
3. Click "Envoyer 1 invitation(s)"
4. Check your email inbox

## Troubleshooting

If emails don't arrive:
- Check your EmailJS dashboard for the email log
- Verify the template variables match exactly
- Make sure the Service ID and Template ID are correct
- Check spam/junk folder
