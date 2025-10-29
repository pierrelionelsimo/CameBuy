from django.db import models
from django.contrib.auth.models import User

class Fournisseur(models.Model):
    utilisateur = models.OneToOneField(User, on_delete=models.CASCADE)
    nom = models.CharField(max_length=255)
    adresse = models.CharField(max_length=255, blank=True)
    telephone = models.CharField(max_length=20)

    def __str__(self):
        return self.nom

from django.utils.text import slugify

class Categorie(models.Model):
    nom = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.nom)
        super().save(*args, **kwargs)


class Produit(models.Model):
    nom = models.CharField(max_length=255)  # Nom du produit
    description = models.TextField(blank=True)  # Description détaillée
    prix = models.DecimalField(max_digits=10, decimal_places=2)  # Prix du produit
    stock = models.PositiveIntegerField(default=0)  # Quantité en stock
    image = models.ImageField(upload_to='produits/')  # Champ pour l'image du produit
    categorie = models.ForeignKey(Categorie, on_delete=models.SET_NULL, null=True)  # Relation avec la catégorie
    fournisseur = models.ForeignKey(Fournisseur, on_delete=models.CASCADE, null=True, blank=True)  # Relation avec le fournisseur
    cree_le = models.DateTimeField(auto_now_add=True)  # Date de création
    modifie_le = models.DateTimeField(auto_now=True)  # Date de dernière modification

    def __str__(self):
        return self.nom
    

class Commande(models.Model):
    client = models.ForeignKey(User, on_delete=models.CASCADE)
    date_commande = models.DateTimeField(auto_now_add=True)
    statut = models.CharField(max_length=50, default='en_attente')
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def calculer_total(self):
        """Calcule le total de la commande à partir des items associés."""
        total = sum(item.produit.prix * item.quantite for item in self.items.all())
        self.total = total
        self.save()
        return total

    def __str__(self):
        return f"Commande #{self.id} - {self.client.username}"
    

    
class CommandeItem(models.Model):
    commande = models.ForeignKey(Commande, on_delete=models.CASCADE, related_name='items')
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE)
    quantite = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.quantite} x {self.produit.nom} (Commande {self.commande.id})"

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

@receiver([post_save, post_delete], sender=CommandeItem)
def update_commande_total(sender, instance, **kwargs):
    instance.commande.calculer_total()


class Paiement(models.Model):
    commande = models.ForeignKey(Commande, on_delete=models.CASCADE)  # Relation avec la commande
    montant = models.DecimalField(max_digits=10, decimal_places=2)  # Montant du paiement
    date_paiement = models.DateTimeField(auto_now_add=True)  # Date du paiement
    statut = models.CharField(max_length=50, default='en attente')  # Statut du paiement

    def __str__(self):
        return f"Paiement {self.id} pour commande {self.commande.id}"

# --- PANIER (CART) ---
class Panier(models.Model):
    utilisateur = models.OneToOneField(User, on_delete=models.CASCADE)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Panier de {self.utilisateur.username}"

class PanierItem(models.Model):
    panier = models.ForeignKey(Panier, on_delete=models.CASCADE, related_name='items')
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE)
    quantite = models.PositiveIntegerField(default=1)
    ajoute_le = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('panier', 'produit')

    def __str__(self):
        return f"{self.quantite} x {self.produit.nom} dans le panier de {self.panier.utilisateur.username}"
