"""
email_service.py — Service d'envoi d'emails CAMEBUY
Place ce fichier dans : backend/products/email_service.py
"""

from django.core.mail import send_mail
from django.conf import settings


# ── Template de base ──────────────────────────────────────
def _base_html(titre, contenu_html):
    return f"""
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{titre}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- HEADER -->
        <tr>
          <td style="background:linear-gradient(135deg,#0b2239,#1a4a7a);border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
            <h1 style="margin:0;font-size:2rem;color:#fff;letter-spacing:-1px;">
              CAME<span style="color:#4db8e8;">BUY</span><span style="color:#ef4444;">.</span>
            </h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.6);font-size:0.85rem;font-style:italic;">
              La marketplace du Cameroun
            </p>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="background:#ffffff;padding:36px 40px;border-left:1px solid #e5e8ed;border-right:1px solid #e5e8ed;">
            {contenu_html}
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#f8fafc;border:1px solid #e5e8ed;border-top:none;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:0.75rem;color:#9aa5b4;">
              Cet email a été envoyé automatiquement par CAMEBUY.<br>
              Ne pas répondre à cet email.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
"""


# ══════════════════════════════════════════════════════════
# 1. EMAIL APRÈS INSCRIPTION — "En attente de validation"
# ══════════════════════════════════════════════════════════
def envoyer_email_inscription(fournisseur):
    """
    Envoyé immédiatement après l'inscription du fournisseur.
    Informe que le compte est en attente de validation.
    """
    sujet = "✅ Inscription CAMEBUY reçue — En attente de validation"

    contenu = f"""
    <h2 style="margin:0 0 8px;color:#0b2239;font-size:1.3rem;">
      Bonjour {fournisseur.nom} 👋
    </h2>
    <p style="margin:0 0 20px;color:#5a6a7a;font-size:0.95rem;line-height:1.6;">
      Nous avons bien reçu votre demande d'inscription sur la plateforme CAMEBUY.
    </p>

    <!-- Statut -->
    <div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:12px;padding:18px 20px;margin-bottom:24px;">
      <p style="margin:0;color:#92400e;font-size:0.9rem;font-weight:600;">
        ⏳ Votre compte est en cours de vérification
      </p>
      <p style="margin:6px 0 0;color:#92400e;font-size:0.85rem;line-height:1.5;">
        Notre équipe examine votre dossier. Vous recevrez un email de confirmation
        dès que votre compte sera activé, généralement sous <strong>24 à 48h</strong>.
      </p>
    </div>

    <!-- Récap infos -->
    <h3 style="margin:0 0 12px;color:#0b2239;font-size:0.95rem;font-weight:600;">
      Vos informations enregistrées :
    </h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e8ed;border-radius:10px;overflow:hidden;margin-bottom:24px;">
      <tr style="background:#f8fafc;">
        <td style="padding:10px 16px;color:#9aa5b4;font-size:0.8rem;font-weight:600;text-transform:uppercase;width:40%;">Nom de fournisseur</td>
        <td style="padding:10px 16px;color:#0b2239;font-size:0.88rem;font-weight:500;">{fournisseur.nom}</td>
      </tr>
      <tr>
        <td style="padding:10px 16px;color:#9aa5b4;font-size:0.8rem;font-weight:600;text-transform:uppercase;border-top:1px solid #e5e8ed;">Nom d'utilisateur</td>
        <td style="padding:10px 16px;color:#0b2239;font-size:0.88rem;font-weight:500;border-top:1px solid #e5e8ed;">{fournisseur.utilisateur.username}</td>
      </tr>
      <tr style="background:#f8fafc;">
        <td style="padding:10px 16px;color:#9aa5b4;font-size:0.8rem;font-weight:600;text-transform:uppercase;border-top:1px solid #e5e8ed;">Email</td>
        <td style="padding:10px 16px;color:#0b2239;font-size:0.88rem;font-weight:500;border-top:1px solid #e5e8ed;">{fournisseur.utilisateur.email}</td>
      </tr>
      {"<tr><td style='padding:10px 16px;color:#9aa5b4;font-size:0.8rem;font-weight:600;text-transform:uppercase;border-top:1px solid #e5e8ed;'>Téléphone</td><td style='padding:10px 16px;color:#0b2239;font-size:0.88rem;font-weight:500;border-top:1px solid #e5e8ed;'>" + fournisseur.telephone + "</td></tr>" if fournisseur.telephone else ""}
    </table>

    <p style="margin:0;color:#9aa5b4;font-size:0.82rem;line-height:1.6;text-align:center;">
      Une question ? Contactez-nous via le chat sur notre site.
    </p>
    """

    try:
        send_mail(
            subject=sujet,
            message=f"Bonjour {fournisseur.nom}, votre inscription CAMEBUY est en attente de validation.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[fournisseur.utilisateur.email],
            html_message=_base_html(sujet, contenu),
            fail_silently=True,
        )
    except Exception as e:
        print(f"[EMAIL] Erreur inscription : {e}")


