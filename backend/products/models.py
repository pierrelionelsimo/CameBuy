"""
models.py — CAMEBUY
Ajouter ces modèles / champs à votre fichier models.py existant.
Puis faire : python manage.py makemigrations && python manage.py migrate
"""

from django.db import models
from django.contrib.auth.models import User


# ──────────────────────────────────────────────────────────
# CATÉGORIE
# ──────────────────────────────────────────────────────────
class Categorie(models.Model):
    nom = models.CharField(max_length=100)
    image = models.ImageField(upload_to='categories/', blank=True, null=True)

    def __str__(self):
        return self.nom


# ──────────────────────────────────────────────────────────
# FOURNISSEUR  ← champ statut + is_validated ajoutés
# ──────────────────────────────────────────────────────────
class Fournisseur(models.Model):
    STATUT_CHOICES = [
        ('en_attente', 'En attente de validation'),
        ('valide',     'Validé'),
        ('refuse',     'Refusé'),
        ('suspendu',   'Suspendu'),
    ]

    utilisateur  = models.OneToOneField(User, on_delete=models.CASCADE, related_name='fournisseur')
    nom          = models.CharField(max_length=200)
    telephone    = models.CharField(max_length=20, blank=True)
    adresse      = models.CharField(max_length=300, blank=True)
    photo        = models.ImageField(upload_to='fournisseurs/', blank=True, null=True)
    description  = models.TextField(blank=True)

    # ── Validation admin ──────────────────────────────────
    statut       = models.CharField(max_length=20, choices=STATUT_CHOICES, default='en_attente')
    is_validated = models.BooleanField(default=False)
    date_validation = models.DateTimeField(blank=True, null=True)
    note_admin   = models.TextField(blank=True, help_text="Message affiché au fournisseur lors du refus")

    created_at   = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nom} [{self.statut}]"


# ──────────────────────────────────────────────────────────
# PRODUIT
# ──────────────────────────────────────────────────────────
class Produit(models.Model):
    nom         = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    prix        = models.DecimalField(max_digits=12, decimal_places=2)
    stock       = models.IntegerField(default=0)
    image       = models.ImageField(upload_to='produits/', blank=True, null=True)
    categorie   = models.ForeignKey(Categorie, on_delete=models.SET_NULL, null=True, blank=True)
    fournisseur = models.ForeignKey(Fournisseur, on_delete=models.SET_NULL, null=True, blank=True, related_name='produits')
    cree_le     = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nom


# ──────────────────────────────────────────────────────────
# COMMANDE
# ──────────────────────────────────────────────────────────
class Commande(models.Model):
    STATUT_CHOICES = [
        ('en_attente', 'En attente'),
        ('payee',      'Payée'),
        ('livree',     'Livrée'),
        ('annulee',    'Annulée'),
    ]
    client   = models.ForeignKey(User, on_delete=models.CASCADE, related_name='commandes')
    statut   = models.CharField(max_length=20, choices=STATUT_CHOICES, default='en_attente')
    total    = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    cree_le  = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Commande #{self.id} — {self.client.username}"


class CommandeItem(models.Model):
    commande = models.ForeignKey(Commande, on_delete=models.CASCADE, related_name='items')
    produit  = models.ForeignKey(Produit,  on_delete=models.CASCADE)
    quantite = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.quantite}× {self.produit.nom}"


# ──────────────────────────────────────────────────────────
# PAIEMENT
# ──────────────────────────────────────────────────────────
class Paiement(models.Model):
    STATUT_CHOICES = [
        ('en_attente', 'En attente'),
        ('complete',   'Complété'),
        ('echoue',     'Échoué'),
    ]
    commande = models.ForeignKey(Commande, on_delete=models.CASCADE, related_name='paiements')
    montant  = models.DecimalField(max_digits=12, decimal_places=2)
    statut   = models.CharField(max_length=20, choices=STATUT_CHOICES, default='en_attente')
    cree_le  = models.DateTimeField(auto_now_add=True)


# ──────────────────────────────────────────────────────────
# PANIER
# ──────────────────────────────────────────────────────────
class Panier(models.Model):
    utilisateur = models.OneToOneField(User, on_delete=models.CASCADE)

class PanierItem(models.Model):
    panier   = models.ForeignKey(Panier,  on_delete=models.CASCADE, related_name='items')
    produit  = models.ForeignKey(Produit, on_delete=models.CASCADE)
    quantite = models.PositiveIntegerField(default=1)


# ──────────────────────────────────────────────────────────
# NOTIFICATION  ← NOUVEAU
# ──────────────────────────────────────────────────────────
class Notification(models.Model):
    TYPE_CHOICES = [
        ('message',   'Message admin'),
        ('validation','Statut validation'),
        ('commande',  'Nouvelle commande'),
        ('stock',     'Alerte stock'),
        ('info',      'Information'),
    ]

    destinataire = models.ForeignKey(
        Fournisseur, on_delete=models.CASCADE, related_name='notifications'
    )
    type_notif   = models.CharField(max_length=20, choices=TYPE_CHOICES, default='info')
    titre        = models.CharField(max_length=200)
    message      = models.TextField()
    lu           = models.BooleanField(default=False)
    cree_le      = models.DateTimeField(auto_now_add=True)
    # L'expéditeur — null = système automatique, sinon = superuser
    expediteur   = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='notifs_envoyees'
    )

    class Meta:
        ordering = ['-cree_le']

    def __str__(self):
        return f"[{self.type_notif}] → {self.destinataire.nom} : {self.titre[:40]}"