# ══════════════════════════════════════════════════════════
# 2. EMAIL VALIDATION — Compte approuvé par l'admin
# ══════════════════════════════════════════════════════════
def envoyer_email_validation(fournisseur, mot_de_passe_clair=None, note_admin=""):
    """
    Envoyé quand l'admin valide le compte.
    Contient les identifiants de connexion.
    """
    sujet = "🎉 Votre compte CAMEBUY est activé — Bienvenue !"

    mdp_section = ""
    if mot_de_passe_clair:
        mdp_section = f"""
        <tr>
          <td style="padding:10px 16px;color:#9aa5b4;font-size:0.8rem;font-weight:600;text-transform:uppercase;border-top:1px solid #e5e8ed;">Mot de passe</td>
          <td style="padding:10px 16px;font-size:0.88rem;font-weight:600;border-top:1px solid #e5e8ed;">
            <span style="background:#f1f5f9;border:1px solid #e2e8f0;border-radius:6px;padding:3px 10px;font-family:monospace;color:#0b2239;">{mot_de_passe_clair}</span>
          </td>
        </tr>
        """

    note_section = ""
    if note_admin:
        note_section = f"""
        <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:14px 18px;margin:16px 0;">
          <p style="margin:0;color:#166534;font-size:0.85rem;">
            <strong>Message de l'équipe CAMEBUY :</strong><br>{note_admin}
          </p>
        </div>
        """

    contenu = f"""
    <div style="text-align:center;margin-bottom:28px;">
      <div style="width:64px;height:64px;background:linear-gradient(135deg,#10b981,#059669);border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:1.8rem;line-height:64px;">
        ✅
      </div>
      <h2 style="margin:0 0 8px;color:#0b2239;font-size:1.4rem;">Félicitations {fournisseur.nom} !</h2>
      <p style="margin:0;color:#5a6a7a;font-size:0.95rem;">Votre compte fournisseur CAMEBUY a été validé.</p>
    </div>

    {note_section}

    <!-- Identifiants de connexion -->
    <h3 style="margin:0 0 12px;color:#0b2239;font-size:0.95rem;font-weight:600;">
      🔑 Vos identifiants de connexion :
    </h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e8ed;border-radius:10px;overflow:hidden;margin-bottom:24px;">
      <tr style="background:#f8fafc;">
        <td style="padding:10px 16px;color:#9aa5b4;font-size:0.8rem;font-weight:600;text-transform:uppercase;width:40%;">Nom de fournisseur</td>
        <td style="padding:10px 16px;color:#0b2239;font-size:0.88rem;font-weight:500;">{fournisseur.nom}</td>
      </tr>
      <tr>
        <td style="padding:10px 16px;color:#9aa5b4;font-size:0.8rem;font-weight:600;text-transform:uppercase;border-top:1px solid #e5e8ed;">Nom d'utilisateur</td>
        <td style="padding:10px 16px;border-top:1px solid #e5e8ed;">
          <span style="background:#f1f5f9;border:1px solid #e2e8f0;border-radius:6px;padding:3px 10px;font-family:monospace;color:#0b2239;font-size:0.88rem;">{fournisseur.utilisateur.username}</span>
        </td>
      </tr>
      {mdp_section}
    </table>

    <!-- Instructions connexion -->
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:18px 20px;margin-bottom:24px;">
      <h4 style="margin:0 0 10px;color:#1e3a8a;font-size:0.9rem;">Comment se connecter :</h4>
      <ol style="margin:0;padding-left:18px;color:#1e40af;font-size:0.85rem;line-height:1.8;">
        <li>Rendez-vous sur <strong>le site CAMEBUY</strong></li>
        <li>Cliquez sur <strong>"Connexion"</strong> en haut à droite</li>
        <li>Entrez votre <strong>nom d'utilisateur</strong> et votre <strong>mot de passe</strong></li>
        <li>Accédez à votre espace fournisseur et commencez à publier vos produits !</li>
      </ol>
    </div>

    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:12px 16px;">
      <p style="margin:0;color:#991b1b;font-size:0.8rem;">
        🔒 <strong>Sécurité :</strong> Nous vous recommandons de changer votre mot de passe après votre première connexion.
      </p>
    </div>
    """

    try:
        send_mail(
            subject=sujet,
            message=f"Félicitations {fournisseur.nom} ! Votre compte CAMEBUY est activé. Connectez-vous avec : {fournisseur.utilisateur.username}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[fournisseur.utilisateur.email],
            html_message=_base_html(sujet, contenu),
            fail_silently=True,
        )
    except Exception as e:
        print(f"[EMAIL] Erreur validation : {e}")


# ══════════════════════════════════════════════════════════
# 3. EMAIL REFUS
# ══════════════════════════════════════════════════════════
def envoyer_email_refus(fournisseur, motif=""):
    sujet = "❌ CAMEBUY — Votre demande n'a pas pu être acceptée"

    contenu = f"""
    <h2 style="margin:0 0 8px;color:#0b2239;font-size:1.3rem;">Bonjour {fournisseur.nom},</h2>
    <p style="margin:0 0 20px;color:#5a6a7a;font-size:0.95rem;line-height:1.6;">
      Après examen de votre dossier, nous ne sommes pas en mesure d'activer votre compte
      fournisseur CAMEBUY pour le moment.
    </p>
    {"<div style='background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:18px 20px;margin-bottom:20px;'><p style='margin:0;color:#991b1b;font-size:0.88rem;'><strong>Motif :</strong><br>" + motif + "</p></div>" if motif else ""}
    <p style="margin:0;color:#5a6a7a;font-size:0.88rem;line-height:1.6;">
      Pour plus d'informations ou pour soumettre un nouveau dossier, contactez-nous via le site.
    </p>
    """

    try:
        send_mail(
            subject=sujet,
            message=f"Bonjour {fournisseur.nom}, votre demande d'inscription CAMEBUY n'a pas pu être acceptée.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[fournisseur.utilisateur.email],
            html_message=_base_html(sujet, contenu),
            fail_silently=True,
        )
    except Exception as e:
        print(f"[EMAIL] Erreur refus : {e}")


# ══════════════════════════════════════════════════════════
# 4. EMAIL SUPPRESSION PRODUIT
# ══════════════════════════════════════════════════════════
def envoyer_email_suppression_produit(fournisseur, produit_nom, motif, detail=""):
    sujet = f"⚠️ Produit retiré — {produit_nom}"

    contenu = f"""
    <h2 style="margin:0 0 8px;color:#0b2239;font-size:1.3rem;">Bonjour {fournisseur.nom},</h2>
    <p style="margin:0 0 20px;color:#5a6a7a;font-size:0.95rem;line-height:1.6;">
      L'administration CAMEBUY a retiré l'un de vos produits de la plateforme.
    </p>

    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:18px 20px;margin-bottom:20px;">
      <p style="margin:0 0 8px;color:#9a3412;font-size:0.88rem;font-weight:600;">Produit retiré :</p>
      <p style="margin:0 0 12px;color:#0b2239;font-size:1rem;font-weight:700;">"{produit_nom}"</p>
      <p style="margin:0 0 4px;color:#9a3412;font-size:0.88rem;font-weight:600;">Motif :</p>
      <p style="margin:0;color:#7c2d12;font-size:0.88rem;">{motif}{(" — " + detail) if detail else ""}</p>
    </div>

    <p style="margin:0;color:#5a6a7a;font-size:0.85rem;line-height:1.6;">
      Vous pouvez republier ce produit en corrigeant les points mentionnés.
      En cas de question, contactez-nous via la plateforme.
    </p>
    """

    try:
        send_mail(
            subject=sujet,
            message=f"Bonjour {fournisseur.nom}, votre produit '{produit_nom}' a été retiré. Motif : {motif}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[fournisseur.utilisateur.email],
            html_message=_base_html(sujet, contenu),
            fail_silently=True,
        )
    except Exception as e:
        print(f"[EMAIL] Erreur suppression produit : {e}")
